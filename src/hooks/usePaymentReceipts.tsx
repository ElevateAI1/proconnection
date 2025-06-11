
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PaymentReceipt {
  id: string;
  psychologist_id: string;
  patient_id?: string;
  original_file_url: string;
  receipt_date?: string;
  amount?: number;
  receipt_type?: string;
  receipt_number?: string;
  patient_cuit?: string;
  payment_method?: string;
  extraction_status: string;
  validation_status: string;
  include_in_report: boolean;
  extracted_data?: any;
  validation_notes?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export const usePaymentReceipts = (psychologistId?: string) => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (err) {
      console.error('Error fetching payment receipts:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for payment receipts
  useEffect(() => {
    if (!psychologistId) return;

    const channel = supabase
      .channel('payment-receipts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_receipts',
          filter: `psychologist_id=eq.${psychologistId}`
        },
        (payload) => {
          console.log('Payment receipts real-time update:', payload);
          
          // Mostrar notificación cuando se complete el procesamiento OCR
          if (payload.eventType === 'UPDATE' && payload.new.extraction_status === 'extracted') {
            toast({
              title: "OCR Completado",
              description: "Un comprobante ha sido procesado automáticamente por IA",
            });
          }
          
          // Mostrar notificación cuando hay error en el procesamiento
          if (payload.eventType === 'UPDATE' && payload.new.extraction_status === 'error') {
            toast({
              title: "Error en OCR",
              description: "Hubo un error procesando un comprobante automáticamente",
              variant: "destructive"
            });
          }
          
          fetchReceipts(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [psychologistId]);

  const validateReceipt = async (
    receiptId: string, 
    validationStatus: 'approved' | 'rejected' | 'needs_correction',
    validationNotes?: string,
    extractedData?: any
  ) => {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({
          validation_status: validationStatus,
          validation_notes: validationNotes,
          validated_by: psychologistId,
          validated_at: new Date().toISOString(),
          include_in_report: validationStatus === 'approved',
          ...extractedData
        })
        .eq('id', receiptId);

      if (error) throw error;

      const statusMessages = {
        approved: 'aprobado',
        rejected: 'rechazado',
        needs_correction: 'marcado para corrección'
      };

      toast({
        title: "Comprobante actualizado",
        description: `El comprobante ha sido ${statusMessages[validationStatus]}`
      });

      fetchReceipts();
    } catch (err) {
      console.error('Error validating receipt:', err);
      toast({
        title: "Error",
        description: "Error al validar el comprobante",
        variant: "destructive"
      });
    }
  };

  const updateReceiptInclusion = async (receiptId: string, includeInReport: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .update({ include_in_report: includeInReport })
        .eq('id', receiptId);

      if (error) throw error;

      toast({
        title: "Inclusión actualizada",
        description: `Comprobante ${includeInReport ? 'incluido en' : 'excluido del'} reporte`
      });

      fetchReceipts();
    } catch (err) {
      console.error('Error updating receipt inclusion:', err);
      toast({
        title: "Error",
        description: "Error al actualizar la inclusión del comprobante",
        variant: "destructive"
      });
    }
  };

  const retryOCRProcessing = async (receiptId: string, fileUrl: string) => {
    try {
      // Actualizar estado a "processing"
      const { error: updateError } = await supabase
        .from('payment_receipts')
        .update({
          extraction_status: 'processing',
          validation_notes: 'Reintentando procesamiento OCR...'
        })
        .eq('id', receiptId);

      if (updateError) throw updateError;

      // Llamar a la función de procesamiento OCR
      const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
        body: { 
          fileUrl: fileUrl, 
          receiptId: receiptId 
        }
      });

      if (ocrError) throw ocrError;

      toast({
        title: "Reintentando OCR",
        description: "El comprobante está siendo reprocesado automáticamente"
      });

      fetchReceipts();
    } catch (err) {
      console.error('Error retrying OCR processing:', err);
      toast({
        title: "Error",
        description: "Error al reintentar el procesamiento OCR",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [psychologistId]);

  return {
    receipts,
    loading,
    error,
    validateReceipt,
    updateReceiptInclusion,
    retryOCRProcessing,
    refetch: fetchReceipts
  };
};
