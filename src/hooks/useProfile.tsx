
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  email: string;
  user_type: 'psychologist' | 'patient';
  created_at: string;
  updated_at: string;
}

interface Psychologist {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  license_number?: string;
  specialization?: string;
  phone?: string;
  subscription_status?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_end_date?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  psychologist_id: string;
  phone?: string;
  age?: number;
  notes?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setPsychologist(null);
      setPatient(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      // Type assertion to ensure user_type is the correct type
      const typedProfile: Profile = {
        ...profileData,
        user_type: profileData.user_type as 'psychologist' | 'patient'
      };
      setProfile(typedProfile);

      // Fetch specific role data with more reliable approach
      if (typedProfile.user_type === 'psychologist') {
        const { data: psychData, error: psychError } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (psychError) {
          console.error('Error fetching psychologist data:', psychError);
        } else {
          setPsychologist(psychData);
        }
      } else if (typedProfile.user_type === 'patient') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (patientError) {
          console.error('Error fetching patient data:', patientError);
        } else {
          setPatient(patientData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPsychologistProfile = async (data: Omit<Psychologist, 'id' | 'professional_code'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Generate professional code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_professional_code');
      
      if (codeError) return { error: codeError.message };

      const { data: result, error } = await supabase
        .from('psychologists')
        .insert({
          id: user.id,
          professional_code: codeData,
          ...data
        })
        .select()
        .single();

      if (error) return { error: error.message };

      setPsychologist(result);
      return { data: result, error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const createPatientProfile = async (data: Omit<Patient, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data: result, error } = await supabase
        .from('patients')
        .insert({
          id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) return { error: error.message };

      setPatient(result);
      return { data: result, error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    profile,
    psychologist,
    patient,
    loading,
    createPsychologistProfile,
    createPatientProfile,
    refetch: fetchProfile
  };
};
