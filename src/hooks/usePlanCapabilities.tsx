
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useAuth } from './useAuth';

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

  const fetchCapabilities = useCallback(async (forceRefresh = false) => {
    if (!psychologist?.id) {
      console.log('No psychologist ID, skipping capabilities fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('=== FETCHING PLAN CAPABILITIES ===');
      console.log('Psychologist ID:', psychologist.id);
      console.log('Force refresh:', forceRefresh);
      
      setLoading(true);
      setError(null);
      
      // SIEMPRE hacer una consulta fresca a la base de datos - sin cache
      const { data, error } = await supabase.rpc('get_plan_capabilities', {
        psychologist_id: psychologist.id
      });

      if (error) {
        console.error('Error fetching plan capabilities:', error);
        throw error;
      }

      console.log('Raw capabilities data from DB:', data);
      
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
      
      console.log('Final capabilities set:', validCapabilities);
      setCapabilities(validCapabilities);
      
    } catch (err) {
      console.error('Error in fetchCapabilities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [psychologist?.id]);

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

    fetchCapabilities();
  }, [fetchCapabilities, user?.id]);

  // Escuchar cambios de plan con refresco INMEDIATO Y MÚLTIPLES INTENTOS
  useEffect(() => {
    const handlePlanUpdate = () => {
      console.log('=== PLAN UPDATE EVENT - FORCING IMMEDIATE REFRESH ===');
      
      // Primer refresh inmediato
      refreshProfile();
      fetchCapabilities(true);
      
      // Segundo refresh con delay corto para asegurar
      setTimeout(() => {
        refreshProfile();
        fetchCapabilities(true);
      }, 500);
      
      // Tercer refresh con delay más largo por si acaso
      setTimeout(() => {
        refreshProfile();
        fetchCapabilities(true);
      }, 2000);
    };

    const handleAdminPlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      console.log('=== ADMIN PLAN UPDATE EVENT ===');
      console.log('Event detail:', event.detail);
      console.log('Target psychologist:', psychologistId);
      console.log('Current psychologist:', psychologist?.id);
      
      if (psychologist?.id === psychologistId) {
        console.log('=== MATCH! FORCING IMMEDIATE REFRESH ===');
        
        // Múltiples refreshes para asegurar actualización
        refreshProfile();
        fetchCapabilities(true);
        
        setTimeout(() => {
          refreshProfile();
          fetchCapabilities(true);
        }, 500);
        
        setTimeout(() => {
          refreshProfile();
          fetchCapabilities(true);
        }, 2000);
      }
    };

    const handleForceRefresh = () => {
      console.log('=== FORCE REFRESH EVENT ===');
      refreshProfile();
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
    };
  }, [psychologist?.id, fetchCapabilities, refreshProfile]);

  const refreshCapabilities = useCallback(() => {
    console.log('=== MANUAL REFRESH CAPABILITIES ===');
    refreshProfile();
    fetchCapabilities(true);
  }, [fetchCapabilities, refreshProfile]);

  const hasCapability = useCallback((capability: keyof PlanCapabilities): boolean => {
    const result = capabilities?.[capability] ?? false;
    console.log(`Checking capability ${capability}:`, result, 'from capabilities:', capabilities);
    return result;
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
      const { data, error } = await supabase.rpc('get_clinic_team', {
        psychologist_id: psychologist.id
      });
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
