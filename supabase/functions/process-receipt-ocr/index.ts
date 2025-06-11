
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, receiptId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Processing receipt OCR for:', receiptId)
    console.log('File URL:', fileUrl)

    // Actualizar estado a "processing"
    await supabaseClient
      .from('payment_receipts')
      .update({ 
        extraction_status: 'processing',
        validation_status: 'pending' 
      })
      .eq('id', receiptId)

    // Llamar a OpenAI Vision API para extraer datos del comprobante
    const extractedData = await extractDataWithOpenAI(fileUrl, openaiApiKey)

    // Actualizar el comprobante con los datos extraídos
    const { error } = await supabaseClient
      .from('payment_receipts')
      .update({
        receipt_date: extractedData.date,
        amount: extractedData.amount,
        receipt_type: extractedData.type,
        receipt_number: extractedData.number,
        patient_cuit: extractedData.cuit,
        payment_method: extractedData.paymentMethod,
        extracted_data: extractedData,
        extraction_status: 'extracted',
        validation_status: 'needs_review'
      })
      .eq('id', receiptId)

    if (error) {
      throw error
    }

    // Disparar webhook n8n si está configurado
    const n8nWebhook = Deno.env.get('N8N_WEBHOOK_URL')
    if (n8nWebhook) {
      try {
        await fetch(n8nWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiptId,
            fileUrl,
            extractedData,
            timestamp: new Date().toISOString()
          })
        })
      } catch (webhookError) {
        console.error('Error calling n8n webhook:', webhookError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        message: 'OCR processing completed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in process-receipt-ocr:', error)
    
    // Actualizar estado de error en la base de datos
    if (req.body) {
      try {
        const { receiptId } = await req.json()
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('payment_receipts')
          .update({ 
            extraction_status: 'error',
            validation_notes: `Error en procesamiento OCR: ${error.message}`
          })
          .eq('id', receiptId)
      } catch (updateError) {
        console.error('Error updating receipt status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function extractDataWithOpenAI(fileUrl: string, apiKey: string) {
  const prompt = `
  Analiza este comprobante de pago y extrae la siguiente información en formato JSON:
  - date: fecha del comprobante (formato YYYY-MM-DD)
  - amount: monto total (solo número, sin símbolos)
  - type: tipo de comprobante (factura_a, factura_b, factura_c, recibo, etc.)
  - number: número del comprobante
  - cuit: CUIT del emisor (si está presente)
  - paymentMethod: método de pago (transferencia, efectivo, tarjeta, etc.)
  - description: descripción del servicio o concepto
  - confidence: nivel de confianza en la extracción (0-1)

  Responde SOLO con el JSON, sin texto adicional.
  `

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: fileUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    // Parse JSON response
    const extractedData = JSON.parse(content)
    
    // Validar y limpiar datos
    return {
      date: extractedData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(extractedData.amount) || 0,
      type: extractedData.type || 'comprobante',
      number: extractedData.number || 'N/A',
      cuit: extractedData.cuit || '',
      paymentMethod: extractedData.paymentMethod || 'no_especificado',
      description: extractedData.description || '',
      confidence: extractedData.confidence || 0.8
    }

  } catch (error) {
    console.error('Error extracting data with OpenAI:', error)
    
    // Fallback a datos por defecto en caso de error
    return {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'comprobante',
      number: 'ERROR-' + Date.now(),
      cuit: '',
      paymentMethod: 'no_especificado',
      description: 'Error en extracción automática',
      confidence: 0.0
    }
  }
}
