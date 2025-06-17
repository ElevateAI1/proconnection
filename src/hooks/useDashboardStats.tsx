
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useRealtimeChannel } from './useRealtimeChannel';

interface DashboardStats {
  todayAppointments: number;
  activePatients: number;
  unreadMessages: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const { psychologist } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activePatients: 0,
    unreadMessages: 0,
    loading: true,
    error: null
  });

  // Real-time subscription for messages to update unread count immediately
  useRealtimeChannel({
    channelName: `dashboard-messages-${psychologist?.id}`,
    enabled: !!psychologist?.id,
    table: 'messages',
    onUpdate: () => {
      console.log('Messages updated, refetching unread count...');
      if (psychologist?.id) {
        fetchUnreadMessages();
      }
    }
  });

  useEffect(() => {
    if (!psychologist?.id) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchStats();
  }, [psychologist?.id]);

  const fetchUnreadMessages = async () => {
    if (!psychologist?.id) return;

    try {
      console.log('Fetching unread messages for psychologist:', psychologist.id);

      // Simple direct query for unread messages
      const { data: unreadMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          conversations!inner(
            psychologist_id
          )
        `)
        .eq('conversations.psychologist_id', psychologist.id)
        .neq('sender_id', psychologist.id)
        .is('read_at', null);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      const unreadCount = unreadMessages?.length || 0;
      console.log('Unread messages count:', unreadCount);

      setStats(prev => ({
        ...prev,
        unreadMessages: unreadCount
      }));

    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const fetchStats = async () => {
    if (!psychologist?.id) return;

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Get today's start and end
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch today's appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('psychologist_id', psychologist.id)
        .gte('appointment_date', startOfDay.toISOString())
        .lt('appointment_date', endOfDay.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Fetch active patients count
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id')
        .eq('psychologist_id', psychologist.id);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      // Fetch unread messages with direct join
      const { data: unreadMessages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          conversations!inner(
            psychologist_id
          )
        `)
        .eq('conversations.psychologist_id', psychologist.id)
        .neq('sender_id', psychologist.id)
        .is('read_at', null);

      let unreadCount = 0;
      if (!messagesError && unreadMessages) {
        unreadCount = unreadMessages.length;
      }

      console.log('Dashboard stats loaded:', {
        todayAppointments: appointments?.length || 0,
        activePatients: patients?.length || 0,
        unreadMessages: unreadCount
      });

      setStats({
        todayAppointments: appointments?.length || 0,
        activePatients: patients?.length || 0,
        unreadMessages: unreadCount,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  };

  return stats;
};
