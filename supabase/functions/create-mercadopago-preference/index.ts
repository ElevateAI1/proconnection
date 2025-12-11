
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
    const { planId, psychologistId, psychologistEmail, psychologistName } = await req.json()

    // Obtener el access token de MercadoPago desde los secrets
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    // Definir los planes disponibles
    const plans = {
      monthly: {
        title: 'Suscripción Mensual PsiConnect',
        unit_price: 2900,
        currency_id: 'ARS',
        description: 'Plan mensual para gestión profesional de consultorios psicológicos'
      },
      yearly: {
        title: 'Suscripción Anual PsiConnect',
        unit_price: 29000,
        currency_id: 'ARS',
        description: 'Plan anual para gestión profesional de consultorios psicológicos (2 meses gratis)'
      }
    }

    const selectedPlan = plans[planId as keyof typeof plans]
    
    if (!selectedPlan) {
      throw new Error('Plan no válido')
    }

    // Crear la preferencia en MercadoPago
    const preferenceData = {
      items: [
        {
          title: selectedPlan.title,
          description: selectedPlan.description,
          unit_price: selectedPlan.unit_price,
          quantity: 1,
          currency_id: selectedPlan.currency_id
        }
      ],
      payer: {
        name: psychologistName,
        email: psychologistEmail
      },
      external_reference: `${psychologistId}_${planId}_${Date.now()}`,
      back_urls: {
        success: `${req.headers.get('origin')}/payment-success`,
        failure: `${req.headers.get('origin')}/payment-failure`,
        pending: `${req.headers.get('origin')}/payment-pending`
      },
      auto_return: 'approved',
      notification_url: `${req.headers.get('origin')}/api/mercadopago-webhook`,
      metadata: {
        psychologist_id: psychologistId,
        plan_id: planId,
        plan_type: planId === 'yearly' ? 'annual' : 'monthly'
      }
    }

    console.log('Creating MercadoPago preference with data:', preferenceData)

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('MercadoPago API error:', errorData)
      throw new Error(`Error de MercadoPago: ${response.status}`)
    }

    const preference = await response.json()
    console.log('MercadoPago preference created:', preference.id)

    // Guardar la referencia de la preferencia en Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabaseClient
      .from('payment_preferences')
      .insert({
        psychologist_id: psychologistId,
        preference_id: preference.id,
        plan_id: planId,
        amount: selectedPlan.unit_price,
        currency: selectedPlan.currency_id,
        status: 'pending'
      })

    if (dbError) {
      console.error('Error saving preference to database:', dbError)
    }

    return new Response(
      JSON.stringify({ 
        init_point: preference.init_point,
        preference_id: preference.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in create-mercadopago-preference:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
