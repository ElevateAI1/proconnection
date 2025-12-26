
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
  plan_type?: string;
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

interface ProfileData {
  profile: Profile | null;
  psychologist: Psychologist | null;
  patient: Patient | null;
}

// Simple cache without complex timing logic
let profileCache: ProfileData & { userId: string | null } = {
  profile: null,
  psychologist: null,
  patient: null,
  userId: null
};

export const useOptimizedProfile = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData>({
    profile: profileCache.profile,
    psychologist: profileCache.psychologist,
    patient: profileCache.patient
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (forceRefresh = false) => {
    if (!user) {
      console.log('No user found');
      setLoading(false);
      return;
    }

    // Use cache if same user and not forcing refresh
    if (!forceRefresh && profileCache.userId === user.id && profileCache.profile) {
      console.log('Using cached profile data');
      setData({
        profile: profileCache.profile,
        psychologist: profileCache.psychologist,
        patient: profileCache.patient
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching fresh profile data for user:', user.id);
      setLoading(true);
      setError(null);
      
      // Single query to get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Error loading profile');
      }

      if (!profileData) {
        console.log('Creating new profile');
        // Intentar crear el profile con upsert
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email!,
            user_type: user.user_metadata?.user_type || 'patient'
          }, {
            onConflict: 'id'
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
          // Si es error 409 (conflicto), el profile ya existe, intentar obtenerlo
          if (createError.code === '23505' || createError.message.includes('duplicate') || createError.code === 'PGRST116' || createError.status === 409 || createError.statusCode === 409) {
            console.log('Profile already exists (409), fetching it');
            const { data: existingProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (fetchError) {
              console.error('Error fetching existing profile:', fetchError);
              // Si no podemos obtener el profile, continuar sin él por ahora
              console.log('Continuing without profile, will retry later');
            } else if (existingProfile) {
              // Usar el profile existente
              profileData = existingProfile;
            } else {
              // No existe y no se pudo crear, lanzar error
              throw new Error('Could not create or fetch profile');
            }
          } else {
            // Otro tipo de error
            throw new Error('Could not create profile');
          }
        } else if (newProfile) {
          // Profile creado exitosamente
          profileData = newProfile;
        }
      }
      
      // Si aún no tenemos profileData después de intentar crearlo, obtenerlo
      if (!profileData) {
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (retryProfile) {
          profileData = retryProfile;
        } else {
          // Si aún no existe, crear uno temporal basado en metadata
          console.log('No profile found in DB, using metadata');
          profileData = {
            id: user.id,
            email: user.email!,
            user_type: (user.user_metadata?.user_type || 'patient') as 'psychologist' | 'patient' | 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }
      
      const typedProfile: Profile = {
        ...profileData,
        user_type: profileData.user_type as 'psychologist' | 'patient' | 'admin'
      };

      // Parallel fetch of role-specific data
      let psychData = null;
      let patientData = null;

      if (typedProfile.user_type === 'psychologist') {
        const { data: psychResult } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        psychData = psychResult;
      } else if (typedProfile.user_type === 'patient') {
        const { data: patientResult } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        patientData = patientResult;
      }

      const newData = {
        profile: typedProfile,
        psychologist: psychData,
        patient: patientData
      };

      setData(newData);
      profileCache = { ...newData, userId: user.id };
      
      console.log('Profile loaded successfully');

    } catch (error) {
      console.error('Error in fetchProfile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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

  useEffect(() => {
    if (!user) {
      setData({ profile: null, psychologist: null, patient: null });
      setLoading(false);
      setError(null);
      profileCache = { profile: null, psychologist: null, patient: null, userId: null };
      return;
    }

    if (profileCache.userId !== user.id) {
      console.log('User changed, clearing cache');
      profileCache = { profile: null, psychologist: null, patient: null, userId: user.id };
    }

    fetchProfile();
  }, [user?.id]);

  const createPsychologistProfile = async (profileData: Omit<Psychologist, 'id' | 'professional_code'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      
      const { data: codeData, error: codeError } = await supabase.rpc('generate_professional_code');
      
      if (codeError) {
        return { error: `Error generating professional code: ${codeError.message}` };
      }

      const psychologistData = {
        id: user.id,
        professional_code: codeData,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone || null,
        specialization: profileData.specialization || null,
        license_number: profileData.license_number || null
      };

      const { data: result, error: insertError } = await supabase
        .from('psychologists')
        .insert(psychologistData)
        .select()
        .single();

      if (insertError) {
        return { error: `Error creating profile: ${insertError.message}` };
      }

      // Clear cache and update state
      profileCache = { profile: data.profile, psychologist: result, patient: null, userId: user.id };
      setData(prev => ({ ...prev, psychologist: result }));
      
      toast({
        title: "Profile created",
        description: "Psychologist profile created successfully",
      });
      
      return { data: result, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Unexpected error';
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

  const createPatientProfile = async (profileData: Omit<Patient, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setLoading(true);
      
      const { data: result, error } = await supabase
        .from('patients')
        .insert({
          id: user.id,
          ...profileData
        })
        .select()
        .single();

      if (error) {
        return { error: 'Could not create patient profile' };
      }

      // Clear cache and update state
      profileCache = { profile: data.profile, psychologist: null, patient: result, userId: user.id };
      setData(prev => ({ ...prev, patient: result }));
      
      toast({
        title: "Profile created",
        description: "Patient profile created successfully",
      });
      
      return { data: result, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Unexpected error';
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

  const refetch = () => fetchProfile(true);
  const clearCache = () => {
    profileCache = { profile: null, psychologist: null, patient: null, userId: null };
    setData({ profile: null, psychologist: null, patient: null });
  };

  return {
    profile: data.profile,
    psychologist: data.psychologist,
    patient: data.patient,
    loading,
    error,
    createPsychologistProfile,
    createPatientProfile,
    refetch,
    clearCache,
    forceRefresh: refetch
  };
};
