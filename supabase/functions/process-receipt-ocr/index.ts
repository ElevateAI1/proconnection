import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateOCRRequest, validateReceiptExists, validateExtractionStatus } from './_utils/validators.ts';
import { handleOCRError, createErrorResponse } from './_utils/error-handler.ts';
import { processReceiptWithPipeline } from './_utils/pipeline-processor.ts';
import { checkRateLimit, getRateLimitIdentifier, createRateLimitResponse } from '../_shared/rate-limiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting configuration: 10 requests per minute
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Check rate limit
  const identifier = getRateLimitIdentifier(req);
  const rateLimitResult = await checkRateLimit(identifier, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    const response = createRateLimitResponse(rateLimitResult);
    // Add CORS headers to rate limit response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  let requestBody: any = null;
  let receiptId: string | null = null;

  try {
    requestBody = await req.json();
    console.log('=== OCR PROCESSING REQUEST START ===');
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    // Validate request
    const validation = validateOCRRequest(requestBody);
    if (!validation.valid) {
      return createErrorResponse(validation.error || 'Invalid request', 400);
    }

    const { fileUrl, receiptId: reqReceiptId } = validation.data!;
    receiptId = reqReceiptId;

    console.log('✅ Processing receipt OCR for:', receiptId);
    console.log('File URL:', fileUrl);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify receipt exists
    const { data: existingReceipt, error: fetchError } = await supabaseClient
      .from('payment_receipts')
      .select('id, original_file_url, extraction_status, created_at')
      .eq('id', receiptId)
      .single();

    if (fetchError || !validateReceiptExists(existingReceipt)) {
      console.error('❌ Receipt not found:', fetchError);
      return createErrorResponse('Receipt not found', 404, receiptId);
    }

    console.log('✅ Found receipt:', existingReceipt.id);
    console.log('Current extraction status:', existingReceipt.extraction_status);

    // Check if already processed
    if (!validateExtractionStatus(existingReceipt.extraction_status)) {
      console.log('ℹ️ Receipt already processed successfully');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Receipt already processed',
          receiptId: receiptId,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update status to "processing"
    const { error: updateError1 } = await supabaseClient
      .from('payment_receipts')
      .update({
        extraction_status: 'processing',
        validation_status: 'pending',
        validation_notes: 'Iniciando procesamiento OCR...',
      })
      .eq('id', receiptId);

    if (updateError1) {
      console.error('⚠️ Error updating receipt to processing:', updateError1);
    } else {
      console.log('✅ Receipt status updated to processing');
    }

    // Process with Gemini Pipeline (RAG)
    return await processReceiptWithPipeline(fileUrl, receiptId);
  } catch (error) {
    return await handleOCRError(error as Error, receiptId);
  }
});
