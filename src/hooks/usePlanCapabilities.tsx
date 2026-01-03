
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useAuth } from './useAuth';
import { canExecuteRateLimited, recordRateLimitedExecution } from '@/utils/rateLimiter';
import { useRealtimeChannel } from './useRealtimeChannel';

interface PlanCapabilities {
  basic_features: boolean;
  seo_profile: boolean;
  advanced_reports: boolean;
  priority_support: boolean;
  financial_features: boolean;
  advanced_documents: boolean;
  team_features: boolean;
  early_access: boolean;
  visibility_consulting: boolean;
  api_integrations: boolean;
  dedicated_support: boolean;
  is_clinic_admin?: boolean;
  is_clinic_member?: boolean;
}

// Función helper para determinar capacidades desde plan_type
const getCapabilitiesFromPlanType = (planType: string): PlanCapabilities => {
  const plan = planType.toLowerCase();
  
  // Starter: solo basic_features
  if (plan === 'starter') {
    return {
      basic_features: true,
      seo_profile: false,
      advanced_reports: false,
      priority_support: false,
      financial_features: false,
      advanced_documents: false,
      team_features: false,
      early_access: false,
      visibility_consulting: false,
      api_integrations: false,
      dedicated_support: false
    };
  }
  
  // ProConnection: starter + proconnection features
  if (plan === 'proconnection') {
    return {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: true,
      team_features: false,
      early_access: false,
      visibility_consulting: false,
      api_integrations: false,
      dedicated_support: false
    };
  }
  
  // Clínicas: todas las capacidades
  if (plan === 'clinicas') {
    return {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: true,
      team_features: true,
      early_access: true,
      visibility_consulting: true,
      api_integrations: true,
      dedicated_support: true,
      is_clinic_admin: false,
      is_clinic_member: false
    };
  }
  
  // Teams (deprecated, mantener compatibilidad)
  if (plan === 'teams') {
    return {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: true,
      team_features: true,
      early_access: true,
      visibility_consulting: true,
      api_integrations: true,
      dedicated_support: true,
      is_clinic_admin: false,
      is_clinic_member: false
    };
  }
  
  // DEV: todas las capacidades (tier especial para pruebas)
  if (plan === 'dev') {
    return {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: true,
      team_features: true,
      early_access: true,
      visibility_consulting: true,
      api_integrations: true,
      dedicated_support: true
    };
  }
  
  // Default: starter
  return {
    basic_features: true,
    seo_profile: false,
    advanced_reports: false,
    priority_support: false,
    financial_features: false,
    advanced_documents: false,
    team_features: false,
    early_access: false,
    visibility_consulting: false,
    api_integrations: false,
    dedicated_support: false
  };
};

