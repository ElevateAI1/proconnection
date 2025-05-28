
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
      
      // Usar la nueva función is_admin_user para evitar recursión
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
      
      // Primero intentamos con la vista psychologist_stats
      let { data: statsData, error: statsError } = await supabase
        .from('psychologist_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (statsError) {
        console.error('Error fetching from psychologist_stats view:', statsError);
        
        // Si falla la vista, intentamos directamente desde las tablas
        console.log('Trying direct table query...');
        const { data: directData, error: directError } = await supabase
          .from('psychologists')
          .select(`
            *,
            profiles!inner(email)
          `)
          .order('created_at', { ascending: false });

        if (directError) {
          console.error('Error fetching direct psychologist data:', directError);
          throw directError;
        }

        // Transformar los datos para que coincidan con el formato esperado
        const transformedData = directData?.map(psychologist => ({
          id: psychologist.id,
          first_name: psychologist.first_name,
          last_name: psychologist.last_name,
          email: psychologist.profiles?.email || '',
          professional_code: psychologist.professional_code,
          subscription_status: psychologist.subscription_status || 'trial',
          trial_start_date: psychologist.trial_start_date,
          trial_end_date: psychologist.trial_end_date,
          subscription_end_date: psychologist.subscription_end_date,
          created_at: psychologist.created_at,
          trial_days_remaining: psychologist.trial_end_date 
            ? Math.max(0, Math.ceil((new Date(psychologist.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : 0,
          subscription_days_remaining: psychologist.subscription_end_date 
            ? Math.max(0, Math.ceil((new Date(psychologist.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : 0,
          is_expired: psychologist.subscription_status === 'expired' || 
                     (psychologist.subscription_status === 'trial' && new Date(psychologist.trial_end_date) < new Date()) ||
                     (psychologist.subscription_status === 'active' && psychologist.subscription_end_date && new Date(psychologist.subscription_end_date) < new Date())
        })) || [];

        console.log('Direct query result:', transformedData);
        setPsychologistStats(transformedData);
      } else {
        console.log('Stats view query result:', statsData);
        setPsychologistStats(statsData || []);
      }

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
