
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

// Cache global que se limpia cuando cambia el plan
let globalCapabilitiesCache: {
  [psychologistId: string]: {
    capabilities: PlanCapabilities;
    timestamp: number;
  }
} = {};

export const usePlanCapabilities = () => {
  const { psychologist } = useProfile();
  const [capabilities, setCapabilities] = useState<PlanCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearCache = useCallback(() => {
    if (psychologist?.id) {
      delete globalCapabilitiesCache[psychologist.id];
    }
  }, [psychologist?.id]);

  const fetchCapabilities = useCallback(async (forceRefresh = false) => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    // Verificar cache solo si no es refresh forzado
    const cached = globalCapabilitiesCache[psychologist.id];
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
    
    if (!forceRefresh && cached && cacheAge < 10000) { // Cache de 10 segundos
      console.log('Using cached capabilities for:', psychologist.id);
      setCapabilities(cached.capabilities);
      setLoading(false);
      return;
    }

    try {
      console.log('=== FETCHING PLAN CAPABILITIES (FRESH) ===');
      console.log('Psychologist ID:', psychologist.id);
      console.log('Force refresh:', forceRefresh);
      
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_plan_capabilities', {
        psychologist_id: psychologist.id
      });

      if (error) {
        console.error('Error fetching plan capabilities:', error);
        throw error;
      }

      console.log('Plan capabilities result:', data);
      
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
      
      // Actualizar cache global
      globalCapabilitiesCache[psychologist.id] = {
        capabilities: validCapabilities,
        timestamp: Date.now()
      };
      
      console.log('Setting capabilities:', validCapabilities);
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

  // Escuchar eventos de actualización de plan
  useEffect(() => {
    const handlePlanUpdate = () => {
      console.log('Plan update event received, clearing cache and refreshing...');
      clearCache();
      fetchCapabilities(true);
    };

    const handleAdminPlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      if (psychologist?.id === psychologistId) {
        console.log('Admin plan update event for this psychologist, refreshing...');
        clearCache();
        fetchCapabilities(true);
      }
    };

    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    };
  }, [psychologist?.id, clearCache, fetchCapabilities]);

  const refreshCapabilities = useCallback(() => {
    console.log('Manually refreshing plan capabilities...');
    clearCache();
    fetchCapabilities(true);
  }, [clearCache, fetchCapabilities]);

  const hasCapability = useCallback((capability: keyof PlanCapabilities): boolean => {
    return capabilities?.[capability] ?? false;
  }, [capabilities]);

  const isPlusUser = useCallback(() => {
    return capabilities?.basic_features && !capabilities?.seo_profile;
  }, [capabilities]);

  const isProUser = useCallback(() => {
    return capabilities?.seo_profile && capabilities?.advanced_reports;
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
