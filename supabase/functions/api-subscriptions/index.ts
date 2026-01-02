
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface SubscriptionUpdate {
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
  plan_type?: 'plus' | 'pro'
  subscription_days?: number
  trial_days?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key')
    const validApiKey = Deno.env.get('API_KEY')
    
    if (!apiKey || apiKey !== validApiKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const psychologistId = pathSegments[pathSegments.length - 2] // .../psychologist-id/action
    const action = pathSegments[pathSegments.length - 1]

    console.log(`API Subscriptions: ${req.method} ${url.pathname}`)

    if (!psychologistId || psychologistId === 'api-subscriptions') {
      return new Response(
        JSON.stringify({ error: 'Psychologist ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify psychologist exists
    const { data: psychologist, error: psychError } = await supabase
      .from('psychologists')
      .select('*')
      .eq('id', psychologistId)
      .single()

    if (psychError || !psychologist) {
      return new Response(
        JSON.stringify({ error: 'Psychologist not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (action) {
      case 'status':
        if (req.method !== 'PUT') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const statusData: { status: string, subscription_days?: number } = await req.json()
        
        if (!statusData.status || !['trial', 'active', 'expired', 'cancelled'].includes(statusData.status)) {
          return new Response(
            JSON.stringify({ error: 'Invalid status. Must be: trial, active, expired, or cancelled' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: statusError } = await supabase
          .rpc('admin_update_subscription_status', {
            psychologist_id: psychologistId,
            new_status: statusData.status,
            subscription_days: statusData.subscription_days || null
          })

        if (statusError) {
          console.error('Error updating subscription status:', statusError)
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription status' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`Subscription status updated to ${statusData.status} for psychologist:`, psychologistId)
        return new Response(
          JSON.stringify({ message: 'Subscription status updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'plan':
        if (req.method !== 'PUT') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const planData: { plan_type: string } = await req.json()
        
        if (!planData.plan_type || !['plus', 'pro'].includes(planData.plan_type)) {
          return new Response(
            JSON.stringify({ error: 'Invalid plan_type. Must be: plus or pro' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: planError } = await supabase
          .rpc('admin_update_plan_type', {
            psychologist_id: psychologistId,
            new_plan_type: planData.plan_type
          })

        if (planError) {
          console.error('Error updating plan type:', planError)
          return new Response(
            JSON.stringify({ error: 'Failed to update plan type' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`Plan type updated to ${planData.plan_type} for psychologist:`, psychologistId)
        return new Response(
          JSON.stringify({ message: 'Plan type updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'extend':
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const extendData: { trial_days?: number, subscription_days?: number } = await req.json()
        
        if (extendData.trial_days) {
          const { error: trialError } = await supabase
            .rpc('admin_update_trial_days', {
              psychologist_id: psychologistId,
              additional_days: extendData.trial_days
            })

          if (trialError) {
            console.error('Error extending trial:', trialError)
            return new Response(
              JSON.stringify({ error: 'Failed to extend trial' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          console.log(`Trial extended by ${extendData.trial_days} days for psychologist:`, psychologistId)
          return new Response(
            JSON.stringify({ message: `Trial extended by ${extendData.trial_days} days` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (extendData.subscription_days) {
          // Update subscription end date
          const newEndDate = new Date()
          newEndDate.setDate(newEndDate.getDate() + extendData.subscription_days)

          const { error: subError } = await supabase
            .from('psychologists')
            .update({
              subscription_end_date: newEndDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', psychologistId)

          if (subError) {
            console.error('Error extending subscription:', subError)
            return new Response(
              JSON.stringify({ error: 'Failed to extend subscription' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          console.log(`Subscription extended by ${extendData.subscription_days} days for psychologist:`, psychologistId)
          return new Response(
            JSON.stringify({ message: `Subscription extended by ${extendData.subscription_days} days` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: 'Either trial_days or subscription_days is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Supported actions: status, plan, extend' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
