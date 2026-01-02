import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { analyzeBillingPipeline } from './gemini-pipeline.ts';
import { downloadAndConvertToBase64, resizeImageIfNeeded } from './image-processor.ts';

export const processReceiptWithPipeline = async (
  fileUrl: string,
  receiptId: string
): Promise<Response> => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  try {
    console.log('🔄 Processing receipt with Gemini Pipeline (RAG)...');

    let fileUrlToUse = fileUrl;
    
    if (fileUrl.includes('supabase.co/storage/v1/object/public/payment-proofs/')) {
      try {
        const fileName = fileUrl.split('/payment-proofs/')[1];
        const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
          .from('payment-proofs')
          .createSignedUrl(fileName, 3600);

        if (!signedUrlError && signedUrlData?.signedUrl) {
          fileUrlToUse = signedUrlData.signedUrl;
        }
      } catch (err) {
        console.warn('⚠️ Could not create signed URL, using original:', err);
      }
    }

    console.log('📥 Downloading and converting file to base64...');
    const { base64, mimeType } = await downloadAndConvertToBase64(fileUrlToUse);
    const optimizedBase64 = resizeImageIfNeeded(base64);

    console.log('🤖 Running Gemini Pipeline analysis...');
    const stepMessages: string[] = [];
    const pipelineResult = await analyzeBillingPipeline(
      optimizedBase64,
      mimeType,
      (step) => {
        stepMessages.push(step);
        console.log(step);
      }
    );

    console.log('✅ Pipeline analysis completed:', pipelineResult);

    const extractedData = {
      amount: pipelineResult.importe_total || 0,
      receipt_date: pipelineResult.fecha || new Date().toISOString().split('T')[0],
      receipt_type: mapReceiptType(pipelineResult.tipo_comprobante),
      receipt_number: pipelineResult.numero_comprobante || null,
      payment_method: mapPaymentMethod(pipelineResult.metodo_pago),
      patient_cuit: pipelineResult.cuit_paciente || null,
      issuer_name: pipelineResult.emisor || null,
      receiver_name: pipelineResult.receptor || null,
      tipo_comprobante_original: pipelineResult.tipo_comprobante || null,
      extraction_method: 'gemini_pipeline_rag',
      confidence: pipelineResult.confidence_score || 0.8,
      es_valido: pipelineResult.es_valido,
      nivel_riesgo: pipelineResult.nivel_riesgo || 0,
      razonamiento_fraude: pipelineResult.razonamiento_fraude || '',
      detected_profile: pipelineResult.detected_profile || 'Unknown',
      moneda: pipelineResult.moneda || 'ARS',
      processing_steps: stepMessages,
      usage_metadata: pipelineResult.usage_metadata,
      estimated_cost_usd: pipelineResult.estimated_cost_usd
    };

    const updateData: any = {
      amount: extractedData.amount,
      receipt_date: extractedData.receipt_date,
      extraction_status: 'extracted',
      validation_status: extractedData.es_valido && extractedData.confidence > 0.8 ? 'pending' : 'pending',
      extracted_data: extractedData,
      validation_notes: extractedData.es_valido 
        ? `Extraído automáticamente con IA (Pipeline RAG). Confianza: ${Math.round(extractedData.confidence * 100)}%`
        : `⚠️ Requiere revisión manual: ${extractedData.razonamiento_fraude}`,
    };

    if (extractedData.receipt_type) {
      updateData.receipt_type = extractedData.receipt_type;
    }
    if (extractedData.receipt_number) {
      updateData.receipt_number = extractedData.receipt_number;
    }
    if (extractedData.payment_method) {
      updateData.payment_method = extractedData.payment_method;
    }
    if (extractedData.patient_cuit) {
      updateData.patient_cuit = extractedData.patient_cuit;
    }

    const { error: updateError } = await supabaseClient
      .from('payment_receipts')
      .update(updateData)
      .eq('id', receiptId);

    if (updateError) {
      console.error('⚠️ Error updating receipt:', updateError);
      throw updateError;
    }

    console.log('✅ Receipt updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Receipt processed successfully with Gemini Pipeline (RAG)',
        receiptId: receiptId,
        extractedData: extractedData,
        amount: extractedData.amount,
        date: extractedData.receipt_date,
        confidence: extractedData.confidence,
        method: 'gemini_pipeline_rag'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error processing receipt with pipeline:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { errorMessage, errorStack });
    
    try {
      await supabaseClient
        .from('payment_receipts')
        .update({
          extraction_status: 'error',
          validation_notes: `Error en procesamiento: ${errorMessage}`
        })
        .eq('id', receiptId);
    } catch (updateError) {
      console.error('Error updating receipt status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error processing receipt with Gemini Pipeline',
        error: errorMessage,
        errorDetails: errorStack,
        receiptId: receiptId
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function mapReceiptType(tipo?: string): string | null {
  if (!tipo) return null;
  const normalized = tipo.toLowerCase();
  
  if (normalized.includes('factura_a') || normalized.includes('factura a') || normalized.includes('factura')) return 'invoice';
  if (normalized.includes('factura_b') || normalized.includes('factura b')) return 'invoice';
  if (normalized.includes('factura_c') || normalized.includes('factura c')) return 'invoice';
  if (normalized.includes('ticket')) return 'ticket';
  if (normalized.includes('recibo') || normalized.includes('receipt')) return 'receipt';
  
  return 'invoice';
}

function mapPaymentMethod(metodo?: string): string | null {
  if (!metodo) return null;
  const normalized = metodo.toLowerCase();
  
  if (normalized.includes('efectivo') || normalized.includes('cash')) return 'cash';
  if (normalized.includes('transferencia') || normalized.includes('transfer')) return 'transfer';
  if (normalized.includes('debito') || normalized.includes('débito') || normalized.includes('tarjeta')) return 'card';
  if (normalized.includes('credito') || normalized.includes('crédito')) return 'card';
  if (normalized.includes('mercadopago') || normalized.includes('mercado pago')) return 'mercadopago';
  
  return 'other';
}

