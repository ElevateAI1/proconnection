import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface PsychologistData {
  first_name: string
  last_name: string
  phone?: string
  specialization?: string
  license_number?: string
  plan_type?: 'plus' | 'pro'
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
}

interface PatientData {
  first_name: string
  last_name: string
  psychologist_id: string
  phone?: string
  age?: number
  notes?: string
}

interface PsychologistAccountData extends PsychologistData {
  email: string
}

interface PatientAccountData extends PatientData {
  email: string
}

interface EmailData {
  email: string
  token: string
  action_type: string
  user_type: string
  first_name: string
  redirect_to?: string
}

interface UserData {
  firstName: string
  userType: string
  email: string
}

// ============================================================================
// UTILIDADES
// ============================================================================

function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key')
  const validApiKey = Deno.env.get('API_KEY')
  return apiKey === validApiKey
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

function createVerificationEmailTemplate(verificationUrl: string, userData?: UserData) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu cuenta - ProConnection</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header with gradient -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">ProConnection</h1>
        <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Plataforma Profesional de Psicología</p>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          ${userData?.firstName ? `¡Hola ${userData.firstName}!` : '¡Bienvenido!'} 🎉
        </h2>
        
        ${userData?.userType === 'psychologist' ? `
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="color: #1e40af; margin: 0; font-weight: 600;">
            👨‍⚕️ Registro como Psicólogo Profesional
          </p>
          <p style="color: #3730a3; margin: 5px 0 0 0; font-size: 14px;">
            Te has registrado como profesional en nuestra plataforma.
          </p>
        </div>
        ` : userData?.userType === 'patient' ? `
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="color: #059669; margin: 0; font-weight: 600;">
            🧑‍🤝‍🧑 Registro como Paciente
          </p>
          <p style="color: #047857; margin: 5px 0 0 0; font-size: 14px;">
            Te has registrado como paciente en nuestra plataforma.
          </p>
        </div>
        ` : ''}
        
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
          ${userData?.email ? `Para completar tu registro con la cuenta <strong>${userData.email}</strong>` : 'Para completar tu registro'}, 
          necesitamos verificar tu dirección de email.
        </p>
        
        <!-- Call to action button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); 
                    color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            ✓ Verificar mi cuenta${userData?.firstName ? ` (${userData.firstName})` : ''}
          </a>
        </div>
        
        <!-- Alternative link section -->
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="color: #475569; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
            ¿No puedes hacer clic en el botón?
          </p>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
            Copia y pega este enlace en tu navegador:<br>
            <span style="word-break: break-all; color: #3b82f6;">${verificationUrl}</span>
          </p>
        </div>
        
        <!-- Security info -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
            <strong>¿Por qué recibes este email?</strong><br>
            ${userData?.email ? `Alguien se registró en ProConnection con la dirección ${userData.email}` : 'Alguien se registró en ProConnection con esta dirección de email'}${userData?.userType ? ` como ${userData.userType === 'psychologist' ? 'psicólogo profesional' : 'paciente'}` : ''}. 
            Si no fuiste tú, puedes ignorar este mensaje de forma segura.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
          Este enlace de verificación expira en 24 horas por seguridad.
        </p>
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          © 2024 ProConnection. Todos los derechos reservados.<br>
          Plataforma profesional para psicólogos y pacientes.
        </p>
      </div>
    </div>
  </body>
