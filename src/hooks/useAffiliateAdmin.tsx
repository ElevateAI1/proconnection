
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface AffiliateStats {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  total_referrals: number;
  affiliate_earnings: number;
  affiliate_code: string;
  commission_rate: number;
  discount_rate: number;
  active_referrals: number;
  pending_payments: number;
  paid_amount: number;
}

interface AffiliatePayment {
  id: string;
  psychologist_id: string;
  amount: number;
  status: string;
  payment_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  psychologist: {
    first_name: string;
    last_name: string;
    professional_code: string;
    affiliate_code?: string;
  };
}

interface AffiliateReferral {
  id: string;
  referrer_psychologist_id: string;
  referred_psychologist_id: string;
  status: string;
  commission_earned: number;
  discount_applied: number;
  created_at: string;
  subscription_start_date: string | null;
  affiliate_code: {
    code: string;
    commission_rate: number;
    discount_rate: number;
  };
  referrer: {
    first_name: string;
    last_name: string;
    professional_code: string;
  };
  referred: {
    first_name: string;
    last_name: string;
    professional_code: string;
  };
}

interface PendingReferredPsychologist {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  created_at: string;
  referrer_name: string;
  referrer_professional_code: string;
  affiliate_code: string;
  commission_rate: number;
  discount_rate: number;
}

