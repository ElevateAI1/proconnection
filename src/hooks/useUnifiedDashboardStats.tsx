
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UnifiedStats {
  // Profile info
  psychologistName: string;
  planType: string;
  subscriptionStatus: string;
  
  // Dashboard stats
  todayAppointments: number;
  activePatients: number;
  
  // Loading states
  profileLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

interface PsychologistInfo {
  first_name?: string;
  last_name?: string;
  plan_type?: string;
  subscription_status?: string;
}

export const useUnifiedDashboardStats = (psychologistId?: string, psychologistInfo?: PsychologistInfo) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UnifiedStats>({
    psychologistName: '',
    planType: '',
    subscriptionStatus: '',
    todayAppointments: 0,
    activePatients: 0,
    profileLoading: true,
    statsLoading: true,
    error: null
  });

  const fetchStatsOnly = useCallback(async () => {
    if (!psychologistId) return;

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

      if (!appointmentsResult?.error) {
        todayAppointments = appointmentsResult?.count || 0;
      }

      if (!patientsResult?.error) {
        activePatients = patientsResult?.count || 0;
      }

      setStats(prev => ({
        ...prev,
        todayAppointments,
        activePatients,
        statsLoading: false,
        error: null
      }));

      console.log('Stats loaded successfully');

    } catch (error) {
      console.log('Stats queries timeout, using default values');
      setStats(prev => ({
        ...prev,
        statsLoading: false,
        todayAppointments: 0,
        activePatients: 0,
        error: null
      }));
    }
  }, [psychologistId]);

  const fetchUnifiedStats = useCallback(async () => {
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
        planType: psychData.plan_type || 'starter',
        subscriptionStatus: psychData.subscription_status || 'trial',
        profileLoading: false
      }));

      // Then fetch stats
      await fetchStatsOnly();

    } catch (error) {
      console.error('Error fetching unified stats:', error);
      setStats(prev => ({
        ...prev,
        profileLoading: false,
        statsLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [psychologistId, fetchStatsOnly]);

  useEffect(() => {
    if (!psychologistId) {
      setStats(prev => ({ 
        ...prev, 
        profileLoading: false, 
        statsLoading: false 
      }));
      return;
    }

    // Si es usuario demo, usar datos simulados
    if (user?.id === 'demo-user-123') {
      // Simular carga rápida del perfil
      setTimeout(() => {
        setStats(prev => ({
          ...prev,
          psychologistName: 'Dr. María González',
          planType: 'teams',
          subscriptionStatus: 'active',
          profileLoading: false
        }));
      }, 200);

      // Simular carga de estadísticas
      setTimeout(() => {
        setStats(prev => ({
          ...prev,
          todayAppointments: 3,
          activePatients: 12,
          statsLoading: false,
          error: null
        }));
      }, 800);
      return;
    }

    // Si ya tenemos la info del psychologist, usarla directamente
    if (psychologistInfo) {
      const firstName = (psychologistInfo.first_name || '').trim();
      const lastName = (psychologistInfo.last_name || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Profesional';

      setStats(prev => ({
        ...prev,
        psychologistName: fullName,
        planType: psychologistInfo.plan_type || 'starter',
        subscriptionStatus: psychologistInfo.subscription_status || 'trial',
        profileLoading: false
      }));

      // Solo fetch de stats, no del perfil
      fetchStatsOnly();
    } else {
      // Si no tenemos la info, hacer fetch completo (fallback)
      fetchUnifiedStats();
    }
  }, [psychologistId, user?.id, psychologistInfo, fetchStatsOnly, fetchUnifiedStats]);

  return { ...stats, refetch: fetchUnifiedStats };
};