</html>
`
}

function errorResponse(message: string, status: number = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function successResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({ data }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// ============================================================================
// HANDLERS DE PATIENTS
// ============================================================================

async function handlePatients(req: Request, supabase: any, segments: string[]) {
  const patientId = segments[segments.length - 1]
  const url = new URL(req.url)

  switch (req.method) {
    case 'GET':
      if (patientId && patientId !== 'patients') {
        const { data, error } = await supabase
          .from('patients')
          .select(`*, profiles!inner(email, user_type, created_at), psychologists!inner(first_name, last_name, professional_code)`)
          .eq('id', patientId)
          .single()

        if (error) return errorResponse('Patient not found', 404)
        return successResponse(data)
      } else {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const psychologistId = url.searchParams.get('psychologist_id')
        
        let query = supabase
          .from('patients')
          .select(`*, profiles!inner(email, user_type, created_at), psychologists!inner(first_name, last_name, professional_code)`, { count: 'exact' })

        if (psychologistId) query = query.eq('psychologist_id', psychologistId)

        const { data, error, count } = await query
          .range((page - 1) * limit, page * limit - 1)
          .order('created_at', { ascending: false })

        if (error) return errorResponse('Failed to fetch patients')
        return new Response(
          JSON.stringify({ 
            data: data, 
            pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    case 'POST':
      const createData: PatientData = await req.json()
      
      if (!createData.first_name || !createData.last_name || !createData.psychologist_id) {
        return errorResponse('first_name, last_name, and psychologist_id are required', 400)
      }

      const { data: psychologist, error: psychError } = await supabase
        .from('psychologists')
        .select('id')
        .eq('id', createData.psychologist_id)
        .single()

      if (psychError || !psychologist) {
        return errorResponse('Invalid psychologist_id', 400)
      }

      const tempEmail = `patient_${Date.now()}@proconnection.com`
      const tempPassword = Math.random().toString(36).substring(2, 15)

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        user_metadata: { user_type: 'patient' }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return errorResponse(`Failed to create user account: ${authError.message}`)
      }

      // Create profile first (required for patients table foreign key)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: tempEmail,
          user_type: 'patient'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return errorResponse(`Failed to create profile: ${profileError.message}`)
      }

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
        // Cleanup: delete profile and auth user if patient creation failed
        await supabase.from('profiles').delete().eq('id', authUser.user.id)
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return errorResponse(`Failed to create patient profile: ${patientCreateError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          data: newPatient,
          auth_details: { temp_email: tempEmail, temp_password: tempPassword, note: "User should update email and password on first login" }
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'PUT':
      if (!patientId || patientId === 'patients') {
        return errorResponse('Patient ID is required', 400)
      }

      const updateData: Partial<PatientData> = await req.json()
      
      if (updateData.psychologist_id) {
        const { data: psychologist, error: psychError } = await supabase
          .from('psychologists')
          .select('id')
          .eq('id', updateData.psychologist_id)
          .single()

        if (psychError || !psychologist) {
          return errorResponse('Invalid psychologist_id', 400)
        }
      }
      
      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', patientId)
        .select()
        .single()

      if (updateError) return errorResponse('Failed to update patient')
      return successResponse(updatedPatient)

    case 'DELETE':
      if (!patientId || patientId === 'patients') {
        return errorResponse('Patient ID is required', 400)
      }

      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)

      if (deleteError) return errorResponse('Failed to delete patient')
      await supabase.auth.admin.deleteUser(patientId)
      return successResponse({ message: 'Patient deleted successfully' })

    default:
      return errorResponse('Method not allowed', 405)
  }
}

// ============================================================================
// HANDLERS DE PSYCHOLOGISTS
// ============================================================================

