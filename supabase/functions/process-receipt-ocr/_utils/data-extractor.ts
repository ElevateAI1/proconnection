export interface ExtractedData {
  amount?: number;
  date?: string;
  receipt_type?: string;
  payment_method?: string;
  receipt_number?: string;
  patient_cuit?: string;
  confidence?: number;
}

export const extractDataFromN8NResponse = (responseData: any): ExtractedData | null => {
  if (!responseData || !responseData.extractedData) {
    return null;
  }

  const extracted = responseData.extractedData;

  return {
    amount: extracted.amount,
    date: extracted.date,
    receipt_type: extracted.receipt_type || extracted.type,
    payment_method: extracted.payment_method,
    receipt_number: extracted.receipt_number,
    patient_cuit: extracted.patient_cuit || extracted.cuit,
    confidence: extracted.confidence,
  };
};

export const getDateInfo = (dateString?: string): { month: number; year: number } => {
  const extractedDate = dateString ? new Date(dateString) : new Date();
  return {
    month: extractedDate.getMonth() + 1,
    year: extractedDate.getFullYear(),
  };
};

