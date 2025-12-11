export interface OCRRequest {
  fileUrl: string;
  receiptId: string;
}

export const validateOCRRequest = (requestBody: any): { valid: boolean; error?: string; data?: OCRRequest } => {
  if (!requestBody) {
    return { valid: false, error: 'Request body is required' };
  }

  const { fileUrl, receiptId } = requestBody;

  if (!fileUrl || !receiptId) {
    return {
      valid: false,
      error: 'Missing required parameters: fileUrl and receiptId are required',
    };
  }

  if (typeof fileUrl !== 'string' || typeof receiptId !== 'string') {
    return {
      valid: false,
      error: 'Invalid parameter types: fileUrl and receiptId must be strings',
    };
  }

  return {
    valid: true,
    data: { fileUrl, receiptId },
  };
};

export const validateReceiptExists = (receipt: any): boolean => {
  return receipt !== null && receipt !== undefined && receipt.id;
};

export const validateExtractionStatus = (status: string): boolean => {
  return status !== 'extracted';
};