async function handlePsychologists(req: Request, supabase: any, segments: string[]) {
  const psychologistId = segments[segments.length - 1]
  const url = new URL(req.url)

  switch (req.method) {
    case 'GET':
      if (psychologistId && psychologistId !== 'psychologists') {
        const { data, error } = await supabase
          .from('psychologists')
          .select(`*, profiles!inner(email, user_type, created_at)`)
          .eq('id', psychologistId)
          .single()

        if (error) return errorResponse('Psychologist not found', 404)
        return successResponse(data)
      } else {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const status = url.searchParams.get('status')
        const plan = url.searchParams.get('plan')
        
        let query = supabase
          .from('psychologists')
          .select(`*, profiles!inner(email, user_type, created_at)`, { count: 'exact' })

        if (status) query = query.eq('subscription_status', status)
        if (plan) query = query.eq('plan_type', plan)

        const { data, error, count } = await query
          .range((page - 1) * limit, page * limit - 1)
          .order('created_at', { ascending: false })

        if (error) return errorResponse('Failed to fetch psychologists')
        return new Response(
          JSON.stringify({ 
            data: data, 
            pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    case 'POST':
      const createData: PsychologistData = await req.json()
      
      if (!createData.first_name || !createData.last_name) {
        return errorResponse('first_name and last_name are required', 400)
      }

      const { data: professionalCode, error: codeError } = await supabase
        .rpc('generate_professional_code')

      if (codeError) return errorResponse('Failed to generate professional code')

      const tempEmail = `temp_${Date.now()}@proconnection.com`
      const tempPassword = Math.random().toString(36).substring(2, 15)

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        user_metadata: { user_type: 'psychologist' }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return errorResponse(`Failed to create user account: ${authError.message}`)
      }

      // Create profile first (required for psychologists table foreign key)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: tempEmail,
          user_type: 'psychologist'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return errorResponse(`Failed to create profile: ${profileError.message}`)
      }

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
        // Cleanup: delete profile and auth user if psychologist creation failed
        await supabase.from('profiles').delete().eq('id', authUser.user.id)
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return errorResponse(`Failed to create psychologist profile: ${psychError.message}`)
      }

      return new Response(
        JSON.stringify({
          data: newPsychologist,
          auth_details: { temp_email: tempEmail, temp_password: tempPassword, note: "User should update email and password on first login" }
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'PUT':
      if (!psychologistId || psychologistId === 'psychologists') {
        return errorResponse('Psychologist ID is required', 400)
      }

      const updateData: Partial<PsychologistData> = await req.json()
      
      const { data: updatedPsychologist, error: updateError } = await supabase
        .from('psychologists')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', psychologistId)
        .select()
        .single()

      if (updateError) return errorResponse('Failed to update psychologist')
      return successResponse(updatedPsychologist)

    case 'DELETE':
      if (!psychologistId || psychologistId === 'psychologists') {
        return errorResponse('Psychologist ID is required', 400)
      }

      const { error: deleteError } = await supabase
        .from('psychologists')
        .delete()
        .eq('id', psychologistId)

      if (deleteError) return errorResponse('Failed to delete psychologist')
      await supabase.auth.admin.deleteUser(psychologistId)
      return successResponse({ message: 'Psychologist deleted successfully' })

    default:
      return errorResponse('Method not allowed', 405)
  }
}

// ============================================================================
// HANDLERS DE ACCOUNTS
// ============================================================================

async function handleAccounts(req: Request, supabase: any, segments: string[]) {
  const accountType = segments[segments.length - 1]
  const userId = req.method === 'DELETE' ? accountType : null

  switch (req.method) {
    case 'POST':
      if (accountType === 'psychologist') {
        const createData: PsychologistAccountData = await req.json()
        
        if (!createData.first_name || !createData.last_name || !createData.email) {
          return errorResponse('first_name, last_name, and email are required', 400)
        }

        const { data: professionalCode, error: codeError } = await supabase
          .rpc('generate_professional_code')

        if (codeError) return errorResponse('Failed to generate professional code')

        const tempPassword = Math.random().toString(36).substring(2, 15) + '!'

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: createData.email,
          password: tempPassword,
          user_metadata: { user_type: 'psychologist' },
          email_confirm: true
        })

        if (authError) {
          console.error('Error creating auth user:', authError)
          return errorResponse(`Failed to create user account: ${authError.message}`)
        }

        // Create profile first (required for psychologists table foreign key)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: createData.email,
            user_type: 'psychologist'
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return errorResponse(`Failed to create profile: ${profileError.message}`)
        }

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
          // Cleanup: delete profile and auth user if psychologist creation failed
          await supabase.from('profiles').delete().eq('id', authUser.user.id)
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return errorResponse(`Failed to create psychologist profile: ${psychError.message}`)
        }

        return successResponse({
          user_id: authUser.user.id,
          email: createData.email,
          psychologist: newPsychologist,
          temp_password: tempPassword,
          note: "User should update password on first login"
        }, 201)

      } else if (accountType === 'patient') {
        const createData: PatientAccountData = await req.json()
        
        if (!createData.first_name || !createData.last_name || !createData.email || !createData.psychologist_id) {
          return errorResponse('first_name, last_name, email, and psychologist_id are required', 400)
        }

        const { data: psychologist, error: psychError } = await supabase
          .from('psychologists')
          .select('id')
          .eq('id', createData.psychologist_id)
          .single()

        if (psychError || !psychologist) {
          return errorResponse('Invalid psychologist_id', 400)
        }

        const tempPassword = Math.random().toString(36).substring(2, 15) + '!'

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: createData.email,
          password: tempPassword,
          user_metadata: { user_type: 'patient' },
          email_confirm: true
        })

        if (authError) {
          console.error('Error creating auth user:', authError)
          return errorResponse(`Failed to create user account: ${authError.message}`)
        }

        // Create profile first (required for patients table foreign key)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: createData.email,
            user_type: 'patient'
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return errorResponse(`Failed to create profile: ${profileError.message}`)
        }

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
          // Cleanup: delete profile and auth user if patient creation failed
          await supabase.from('profiles').delete().eq('id', authUser.user.id)
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return errorResponse(`Failed to create patient profile: ${patientCreateError.message}`)
        }

        return successResponse({
          user_id: authUser.user.id,
          email: createData.email,
          patient: newPatient,
          temp_password: tempPassword,
          note: "User should update password on first login"
        }, 201)

      } else {
        return errorResponse('Invalid account type. Supported: psychologist, patient', 400)
      }

    case 'DELETE':
      if (!userId) return errorResponse('User ID is required', 400)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single()

      if (profileError || !profile) return errorResponse('User not found', 404)

      if (profile.user_type === 'psychologist') {
        const { error: deleteError } = await supabase
          .from('psychologists')
          .delete()
          .eq('id', userId)

        if (deleteError) return errorResponse('Failed to delete psychologist account')
      } else if (profile.user_type === 'patient') {
        const { error: deleteError } = await supabase
          .from('patients')
          .delete()
          .eq('id', userId)

        if (deleteError) return errorResponse('Failed to delete patient account')
      }

      await supabase.auth.admin.deleteUser(userId)
      return successResponse({ message: 'Account deleted successfully' })

    default:
      return errorResponse('Method not allowed', 405)
  }
}

