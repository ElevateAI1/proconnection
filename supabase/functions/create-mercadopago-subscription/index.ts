import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, getRateLimitIdentifier, createRateLimitResponse } from '../_shared/rate-limiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: 5 requests per minute
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Check rate limit
  const identifier = getRateLimitIdentifier(req);
  const rateLimitResult = await checkRateLimit(identifier, RATE_LIMIT_CONFIG);
  
  if (!rateLimitResult.allowed) {
    const response = createRateLimitResponse(rateLimitResult);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  try {
    const { planKey, psychologistId, payerEmail, backUrl } = await req.json()

    if (!planKey || !psychologistId || !payerEmail) {
      return new Response(
        JSON.stringify({ error: 'planKey, psychologistId, and payerEmail are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener el access token de MercadoPago desde los secrets
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    // Obtener información del plan desde la base de datos
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('plan_key', planKey)
      .single()

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener información del psicólogo
    const { data: psychologist, error: psychError } = await supabaseClient
      .from('psychologists')
      .select('first_name, last_name, email')
      .eq('id', psychologistId)
      .single()

    if (psychError || !psychologist) {
      return new Response(
        JSON.stringify({ error: 'Psicólogo no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convertir precio de centavos a pesos
    const priceInPesos = plan.price_cents / 100

    // Crear Preapproval en MercadoPago (suscripción recurrente)
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

    console.log('Creating MercadoPago Preapproval with data:', preapprovalData)

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preapprovalData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('MercadoPago API error:', errorData)
      throw new Error(`Error de MercadoPago: ${response.status}`)
    }

    const preapproval = await response.json()
    console.log('MercadoPago Preapproval created:', preapproval.id)

    // Guardar el preapproval_id en la base de datos (pero no activar aún, esperar confirmación)
    const { error: dbError } = await supabaseClient
      .from('psychologists')
      .update({
        mercadopago_preapproval_id: preapproval.id
      })
      .eq('id', psychologistId)

    if (dbError) {
      console.error('Error saving preapproval to database:', dbError)
    }

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
    console.error('Error in create-mercadopago-subscription:', error)
    
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

