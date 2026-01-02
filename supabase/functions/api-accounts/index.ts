
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS'
}

interface PsychologistAccountData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  specialization?: string
  license_number?: string
  plan_type?: 'plus' | 'pro'
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
}

interface PatientAccountData {
  first_name: string
  last_name: string
  email: string
  psychologist_id: string
  phone?: string
  age?: number
  notes?: string
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
    const accountType = pathSegments[pathSegments.length - 1] // psychologist, patient, or user_id for delete
    const userId = req.method === 'DELETE' ? accountType : null

    console.log(`API Accounts: ${req.method} ${url.pathname}`)

    switch (req.method) {
      case 'POST':
        if (accountType === 'psychologist') {
          const createData: PsychologistAccountData = await req.json()
          
          // Validate required fields
          if (!createData.first_name || !createData.last_name || !createData.email) {
            return new Response(
              JSON.stringify({ error: 'first_name, last_name, and email are required' }),
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

          // Create auth user
          const tempPassword = Math.random().toString(36).substring(2, 15) + '!'

          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: createData.email,
            password: tempPassword,
            user_metadata: { user_type: 'psychologist' },
            email_confirm: true // Auto-confirm email
          })

          if (authError) {
            console.error('Error creating auth user:', authError)
            return new Response(
              JSON.stringify({ error: `Failed to create user account: ${authError.message}` }),
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

          console.log('Complete psychologist account created successfully:', newPsychologist.id)
          return new Response(
            JSON.stringify({ 
              data: {
                user_id: authUser.user.id,
                email: createData.email,
                psychologist: newPsychologist,
                temp_password: tempPassword,
                note: "User should update password on first login"
              }
            }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } else if (accountType === 'patient') {
          const createData: PatientAccountData = await req.json()
          
          // Validate required fields
          if (!createData.first_name || !createData.last_name || !createData.email || !createData.psychologist_id) {
            return new Response(
              JSON.stringify({ error: 'first_name, last_name, email, and psychologist_id are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Verify psychologist exists
          const { data: psychologist, error: psychError } = await supabase
            .from('psychologists')
            .select('id')
            .eq('id', createData.psychologist_id)
            .single()

          if (psychError || !psychologist) {
            return new Response(
              JSON.stringify({ error: 'Invalid psychologist_id' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Create auth user
          const tempPassword = Math.random().toString(36).substring(2, 15) + '!'

          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: createData.email,
            password: tempPassword,
            user_metadata: { user_type: 'patient' },
            email_confirm: true // Auto-confirm email
          })

          if (authError) {
            console.error('Error creating auth user:', authError)
            return new Response(
              JSON.stringify({ error: `Failed to create user account: ${authError.message}` }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Create patient profile
          const patientData = {
            id: authUser.user.id,
            first_name: createData.first_name,
            last_name: createData.last_name,
            psychologist_id: createData.psychologist_id,
            phone: createData.phone || null,
            age: createData.age || null,
            notes: createData.notes || null
          }

          const { data: newPatient, error: patientCreateError } = await supabase
            .from('patients')
            .insert(patientData)
            .select()
            .single()

          if (patientCreateError) {
            console.error('Error creating patient:', patientCreateError)
            // Cleanup: delete the auth user if patient creation failed
            await supabase.auth.admin.deleteUser(authUser.user.id)
            return new Response(
              JSON.stringify({ error: 'Failed to create patient profile' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          console.log('Complete patient account created successfully:', newPatient.id)
          return new Response(
            JSON.stringify({ 
              data: {
                user_id: authUser.user.id,
                email: createData.email,
                patient: newPatient,
                temp_password: tempPassword,
                note: "User should update password on first login"
              }
            }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } else {
          return new Response(
            JSON.stringify({ error: 'Invalid account type. Supported: psychologist, patient' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'DELETE':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get user profile to determine type
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .single()

        if (profileError || !profile) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete from specific table first (cascade will handle related data)
        if (profile.user_type === 'psychologist') {
          const { error: deleteError } = await supabase
            .from('psychologists')
            .delete()
            .eq('id', userId)

          if (deleteError) {
            console.error('Error deleting psychologist:', deleteError)
            return new Response(
              JSON.stringify({ error: 'Failed to delete psychologist account' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else if (profile.user_type === 'patient') {
          const { error: deleteError } = await supabase
            .from('patients')
            .delete()
            .eq('id', userId)

          if (deleteError) {
            console.error('Error deleting patient:', deleteError)
            return new Response(
              JSON.stringify({ error: 'Failed to delete patient account' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        // Delete the auth user
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)
        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError)
          // Continue anyway since the profile is already deleted
        }

        console.log('Complete account deleted successfully:', userId)
        return new Response(
          JSON.stringify({ message: 'Account deleted successfully' }),
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
