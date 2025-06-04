
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedStats {
  // Profile info
  psychologistName: string;
  planType: string;
  subscriptionStatus: string;
  
  // Dashboard stats
  todayAppointments: number;
  activePatients: number;
  unreadMessages: number;
  
  // Loading states
  profileLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

export const useUnifiedDashboardStats = (psychologistId?: string) => {
  const [stats, setStats] = useState<UnifiedStats>({
    psychologistName: '',
    planType: '',
    subscriptionStatus: '',
    todayAppointments: 0,
    activePatients: 0,
    unreadMessages: 0,
    profileLoading: true,
    statsLoading: true,
    error: null
  });

  useEffect(() => {
    if (!psychologistId) {
      setStats(prev => ({ 
        ...prev, 
        profileLoading: false, 
        statsLoading: false 
      }));
      return;
    }

    fetchUnifiedStats();
  }, [psychologistId]);

  const fetchUnifiedStats = async () => {
    if (!psychologistId) return;

    try {
      console.log('Fetching unified stats for psychologist:', psychologistId);
      
      // First, get psychologist basic info (fast query)
      const { data: psychData, error: psychError } = await supabase
        .from('psychologists')
        .select('first_name, last_name, plan_type, subscription_status')
        .eq('id', psychologistId)
        .single();

      if (psychError) {
        console.error('Error fetching psychologist info:', psychError);
        setStats(prev => ({
          ...prev,
          profileLoading: false,
          error: 'Error cargando información del profesional'
        }));
        return;
      }

      // Clean and format the name properly
      const firstName = (psychData.first_name || '').trim();
      const lastName = (psychData.last_name || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Profesional';

      // Update basic info immediately
      setStats(prev => ({
        ...prev,
        psychologistName: fullName,
        planType: psychData.plan_type || 'plus',
        subscriptionStatus: psychData.subscription_status || 'trial',
        profileLoading: false
      }));

      // Then fetch stats in the background with timeout
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Use Promise.race to add timeout to queries
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      );

      try {
        // Fetch appointment count with timeout
        const appointmentsPromise = supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('psychologist_id', psychologistId)
          .gte('appointment_date', startOfDay.toISOString())
          .lt('appointment_date', endOfDay.toISOString())
          .in('status', ['scheduled', 'confirmed', 'accepted']);

        const appointmentsResult = await Promise.race([appointmentsPromise, timeoutPromise]) as any;
        
        // Fetch patients count with timeout
        const patientsPromise = supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('psychologist_id', psychologistId);

        const patientsResult = await Promise.race([patientsPromise, timeoutPromise]) as any;

        let todayAppointments = 0;
        let activePatients = 0;
        let unreadMessages = 0;

        if (!appointmentsResult?.error) {
          todayAppointments = appointmentsResult?.count || 0;
        }

        if (!patientsResult?.error) {
          activePatients = patientsResult?.count || 0;
        }

        // For messages, use a simpler approach to avoid hanging
        try {
          const conversationsPromise = supabase
            .from('conversations')
            .select('id')
            .eq('psychologist_id', psychologistId)
            .limit(10);

          const conversationsResult = await Promise.race([conversationsPromise, timeoutPromise]) as any;

          if (conversationsResult?.data && conversationsResult.data.length > 0) {
            const conversationIds = conversationsResult.data.map((c: any) => c.id);
            
            const messagesPromise = supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .in('conversation_id', conversationIds)
              .neq('sender_id', psychologistId)
              .is('read_at', null);

            const unreadData = await Promise.race([messagesPromise, timeoutPromise]) as any;

            unreadMessages = unreadData?.count || 0;
          }
        } catch (error) {
          console.log('Messages query timeout, setting to 0');
          unreadMessages = 0;
        }

        setStats(prev => ({
          ...prev,
          todayAppointments,
          activePatients,
          unreadMessages,
          statsLoading: false,
          error: null
        }));

        console.log('Unified stats loaded successfully');

      } catch (error) {
        console.log('Stats queries timeout, using default values');
        setStats(prev => ({
          ...prev,
          statsLoading: false,
          todayAppointments: 0,
          activePatients: 0,
          unreadMessages: 0,
          error: null
        }));
      }

    } catch (error) {
      console.error('Error fetching unified stats:', error);
      setStats(prev => ({
        ...prev,
        profileLoading: false,
        statsLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  };

  return { ...stats, refetch: fetchUnifiedStats };
};
