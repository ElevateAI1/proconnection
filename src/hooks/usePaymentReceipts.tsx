import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { usePaymentReceiptQueries, type PaymentReceipt } from './usePaymentReceiptQueries';
import { usePaymentReceiptMutations } from './usePaymentReceiptMutations';
import { usePaymentReceiptValidation } from './usePaymentReceiptValidation';

// Re-export type for backward compatibility
export type { PaymentReceipt };

export const usePaymentReceipts = (psychologistId?: string) => {
  const { user } = useAuth();
  const queries = usePaymentReceiptQueries(psychologistId);
  const mutations = usePaymentReceiptMutations(psychologistId, queries.fetchReceipts);
  const validation = usePaymentReceiptValidation(psychologistId, queries.fetchReceipts);
  const [demoReceipts, setDemoReceipts] = useState<PaymentReceipt[] | null>(null);

  useEffect(() => {
    if (!psychologistId) {
      return;
    }

    // Demo user handling
    if (user?.id === 'demo-user-123') {
      const demoData: PaymentReceipt[] = [
        {
          id: '1',
          psychologist_id: psychologistId,
          original_file_url: 'demo-receipt-1.pdf',
          receipt_date: new Date().toISOString(),
          amount: 150,
          receipt_type: 'consultation',
          payment_method: 'cash',
          receipt_number: 'R-001',
          extraction_status: 'completed',
          validation_status: 'pending',
          include_in_report: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          psychologist_id: psychologistId,
          original_file_url: 'demo-receipt-2.pdf',
          receipt_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 200,
          receipt_type: 'consultation',
          payment_method: 'transfer',
          receipt_number: 'R-002',
          extraction_status: 'completed',
          validation_status: 'approved',
          include_in_report: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          psychologist_id: psychologistId,
          original_file_url: 'demo-receipt-3.pdf',
          receipt_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 180,
          receipt_type: 'consultation',
          payment_method: 'cash',
          receipt_number: 'R-003',
          extraction_status: 'completed',
          validation_status: 'approved',
          include_in_report: true,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setTimeout(() => {
        setDemoReceipts(demoData);
      }, 300);
      return;
    }

    queries.fetchReceipts();
    
    // Polling fallback if realtime is disabled
    if (queries.isDisabled) {
      const interval = setInterval(() => {
        queries.fetchReceipts();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [psychologistId, queries.isDisabled, user?.id]);

  const retryOCRProcessing = async (receiptId: string) => {
    const receipts = demoReceipts || queries.receipts;
    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    return mutations.retryOCRProcessing(receiptId, receipt.original_file_url);
  };

  const receipts = demoReceipts || queries.receipts;
  const loading = demoReceipts === null && queries.loading;

  return {
    receipts,
    loading,
    error: queries.error,
    uploadReceipt: mutations.uploadReceipt,
    validateReceipt: validation.validateReceipt,
    updateReceiptInclusion: mutations.updateReceiptInclusion,
    retryOCRProcessing,
    refetch: queries.fetchReceipts
  };
};
