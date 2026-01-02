
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useProfileImage = () => {
  const [uploading, setUploading] = useState(false);

  const uploadProfileImage = async (file: File, psychologistId: string) => {
    try {
      setUploading(true);

      // Validar archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${psychologistId}/${Date.now()}.${fileExt}`;

      // Subir archivo a Storage
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

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Actualizar perfil del psicólogo
      const { error: updateError } = await supabase
        .from('psychologists')
        .update({ profile_image_url: publicUrl })
        .eq('id', psychologistId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Error al actualizar el perfil');
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

  const deleteProfileImage = async (psychologistId: string, imageUrl: string) => {
    try {
      setUploading(true);

      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // psychologistId/filename

      // Eliminar archivo de Storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([fileName]);

      if (deleteError) {
        console.error('Error deleting file:', deleteError);
        throw new Error('Error al eliminar la imagen');
      }

      // Actualizar perfil del psicólogo
      const { error: updateError } = await supabase
        .from('psychologists')
        .update({ profile_image_url: null })
        .eq('id', psychologistId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Error al actualizar el perfil');
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
