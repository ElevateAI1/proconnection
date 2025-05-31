
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PsychologistStats {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  professional_code: string;
  subscription_status: string;
  trial_start_date: string;
  trial_end_date: string;
  subscription_end_date: string;
  created_at: string;
  trial_days_remaining: number;
  subscription_days_remaining: number;
  is_expired: boolean;
  plan_type: string; // Agregado para soportar cambio de plan
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [psychologistStats, setPsychologistStats] = useState<PsychologistStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking admin status for user:', user.id);
      
      const { data: adminData, error: adminError } = await supabase
        .rpc('is_admin_user', { user_id: user.id });

      console.log('Admin check result:', { adminData, adminError });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setIsAdmin(false);
      } else {
        setIsAdmin(adminData === true);
        
        if (adminData === true) {
          await fetchPsychologistStats();
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPsychologistStats = async () => {
    try {
      console.log('Fetching psychologist stats...');
      
      // Consultar directamente la tabla psychologists con las nuevas políticas RLS
      const { data: psychologistData, error: psychologistError } = await supabase
        .from('psychologists')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Psychologists query result:', { psychologistData, psychologistError });

      if (psychologistError) {
        console.error('Error fetching psychologists:', psychologistError);
        throw psychologistError;
      }

      if (!psychologistData || psychologistData.length === 0) {
        console.log('No psychologists found in database');
        setPsychologistStats([]);
        return;
      }

      console.log('Found psychologists:', psychologistData.length);

      // Obtener emails de la tabla profiles
      const psychologistIds = psychologistData.map(p => p.id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', psychologistIds);

      console.log('Profiles query result:', { profilesData, profilesError });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Crear un mapa de emails
      const emailMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          emailMap.set(profile.id, profile.email);
        });
      }

      // Transformar los datos
      const transformedData = psychologistData.map(psychologist => {
        const email = emailMap.get(psychologist.id) || 'No email';
        const trialEndDate = psychologist.trial_end_date ? new Date(psychologist.trial_end_date) : null;
        const subscriptionEndDate = psychologist.subscription_end_date ? new Date(psychologist.subscription_end_date) : null;
        const now = new Date();

        const trialDaysRemaining = trialEndDate 
          ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const subscriptionDaysRemaining = subscriptionEndDate 
          ? Math.max(0, Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const isExpired = psychologist.subscription_status === 'expired' || 
                         (psychologist.subscription_status === 'trial' && trialEndDate && trialEndDate < now) ||
                         (psychologist.subscription_status === 'active' && subscriptionEndDate && subscriptionEndDate < now);

        return {
          id: psychologist.id,
          first_name: psychologist.first_name || 'Sin nombre',
          last_name: psychologist.last_name || 'Sin apellido',
          email: email,
          professional_code: psychologist.professional_code || 'Sin código',
          subscription_status: psychologist.subscription_status || 'trial',
          trial_start_date: psychologist.trial_start_date || '',
          trial_end_date: psychologist.trial_end_date || '',
          subscription_end_date: psychologist.subscription_end_date || '',
          created_at: psychologist.created_at || '',
          trial_days_remaining: trialDaysRemaining,
          subscription_days_remaining: subscriptionDaysRemaining,
          is_expired: isExpired,
          plan_type: psychologist.plan_type || 'plus' // Incluir plan_type
        };
      });

      console.log('Transformed data:', transformedData);
      setPsychologistStats(transformedData);

    } catch (error) {
      console.error('Error fetching psychologist stats:', error);
      setPsychologistStats([]);
    }
  };

  return {
    isAdmin,
    psychologistStats,
    loading,
    refetch: fetchPsychologistStats
  };
};
