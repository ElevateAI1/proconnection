
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePendingAppointmentRequests = (psychologistId?: string) => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    // Si es usuario demo, usar datos simulados
    if (user?.id === 'demo-user-123') {
      setTimeout(() => {
        setPendingCount(2);
        setLoading(false);
      }, 400);
      return;
    }

    fetchPendingCount();
  }, [psychologistId, user?.id]);

  const fetchPendingCount = async () => {
    if (!psychologistId) return;

    try {
      setLoading(true);
      
      const { count, error } = await supabase
        .from('appointment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('psychologist_id', psychologistId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending requests count:', error);
        setPendingCount(0);
      } else {
        setPendingCount(count || 0);
      }
    } catch (error) {
      console.error('Error in fetchPendingCount:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { pendingCount, loading, refetch: fetchPendingCount };
};
