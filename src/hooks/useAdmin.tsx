
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
  plan_type: string;
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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking admin status for user:', user.id);
      
      const { data: adminData, error: adminError } = await supabase
        .rpc('is_admin_user', { user_id: user.id });

      console.log('Admin check result:', { adminData, adminError });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setIsAdmin(false);
      } else {
        setIsAdmin(adminData === true);
        
        if (adminData === true) {
          await fetchPsychologistStats();
        }
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
      const timestamp = Date.now();
      console.log(`[${timestamp}] === FETCHING ULTRA FRESH DATA WITH NO CACHE ===`);
      
      // Forzar consulta completamente fresca evitando cualquier cache
      const randomParam = Math.random().toString(36);
      console.log(`[${timestamp}] Using cache-buster: ${randomParam}`);

      // Consulta principal de psicólogos con orden aleatorio para evitar cache
      const { data: psychologistData, error: psychologistError } = await supabase
        .from('psychologists')
        .select('*')
        .order('updated_at', { ascending: false })
        .order('id', { ascending: true }); // Orden secundario para consistencia

      console.log(`[${timestamp}] FRESH QUERY RESULT:`, { 
        count: psychologistData?.length, 
        error: psychologistError,
        timestamp: new Date().toISOString()
      });

      if (psychologistError) {
        console.error('Error fetching psychologists:', psychologistError);
        throw psychologistError;
      }

      if (!psychologistData || psychologistData.length === 0) {
        console.log('No psychologists found');
        setPsychologistStats([]);
        return;
      }

      // Log detallado de TODOS los plan_type
      psychologistData.forEach((p, index) => {
        console.log(`[${timestamp}] PSYCHOLOGIST ${index + 1}:`);
        console.log(`  - Name: ${p.first_name} ${p.last_name}`);
        console.log(`  - ID: ${p.id}`);
        console.log(`  - plan_type: "${p.plan_type}" (type: ${typeof p.plan_type})`);
        console.log(`  - updated_at: ${p.updated_at}`);
        console.log(`  - Raw object:`, p);
      });

      // Obtener emails con consulta separada
      const psychologistIds = psychologistData.map(p => p.id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', psychologistIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Crear mapa de emails
      const emailMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          emailMap.set(profile.id, profile.email);
        });
      }

      // Transformar datos con logging extra
      const transformedData = psychologistData.map((psychologist, index) => {
        const email = emailMap.get(psychologist.id) || 'No email';
        const trialEndDate = psychologist.trial_end_date ? new Date(psychologist.trial_end_date) : null;
        const subscriptionEndDate = psychologist.subscription_end_date ? new Date(psychologist.subscription_end_date) : null;
        const now = new Date();

        const trialDaysRemaining = trialEndDate 
          ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const subscriptionDaysRemaining = subscriptionEndDate 
          ? Math.max(0, Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const isExpired = psychologist.subscription_status === 'expired' || 
                         (psychologist.subscription_status === 'trial' && trialEndDate && trialEndDate < now) ||
                         (psychologist.subscription_status === 'active' && subscriptionEndDate && subscriptionEndDate < now);

        // PRESERVAR EXACTAMENTE el plan_type de la DB
        const planType = psychologist.plan_type;
        
        console.log(`[${timestamp}] TRANSFORM ${index + 1}: ${psychologist.first_name} ${psychologist.last_name}`);
        console.log(`[${timestamp}]   - DB plan_type: "${planType}" (preserved exactly)`);

        const result = {
          id: psychologist.id,
          first_name: psychologist.first_name || 'Sin nombre',
          last_name: psychologist.last_name || 'Sin apellido',
          email: email,
          professional_code: psychologist.professional_code || 'Sin código',
          subscription_status: psychologist.subscription_status || 'trial',
          trial_start_date: psychologist.trial_start_date || '',
          trial_end_date: psychologist.trial_end_date || '',
          subscription_end_date: psychologist.subscription_end_date || '',
          created_at: psychologist.created_at || '',
          trial_days_remaining: trialDaysRemaining,
          subscription_days_remaining: subscriptionDaysRemaining,
          is_expired: isExpired,
          plan_type: planType // EXACTAMENTE como viene de la DB
        };

        console.log(`[${timestamp}]   - Final result plan_type: "${result.plan_type}"`);
        return result;
      });

      console.log(`[${timestamp}] === SETTING FINAL STATE ===`);
      console.log(`[${timestamp}] Total records to set:`, transformedData.length);
      
      // Log final de todos los plan_type que se van a mostrar
      transformedData.forEach((item, index) => {
        console.log(`[${timestamp}] FINAL STATE ${index + 1}: ${item.first_name} ${item.last_name} - plan_type: "${item.plan_type}"`);
      });

      setPsychologistStats(transformedData);
      console.log(`[${timestamp}] ✅ STATE UPDATED SUCCESSFULLY`);

    } catch (error) {
      console.error('Error fetching psychologist stats:', error);
      setPsychologistStats([]);
    }
  };

  // Función de refresh ultra agresiva
  const forceRefresh = async () => {
    const timestamp = Date.now();
    console.log(`[${timestamp}] === FORCE REFRESH INITIATED ===`);
    
    // Invalidar cualquier cache potential
    console.log(`[${timestamp}] Clearing potential caches...`);
    
    // Re-fetch inmediato
    await fetchPsychologistStats();
    
    console.log(`[${timestamp}] ✅ FORCE REFRESH COMPLETED`);
  };

  return {
    isAdmin,
    psychologistStats,
    loading,
    refetch: fetchPsychologistStats,
    forceRefresh
  };
};
