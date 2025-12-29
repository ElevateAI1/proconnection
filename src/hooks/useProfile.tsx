import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfileCache } from './useProfileCache';
import { useProfileData, type Profile } from './useProfileData';
import { usePsychologistData, type Psychologist } from './usePsychologistData';
import { supabase } from '@/integrations/supabase/client';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  psychologist_id: string;
  phone?: string;
  age?: number;
  notes?: string;
  profile_image_url?: string | null;
}

// Re-export types for backward compatibility
export type { Profile, Psychologist };

export const useProfile = () => {
  const { user } = useAuth();
  const cache = useProfileCache();
  const profileData = useProfileData();
  const psychologistData = usePsychologistData();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      profileData.clearProfile();
      psychologistData.clearPsychologist();
      setPatient(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = cache.getCache(user.id);
      if (cached) {
        // Cache hit - we'll let the individual hooks handle their own state
        // For now, we'll still fetch to keep state in sync
        // In a more optimized version, we could set state directly
      }

      // Fetch profile
      const profile = await profileData.fetchProfile(user.id);
      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch role-specific data
      let psychologist: Psychologist | null = null;
      let patientData: Patient | null = null;

      if (profile.user_type === 'psychologist') {
        psychologist = await psychologistData.fetchPsychologist(user.id);
      } else if (profile.user_type === 'patient') {
        const { data: patientResult, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .single();

        if (patientError) {
          console.error('Error fetching patient:', patientError);
        } else {
          patientData = patientResult;
          setPatient(patientResult);
        }
      }

      // Update cache
      cache.setCache(user.id, {
        profile,
        psychologist,
        patient: patientData
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    cache.invalidateCache();
    fetchProfile();
  };

  // Combine states from all hooks
  const combinedLoading = loading || profileData.loading || psychologistData.loading;
  const combinedError = error || profileData.error || psychologistData.error;

  return {
    profile: profileData.profile,
    psychologist: psychologistData.psychologist,
    patient,
    loading: combinedLoading,
    error: combinedError,
    forceRefresh
  };
};
