
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PublicProfile {
  id: string;
  psychologist_id: string;
  custom_url: string;
  is_active: boolean;
  profile_data: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

interface PublicProfileView {
  id: string;
  custom_url: string;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  last_viewed_at?: string;
  profile_data: any;
  first_name: string;
  last_name: string;
  specialization?: string;
  professional_code: string;
  config_title?: string;
  config_description?: string;
  config_keywords?: string;
  config_custom_url?: string;
}

export const usePublicProfiles = () => {
  const [loading, setLoading] = useState(false);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);

  const createOrUpdatePublicProfile = async (data: {
    custom_url: string;
    is_active: boolean;
    profile_data?: any;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
  }) => {
    setLoading(true);
    try {
      console.log('=== CREATING/UPDATING PUBLIC PROFILE ===', data);
      
      // Verificar si ya existe un perfil público para este psicólogo
      const { data: existingProfile, error: checkError } = await supabase
        .from('public_psychologist_profiles')
        .select('*')
        .eq('psychologist_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (checkError) {
        console.error('=== ERROR CHECKING EXISTING PROFILE ===', checkError);
        throw checkError;
      }

      let result;
      if (existingProfile) {
        // Actualizar perfil existente
        const { data: updatedProfile, error: updateError } = await supabase
          .from('public_psychologist_profiles')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
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
            psychologist_id: (await supabase.auth.getUser()).data.user?.id,
            ...data
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

      setPublicProfile(result);
      console.log('=== PUBLIC PROFILE CREATED/UPDATED ===', result);
      return result;
      
    } catch (error: any) {
      console.error('=== ERROR MANAGING PUBLIC PROFILE ===', error);
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

  const getMyPublicProfile = async () => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('public_psychologist_profiles')
        .select('*')
        .eq('psychologist_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (error) throw error;
      
      setPublicProfile(profile);
      return profile;
      
    } catch (error: any) {
      console.error('=== ERROR FETCHING PUBLIC PROFILE ===', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPublicProfileByUrl = async (customUrl: string): Promise<PublicProfileView | null> => {
    try {
      console.log('=== FETCHING PUBLIC PROFILE BY URL ===', customUrl);
      
      // Incrementar contador de vistas
      await supabase.rpc('increment_profile_view', { profile_url: customUrl });
      
      // Obtener datos del perfil usando la vista
      const { data: profile, error } = await supabase
        .from('public_profile_view')
        .select('*')
        .eq('custom_url', customUrl)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('=== ERROR FETCHING PUBLIC PROFILE ===', error);
        return null;
      }

      console.log('=== PUBLIC PROFILE FOUND ===', profile);
      return profile;
      
    } catch (error: any) {
      console.error('=== ERROR IN getPublicProfileByUrl ===', error);
      return null;
    }
  };

  const toggleProfileStatus = async (isActive: boolean) => {
    if (!publicProfile) return;

    setLoading(true);
    try {
      const { data: updatedProfile, error } = await supabase
        .from('public_psychologist_profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', publicProfile.id)
        .select()
        .single();

      if (error) throw error;
      
      setPublicProfile(updatedProfile);
      
      toast({
        title: isActive ? "Perfil activado" : "Perfil desactivado",
        description: isActive 
          ? "Tu perfil público está ahora visible"
          : "Tu perfil público está ahora oculto",
      });
      
    } catch (error: any) {
      console.error('=== ERROR TOGGLING PROFILE STATUS ===', error);
      toast({
        title: "Error",
        description: "Error al cambiar el estado del perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    publicProfile,
    loading,
    createOrUpdatePublicProfile,
    getMyPublicProfile,
    getPublicProfileByUrl,
    toggleProfileStatus
  };
};
