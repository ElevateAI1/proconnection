
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
    const statsType = pathSegments[pathSegments.length - 1]

    console.log(`API Stats: ${req.method} ${url.pathname}`)

    switch (statsType) {
      case 'overview':
        // General platform statistics
        const [
          { count: totalPsychologists },
          { count: totalPatients },
          { count: activePsychologists },
          { count: trialPsychologists },
          { count: proPsychologists }
        ] = await Promise.all([
          supabase.from('psychologists').select('*', { count: 'exact', head: true }),
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('psychologists').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
          supabase.from('psychologists').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial'),
          supabase.from('psychologists').select('*', { count: 'exact', head: true }).eq('plan_type', 'pro')
        ])

        const overviewStats = {
          total_psychologists: totalPsychologists || 0,
          total_patients: totalPatients || 0,
          active_psychologists: activePsychologists || 0,
          trial_psychologists: trialPsychologists || 0,
          pro_plan_psychologists: proPsychologists || 0,
          plus_plan_psychologists: (totalPsychologists || 0) - (proPsychologists || 0),
          generated_at: new Date().toISOString()
        }

        return new Response(
          JSON.stringify({ data: overviewStats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'psychologists':
        // Detailed psychologist statistics
        const { data: psychStats, error: psychError } = await supabase
          .from('psychologist_stats')
          .select('*')
          .order('created_at', { ascending: false })

        if (psychError) {
          console.error('Error fetching psychologist stats:', psychError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch psychologist statistics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ data: psychStats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'subscriptions':
        // Subscription statistics
        const { data: subStats, error: subError } = await supabase
          .from('psychologists')
          .select('subscription_status, plan_type, trial_end_date, subscription_end_date, created_at')

        if (subError) {
          console.error('Error fetching subscription stats:', subError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch subscription statistics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Process subscription statistics
        const now = new Date()
        const subscriptionAnalytics = {
          by_status: {},
          by_plan: {},
          expiring_soon: 0,
          expired_trials: 0,
          revenue_potential: {
            plus_monthly: 0,
            pro_monthly: 0
          }
        }

        subStats?.forEach(psych => {
          // Count by status
          subscriptionAnalytics.by_status[psych.subscription_status] = 
            (subscriptionAnalytics.by_status[psych.subscription_status] || 0) + 1

          // Count by plan
          subscriptionAnalytics.by_plan[psych.plan_type] = 
            (subscriptionAnalytics.by_plan[psych.plan_type] || 0) + 1

          // Check expiring soon (within 7 days)
          const endDate = psych.subscription_status === 'trial' 
            ? new Date(psych.trial_end_date)
            : new Date(psych.subscription_end_date)
          
          if (endDate && endDate > now) {
            const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            if (daysUntilExpiry <= 7) {
              subscriptionAnalytics.expiring_soon++
            }
          }

          // Check expired trials
          if (psych.subscription_status === 'trial' && psych.trial_end_date) {
            const trialEnd = new Date(psych.trial_end_date)
            if (trialEnd < now) {
              subscriptionAnalytics.expired_trials++
            }
          }

          // Calculate revenue potential (assuming active subscriptions)
          if (psych.subscription_status === 'active') {
            if (psych.plan_type === 'plus') {
              subscriptionAnalytics.revenue_potential.plus_monthly += 29 // Assuming $29/month
            } else if (psych.plan_type === 'pro') {
              subscriptionAnalytics.revenue_potential.pro_monthly += 99 // Assuming $99/month
            }
          }
        })

        subscriptionAnalytics.revenue_potential.total_monthly = 
          subscriptionAnalytics.revenue_potential.plus_monthly + 
          subscriptionAnalytics.revenue_potential.pro_monthly

        return new Response(
          JSON.stringify({ data: subscriptionAnalytics }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid stats type. Supported: overview, psychologists, subscriptions' }),
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
