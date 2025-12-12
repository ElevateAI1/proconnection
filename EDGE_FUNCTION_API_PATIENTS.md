# Edge Function: api-patients

## Código completo para Supabase

Copia este código en `supabase/functions/api-patients/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface PatientData {
  first_name: string
  last_name: string
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
    const patientId = pathSegments[pathSegments.length - 1]

    console.log(`API Patients: ${req.method} ${url.pathname}`)

    switch (req.method) {
      case 'GET':
        if (patientId && patientId !== 'api-patients') {
          // Get specific patient
          const { data: patient, error } = await supabase
            .from('patients')
            .select(`
              *,
              profiles!inner(email, user_type, created_at),
              psychologists!inner(first_name, last_name, professional_code)
            `)
            .eq('id', patientId)
            .single()

          if (error) {
            console.error('Error fetching patient:', error)
            return new Response(
              JSON.stringify({ error: 'Patient not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ data: patient }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // List patients with filters
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '50')
          const psychologistId = url.searchParams.get('psychologist_id')
          
          let query = supabase
            .from('patients')
            .select(`
              *,
              profiles!inner(email, user_type, created_at),
              psychologists!inner(first_name, last_name, professional_code)
            `, { count: 'exact' })

          if (psychologistId) {
            query = query.eq('psychologist_id', psychologistId)
          }

          const { data: patients, error, count } = await query
            .range((page - 1) * limit, page * limit - 1)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching patients:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to fetch patients' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ 
              data: patients, 
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
        const createData: PatientData = await req.json()
        
        // Validate required fields
        if (!createData.first_name || !createData.last_name || !createData.psychologist_id) {
          return new Response(
            JSON.stringify({ error: 'first_name, last_name, and psychologist_id are required' }),
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

        // Create auth user first
        const tempEmail = `patient_${Date.now()}@proconnection.com`
        const tempPassword = Math.random().toString(36).substring(2, 15)

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: tempEmail,
          password: tempPassword,
          user_metadata: { user_type: 'patient' }
        })

        if (authError) {
          console.error('Error creating auth user:', authError)
          return new Response(
            JSON.stringify({ error: 'Failed to create user account' }),
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

        console.log('Patient created successfully:', newPatient.id)
        return new Response(
          JSON.stringify({ 
            data: newPatient,
            auth_details: {
              temp_email: tempEmail,
              temp_password: tempPassword,
              note: "User should update email and password on first login"
            }
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        if (!patientId || patientId === 'api-patients') {
          return new Response(
            JSON.stringify({ error: 'Patient ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData: Partial<PatientData> = await req.json()
        
        // If psychologist_id is being updated, verify it exists
        if (updateData.psychologist_id) {
          const { data: psychologist, error: psychError } = await supabase
            .from('psychologists')
            .select('id')
            .eq('id', updateData.psychologist_id)
            .single()

          if (psychError || !psychologist) {
            return new Response(
              JSON.stringify({ error: 'Invalid psychologist_id' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        
        const { data: updatedPatient, error: updateError } = await supabase
          .from('patients')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', patientId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating patient:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update patient' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Patient updated successfully:', patientId)
        return new Response(
          JSON.stringify({ data: updatedPatient }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!patientId || patientId === 'api-patients') {
          return new Response(
            JSON.stringify({ error: 'Patient ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete patient (cascade will handle related data)
        const { error: deleteError } = await supabase
          .from('patients')
          .delete()
          .eq('id', patientId)

        if (deleteError) {
          console.error('Error deleting patient:', deleteError)
          return new Response(
            JSON.stringify({ error: 'Failed to delete patient' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Also delete the auth user
        await supabase.auth.admin.deleteUser(patientId)

        console.log('Patient deleted successfully:', patientId)
        return new Response(
          JSON.stringify({ message: 'Patient deleted successfully' }),
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
```

## Pasos para desplegar en Supabase:

1. **Crear la función en Supabase Dashboard:**
   - Ve a tu proyecto en Supabase
   - Edge Functions → Create a new function
   - Nombre: `api-patients`
   - Copia el código de arriba

2. **Configurar variable de entorno:**
   - En Supabase Dashboard → Edge Functions → Settings
   - Agrega la variable: `API_KEY` con un valor secreto (ej: `tu-api-key-secreta-123`)

3. **Actualizar el código del frontend** (ver siguiente paso)

