
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const fetchingRef = useRef(false);
  const lastPsychologistIdRef = useRef<string | undefined>(psychologistId);
  const psychologistInfoRef = useRef<PsychologistInfo | undefined>(psychologistInfo);
  const fetchStatsOnlyRef = useRef<(() => Promise<void>) | null>(null);
  const fetchUnifiedStatsRef = useRef<(() => Promise<void>) | null>(null);
  const hasFetchedRef = useRef(false);

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

    } catch (error) {
      // Timeout o error en queries - usar valores por defecto silenciosamente
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

  // Actualizar refs cuando cambian las funciones
  useEffect(() => {
    fetchStatsOnlyRef.current = fetchStatsOnly;
    fetchUnifiedStatsRef.current = fetchUnifiedStats;
  }, [fetchStatsOnly, fetchUnifiedStats]);

  // Actualizar refs cuando cambian
  useEffect(() => {
    psychologistInfoRef.current = psychologistInfo;
  }, [psychologistInfo?.first_name, psychologistInfo?.last_name, psychologistInfo?.plan_type, psychologistInfo?.subscription_status]);

  useEffect(() => {
    if (!psychologistId) {
      setStats(prev => ({ 
        ...prev, 
        profileLoading: false, 
        statsLoading: false 
      }));
      fetchingRef.current = false;
      lastPsychologistIdRef.current = undefined;
      hasFetchedRef.current = false;
      return;
    }

    // Si cambió el psychologist ID, resetear todo
    if (lastPsychologistIdRef.current !== psychologistId) {
      fetchingRef.current = false;
      lastPsychologistIdRef.current = psychologistId;
      hasFetchedRef.current = false;
    }

    // Protección fuerte: solo ejecutar una vez por psychologistId
    if (hasFetchedRef.current && lastPsychologistIdRef.current === psychologistId) {
      return;
    }

    // Protección contra llamadas simultáneas
    if (fetchingRef.current) {
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
      hasFetchedRef.current = true;
      return;
    }

    fetchingRef.current = true;
    hasFetchedRef.current = true;

    // Si ya tenemos la info del psychologist, usarla directamente
    const currentInfo = psychologistInfoRef.current;
    if (currentInfo?.first_name || currentInfo?.last_name || currentInfo?.plan_type) {
      const firstName = (currentInfo.first_name || '').trim();
      const lastName = (currentInfo.last_name || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Profesional';

      setStats(prev => ({
        ...prev,
        psychologistName: fullName,
        planType: currentInfo.plan_type || 'starter',
        subscriptionStatus: currentInfo.subscription_status || 'trial',
        profileLoading: false
      }));

      // Solo fetch de stats, no del perfil - usar ref para evitar dependencias
      if (fetchStatsOnlyRef.current) {
        fetchStatsOnlyRef.current().finally(() => {
          fetchingRef.current = false;
        });
      } else {
        fetchingRef.current = false;
      }
    } else {
      // Si no tenemos la info, hacer fetch completo (fallback) - usar ref
      if (fetchUnifiedStatsRef.current) {
        fetchUnifiedStatsRef.current().finally(() => {
          fetchingRef.current = false;
        });
      } else {
        fetchingRef.current = false;
      }
    }
  }, [psychologistId, user?.id]);

  // Memoizar el objeto de retorno para evitar recreaciones innecesarias
  return useMemo(() => ({ ...stats, refetch: fetchUnifiedStats }), [
    stats.psychologistName,
    stats.planType,
    stats.subscriptionStatus,
    stats.todayAppointments,
    stats.activePatients,
    stats.profileLoading,
    stats.statsLoading,
    stats.error,
    fetchUnifiedStats
  ]);
};
