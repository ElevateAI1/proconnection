
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  local_seo?: string;
  custom_url?: string;
  structured_data?: any;
}

interface DirectoryEntry {
  directory_id: string;
  directory_name: string;
  status: 'not_registered' | 'pending' | 'registered';
  registration_date?: string;
  profile_url?: string;
  notes?: string;
}

interface SocialPlatform {
  platform_id: string;
  platform_name: string;
  status: 'inactive' | 'planned' | 'active';
  profile_url?: string;
  content_strategy?: any;
  posting_frequency?: string;
  target_audience?: string;
}

interface ModuleScore {
  module_type: 'profile' | 'seo' | 'presence' | 'social';
  score: number;
  completed: boolean;
  module_data?: any;
}

export const useVisibilityData = () => {
  const { psychologist } = useProfile();
  const [seoConfig, setSeoConfig] = useState<SeoConfig>({});
  const [directories, setDirectories] = useState<DirectoryEntry[]>([]);
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>([]);
  const [moduleScores, setModuleScores] = useState<ModuleScore[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos de SEO
  const loadSeoConfig = async () => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from('psychologist_seo_config')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading SEO config:', error);
        return;
      }

      if (data) {
        setSeoConfig({
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          local_seo: data.local_seo,
          custom_url: data.custom_url,
          structured_data: data.structured_data
        });
      }
    } catch (error) {
      console.error('Exception loading SEO config:', error);
    }
  };

  // Guardar configuración SEO
  const saveSeoConfig = async (config: SeoConfig) => {
    if (!psychologist?.id) return { error: 'No psychologist ID' };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('psychologist_seo_config')
        .upsert({
          psychologist_id: psychologist.id,
          title: config.title,
          description: config.description,
          keywords: config.keywords,
          local_seo: config.local_seo,
          custom_url: config.custom_url,
          structured_data: config.structured_data || {},
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving SEO config:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración SEO",
          variant: "destructive"
        });
        return { error: error.message };
      }

      setSeoConfig(config);
      toast({
        title: "Guardado exitoso",
        description: "Configuración SEO guardada correctamente"
      });
      return { data };
    } catch (error: any) {
      console.error('Exception saving SEO config:', error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar",
        variant: "destructive"
      });
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cargar directorios
  const loadDirectories = async () => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from('psychologist_directories')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (error) {
        console.error('Error loading directories:', error);
        return;
      }

      // Mapear los datos de la DB a nuestro tipo con validación de status
      const mappedDirectories: DirectoryEntry[] = (data || []).map(item => ({
        directory_id: item.directory_id,
        directory_name: item.directory_name,
        status: ['not_registered', 'pending', 'registered'].includes(item.status) 
          ? item.status as 'not_registered' | 'pending' | 'registered'
          : 'not_registered',
        registration_date: item.registration_date,
        profile_url: item.profile_url,
        notes: item.notes
      }));

      setDirectories(mappedDirectories);
    } catch (error) {
      console.error('Exception loading directories:', error);
    }
  };

  // Actualizar directorio
  const updateDirectory = async (directoryData: Partial<DirectoryEntry> & { directory_id: string }) => {
    if (!psychologist?.id) return { error: 'No psychologist ID' };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('psychologist_directories')
        .upsert({
          psychologist_id: psychologist.id,
          directory_id: directoryData.directory_id,
          directory_name: directoryData.directory_name || '',
          status: directoryData.status || 'not_registered',
          profile_url: directoryData.profile_url,
          notes: directoryData.notes,
          registration_date: directoryData.status === 'registered' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating directory:', error);
        return { error: error.message };
      }

      await loadDirectories(); // Recargar lista
      toast({
        title: "Directorio actualizado",
        description: `Estado de ${directoryData.directory_name} actualizado`
      });
      return { data };
    } catch (error: any) {
      console.error('Exception updating directory:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cargar plataformas sociales
  const loadSocialPlatforms = async () => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from('psychologist_social_strategy')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (error) {
        console.error('Error loading social platforms:', error);
        return;
      }

      // Mapear los datos de la DB a nuestro tipo con validación de status
      const mappedPlatforms: SocialPlatform[] = (data || []).map(item => ({
        platform_id: item.platform_id,
        platform_name: item.platform_name,
        status: ['inactive', 'planned', 'active'].includes(item.status)
          ? item.status as 'inactive' | 'planned' | 'active'
          : 'inactive',
        profile_url: item.profile_url,
        content_strategy: item.content_strategy,
        posting_frequency: item.posting_frequency,
        target_audience: item.target_audience
      }));

      setSocialPlatforms(mappedPlatforms);
    } catch (error) {
      console.error('Exception loading social platforms:', error);
    }
  };

  // Actualizar plataforma social
  const updateSocialPlatform = async (platformData: Partial<SocialPlatform> & { platform_id: string }) => {
    if (!psychologist?.id) return { error: 'No psychologist ID' };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('psychologist_social_strategy')
        .upsert({
          psychologist_id: psychologist.id,
          platform_id: platformData.platform_id,
          platform_name: platformData.platform_name || '',
          status: platformData.status || 'inactive',
          profile_url: platformData.profile_url,
          content_strategy: platformData.content_strategy || {},
          posting_frequency: platformData.posting_frequency,
          target_audience: platformData.target_audience,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating social platform:', error);
        return { error: error.message };
      }

      await loadSocialPlatforms(); // Recargar lista
      toast({
        title: "Plataforma actualizada",
        description: `${platformData.platform_name} actualizada correctamente`
      });
      return { data };
    } catch (error: any) {
      console.error('Exception updating social platform:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Guardar puntuación de módulo
  const saveModuleScore = async (moduleType: ModuleScore['module_type'], score: number, moduleData?: any) => {
    if (!psychologist?.id) return { error: 'No psychologist ID' };

    try {
      const { data, error } = await supabase
        .from('visibility_module_scores')
        .upsert({
          psychologist_id: psychologist.id,
          module_type: moduleType,
          score: score,
          completed: score > 0,
          module_data: moduleData || {},
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving module score:', error);
        return { error: error.message };
      }

      await loadModuleScores(); // Recargar puntuaciones
      return { data };
    } catch (error: any) {
      console.error('Exception saving module score:', error);
      return { error: error.message };
    }
  };

  // Cargar puntuaciones de módulos
  const loadModuleScores = async () => {
    if (!psychologist?.id) return;

    try {
      const { data, error } = await supabase
        .from('visibility_module_scores')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (error) {
        console.error('Error loading module scores:', error);
        return;
      }

      // Mapear los datos de la DB a nuestro tipo con validación de module_type
      const mappedScores: ModuleScore[] = (data || []).map(item => ({
        module_type: ['profile', 'seo', 'presence', 'social'].includes(item.module_type)
          ? item.module_type as 'profile' | 'seo' | 'presence' | 'social'
          : 'profile',
        score: item.score,
        completed: item.completed,
        module_data: item.module_data
      }));

      setModuleScores(mappedScores);
    } catch (error) {
      console.error('Exception loading module scores:', error);
    }
  };

  // Actualizar perfil de psicólogo
  const updatePsychologistProfile = async (profileData: Partial<{
    first_name: string;
    last_name: string;
    specialization: string;
    phone: string;
    license_number: string;
  }>) => {
    if (!psychologist?.id) return { error: 'No psychologist ID' };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('psychologists')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', psychologist.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating psychologist profile:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil",
          variant: "destructive"
        });
        return { error: error.message };
      }

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente"
      });
      return { data };
    } catch (error: any) {
      console.error('Exception updating psychologist profile:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar",
        variant: "destructive"
      });
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener puntuación de un módulo específico
  const getModuleScore = (moduleType: ModuleScore['module_type']) => {
    const module = moduleScores.find(m => m.module_type === moduleType);
    return module ? { score: module.score, completed: module.completed } : { score: 0, completed: false };
  };

  // Cargar todos los datos al inicio
  useEffect(() => {
    if (psychologist?.id) {
      loadSeoConfig();
      loadDirectories();
      loadSocialPlatforms();
      loadModuleScores();
    }
  }, [psychologist?.id]);

  return {
    // Estado
    seoConfig,
    directories,
    socialPlatforms,
    moduleScores,
    loading,

    // Métodos
    saveSeoConfig,
    updateDirectory,
    updateSocialPlatform,
    saveModuleScore,
    updatePsychologistProfile,
    getModuleScore,

    // Recargar datos
    loadSeoConfig,
    loadDirectories,
    loadSocialPlatforms,
    loadModuleScores
  };
};
