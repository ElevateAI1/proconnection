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
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const mercadoPagoWebhookKey = Deno.env.get('MERCADOPAGO_WEBHOOK_KEY')
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    // Validar webhook key si está configurado (seguridad)
    if (mercadoPagoWebhookKey) {
      const xSignature = req.headers.get('x-signature')
      const xRequestId = req.headers.get('x-request-id')
      
      // MercadoPago envía el webhook key en el header x-signature
      // En producción, deberías validar la firma completa
      // Por ahora, validamos que el header esté presente
      if (!xSignature && !xRequestId) {
        console.warn('Webhook received without signature headers')
        // No bloqueamos, pero registramos la advertencia
      }
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // MercadoPago envía los datos como query params
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const dataId = url.searchParams.get('data.id')
    
    // Si no están en query params, intentar leer del body
    let bodyData: any = null
    try {
      const bodyText = await req.text()
      if (bodyText) {
        bodyData = JSON.parse(bodyText)
      }
    } catch (e) {
      // Ignorar error si no hay body
    }
    
    const finalType = type || bodyData?.type
    const finalDataId = dataId || bodyData?.['data.id'] || bodyData?.data?.id

    console.log('MercadoPago webhook received:', { type: finalType, dataId: finalDataId })

    if (!finalType || !finalDataId) {
      return new Response(
        JSON.stringify({ error: 'Missing type or data.id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Manejar diferentes tipos de notificaciones
    if (finalType === 'preapproval') {
      // Obtener información del Preapproval desde MercadoPago
      const preapprovalResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${finalDataId}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadoPagoAccessToken}`
          }
        }
      )

      if (!preapprovalResponse.ok) {
        throw new Error(`Error fetching preapproval: ${preapprovalResponse.status}`)
      }

      const preapproval = await preapprovalResponse.json()
      console.log('Preapproval data:', preapproval)

      const psychologistId = preapproval.metadata?.psychologist_id
      const planKey = preapproval.metadata?.plan_key

      if (!psychologistId) {
        return new Response(
          JSON.stringify({ error: 'Missing psychologist_id in metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Actualizar estado de suscripción según el status del Preapproval
      const updateData: any = {
        mercadopago_preapproval_id: preapproval.id
      }

      if (preapproval.status === 'authorized' || preapproval.status === 'active') {
        // Suscripción activa
        updateData.subscription_status = 'active'
        updateData.plan_type = planKey || 'proconnection'
        
        // Calcular fechas
        const now = new Date()
        updateData.subscription_start_date = now.toISOString()
        
        // Próximo billing: en 1 mes
        const nextBilling = new Date(now)
        nextBilling.setMonth(nextBilling.getMonth() + 1)
        updateData.next_billing_date = nextBilling.toISOString()
        updateData.subscription_end_date = nextBilling.toISOString()
      } else if (preapproval.status === 'cancelled' || preapproval.status === 'paused') {
        // Suscripción cancelada o pausada
        updateData.subscription_status = 'cancelled'
        // Mantener acceso hasta subscription_end_date si existe
      } else if (preapproval.status === 'pending') {
        // Pendiente de pago
        updateData.subscription_status = 'trial'
      }

      const { error: updateError } = await supabaseClient
        .from('psychologists')
        .update(updateData)
        .eq('id', psychologistId)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        throw updateError
      }

      // Disparar evento para refrescar capacidades
      console.log('Subscription updated successfully for psychologist:', psychologistId)

    } else if (finalType === 'payment') {
      // Manejar pagos individuales (si es necesario)
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${finalDataId}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadoPagoAccessToken}`
          }
        }
      )

      if (!paymentResponse.ok) {
        throw new Error(`Error fetching payment: ${paymentResponse.status}`)
      }

      const payment = await paymentResponse.json()
      console.log('Payment data:', payment)

      // Aquí puedes procesar pagos individuales si es necesario
      // Por ahora, nos enfocamos en Preapproval
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in mercadopago-webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

