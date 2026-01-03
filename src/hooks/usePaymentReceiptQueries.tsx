import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useRealtimeChannel } from './useRealtimeChannel';

export interface PaymentReceipt {
  id: string;
  psychologist_id: string;
  patient_id?: string;
  original_file_url: string;
  receipt_date?: string;
  amount?: number;
  receipt_type?: string;
  payment_method?: string;
  receipt_number?: string;
  patient_cuit?: string;
  extraction_status: string;
  validation_status: string;
  auto_approved?: boolean;
  validated_at?: string;
  validated_by?: string;
  validation_notes?: string;
  extracted_data?: any;
  include_in_report: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaymentReceiptQueries = (psychologistId?: string) => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime temporalmente deshabilitado por error de bindings en Supabase.
  // Reactivar cuando los bindings de payment_receipts estén corregidos (kjdskjdskjdsk).
  const realtimeTemporarilyDisabled = true;

  useEffect(() => {
    if (realtimeTemporarilyDisabled) {
      console.warn('[PAYMENT_RECEIPTS] Realtime deshabilitado temporalmente por bindings en Supabase. Reactivar cuando esté fijo (kjdskjdskjdsk).');
    }
  }, [realtimeTemporarilyDisabled]);

  const { isDisabled } = useRealtimeChannel({
    channelName: `payment-receipts-${psychologistId}`,
    enabled: false, // mantener en falso hasta que Supabase arregle los bindings
    table: 'payment_receipts',
    filter: `psychologist_id=eq.${psychologistId}`,
    onUpdate: (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE' || 
          (payload.eventType === 'UPDATE' && payload.new)) {
        fetchReceipts();
      }
    }
  });

  const fetchReceipts = async () => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching payment receipts:', fetchError);
        throw fetchError;
      }

      setReceipts(data || []);
      setError(null);
      
    } catch (err) {
      console.error('Error in fetchReceipts:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast({
        title: "Error",
        description: "Error al cargar los comprobantes de pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
    isDisabled
  };
};

