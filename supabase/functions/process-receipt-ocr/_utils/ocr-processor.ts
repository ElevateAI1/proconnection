import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { extractDataFromN8NResponse, getDateInfo } from './data-extractor';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const processReceiptWithN8N = async (
  fileUrl: string,
  receiptId: string
): Promise<Response> => {
  const n8nWebhook = Deno.env.get('N8N_WEBHOOK_URL');

  if (!n8nWebhook) {
    throw new Error('N8N webhook not configured');
  }

  console.log('=== CALLING N8N WEBHOOK ===');

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Prepare file URL (create signed URL if needed)
  let fileUrlToUse = fileUrl;

  if (fileUrl.includes('supabase.co/storage/v1/object/public/payment-proofs/')) {
    try {
      const fileName = fileUrl.split('/payment-proofs/')[1];
      console.log('Creating signed URL for file:', fileName);

      const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
        .from('payment-proofs')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError) {
        console.error('⚠️ Error creating signed URL:', signedUrlError);
      } else if (signedUrlData?.signedUrl) {
        fileUrlToUse = signedUrlData.signedUrl;
        console.log('✅ Using signed URL for better access');
      }
    } catch (signedUrlErr) {
      console.error('⚠️ Error handling signed URL creation:', signedUrlErr);
    }
  }

  const webhookPayload = {
    receiptId: receiptId,
    fileUrl: fileUrlToUse,
    originalFileUrl: fileUrl,
    timestamp: new Date().toISOString(),
    source: 'edge_function',
  };

  console.log('Sending payload to n8n:', JSON.stringify(webhookPayload, null, 2));

  try {
    const webhookResponse = await fetch(n8nWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(60000), // 60 seconds
    });

    console.log('N8N webhook response status:', webhookResponse.status);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ N8N webhook failed with status:', webhookResponse.status);
      console.error('N8N webhook error response:', errorText);
      throw new Error(`N8N webhook failed: ${webhookResponse.status} - ${errorText}`);
    }

    const responseText = await webhookResponse.text();
    console.log('N8N webhook response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Response is not JSON, treating as text success');
      responseData = { message: responseText };
    }

    // Check if response includes extracted data
    if (responseData.success && responseData.extractedData) {
      console.log('✅ N8N processing completed successfully with extracted data:', responseData.extractedData);

      const extractedData = extractDataFromN8NResponse(responseData);
      const dateInfo = getDateInfo(extractedData?.date);

      console.log(`Receipt date info: ${extractedData?.date}, Month: ${dateInfo.month}, Year: ${dateInfo.year}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'OCR processing completed successfully via n8n',
          receiptId: receiptId,
          extractedData: extractedData,
          amount: extractedData?.amount,
          date: extractedData?.date,
          extractedMonth: dateInfo.month,
          extractedYear: dateInfo.year,
          confidence: extractedData?.confidence,
          n8nResponse: responseData,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.log('✅ N8N webhook completed but checking for data...');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'OCR processing initiated via n8n',
          receiptId: receiptId,
          n8nResponse: responseData,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (webhookError) {
    console.error('❌ Error calling n8n webhook:', webhookError);
    throw webhookError;
  }
};

