
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface PsychologistData {
  first_name: string
  last_name: string
  phone?: string
  specialization?: string
  license_number?: string
  plan_type?: 'plus' | 'pro'
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
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
    const psychologistId = pathSegments[pathSegments.length - 1]

    console.log(`API Psychologists: ${req.method} ${url.pathname}`)

    switch (req.method) {
      case 'GET':
        if (psychologistId && psychologistId !== 'api-psychologists') {
          // Get specific psychologist
          const { data: psychologist, error } = await supabase
            .from('psychologists')
            .select(`
              *,
              profiles!inner(email, user_type, created_at)
            `)
            .eq('id', psychologistId)
            .single()

          if (error) {
            console.error('Error fetching psychologist:', error)
            return new Response(
              JSON.stringify({ error: 'Psychologist not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ data: psychologist }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // List psychologists with filters
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '50')
          const status = url.searchParams.get('status')
          const plan = url.searchParams.get('plan')
          
          let query = supabase
            .from('psychologists')
            .select(`
              *,
              profiles!inner(email, user_type, created_at)
            `, { count: 'exact' })

          if (status) {
            query = query.eq('subscription_status', status)
          }
          if (plan) {
            query = query.eq('plan_type', plan)
          }

          const { data: psychologists, error, count } = await query
            .range((page - 1) * limit, page * limit - 1)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching psychologists:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to fetch psychologists' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ 
              data: psychologists, 
              pagination: { 
                page, 
                limit, 
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        const createData: PsychologistData = await req.json()
        
        // Validate required fields
        if (!createData.first_name || !createData.last_name) {
          return new Response(
            JSON.stringify({ error: 'first_name and last_name are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Generate professional code
        const { data: professionalCode, error: codeError } = await supabase
          .rpc('generate_professional_code')

        if (codeError) {
          console.error('Error generating professional code:', codeError)
          return new Response(
            JSON.stringify({ error: 'Failed to generate professional code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create auth user first
        const tempEmail = `temp_${Date.now()}@proconnection.com`
        const tempPassword = Math.random().toString(36).substring(2, 15)

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: tempEmail,
          password: tempPassword,
          user_metadata: { user_type: 'psychologist' }
        })

        if (authError) {
          console.error('Error creating auth user:', authError)
          return new Response(
            JSON.stringify({ error: 'Failed to create user account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create psychologist profile
        const psychologistData = {
          id: authUser.user.id,
          professional_code: professionalCode,
          first_name: createData.first_name,
          last_name: createData.last_name,
          phone: createData.phone || null,
          specialization: createData.specialization || null,
          license_number: createData.license_number || null,
          plan_type: createData.plan_type || 'plus',
          subscription_status: createData.subscription_status || 'trial'
        }

        const { data: newPsychologist, error: psychError } = await supabase
          .from('psychologists')
          .insert(psychologistData)
          .select()
          .single()

        if (psychError) {
          console.error('Error creating psychologist:', psychError)
          // Cleanup: delete the auth user if psychologist creation failed
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return new Response(
            JSON.stringify({ error: 'Failed to create psychologist profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Psychologist created successfully:', newPsychologist.id)
        return new Response(
          JSON.stringify({ 
            data: newPsychologist,
            auth_details: {
              temp_email: tempEmail,
              temp_password: tempPassword,
              note: "User should update email and password on first login"
            }
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        if (!psychologistId || psychologistId === 'api-psychologists') {
          return new Response(
            JSON.stringify({ error: 'Psychologist ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData: Partial<PsychologistData> = await req.json()
        
        const { data: updatedPsychologist, error: updateError } = await supabase
          .from('psychologists')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', psychologistId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating psychologist:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update psychologist' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Psychologist updated successfully:', psychologistId)
        return new Response(
          JSON.stringify({ data: updatedPsychologist }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!psychologistId || psychologistId === 'api-psychologists') {
          return new Response(
            JSON.stringify({ error: 'Psychologist ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete psychologist (cascade will handle related data)
        const { error: deleteError } = await supabase
          .from('psychologists')
          .delete()
          .eq('id', psychologistId)

        if (deleteError) {
          console.error('Error deleting psychologist:', deleteError)
          return new Response(
            JSON.stringify({ error: 'Failed to delete psychologist' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Also delete the auth user
        await supabase.auth.admin.deleteUser(psychologistId)

        console.log('Psychologist deleted successfully:', psychologistId)
        return new Response(
          JSON.stringify({ message: 'Psychologist deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
