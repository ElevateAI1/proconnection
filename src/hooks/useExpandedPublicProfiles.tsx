
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
}

export const useExpandedPublicProfiles = () => {
  const [loading, setLoading] = useState(false);

  const createOrUpdateExpandedProfile = async (data: ExpandedProfileData) => {
    setLoading(true);
    try {
      console.log('=== CREATING/UPDATING EXPANDED PROFILE ===', data);
      
      // Obtener el usuario actual
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      // Verificar si ya existe un perfil público
      const { data: existingProfile, error: checkError } = await supabase
        .from('public_psychologist_profiles')
        .select('*')
        .eq('psychologist_id', user.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('=== ERROR CHECKING EXISTING PROFILE ===', checkError);
        throw checkError;
      }

      let result;
      const profileData = {
        custom_url: data.custom_url,
        is_active: data.is_active,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords,
        about_description: data.about_description,
        therapeutic_approach: data.therapeutic_approach,
        years_experience: data.years_experience,
        profession_type: data.profession_type || 'psychologist',
        profile_data: data.profile_data || {},
        updated_at: new Date().toISOString()
      };

      if (existingProfile) {
        // Actualizar perfil existente
        const { data: updatedProfile, error: updateError } = await supabase
          .from('public_psychologist_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = updatedProfile;
        
        toast({
          title: "Perfil público actualizado",
          description: "Tu perfil público ha sido actualizado exitosamente",
        });
      } else {
        // Crear nuevo perfil público
        const { data: newProfile, error: createError } = await supabase
          .from('public_psychologist_profiles')
          .insert({
            psychologist_id: user.user.id,
            ...profileData
          })
          .select()
          .single();

        if (createError) throw createError;
        result = newProfile;
        
        toast({
          title: "Perfil público creado",
          description: "Tu perfil público ha sido creado exitosamente",
        });
      }

      console.log('=== EXPANDED PROFILE CREATED/UPDATED ===', result);
      return result;
      
    } catch (error: any) {
      console.error('=== ERROR MANAGING EXPANDED PROFILE ===', error);
      toast({
        title: "Error",
        description: error.message || "Error al gestionar el perfil público",
        variant: "destructive"
      });
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
