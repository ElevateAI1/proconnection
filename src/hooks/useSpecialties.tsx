
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Specialty {
  id: string;
  name: string;
  profession_type: string;
  category: string;
  icon: string;
}

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSpecialties = useCallback(async (professionType?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('professional_specialties')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (professionType) {
        query = query.eq('profession_type', professionType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading specialties:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las especialidades",
          variant: "destructive"
        });
        return;
      }

      setSpecialties(data || []);
    } catch (error) {
      console.error('Exception loading specialties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfileSpecialties = useCallback(async (profileId: string, specialtyIds: string[]) => {
    try {
      // Eliminar especialidades existentes
      await supabase
        .from('profile_specialties')
        .delete()
        .eq('profile_id', profileId);

      // Insertar nuevas especialidades
      if (specialtyIds.length > 0) {
        const { error } = await supabase
          .from('profile_specialties')
          .insert(
            specialtyIds.map(specialtyId => ({
              profile_id: profileId,
              specialty_id: specialtyId
            }))
          );

        if (error) throw error;
      }

      toast({
        title: "Especialidades guardadas",
        description: "Las especialidades se han actualizado correctamente"
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error saving specialties:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las especialidades",
        variant: "destructive"
      });
      return { error: error.message };
    }
  }, []);

  const getProfileSpecialties = useCallback(async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('profile_specialties')
        .select('specialty_id, professional_specialties(*)')
        .eq('profile_id', profileId);

      if (error) throw error;
      
      return data?.map(item => item.professional_specialties).filter(Boolean) || [];
    } catch (error) {
      console.error('Error loading profile specialties:', error);
      return [];
    }
  }, []);

  return {
    specialties,
    loading,
    loadSpecialties,
    saveProfileSpecialties,
    getProfileSpecialties
  };
};
