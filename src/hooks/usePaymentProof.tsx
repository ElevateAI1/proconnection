
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePaymentProof = () => {
  const [uploading, setUploading] = useState(false);

  const uploadPaymentProof = async (
    file: File, 
    psychologistId: string, 
    patientId: string
  ): Promise<string | null> => {
    setUploading(true);
    
    try {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG.');
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Generar nombre del archivo: {patient_id}/{timestamp}_{original_name}
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${patientId}/${timestamp}_${psychologistId}.${extension}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(`Error al subir archivo: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      toast({
        title: "Comprobante subido",
        description: "El comprobante de pago se ha subido exitosamente"
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getPaymentProofUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const getPaymentProofData = (fileName: string) => {
    // Este método ya no es necesario con Supabase Storage
    // pero mantenemos la firma para compatibilidad
    return null;
  };

  return {
    uploadPaymentProof,
    uploading,
    getPaymentProofUrl,
    getPaymentProofData
  };
};
