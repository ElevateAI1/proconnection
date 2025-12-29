import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
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
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]

    console.log(`API Integrations: ${req.method} ${url.pathname}`)

    // Verificar que el usuario tiene plan Clínicas
    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('plan_type')
      .eq('id', user.id)
      .single()

    if (psychologist?.plan_type?.toLowerCase() !== 'clinicas') {
      return new Response(
        JSON.stringify({ error: 'Clínicas plan required for API integrations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (req.method) {
      case 'GET':
        if (action === 'api-keys') {
          // TODO: Implementar cuando tengamos tabla de API keys
          return new Response(
            JSON.stringify({ data: [] }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'webhooks') {
          // TODO: Implementar cuando tengamos tabla de webhooks
          return new Response(
            JSON.stringify({ data: [] }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'POST':
        if (action === 'api-keys') {
          const { name } = await req.json()

          if (!name) {
            return new Response(
              JSON.stringify({ error: 'name is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Generar API key
          const apiKey = `pk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')}`

          // TODO: Guardar en base de datos cuando tengamos la tabla
          const newKey = {
            id: crypto.randomUUID(),
            name,
            key: apiKey,
            psychologist_id: user.id,
            created_at: new Date().toISOString()
          }

          return new Response(
            JSON.stringify({ data: newKey }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'webhooks') {
          const { url: webhookUrl, events } = await req.json()

          if (!webhookUrl || !events || !Array.isArray(events)) {
            return new Response(
              JSON.stringify({ error: 'url and events array are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // TODO: Guardar en base de datos cuando tengamos la tabla
          const newWebhook = {
            id: crypto.randomUUID(),
            url: webhookUrl,
            events,
            psychologist_id: user.id,
            active: true,
            created_at: new Date().toISOString()
          }

          return new Response(
            JSON.stringify({ data: newWebhook }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        const resourceId = pathSegments[pathSegments.length - 1]
        const resourceType = pathSegments[pathSegments.length - 2]

        if (!resourceId || !resourceType) {
          return new Response(
            JSON.stringify({ error: 'resource_id and resource_type are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // TODO: Implementar eliminación cuando tengamos las tablas
        return new Response(
          JSON.stringify({ message: 'Resource deleted successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in API integrations:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

