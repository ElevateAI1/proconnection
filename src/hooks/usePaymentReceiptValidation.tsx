import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePaymentReceiptValidation = (
  psychologistId: string | undefined,
  onSuccess: () => void
) => {
  const validateReceipt = async (
    receiptId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      console.log('Validating receipt:', { receiptId, status, notes });

      const { error } = await supabase
        .from('payment_receipts')
        .update({
          validation_status: status,
          validated_at: new Date().toISOString(),
          validated_by: psychologistId,
          validation_notes: notes
        })
        .eq('id', receiptId);

      if (error) {
        console.error('Error validating receipt:', error);
        throw error;
      }

      toast({
        title: "Comprobante validado",
        description: `El comprobante ha sido ${status === 'approved' ? 'aprobado' : 'rechazado'}`
      });

      onSuccess();

    } catch (error) {
      console.error('Error validating receipt:', error);
      toast({
        title: "Error",
        description: "Error al validar el comprobante",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    validateReceipt
  };
};

