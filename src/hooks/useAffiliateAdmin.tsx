
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

export const useAffiliateAdmin = () => {
  const { user } = useAuth();
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats[]>([]);
  const [pendingPayments, setPendingPayments] = useState<AffiliatePayment[]>([]);
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);
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
          fetchAffiliateReferrals()
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

  const fetchAffiliateReferrals = async () => {
    try {
      console.log('Fetching affiliate referrals...');
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          affiliate_code:affiliate_codes(code, commission_rate, discount_rate),
          referrer:referrer_psychologist_id(first_name, last_name, professional_code),
          referred:referred_psychologist_id(first_name, last_name, professional_code)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching affiliate referrals:', error);
        throw error;
      }

      console.log('Affiliate referrals fetched:', data);
      setAffiliateReferrals(data || []);
    } catch (error) {
      console.error('Error fetching affiliate referrals:', error);
      setAffiliateReferrals([]);
    }
  };

  const approvePayment = async (paymentId: string, paymentMethod: string, paymentReference?: string) => {
    try {
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

      if (error) throw error;

      toast({
        title: "Pago aprobado",
        description: "El pago de comisión ha sido marcado como pagado",
      });

      await Promise.all([
        fetchAffiliateStats(),
        fetchPendingPayments(),
        fetchAffiliateReferrals()
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el pago",
        variant: "destructive"
      });
    }
  };

  const processSubscriptionCommission = async (psychologistId: string, amount: number) => {
    try {
      const { error } = await supabase
        .rpc('process_affiliate_commission', {
          referred_psychologist_id: psychologistId,
          subscription_amount: amount
        });

      if (error) throw error;

      toast({
        title: "Comisión procesada",
        description: "Se ha calculado y registrado la comisión de afiliado",
      });

      await Promise.all([
        fetchAffiliateStats(),
        fetchPendingPayments(),
        fetchAffiliateReferrals()
      ]);
    } catch (error: any) {
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
    loading,
    isAdmin,
    approvePayment,
    processSubscriptionCommission,
    createAffiliateCode,
    refetch: checkAdminAndFetch
  };
};
