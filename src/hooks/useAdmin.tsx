
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
    if (!user) return;

    try {
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      setIsAdmin(!!adminData);
      
      if (adminData) {
        await fetchPsychologistStats();
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
      const { data, error } = await supabase
        .from('psychologist_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPsychologistStats(data || []);
    } catch (error) {
      console.error('Error fetching psychologist stats:', error);
    }
  };

  return {
    isAdmin,
    psychologistStats,
    loading,
    refetch: fetchPsychologistStats
  };
};
