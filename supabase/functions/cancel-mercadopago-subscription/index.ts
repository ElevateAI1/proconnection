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
    // Obtener usuario autenticado
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener información del psicólogo y su preapproval_id
    const { data: psychologist, error: psychError } = await supabaseClient
      .from('psychologists')
      .select('id, mercadopago_preapproval_id, subscription_end_date')
      .eq('id', user.id)
      .single()

    if (psychError || !psychologist) {
      return new Response(
        JSON.stringify({ error: 'Psicólogo no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!psychologist.mercadopago_preapproval_id) {
      return new Response(
        JSON.stringify({ error: 'No hay suscripción activa para cancelar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener el access token de MercadoPago
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    // Cancelar el Preapproval en MercadoPago
    const cancelResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${psychologist.mercadopago_preapproval_id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      }
    )

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.text()
      console.error('MercadoPago cancel error:', errorData)
      throw new Error(`Error al cancelar en MercadoPago: ${cancelResponse.status}`)
    }

    // Actualizar estado en base de datos
    // Mantener acceso hasta subscription_end_date si existe
    const updateData: any = {
      mercadopago_preapproval_id: null,
      subscription_status: 'cancelled'
    }

    // Si tiene subscription_end_date, mantener acceso hasta esa fecha
    // Si no, cancelar inmediatamente
    if (!psychologist.subscription_end_date) {
      updateData.subscription_status = 'cancelled'
    }

    const { error: updateError } = await supabaseClient
      .from('psychologists')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating subscription status:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Suscripción cancelada exitosamente',
        access_until: psychologist.subscription_end_date || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in cancel-mercadopago-subscription:', error)
    
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