// ============================================================================
// HANDLERS DE STATS
// ============================================================================

async function handleStats(req: Request, supabase: any, segments: string[]) {
  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  const statsType = segments[segments.length - 1]

  switch (statsType) {
    case 'overview':
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

      return successResponse({
        total_psychologists: totalPsychologists || 0,
        total_patients: totalPatients || 0,
        active_psychologists: activePsychologists || 0,
        trial_psychologists: trialPsychologists || 0,
        pro_plan_psychologists: proPsychologists || 0,
        plus_plan_psychologists: (totalPsychologists || 0) - (proPsychologists || 0),
        generated_at: new Date().toISOString()
      })

    case 'psychologists':
      const { data: psychStats, error: psychError } = await supabase
        .from('psychologist_stats')
        .select('*')
        .order('created_at', { ascending: false })

      if (psychError) return errorResponse('Failed to fetch psychologist statistics')
      return successResponse(psychStats)

    case 'subscriptions':
      const { data: subStats, error: subError } = await supabase
        .from('psychologists')
        .select('subscription_status, plan_type, trial_end_date, subscription_end_date, created_at')

      if (subError) return errorResponse('Failed to fetch subscription statistics')

      const now = new Date()
      const subscriptionAnalytics: any = {
        by_status: {},
        by_plan: {},
        expiring_soon: 0,
        expired_trials: 0,
        revenue_potential: { plus_monthly: 0, pro_monthly: 0, total_monthly: 0 }
      }

      subStats?.forEach(psych => {
        subscriptionAnalytics.by_status[psych.subscription_status] = 
          (subscriptionAnalytics.by_status[psych.subscription_status] || 0) + 1

        subscriptionAnalytics.by_plan[psych.plan_type] = 
          (subscriptionAnalytics.by_plan[psych.plan_type] || 0) + 1

        const endDate = psych.subscription_status === 'trial' 
          ? new Date(psych.trial_end_date)
          : new Date(psych.subscription_end_date)
        
        if (endDate && endDate > now) {
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysUntilExpiry <= 7) subscriptionAnalytics.expiring_soon++
        }

        if (psych.subscription_status === 'trial' && psych.trial_end_date) {
          const trialEnd = new Date(psych.trial_end_date)
          if (trialEnd < now) subscriptionAnalytics.expired_trials++
        }

        if (psych.subscription_status === 'active') {
          if (psych.plan_type === 'plus') {
            subscriptionAnalytics.revenue_potential.plus_monthly += 29
          } else if (psych.plan_type === 'pro') {
            subscriptionAnalytics.revenue_potential.pro_monthly += 99
          }
        }
      })

      subscriptionAnalytics.revenue_potential.total_monthly = 
        subscriptionAnalytics.revenue_potential.plus_monthly + 
        subscriptionAnalytics.revenue_potential.pro_monthly

      return successResponse(subscriptionAnalytics)

    default:
      return errorResponse('Invalid stats type. Supported: overview, psychologists, subscriptions', 400)
  }
}

// ============================================================================
// HANDLERS DE EMAIL VERIFICATION
// ============================================================================

