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
          ...extractedData
        })
        .eq('id', receiptId);

      if (error) throw error;

      toast({
        title: "Comprobante actualizado",
        description: `El comprobante ha sido ${validationStatus === 'approved' ? 'aprobado' : validationStatus === 'rejected' ? 'rechazado' : 'marcado para corrección'}`
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

  useEffect(() => {
    fetchReceipts();
  }, [psychologistId]);

  return {
    receipts,
    loading,
    error,
    validateReceipt,
    updateReceiptInclusion,
    refetch: fetchReceipts
  };
};
