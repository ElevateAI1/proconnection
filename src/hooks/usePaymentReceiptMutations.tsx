import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { PaymentReceipt } from './usePaymentReceiptQueries';

export const usePaymentReceiptMutations = (
  psychologistId: string | undefined,
  onSuccess: () => void
) => {
  const uploadReceipt = async (file: File, expectedAmount?: number, patientId?: string): Promise<PaymentReceipt | null> => {
    if (!psychologistId) {
      throw new Error('Psychologist ID is required');
    }

    try {
      console.log('Uploading receipt file:', file.name);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${psychologistId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(uploadData.path);

      // Create payment receipt record
      const { data: receiptData, error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          psychologist_id: psychologistId,
          patient_id: patientId,
          original_file_url: urlData.publicUrl,
          extraction_status: 'pending',
          validation_status: 'pending',
          include_in_report: true
        })
        .select()
        .single();

      if (receiptError) {
        console.error('Error creating receipt record:', receiptError);
        throw receiptError;
      }

      console.log('Receipt record created:', receiptData.id);

      // Trigger OCR processing
      const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
        body: {
          fileUrl: urlData.publicUrl,
          receiptId: receiptData.id
        }
      });

      if (ocrError) {
        console.error('Error triggering OCR:', ocrError);
        // Don't throw here, let the receipt be processed manually
      }

      toast({
        title: "Comprobante subido",
        description: "El comprobante se ha subido y está siendo procesado"
      });

      onSuccess();
      return receiptData;

    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Error al subir el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateReceiptInclusion = async (receiptId: string, includeInReport: boolean) => {
    try {
      console.log('Updating receipt inclusion:', { receiptId, includeInReport });

      const { error } = await supabase
        .from('payment_receipts')
        .update({
          include_in_report: includeInReport
        })
        .eq('id', receiptId);

      if (error) {
        console.error('Error updating receipt inclusion:', error);
        throw error;
      }

      toast({
        title: "Comprobante actualizado",
        description: `El comprobante ha sido ${includeInReport ? 'incluido en' : 'excluido del'} reporte`
      });

      onSuccess();

    } catch (error) {
      console.error('Error updating receipt inclusion:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  const retryOCRProcessing = async (receiptId: string, originalFileUrl: string) => {
    try {
      console.log('Retrying OCR processing for receipt:', receiptId);

      // Update status to pending
      const { error: updateError } = await supabase
        .from('payment_receipts')
        .update({
          extraction_status: 'pending'
        })
        .eq('id', receiptId);

      if (updateError) {
        throw updateError;
      }

      // Trigger OCR processing again
      const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
        body: { 
          fileUrl: originalFileUrl, 
          receiptId: receiptId 
        }
      });

      if (ocrError) {
        console.error('Error triggering OCR retry:', ocrError);
        const errorMessage = ocrError.message || 'Error desconocido al procesar con IA';
        throw new Error(errorMessage);
      }

      toast({
        title: "Procesando comprobante",
        description: "El comprobante está siendo procesado nuevamente"
      });

      onSuccess();

    } catch (error) {
      console.error('Error retrying OCR processing:', error);
      toast({
        title: "Error",
        description: "Error al procesar el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    uploadReceipt,
    updateReceiptInclusion,
    retryOCRProcessing
  };
};

