
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
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch specific role data
      if (profileData.user_type === 'psychologist') {
        const { data: psychData } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        setPsychologist(psychData);
      } else if (profileData.user_type === 'patient') {
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        setPatient(patientData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPsychologistProfile = async (data: Omit<Psychologist, 'id' | 'professional_code'>) => {
    if (!user) return { error: 'No user logged in' };

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

    if (!error) {
      setPsychologist(result);
    }

    return { data: result, error };
  };

  const createPatientProfile = async (data: Omit<Patient, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    const { data: result, error } = await supabase
      .from('patients')
      .insert({
        id: user.id,
        ...data
      })
      .select()
      .single();

    if (!error) {
      setPatient(result);
    }

    return { data: result, error };
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