export const usePlanCapabilities = () => {
  const { psychologist, forceRefresh: refreshProfile } = useProfile();
  const { user } = useAuth();
  const [capabilities, setCapabilities] = useState<PlanCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rate limiting: track last fetch time and cache
  const lastFetchTimeRef = useRef<number>(0);
  const cachedCapabilitiesRef = useRef<{ data: PlanCapabilities | null; timestamp: number } | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const psychologistIdRef = useRef<string | undefined>(psychologist?.id);
  const refreshProfileRef = useRef(refreshProfile);
  const CACHE_TTL_MS = 30000; // 30 seconds
  const MIN_FETCH_INTERVAL_MS = 300; // 300ms debounce

  // Actualizar refs cuando cambian
  useEffect(() => {
    psychologistIdRef.current = psychologist?.id;
    refreshProfileRef.current = refreshProfile;
  }, [psychologist?.id, refreshProfile]);

  const fetchCapabilities = useCallback(async (forceRefresh = false) => {
    const currentPsychologistId = psychologistIdRef.current;
    if (!currentPsychologistId) {
      console.log('No psychologist ID, skipping capabilities fetch');
      setLoading(false);
      return;
    }

    const now = Date.now();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && cachedCapabilitiesRef.current) {
      const cacheAge = now - cachedCapabilitiesRef.current.timestamp;
      if (cacheAge < CACHE_TTL_MS) {
        console.log('Using cached capabilities (age:', cacheAge, 'ms)');
        setCapabilities(cachedCapabilitiesRef.current.data);
        setLoading(false);
        return;
      }
    }
    
    // Rate limiting: prevent rapid successive calls
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL_MS && !forceRefresh) {
      console.log('Rate limiting: waiting', MIN_FETCH_INTERVAL_MS - timeSinceLastFetch, 'ms before fetch');
      // Clear any pending timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      // Schedule fetch after debounce period
      fetchTimeoutRef.current = setTimeout(() => {
        fetchCapabilities(forceRefresh);
      }, MIN_FETCH_INTERVAL_MS - timeSinceLastFetch);
      return;
    }

    try {
      
      lastFetchTimeRef.current = now;
      setLoading(true);
      setError(null);
      
      // SIEMPRE hacer una consulta fresca a la base de datos - sin cache
      const { data, error } = await supabase.rpc('get_plan_capabilities', {
        p_psychologist_id: currentPsychologistId
      });

      if (error) {
        console.error('Error fetching plan capabilities:', error);
        throw error;
      }

      
      let validCapabilities: PlanCapabilities;
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const planData = data as Record<string, unknown>;
        validCapabilities = {
          basic_features: Boolean(planData.basic_features),
          seo_profile: Boolean(planData.seo_profile),
          advanced_reports: Boolean(planData.advanced_reports),
          priority_support: Boolean(planData.priority_support),
          financial_features: Boolean(planData.financial_features),
          advanced_documents: Boolean(planData.advanced_documents),
          team_features: Boolean(planData.team_features),
          early_access: Boolean(planData.early_access),
          visibility_consulting: Boolean(planData.visibility_consulting),
          api_integrations: Boolean(planData.api_integrations),
          dedicated_support: Boolean(planData.dedicated_support),
          is_clinic_admin: Boolean(planData.is_clinic_admin),
          is_clinic_member: Boolean(planData.is_clinic_member)
        };
      } else {
        // Fallback: determinar capacidades desde plan_type si no hay datos de RPC
        const planType = psychologist?.plan_type?.toLowerCase() || 'starter';
        validCapabilities = getCapabilitiesFromPlanType(planType);
      }
      
      // Actualizar cache
      cachedCapabilitiesRef.current = {
        data: validCapabilities,
        timestamp: now
      };
      
      setCapabilities(validCapabilities);
      
    } catch (err) {
      console.error('Error in fetchCapabilities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [psychologist?.plan_type]);

  useEffect(() => {
    // Si es usuario demo, usar capacidades simuladas
    if (user?.id === 'demo-user-123') {
      setCapabilities({
        basic_features: true,
        seo_profile: true,
        advanced_reports: true,
        priority_support: true,
        financial_features: true,
        advanced_documents: true,
        team_features: true,
        early_access: true,
        visibility_consulting: true,
        api_integrations: true,
        dedicated_support: true
      });
      setLoading(false);
      return;
    }

    // Solo fetch cuando cambia el psychologist ID, no cuando cambia fetchCapabilities
    if (psychologist?.id) {
      fetchCapabilities();
    } else {
      setLoading(false);
    }
  }, [psychologist?.id, user?.id]);

  // Listener de Realtime para cambios en la tabla psychologists
  useRealtimeChannel({
    channelName: `psychologist-plan-${psychologist?.id}`,
    enabled: !!psychologist?.id,
    table: 'psychologists',
    filter: `id=eq.${psychologist?.id}`,
    onUpdate: (payload) => {
      console.log('=== REALTIME: PSYCHOLOGIST PLAN CHANGE DETECTED ===');
      console.log('Payload:', payload);

      const newRecord = payload.new as any;
      const oldRecord = payload.old as any;

      // Verificar si cambió plan_type o subscription_status
      if (
        payload.eventType === 'UPDATE' &&
        (newRecord?.plan_type !== oldRecord?.plan_type ||
         newRecord?.subscription_status !== oldRecord?.subscription_status)
      ) {
        console.log('=== PLAN OR SUBSCRIPTION STATUS CHANGED ===');
        console.log('Old:', { plan_type: oldRecord?.plan_type, subscription_status: oldRecord?.subscription_status });
        console.log('New:', { plan_type: newRecord?.plan_type, subscription_status: newRecord?.subscription_status });

        // Clear cache to force fresh fetch
        cachedCapabilitiesRef.current = null;
        lastFetchTimeRef.current = 0;

        // Refresh profile and capabilities
        refreshProfileRef.current();
        fetchCapabilities(true);
      }
    }
  });

  // Escuchar cambios de plan con refresco controlado (solo uno con debounce)
  useEffect(() => {
    const handlePlanUpdate = () => {
      console.log('=== PLAN UPDATE EVENT - FORCING REFRESH ===');

      // Clear cache to force fresh fetch
      cachedCapabilitiesRef.current = null;
      lastFetchTimeRef.current = 0;

      // Single refresh with debounce
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        refreshProfileRef.current();
        fetchCapabilities(true);
      }, 300);
    };

    const handleAdminPlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      console.log('=== ADMIN PLAN UPDATE EVENT ===');
      console.log('Event detail:', event.detail);
      console.log('Target psychologist:', psychologistId);
      console.log('Current psychologist:', psychologistIdRef.current);

      if (psychologistIdRef.current === psychologistId) {
        console.log('=== MATCH! FORCING SINGLE REFRESH ===');

        // Un solo refresh con debounce
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(() => {
          refreshProfileRef.current();
          fetchCapabilities(true);
        }, 300);
      }
    };

    const handleForceRefresh = () => {
      console.log('=== FORCE REFRESH EVENT ===');
      refreshProfileRef.current();
      fetchCapabilities(true);
    };

    // Escuchar TODOS los eventos posibles
    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    window.addEventListener('forceRefreshCapabilities', handleForceRefresh);

    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
      window.removeEventListener('forceRefreshCapabilities', handleForceRefresh);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [psychologist?.id]);

  const refreshCapabilities = useCallback(() => {
    console.log('=== MANUAL REFRESH CAPABILITIES ===');
    refreshProfileRef.current();
    fetchCapabilities(true);
  }, [fetchCapabilities]);

  const hasCapability = useCallback((capability: keyof PlanCapabilities): boolean => {
    return capabilities?.[capability] ?? false;
  }, [capabilities]);


  const isStarterUser = useCallback(() => {
    const planType = psychologist?.plan_type?.toLowerCase() || 'starter';
    return planType === 'starter';
  }, [psychologist?.plan_type]);

  const isProConnectionUser = useCallback(() => {
    const planType = psychologist?.plan_type?.toLowerCase() || 'starter';
    return planType === 'proconnection';
  }, [psychologist?.plan_type]);

  const isClinicasUser = useCallback(() => {
    const planType = psychologist?.plan_type?.toLowerCase() || 'starter';
    return planType === 'clinicas' || planType === 'dev';
  }, [psychologist?.plan_type]);

  const isTeamsUser = useCallback(() => {
    // Deprecated: mantener por compatibilidad
    return isClinicasUser();
  }, [isClinicasUser]);

  const isDevUser = useCallback(() => {
    const planType = psychologist?.plan_type?.toLowerCase() || 'starter';
    return planType === 'dev';
  }, [psychologist?.plan_type]);

  const hasTierOrHigher = useCallback((requiredTier: 'starter' | 'proconnection' | 'clinicas' | 'teams' | 'dev'): boolean => {
    // DEV tiene acceso a todo
    const currentPlan = psychologist?.plan_type?.toLowerCase() || 'starter';
    if (currentPlan === 'dev') return true;
    
    // Mapear 'teams' a 'clinicas' para compatibilidad
    const normalizedTier = requiredTier === 'teams' ? 'clinicas' : requiredTier;
    const normalizedPlan = currentPlan === 'teams' ? 'clinicas' : currentPlan;
    
    const tierOrder = ['starter', 'proconnection', 'clinicas'];
    const currentIndex = tierOrder.indexOf(normalizedPlan);
    const requiredIndex = tierOrder.indexOf(normalizedTier);
    return currentIndex >= requiredIndex;
  }, [psychologist?.plan_type]);

  // Mantener compatibilidad con código existente (deprecated)
  const isPlusUser = useCallback(() => {
    return isProConnectionUser();
  }, [isProConnectionUser]);

  const isProUser = useCallback(() => {
    return isClinicasUser();
  }, [isClinicasUser]);

  const isClinicAdmin = useCallback(async (): Promise<boolean> => {
    if (!psychologist?.id) return false;
    try {
      const { data, error } = await supabase.rpc('is_clinic_admin', {
        psychologist_id: psychologist.id
      });
      if (error) {
        console.error('Error checking clinic admin:', error);
        return false;
      }
      return Boolean(data);
    } catch (err) {
      console.error('Error in isClinicAdmin:', err);
      return false;
    }
  }, [psychologist?.id]);

  const getClinicTeam = useCallback(async () => {
    if (!psychologist?.id) return null;
    try {
      // Rate limiting: solo 1 vez por día
      const rateLimitKey = `get_clinic_team_${psychologist.id}`;
      
      if (!canExecuteRateLimited(rateLimitKey, psychologist.id, 1)) {
        console.log('Rate limit: get_clinic_team ya fue llamado hoy para este psicólogo');
        return null;
      }

      const { data, error } = await supabase.rpc('get_clinic_team', {
        p_psychologist_id: psychologist.id
      });

      // Registrar la ejecución solo si no hay error
      if (!error) {
        recordRateLimitedExecution(rateLimitKey, psychologist.id);
        recordRateLimitedExecution(rateLimitKey, psychologist.id);
      }
      if (error) {
        console.error('Error fetching clinic team:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in getClinicTeam:', err);
      return null;
    }
  }, [psychologist?.id]);

  return {
    capabilities,
    loading,
    error,
    hasCapability,
    isStarterUser,
    isProConnectionUser,
    isClinicasUser,
    isTeamsUser, // Deprecated: mantener por compatibilidad
    isDevUser,
    hasTierOrHigher,
    isClinicAdmin,
    getClinicTeam,
    // Deprecated: mantener por compatibilidad
    isPlusUser,
    isProUser,
    refreshCapabilities
  };
};
