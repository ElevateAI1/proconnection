
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

interface AffiliateCode {
  id: string;
  code: string;
  commission_rate: number;
  discount_rate: number;
  secondary_commission_rate: number;
  is_active: boolean;
}

interface AffiliateReferral {
  id: string;
  referred_psychologist_id: string;
  discount_applied: number;
  commission_earned: number;
  status: string;
  subscription_start_date: string;
  created_at: string;
  referred_psychologist: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface AffiliateStats {
  totalEarnings: number;
  totalReferrals: number;
  pendingPayments: number;
  activeReferrals: number;
}

export const useAffiliateSystem = () => {
  const [affiliateCode, setAffiliateCode] = useState<AffiliateCode | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [stats, setStats] = useState<AffiliateStats>({
    totalEarnings: 0,
    totalReferrals: 0,
    pendingPayments: 0,
    activeReferrals: 0
  });
  const [loading, setLoading] = useState(false);
  const { psychologist } = useProfile();

  const fetchAffiliateData = async () => {
    if (!psychologist) return;

    try {
      setLoading(true);

      // Obtener código de afiliado del psicólogo
      const { data: codeData, error: codeError } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .maybeSingle();

      if (codeError && codeError.code !== 'PGRST116') {
        console.error('Error fetching affiliate code:', codeError);
      } else {
        setAffiliateCode(codeData);
      }

      // Obtener referidos
      const { data: referralsData, error: referralsError } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          referred_psychologist:psychologists!affiliate_referrals_referred_psychologist_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('referrer_psychologist_id', psychologist.id);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      } else {
        setReferrals(referralsData || []);
      }

      // Calcular estadísticas
      if (referralsData) {
        const totalEarnings = referralsData.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0);
        const pendingPayments = referralsData
          .filter(ref => ref.status === 'confirmed')
          .reduce((sum, ref) => sum + (ref.commission_earned || 0), 0);

        setStats({
          totalEarnings,
          totalReferrals: referralsData.length,
          pendingPayments,
          activeReferrals: referralsData.filter(ref => ref.status === 'confirmed').length
        });
      }

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "Error",
        description: "Error al cargar datos del sistema de afiliados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAffiliateCode = async () => {
    if (!psychologist) return;

    try {
      setLoading(true);

      // Generar código único
      const { data: generatedCode, error: codeGenError } = await supabase.rpc('generate_affiliate_code');
      
      if (codeGenError) {
        throw new Error('Error al generar código de afiliado');
      }

      // Crear el código de afiliado
      const { data, error } = await supabase
        .from('affiliate_codes')
        .insert({
          psychologist_id: psychologist.id,
          code: generatedCode
        })
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear código de afiliado');
      }

      setAffiliateCode(data);
      
      toast({
        title: "Código creado",
        description: `Tu código de afiliado ${generatedCode} ha sido creado exitosamente`,
      });

    } catch (error: any) {
      console.error('Error creating affiliate code:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAffiliateCode = async (code: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_affiliate_code', { input_code: code });
      
      if (error) {
        throw new Error('Error al validar código');
      }

      return !!data;
    } catch (error) {
      console.error('Error validating affiliate code:', error);
      return false;
    }
  };

  useEffect(() => {
    if (psychologist) {
      fetchAffiliateData();
    }
  }, [psychologist]);

  return {
    affiliateCode,
    referrals,
    stats,
    loading,
    createAffiliateCode,
    validateAffiliateCode,
    refetch: fetchAffiliateData
  };
};
