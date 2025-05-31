
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

interface PlanCapabilities {
  seo_profile: boolean;
  advanced_reports: boolean;
  early_access: boolean;
  priority_support: boolean;
  visibility_consulting: boolean;
  basic_features: boolean;
}

export const usePlanCapabilities = () => {
  const { psychologist, forceRefresh: refreshProfile } = useProfile();
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
      console.log('=== FETCHING PLAN CAPABILITIES (FORCED) ===');
      console.log('Psychologist ID:', psychologist.id);
      console.log('Force refresh:', forceRefresh);
      
      setLoading(true);
      setError(null);
      
      // SIEMPRE hacer una consulta fresca - no cache
      const { data, error } = await supabase.rpc('get_plan_capabilities', {
        psychologist_id: psychologist.id
      });

      if (error) {
        console.error('Error fetching plan capabilities:', error);
        throw error;
      }

      console.log('Raw capabilities data:', data);
      
      let validCapabilities: PlanCapabilities;
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const planData = data as Record<string, unknown>;
        validCapabilities = {
          seo_profile: Boolean(planData.seo_profile),
          advanced_reports: Boolean(planData.advanced_reports),
          early_access: Boolean(planData.early_access),
          priority_support: Boolean(planData.priority_support),
          visibility_consulting: Boolean(planData.visibility_consulting),
          basic_features: Boolean(planData.basic_features)
        };
      } else {
        console.log('No valid capabilities data, setting defaults');
        validCapabilities = {
          seo_profile: false,
          advanced_reports: false,
          early_access: false,
          priority_support: false,
          visibility_consulting: false,
          basic_features: false
        };
      }
      
      console.log('Final capabilities:', validCapabilities);
      setCapabilities(validCapabilities);
      
    } catch (err) {
      console.error('Error in fetchCapabilities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [psychologist?.id]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  // Escuchar cambios de plan con refresco INMEDIATO
  useEffect(() => {
    const handlePlanUpdate = () => {
      console.log('=== PLAN UPDATE EVENT - IMMEDIATE REFRESH ===');
      // Refrescar perfil INMEDIATAMENTE
      refreshProfile();
      // Refrescar capacidades INMEDIATAMENTE
      fetchCapabilities(true);
    };

    const handleAdminPlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      if (psychologist?.id === psychologistId) {
        console.log('=== ADMIN PLAN UPDATE - IMMEDIATE REFRESH ===');
        console.log('Target psychologist:', psychologistId);
        console.log('Current psychologist:', psychologist.id);
        
        // Refrescar INMEDIATAMENTE sin delays
        refreshProfile();
        fetchCapabilities(true);
      }
    };

    // Escuchar múltiples eventos
    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    window.addEventListener('forceRefreshCapabilities', handlePlanUpdate);
    
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
      window.removeEventListener('forceRefreshCapabilities', handlePlanUpdate);
    };
  }, [psychologist?.id, fetchCapabilities, refreshProfile]);

  const refreshCapabilities = useCallback(() => {
    console.log('=== MANUAL REFRESH CAPABILITIES ===');
    refreshProfile();
    fetchCapabilities(true);
  }, [fetchCapabilities, refreshProfile]);

  const hasCapability = useCallback((capability: keyof PlanCapabilities): boolean => {
    const result = capabilities?.[capability] ?? false;
    console.log(`Checking capability ${capability}:`, result);
    return result;
  }, [capabilities]);

  const isPlusUser = useCallback(() => {
    const result = capabilities?.basic_features && !capabilities?.seo_profile;
    console.log('isPlusUser check:', result, capabilities);
    return result;
  }, [capabilities]);

  const isProUser = useCallback(() => {
    const result = capabilities?.seo_profile && capabilities?.advanced_reports;
    console.log('isProUser check:', result, capabilities);
    return result;
  }, [capabilities]);

  return {
    capabilities,
    loading,
    error,
    hasCapability,
    isPlusUser,
    isProUser,
    refreshCapabilities
  };
};
