import { useState, useCallback } from 'react';
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

export const usePublicProfiles = () => {
  const [loading, setLoading] = useState(false);

  const createOrUpdateExpandedProfile = useCallback(async (data: ExpandedProfileData) => {
    setLoading(true);
    try {
      console.log('=== CREATING/UPDATING EXPANDED PROFILE ===', data);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

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
  }, []);

  const getMyExpandedProfile = useCallback(async () => {
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
  }, []);
  
  return {
    loading,
    createOrUpdateExpandedProfile,
    getMyExpandedProfile
  };
};


export const getPublicProfileByUrlDetailed = async (customUrl: string) => {
    try {
      // Normalizar la URL (lowercase, trim)
      const normalizedUrl = customUrl.toLowerCase().trim();
      console.log(`[getPublicProfileByUrlDetailed] V5: Start fetching for: "${normalizedUrl}" (original: "${customUrl}")`);

      // Increment view count in parallel, no need to wait
      supabase.rpc('increment_profile_view', { profile_url: normalizedUrl }).then(({ error }) => {
        if (error) console.warn(`[getPublicProfileByUrlDetailed] V5: RPC increment_profile_view failed (non-critical):`, error);
      });

      // Intentar primero con la vista detallada
      console.log(`[getPublicProfileByUrlDetailed] V5: Attempting to fetch from public_profile_detailed_view...`);
      
      let profile = null;
      let error = null;

      try {
        const { data, error: viewError } = await supabase
          .from('public_profile_detailed_view')
          .select('*')
          .ilike('custom_url', normalizedUrl) // Case-insensitive search
          .eq('is_active', true)
          .maybeSingle();

        if (viewError) {
          console.warn('[getPublicProfileByUrlDetailed] V5: View query failed, trying direct table query:', viewError);
          error = viewError;
        } else if (data) {
          console.log('[getPublicProfileByUrlDetailed] V5: Successfully fetched from view:', data);
          return data;
        }
      } catch (viewException) {
        console.warn('[getPublicProfileByUrlDetailed] V5: Exception querying view, falling back to direct table:', viewException);
      }

      // Fallback: buscar directamente en la tabla y hacer join manual
      console.log(`[getPublicProfileByUrlDetailed] V5: Falling back to direct table query...`);
      
      const { data: publicProfile, error: profileError } = await supabase
        .from('public_psychologist_profiles')
        .select(`
          *,
          psychologists!inner (
            id,
            first_name,
            last_name,
            specialization,
            professional_code
          )
        `)
        .ilike('custom_url', normalizedUrl)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError) {
        console.error('[getPublicProfileByUrlDetailed] V5: Error fetching profile from table:', profileError);
        return null;
      }

      if (!publicProfile) {
        console.warn(`[getPublicProfileByUrlDetailed] V5: Profile not found for url: "${normalizedUrl}"`);
        console.warn(`[getPublicProfileByUrlDetailed] V5: Make sure the profile exists and is_active = true`);
        return null;
      }

      // Obtener especialidades del perfil
      const { data: specialties } = await supabase
        .from('profile_specialties')
        .select(`
          specialty_id,
          professional_specialties!inner (
            id,
            name,
            category,
            icon
          )
        `)
        .eq('profile_id', publicProfile.id);

      // Construir el objeto de respuesta similar a la vista
      const psychologist = Array.isArray(publicProfile.psychologists) 
        ? publicProfile.psychologists[0] 
        : publicProfile.psychologists;

      const selectedSpecialties = specialties?.map((s: any) => ({
        id: s.professional_specialties.id,
        name: s.professional_specialties.name,
        category: s.professional_specialties.category,
        icon: s.professional_specialties.icon
      })) || [];

      const combinedProfile = {
        id: publicProfile.id,
        custom_url: publicProfile.custom_url,
        is_active: publicProfile.is_active,
        seo_title: publicProfile.seo_title,
        seo_description: publicProfile.seo_description,
        seo_keywords: publicProfile.seo_keywords,
        about_description: publicProfile.about_description,
        therapeutic_approach: publicProfile.therapeutic_approach,
        years_experience: publicProfile.years_experience,
        profession_type: publicProfile.profession_type,
        profile_data: publicProfile.profile_data,
        view_count: publicProfile.view_count,
        last_viewed_at: publicProfile.last_viewed_at,
        first_name: psychologist?.first_name || null,
        last_name: psychologist?.last_name || null,
        specialization: psychologist?.specialization || null,
        professional_code: psychologist?.professional_code || null,
        selected_specialties: selectedSpecialties,
        config_title: null,
        config_description: null,
        config_keywords: null,
        config_custom_url: null
      };

      console.log('[getPublicProfileByUrlDetailed] V5: Successfully constructed profile from direct query:', combinedProfile);
      return combinedProfile;
      
    } catch (error: any) {
      console.error('[getPublicProfileByUrlDetailed] V5: CATCH BLOCK: An unexpected error occurred', error);
      return null;
    }
  };