export const useAffiliateAdmin = () => {
  const { user } = useAuth();
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats[]>([]);
  const [pendingPayments, setPendingPayments] = useState<AffiliatePayment[]>([]);
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);
  const [pendingReferredPsychologists, setPendingReferredPsychologists] = useState<PendingReferredPsychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAndFetch();
    }
  }, [user]);

  const checkAdminAndFetch = async () => {
    try {
      const { data: adminCheck } = await supabase
        .rpc('is_admin_user', { user_id: user?.id });

      if (adminCheck) {
        setIsAdmin(true);
        await Promise.all([
          fetchAffiliateStats(),
          fetchPendingPayments(),
          fetchAffiliateReferrals(),
          fetchPendingReferredPsychologists()
        ]);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      console.log('Fetching affiliate stats...');
      const { data, error } = await supabase
        .from('affiliate_admin_stats')
        .select('*')
        .order('total_referrals', { ascending: false });

      if (error) {
        console.error('Error fetching affiliate stats:', error);
        throw error;
      }
      
      console.log('Affiliate stats fetched:', data);
      setAffiliateStats(data || []);
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      setAffiliateStats([]);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      console.log('Fetching pending payments...');
      const { data, error } = await supabase
        .from('affiliate_payments')
        .select(`
          *,
          psychologist:psychologists(
            first_name, 
            last_name, 
            professional_code,
            affiliate_code_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending payments:', error);
        throw error;
      }

      // Obtener códigos de afiliado para cada psicólogo
      const paymentsWithCodes = await Promise.all(
        (data || []).map(async (payment) => {
          let affiliateCode = '';
          if (payment.psychologist?.affiliate_code_id) {
            const { data: codeData } = await supabase
              .from('affiliate_codes')
              .select('code')
              .eq('id', payment.psychologist.affiliate_code_id)
              .single();
            affiliateCode = codeData?.code || '';
          }

          return {
            ...payment,
            psychologist: {
              ...payment.psychologist,
              affiliate_code: affiliateCode
            }
          };
        })
      );

      console.log('Pending payments fetched:', paymentsWithCodes);
      setPendingPayments(paymentsWithCodes);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setPendingPayments([]);
    }
  };

  const fetchPendingReferredPsychologists = async () => {
    try {
      console.log('Fetching pending referred psychologists...');
      
      // Obtener psicólogos que fueron referidos pero aún no han pagado su primera suscripción
      const { data: referralsData, error: referralsError } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          affiliate_code:affiliate_codes(code, commission_rate, discount_rate)
        `)
        .eq('status', 'active')
        .is('subscription_start_date', null)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching pending referred psychologists:', referralsError);
        throw referralsError;
      }

      // Obtener información detallada de cada psicólogo
      const pendingPsychologists = await Promise.all(
        (referralsData || []).map(async (referral) => {
          // Datos del psicólogo referido
          const { data: referredData } = await supabase
            .from('psychologists')
            .select('first_name, last_name, professional_code, created_at')
            .eq('id', referral.referred_psychologist_id)
            .single();

          // Datos del psicólogo referidor
          const { data: referrerData } = await supabase
            .from('psychologists')
            .select('first_name, last_name, professional_code')
            .eq('id', referral.referrer_psychologist_id)
            .single();

          return {
            id: referral.referred_psychologist_id,
            first_name: referredData?.first_name || '',
            last_name: referredData?.last_name || '',
            professional_code: referredData?.professional_code || '',
            created_at: referredData?.created_at || '',
            referrer_name: referrerData ? `${referrerData.first_name} ${referrerData.last_name}` : '',
            referrer_professional_code: referrerData?.professional_code || '',
            affiliate_code: referral.affiliate_code?.code || '',
            commission_rate: referral.affiliate_code?.commission_rate || 0,
            discount_rate: referral.affiliate_code?.discount_rate || 0
          };
        })
      );

      console.log('Pending referred psychologists fetched:', pendingPsychologists);
      setPendingReferredPsychologists(pendingPsychologists);
    } catch (error) {
      console.error('Error fetching pending referred psychologists:', error);
      setPendingReferredPsychologists([]);
    }
  };

  const fetchAffiliateReferrals = async () => {
    try {
      console.log('Fetching affiliate referrals...');
      
      // Primero obtener los referidos básicos
      const { data: referralsData, error: referralsError } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          affiliate_code:affiliate_codes(code, commission_rate, discount_rate)
        `)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching affiliate referrals:', referralsError);
        throw referralsError;
      }

      // Luego obtener los datos de los psicólogos referidores y referidos
      const referralsWithPsychologists = await Promise.all(
        (referralsData || []).map(async (referral) => {
          // Obtener datos del referidor
          const { data: referrerData } = await supabase
            .from('psychologists')
            .select('first_name, last_name, professional_code')
            .eq('id', referral.referrer_psychologist_id)
            .single();

          // Obtener datos del referido
          const { data: referredData } = await supabase
            .from('psychologists')
            .select('first_name, last_name, professional_code')
            .eq('id', referral.referred_psychologist_id)
            .single();

          return {
            ...referral,
            referrer: referrerData || { first_name: '', last_name: '', professional_code: '' },
            referred: referredData || { first_name: '', last_name: '', professional_code: '' }
          };
        })
      );

      console.log('Affiliate referrals fetched:', referralsWithPsychologists);
      setAffiliateReferrals(referralsWithPsychologists);
    } catch (error) {
      console.error('Error fetching affiliate referrals:', error);
      setAffiliateReferrals([]);
    }
  };

  const approvePayment = async (paymentId: string, paymentMethod: string, paymentReference?: string) => {
    try {
      console.log('Approving payment:', paymentId);
      
      // 1. Actualizar el pago en la base de datos
      const { error } = await supabase
        .from('affiliate_payments')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('Error updating payment in database:', error);
        throw error;
      }

      console.log('Payment updated successfully in database');

      // 2. Actualizar inmediatamente el estado local - REMOVER el pago de la lista
      setPendingPayments(prevPayments => {
        const updatedPayments = prevPayments.filter(payment => payment.id !== paymentId);
        console.log('Updated pending payments state:', updatedPayments.length, 'payments remaining');
        return updatedPayments;
      });

      // 3. Actualizar las estadísticas para reflejar el pago procesado
      await fetchAffiliateStats();

      toast({
        title: "Pago aprobado",
        description: "El pago de comisión ha sido marcado como pagado",
      });

      console.log('Payment approval process completed successfully');

    } catch (error: any) {
      console.error('Error in approvePayment:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el pago",
        variant: "destructive"
      });
    }
  };

  const processSubscriptionCommission = async (psychologistId: string, amount: number) => {
    try {
      console.log('Processing subscription commission for:', psychologistId, 'amount:', amount);
      
      const { error } = await supabase
        .rpc('process_affiliate_commission', {
          referred_psychologist_id: psychologistId,
          subscription_amount: amount
        });

      if (error) {
        console.error('Error processing commission:', error);
        throw error;
      }

      console.log('Commission processed successfully');

      // Actualizar inmediatamente el psicólogo de la lista de pendientes
      setPendingReferredPsychologists(prevPending => {
        const updated = prevPending.filter(p => p.id !== psychologistId);
        console.log('Updated pending referred psychologists:', updated.length, 'remaining');
        return updated;
      });

      // Refrescar los datos para obtener el nuevo pago pendiente generado
      await Promise.all([
        fetchAffiliateStats(),
        fetchPendingPayments(),
        fetchAffiliateReferrals()
      ]);

      toast({
        title: "Comisión procesada",
        description: "Se ha calculado y registrado la comisión de afiliado",
      });

    } catch (error: any) {
      console.error('Error in processSubscriptionCommission:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la comisión",
        variant: "destructive"
      });
    }
  };

  const createAffiliateCode = async (psychologistId: string) => {
    try {
      // Generar código de afiliado
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_affiliate_code');

      if (codeError) throw codeError;

      // Crear el código de afiliado en la base de datos
      const { error: insertError } = await supabase
        .from('affiliate_codes')
        .insert({
          psychologist_id: psychologistId,
          code: codeData,
          commission_rate: 10.00,
          discount_rate: 15.00,
          is_active: true
        });

      if (insertError) throw insertError;

      // Actualizar el psicólogo con el ID del código de afiliado
      const { data: affiliateCodeRecord } = await supabase
        .from('affiliate_codes')
        .select('id')
        .eq('code', codeData)
        .single();

      if (affiliateCodeRecord) {
        await supabase
          .from('psychologists')
          .update({ affiliate_code_id: affiliateCodeRecord.id })
          .eq('id', psychologistId);
      }

      toast({
        title: "Código de afiliado creado",
        description: `Código generado: ${codeData}`,
      });

      await fetchAffiliateStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el código de afiliado",
        variant: "destructive"
      });
    }
  };

  return {
    affiliateStats,
    pendingPayments,
    affiliateReferrals,
    pendingReferredPsychologists,
    loading,
    isAdmin,
    approvePayment,
    processSubscriptionCommission,
    createAffiliateCode,
    refetch: checkAdminAndFetch
  };
};