async function handleSendVerificationEmail(req: Request) {
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const { email, token, action_type, user_type, first_name, redirect_to }: EmailData = await req.json()
    
    console.log('Processing verification email for:', email)
    console.log('User type:', user_type)
    console.log('First name:', first_name)

    // Decode the verification token to get user data
    let verificationData
    try {
      verificationData = JSON.parse(atob(token))
    } catch (e) {
      console.log('Could not decode token, using simple verification')
      verificationData = { email, userType: user_type, firstName: first_name }
    }

    // Create verification URL with detailed information
    const verificationUrl = redirect_to || `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token}&type=${action_type}`

    console.log('Verification URL:', verificationUrl)

    // Use the professional email template with user-specific data
    const emailHtml = createVerificationEmailTemplate(verificationUrl, {
      firstName: first_name,
      userType: user_type,
      email: email
    })

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return errorResponse("RESEND_API_KEY no está configurada", 500);
    }
    const resend = new Resend(resendApiKey);
    
    const emailResponse = await resend.emails.send({
      from: "ProConnection <lord@mattyeh.com>",
      to: [email],
      subject: `🔐 Verifica tu cuenta en ProConnection - ${first_name}`,
      html: emailHtml,
    })

    console.log("Verification email sent successfully:", emailResponse)

    return successResponse({ success: true, id: emailResponse.data?.id })
  } catch (error: any) {
    console.error("Error sending verification email:", error)
    return errorResponse(`Failed to send verification email: ${error.message}`, 500)
  }
}

// ============================================================================
// HANDLERS DE JITSI MEETING
// ============================================================================

async function handleCreateJitsiMeeting(req: Request, supabase: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json()
    // Extraer el resource si está presente (se ignora, solo se usa para routing)
    const { resource, action, appointmentId, patientName, psychologistName, appointmentDate, roomName, startTime, duration } = body

    if (!appointmentId) {
      return errorResponse('appointmentId is required', 400)
    }

    console.log('Creating Jitsi meeting for appointment:', appointmentId)

    // Generate a unique room name if not provided
    const finalRoomName = roomName || `therapy-session-${appointmentId}-${Date.now()}`
    
    // Create Jitsi meet URL
    const jitsiMeetUrl = `https://meet.jit.si/${finalRoomName}`
    
    // Update the appointment with the meeting URL
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        meeting_url: jitsiMeetUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (updateError) {
      console.error('Error updating appointment with meeting URL:', updateError)
      return errorResponse('No se pudo guardar el enlace de la reunión', 500)
    }

    console.log('Meeting URL created and saved successfully:', jitsiMeetUrl)

    // Return the meeting details
    return successResponse({
      success: true,
      meetingUrl: jitsiMeetUrl,
      roomName: finalRoomName,
      appointmentId: appointmentId,
      message: 'Reunión creada exitosamente'
    })
  } catch (error: any) {
    console.error('Error creating Jitsi meeting:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return errorResponse(`Error al crear la reunión: ${errorMessage}`, 500)
  }
}

// ============================================================================
// HANDLERS DE SUBSCRIPTIONS
// ============================================================================

