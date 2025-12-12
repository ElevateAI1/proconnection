import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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

      if (authError) return errorResponse('Failed to create user account')

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
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return errorResponse('Failed to create patient profile')
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

      if (authError) return errorResponse('Failed to create user account')

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
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return errorResponse('Failed to create psychologist profile')
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

        if (authError) return errorResponse(`Failed to create user account: ${authError.message}`)

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
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return errorResponse('Failed to create psychologist profile')
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

        if (authError) return errorResponse(`Failed to create user account: ${authError.message}`)

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
          await supabase.auth.admin.deleteUser(authUser.user.id)
          return errorResponse('Failed to create patient profile')
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!verifyApiKey(req)) {
      return errorResponse('Invalid or missing API key', 401)
    }

    const supabase = getSupabaseClient()
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    
    // Remover el nombre de la función si está presente
    if (segments[0] === 'proconnection-api' || segments[0] === 'edge-function-proconnection') {
      segments.shift()
    }
    
    const resource = segments[0]

    console.log(`ProConnection API: ${req.method} /${segments.join('/')}`)

    // Routing
    switch (resource) {
      case 'patients':
        return await handlePatients(req, supabase, segments)
      
      case 'psychologists':
        return await handlePsychologists(req, supabase, segments)
      
      case 'accounts':
        return await handleAccounts(req, supabase, segments)
      
      case 'stats':
        return await handleStats(req, supabase, segments)
      
      case 'subscriptions':
        return await handleSubscriptions(req, supabase, segments)
      
      default:
        return errorResponse('Invalid resource. Supported: patients, psychologists, accounts, stats, subscriptions', 400)
    }

  } catch (error) {
    console.error('API Error:', error)
    return errorResponse('Internal server error', 500)
  }
})

