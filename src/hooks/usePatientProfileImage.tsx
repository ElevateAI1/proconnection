import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePatientProfileImage = () => {
  const [uploading, setUploading] = useState(false);

  const uploadProfileImage = async (file: File, patientId: string) => {
    try {
      setUploading(true);

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `patients/${patientId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Error al subir la imagen');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Actualizar perfil del paciente
      const { error: updateError } = await supabase
        .from('patients')
        .update({ profile_image_url: publicUrl })
        .eq('id', patientId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        // Si el campo no existe, intentar con RPC o simplemente continuar
        if (updateError.code === '42703') {
          console.log('profile_image_url column may not exist, skipping update');
        } else {
          throw new Error('Error al actualizar el perfil');
        }
      }

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada exitosamente",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteProfileImage = async (patientId: string, imageUrl: string) => {
    try {
      setUploading(true);

      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-3).join('/'); // patients/patientId/filename

      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([fileName]);

      if (deleteError) {
        console.error('Error deleting file:', deleteError);
        throw new Error('Error al eliminar la imagen');
      }

      const { error: updateError } = await supabase
        .from('patients')
        .update({ profile_image_url: null })
        .eq('id', patientId);

      if (updateError) {
        if (updateError.code !== '42703') {
          throw new Error('Error al actualizar el perfil');
        }
      }

      toast({
        title: "Foto eliminada",
        description: "Tu foto de perfil ha sido eliminada",
      });

      return true;
    } catch (error) {
      console.error('Error in deleteProfileImage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfileImage,
    deleteProfileImage,
    uploading
  };
};

