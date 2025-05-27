
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  user_type: 'psychologist' | 'patient' | 'admin';
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

// Cache global que persiste entre navegación
let profileCache: {
  profile: Profile | null;
  psychologist: Psychologist | null;
  patient: Patient | null;
  userId: string | null;
  dataFetched: boolean;
} = {
  profile: null,
  psychologist: null,
  patient: null,
  userId: null,
  dataFetched: false
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(profileCache.profile);
  const [psychologist, setPsychologist] = useState<Psychologist | null>(profileCache.psychologist);
  const [patient, setPatient] = useState<Patient | null>(profileCache.patient);
  const [loading, setLoading] = useState(!profileCache.dataFetched);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Limpiar estado cuando no hay usuario
      setProfile(null);
      setPsychologist(null);
      setPatient(null);
      setLoading(false);
      setError(null);
      profileCache = {
        profile: null,
        psychologist: null,
        patient: null,
        userId: null,
        dataFetched: false
      };
      return;
    }

    // IMPORTANTE: Si el usuario cambió, limpiar cache y hacer fetch nuevo
    if (profileCache.userId !== user.id) {
      console.log('User ID changed, clearing cache and fetching new profile');
      profileCache = {
        profile: null,
        psychologist: null,
        patient: null,
        userId: null,
        dataFetched: false
      };
      fetchProfile();
      return;
    }

    // Si ya tenemos datos para este usuario, usarlos inmediatamente
    if (profileCache.userId === user.id && profileCache.dataFetched) {
      console.log('Using cached profile data for user:', user.id);
      setProfile(profileCache.profile);
      setPsychologist(profileCache.psychologist);
      setPatient(profileCache.patient);
      setLoading(false);
      return;
    }

    // Solo hacer fetch si no tenemos datos en cache
    if (!profileCache.dataFetched || profileCache.userId !== user.id) {
      fetchProfile();
    }
  }, [user?.id]); // Solo depender del ID del usuario

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', user.id);
      setLoading(true);
      setError(null);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('No se pudo cargar el perfil');
      }
      
      const typedProfile: Profile = {
        ...profileData,
        user_type: profileData.user_type as 'psychologist' | 'patient' | 'admin'
      };
      setProfile(typedProfile);

      let psychData = null;
      let patientData = null;

      // Fetch specific role data
      if (typedProfile.user_type === 'psychologist') {
        const { data: psychResult, error: psychError } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (psychError) {
          console.error('Error fetching psychologist data:', psychError);
          setError('Error al cargar datos del psicólogo');
        } else {
          psychData = psychResult;
          setPsychologist(psychResult);
        }
      } else if (typedProfile.user_type === 'patient') {
        const { data: patientResult, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (patientError) {
          console.error('Error fetching patient data:', patientError);
          setError('Error al cargar datos del paciente');
        } else {
          patientData = patientResult;
          setPatient(patientResult);
        }
      }

      // Guardar en cache y marcar como completado
      profileCache = {
        profile: typedProfile,
        psychologist: psychData,
        patient: patientData,
        userId: user.id,
        dataFetched: true
      };

    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPsychologistProfile = async (data: Omit<Psychologist, 'id' | 'professional_code'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      
      const { data: codeData, error: codeError } = await supabase.rpc('generate_professional_code');
      
      if (codeError) {
        console.error('Error generating code:', codeError);
        return { error: 'No se pudo generar el código profesional' };
      }

      const { data: result, error } = await supabase
        .from('psychologists')
        .insert({
          id: user.id,
          professional_code: codeData,
          ...data
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating psychologist:', error);
        return { error: 'No se pudo crear el perfil de psicólogo' };
      }

      setPsychologist(result);
      profileCache.psychologist = result;
      
      toast({
        title: "Perfil creado",
        description: "Perfil de psicólogo creado exitosamente",
      });
      
      return { data: result, error: null };
    } catch (error: any) {
      console.error('Error creating psychologist profile:', error);
      const errorMessage = error.message || 'Error inesperado';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createPatientProfile = async (data: Omit<Patient, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      
      const { data: result, error } = await supabase
        .from('patients')
        .insert({
          id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        return { error: 'No se pudo crear el perfil de paciente' };
      }

      setPatient(result);
      profileCache.patient = result;
      
      toast({
        title: "Perfil creado",
        description: "Perfil de paciente creado exitosamente",
      });
      
      return { data: result, error: null };
    } catch (error: any) {
      console.error('Error creating patient profile:', error);
      const errorMessage = error.message || 'Error inesperado';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    profileCache = {
      profile: null,
      psychologist: null,
      patient: null,
      userId: null,
      dataFetched: false
    };
  };

  const refetch = () => {
    profileCache.dataFetched = false;
    fetchProfile();
  };

  return {
    profile,
    psychologist,
    patient,
    loading,
    error,
    createPsychologistProfile,
    createPatientProfile,
    refetch,
    clearCache
  };
};