async function handleSubscriptions(req: Request, supabase: any, segments: string[]) {
  const psychologistId = segments[segments.length - 2]
  const action = segments[segments.length - 1]

  if (!psychologistId || psychologistId === 'subscriptions') {
    return errorResponse('Psychologist ID is required', 400)
  }

  const { data: psychologist, error: psychError } = await supabase
    .from('psychologists')
    .select('*')
    .eq('id', psychologistId)
    .single()

  if (psychError || !psychologist) {
    return errorResponse('Psychologist not found', 404)
  }

  switch (action) {
    case 'status':
      if (req.method !== 'PUT') return errorResponse('Method not allowed', 405)

      const statusData: { status: string, subscription_days?: number } = await req.json()
      
      if (!statusData.status || !['trial', 'active', 'expired', 'cancelled'].includes(statusData.status)) {
        return errorResponse('Invalid status. Must be: trial, active, expired, or cancelled', 400)
      }

      const { error: statusError } = await supabase
        .rpc('admin_update_subscription_status', {
          psychologist_id: psychologistId,
          new_status: statusData.status,
          subscription_days: statusData.subscription_days || null
        })

      if (statusError) return errorResponse('Failed to update subscription status')
      return successResponse({ message: 'Subscription status updated successfully' })

    case 'plan':
      if (req.method !== 'PUT') return errorResponse('Method not allowed', 405)

      const planData: { plan_type: string } = await req.json()
      
      if (!planData.plan_type || !['plus', 'pro'].includes(planData.plan_type)) {
        return errorResponse('Invalid plan_type. Must be: plus or pro', 400)
      }

      const { error: planError } = await supabase
        .rpc('admin_update_plan_type', {
          psychologist_id: psychologistId,
          new_plan_type: planData.plan_type
        })

      if (planError) return errorResponse('Failed to update plan type')
      return successResponse({ message: 'Plan type updated successfully' })

    case 'extend':
      if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

      const extendData: { trial_days?: number, subscription_days?: number } = await req.json()
      
      if (extendData.trial_days) {
        const { error: trialError } = await supabase
          .rpc('admin_update_trial_days', {
            psychologist_id: psychologistId,
            additional_days: extendData.trial_days
          })

        if (trialError) return errorResponse('Failed to extend trial')
        return successResponse({ message: `Trial extended by ${extendData.trial_days} days` })
      }

      if (extendData.subscription_days) {
        const newEndDate = new Date()
        newEndDate.setDate(newEndDate.getDate() + extendData.subscription_days)

        const { error: subError } = await supabase
          .from('psychologists')
          .update({
            subscription_end_date: newEndDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', psychologistId)

        if (subError) return errorResponse('Failed to extend subscription')
        return successResponse({ message: `Subscription extended by ${extendData.subscription_days} days` })
      }

      return errorResponse('Either trial_days or subscription_days is required', 400)

    default:
      return errorResponse('Invalid action. Supported actions: status, plan, extend', 400)
  }
}

// ============================================================================
// ROUTER PRINCIPAL
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight requests - MUST return 200 status
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const supabase = getSupabaseClient()
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    
    // Buscar el índice del nombre de la función
    const functionNameIndex = segments.findIndex(
      seg => seg === 'proconnection-api' || seg === 'proconnection-api' || seg === 'edge-function-proconnection'
    )
    
    // Si encontramos el nombre de la función, tomar los segments después de ella
    // Si no, usar todos los segments
    let resourceSegments = functionNameIndex !== -1
      ? segments.slice(functionNameIndex + 1)
      : segments
    
    let resource = resourceSegments[0]
    
    // Si no hay resource en la URL, intentar leerlo del body (para llamadas desde invoke)
    // Necesitamos clonar el request para leer el body sin consumirlo
    let requestBody: any = null
    if (!resource && req.method === 'POST') {
      try {
        requestBody = await req.clone().json()
        if (requestBody.resource || requestBody.action) {
          resource = requestBody.resource || requestBody.action
        }
      } catch (e) {
        // Si no se puede parsear el body, continuar con el routing normal
      }
    }

    console.log(`ProConnection API: ${req.method} /${segments.join('/')} -> resource: ${resource}, segments: [${resourceSegments.join(', ')}]`)

    // Endpoints públicos (no requieren API key)
    if (resource === 'send-verification-email') {
      return await handleSendVerificationEmail(req)
    }

    if (resource === 'create-jitsi-meeting') {
      // create-jitsi-meeting no requiere API key (es llamado desde el frontend autenticado)
      // El handler ignorará el campo 'resource' si está presente en el body
      return await handleCreateJitsiMeeting(req, supabase)
    }

    // Todos los demás endpoints requieren API key
    if (!verifyApiKey(req)) {
      return errorResponse('Invalid or missing API key', 401)
    }

    // Routing
    switch (resource) {
      case 'patients':
        return await handlePatients(req, supabase, resourceSegments)
      
      case 'psychologists':
        return await handlePsychologists(req, supabase, resourceSegments)
      
      case 'accounts':
        return await handleAccounts(req, supabase, resourceSegments)
      
      case 'stats':
        return await handleStats(req, supabase, resourceSegments)
      
      case 'subscriptions':
        return await handleSubscriptions(req, supabase, resourceSegments)
      
      default:
        return errorResponse('Invalid resource. Supported: patients, psychologists, accounts, stats, subscriptions, send-verification-email, create-jitsi-meeting', 400)
    }

  } catch (error) {
    console.error('API Error:', error)
    return errorResponse('Internal server error', 500)
  }
})

