
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ExpandedProfileData {
  custom_url: string;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  about_description?: string;
  therapeutic_approach?: string;
  years_experience?: number;
  profession_type?: string;
  profile_data?: any;
  specialties?: string[];
  location?: string;
  languages?: string[];
  session_format?: string;
  session_duration?: number;
  pricing_info?: string;
  education?: string;
  certifications?: string;
  email?: string;
  website?: string;
}

export const useExpandedPublicProfiles = () => {
  const [loading, setLoading] = useState(false);

  const createOrUpdateExpandedProfile = async (data: ExpandedProfileData) => {
    setLoading(true);
    try {
      console.log('=== STARTING PROFILE SAVE ===', data);
      
      // Obtener el usuario actual
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      console.log('=== USER AUTHENTICATED ===', user.user.id);

      // Construir el profile_data completo con TODOS los datos
      const completeProfileData = {
        selected_specialties: data.specialties || [],
        location: data.location || '',
        languages: data.languages || [],
        session_format: data.session_format || 'presencial',
        session_duration: data.session_duration || 60,
        pricing_info: data.pricing_info || '',
        education: data.education || '',
        certifications: data.certifications || '',
        email: data.email || '',
        website: data.website || ''
      };

      console.log('=== COMPLETE PROFILE DATA ===', completeProfileData);

      // Preparar el objeto completo para guardar
      const profilePayload = {
        custom_url: data.custom_url.trim(),
        is_active: data.is_active,
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || '',
        about_description: data.about_description || '',
        therapeutic_approach: data.therapeutic_approach || '',
        years_experience: data.years_experience || null,
        profession_type: data.profession_type || 'psychologist',
        profile_data: completeProfileData,
        updated_at: new Date().toISOString()
      };

      console.log('=== PROFILE PAYLOAD ===', profilePayload);

      // Verificar si ya existe un perfil público
      const { data: existingProfile, error: checkError } = await supabase
        .from('public_psychologist_profiles')
        .select('id, psychologist_id')
        .eq('psychologist_id', user.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('=== ERROR CHECKING EXISTING PROFILE ===', checkError);
        throw checkError;
      }

      let result;

      if (existingProfile) {
        console.log('=== UPDATING EXISTING PROFILE ===', existingProfile.id);
        
        // Actualizar perfil existente
        const { data: updatedProfile, error: updateError } = await supabase
          .from('public_psychologist_profiles')
          .update(profilePayload)
          .eq('id', existingProfile.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('=== UPDATE ERROR ===', updateError);
          throw updateError;
        }

        result = updatedProfile;
        console.log('=== PROFILE UPDATED SUCCESSFULLY ===', result);
        
      } else {
        console.log('=== CREATING NEW PROFILE ===');
        
        // Crear nuevo perfil público
        const { data: newProfile, error: createError } = await supabase
          .from('public_psychologist_profiles')
          .insert({
            psychologist_id: user.user.id,
            ...profilePayload
          })
          .select('*')
          .single();

        if (createError) {
          console.error('=== CREATE ERROR ===', createError);
          throw createError;
        }

        result = newProfile;
        console.log('=== PROFILE CREATED SUCCESSFULLY ===', result);
      }

      return result;
      
    } catch (error: any) {
      console.error('=== PROFILE SAVE ERROR ===', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMyExpandedProfile = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data: profile, error } = await supabase
        .from('public_psychologist_profiles')
        .select('*')
        .eq('psychologist_id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      
      return profile;
      
    } catch (error: any) {
      console.error('=== ERROR FETCHING EXPANDED PROFILE ===', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPublicProfileByUrlDetailed = async (customUrl: string) => {
    try {
      console.log('=== FETCHING DETAILED PROFILE BY URL ===', customUrl);
      
      // Incrementar contador de vistas
      await supabase.rpc('increment_profile_view', { profile_url: customUrl });
      
      // Obtener datos del perfil usando la vista detallada
      const { data: profile, error } = await supabase
        .from('public_profile_detailed_view')
        .select('*')
        .eq('custom_url', customUrl)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('=== ERROR FETCHING DETAILED PROFILE ===', error);
        return null;
      }

      console.log('=== DETAILED PROFILE FOUND ===', profile);
      return profile;
      
    } catch (error: any) {
      console.error('=== ERROR IN getPublicProfileByUrlDetailed ===', error);
      return null;
    }
  };

  return {
    loading,
    createOrUpdateExpandedProfile,
    getMyExpandedProfile,
    getPublicProfileByUrlDetailed
  };
};
