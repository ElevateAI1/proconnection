import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleOCRError = async (
  error: Error,
  receiptId: string | null
): Promise<Response> => {
  console.error('=== ERROR IN PROCESS-RECEIPT-OCR ===');
  console.error('Error details:', error);
  console.error('Error stack:', error.stack);

  // Update error status in database
  if (receiptId) {
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('payment_receipts')
        .update({
          extraction_status: 'error',
          validation_status: 'needs_review',
          validation_notes: `Error en procesamiento OCR: ${error.message}. Timestamp: ${new Date().toISOString()}`,
        })
        .eq('id', receiptId);

      console.log('✅ Updated receipt status to error');
    } catch (updateError) {
      console.error('❌ Error updating receipt status:', updateError);
    }
  }

  return new Response(
    JSON.stringify({
      error: error.message,
      receiptId: receiptId,
      success: false,
      timestamp: new Date().toISOString(),
      details: 'Check edge function logs for more information',
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

export const createErrorResponse = (
  message: string,
  status: number = 400,
  receiptId?: string
): Response => {
  return new Response(
    JSON.stringify({
      error: message,
      receiptId: receiptId,
      success: false,
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

