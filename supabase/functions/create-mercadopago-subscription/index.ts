import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, getRateLimitIdentifier, createRateLimitResponse } from '../_shared/rate-limiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

// Rate limiting: 5 requests per minute
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
}

serve(async (req) => {
  console.log('🚀 Function called, method:', req.method)
  console.log('🔗 Request URL:', req.url)
  console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()))

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request')
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Check rate limit
  console.log('⏱️ Checking rate limit...')
  const identifier = getRateLimitIdentifier(req);
  const rateLimitResult = await checkRateLimit(identifier, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    console.log('❌ Rate limit exceeded')
    const response = createRateLimitResponse(rateLimitResult);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  console.log('✅ Rate limit check passed')

  try {
    console.log('📦 Parsing request body...')
    const body = await req.json()
    console.log('📦 Request body:', body)
    
    const { planKey, psychologistId, payerEmail, backUrl } = body
    console.log('🔍 Validating params:', { planKey, psychologistId, payerEmail })

    if (!planKey || !psychologistId || !payerEmail) {
      console.log('❌ Missing required params')
      return new Response(
        JSON.stringify({ error: 'planKey, psychologistId, and payerEmail are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener el access token de MercadoPago desde los secrets
    console.log('🔑 Getting MercadoPago access token...')
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    
    if (!mercadoPagoAccessToken) {
      console.log('❌ MercadoPago access token not configured')
      throw new Error('MercadoPago access token not configured')
    }
    console.log('✅ MercadoPago access token found')

    // Obtener información del plan desde la base de datos
    console.log('🔌 Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔎 Looking for plan:', planKey)
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('plan_key', planKey)
      .single()

    console.log('📋 Plan result:', { plan, planError })

    if (planError || !plan) {
      console.log('❌ Plan not found!')
      return new Response(
        JSON.stringify({ error: 'Plan no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('✅ Plan found:', plan.title)

    // Obtener información del psicólogo
    console.log('🔎 Looking for psychologist:', psychologistId)
    const { data: psychologist, error: psychError } = await supabaseClient
      .from('psychologists')
      .select('first_name, last_name')
      .eq('id', psychologistId)
      .single()

    console.log('👨‍⚕️ Psychologist result:', { psychologist, psychError })

    if (psychError || !psychologist) {
      console.log('❌ Psychologist not found!')
      return new Response(
        JSON.stringify({ error: 'Psicólogo no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('✅ Psychologist found:', psychologist.first_name, psychologist.last_name)

    // Convertir precio de centavos a pesos
    console.log('💰 Converting price...')
    const priceInPesos = plan.price_cents / 100
    console.log('💰 Price in pesos:', priceInPesos)

    // Crear Preapproval en MercadoPago (suscripción recurrente)
    console.log('📝 Creating Preapproval data...')
    const preapprovalData = {
      reason: plan.title,
      auto_recurring: {
        frequency: 1, // Mensual
        frequency_type: 'months',
        transaction_amount: priceInPesos,
        currency_id: 'ARS',
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        end_date: null // Sin fecha de fin (suscripción indefinida hasta cancelación)
      },
      payer_email: payerEmail,
      back_url: backUrl || `${req.headers.get('origin')}/plans?result=subscription`,
      external_reference: `${psychologistId}_${planKey}_${Date.now()}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      metadata: {
        psychologist_id: psychologistId,
        plan_key: planKey,
        plan_id: plan.id
      }
    }

    console.log('📤 Sending request to MercadoPago API...')
    console.log('📋 Preapproval data:', JSON.stringify(preapprovalData, null, 2))

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preapprovalData)
    })

    console.log('📥 MercadoPago API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ MercadoPago API error:', errorData)
      throw new Error(`Error de MercadoPago: ${response.status}`)
    }

    const preapproval = await response.json()
    console.log('✅ MercadoPago Preapproval created:', preapproval.id)
    console.log('🔗 Init point:', preapproval.init_point)

    // Guardar el preapproval_id en la base de datos (pero no activar aún, esperar confirmación)
    console.log('💾 Saving preapproval_id to database...')
    const { error: dbError } = await supabaseClient
      .from('psychologists')
      .update({
        mercadopago_preapproval_id: preapproval.id
      })
      .eq('id', psychologistId)

    if (dbError) {
      console.error('❌ Error saving preapproval to database:', dbError)
    } else {
      console.log('✅ Preapproval ID saved to database')
    }

    console.log('✅ Returning success response')
    return new Response(
      JSON.stringify({ 
        success: true,
        init_point: preapproval.init_point,
        preapproval_id: preapproval.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in create-mercadopago-subscription:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

