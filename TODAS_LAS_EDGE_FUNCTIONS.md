# Todas las Edge Functions de ProConnection

Este documento contiene todas las edge functions que se usan en el código y que necesitas desplegar en Supabase.

## 📋 Resumen

**Total de Edge Functions: 14**

### ✅ Edge Functions Existentes (13):
1. `api-patients` - Gestión de pacientes
2. `api-accounts` - Creación de cuentas (psychologist/patient)
3. `api-psychologists` - Gestión de psicólogos
4. `api-stats` - Estadísticas de la plataforma
5. `api-subscriptions` - Gestión de suscripciones
6. `process-whatsapp-notifications` - Procesamiento de notificaciones WhatsApp
7. `create-jitsi-meeting` - Creación de reuniones Jitsi
8. `generate-autocomplete-suggestions` - Sugerencias de autocompletado (OpenAI)
9. `notification-scheduler` - Programación de notificaciones
10. `create-mercadopago-preference` - Creación de preferencias MercadoPago
11. `generate-monthly-report` - Generación de reportes mensuales
12. `send-verification-email` - Envío de emails de verificación (Resend)
13. `process-receipt-ocr` - Procesamiento OCR de comprobantes
14. `whatsapp-manager` - Gestión de WhatsApp

### ⚠️ Edge Functions Usadas pero NO Existentes (1):
- `check-mercadopago-payment` - Verificación de estado de pago MercadoPago (usada en `useMercadoPago.tsx` pero no existe)

---

## 🔧 Variables de Entorno Necesarias

Configura estas variables en Supabase Dashboard → Edge Functions → Settings:

```
API_KEY=tu-api-key-secreta-123
OPENAI_API_KEY=sk-... (para generate-autocomplete-suggestions)
RESEND_API_KEY=... (para send-verification-email)
MERCADOPAGO_ACCESS_TOKEN=... (para create-mercadopago-preference)
N8N_WEBHOOK_URL=... (para process-receipt-ocr)
```

---

## 📦 Edge Functions Completas

### 1. api-patients

**Archivo:** `supabase/functions/api-patients/index.ts`

**Código completo:** (Ver archivo `EDGE_FUNCTION_API_PATIENTS.md` que ya creé)

**Uso en código:**
- `src/hooks/useOptimizedPatients.tsx` - Línea 76

**Variables de entorno:**
- `API_KEY`

---

### 2. api-accounts

**Archivo:** `supabase/functions/api-accounts/index.ts`

```typescript
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
```

**Variables de entorno:**
- `API_KEY`

---

### 3. api-psychologists

**Archivo:** `supabase/functions/api-psychologists/index.ts`

```typescript
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
```

**Variables de entorno:**
- `API_KEY`

---

### 4. api-stats

**Archivo:** `supabase/functions/api-stats/index.ts`

```typescript
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
```

**Variables de entorno:**
- `API_KEY`

---

### 5. api-subscriptions

**Archivo:** `supabase/functions/api-subscriptions/index.ts`

```typescript
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
```

**Variables de entorno:**
- `API_KEY`

---

## 📝 Nota sobre las otras funciones

Las demás edge functions (`process-whatsapp-notifications`, `create-jitsi-meeting`, `generate-autocomplete-suggestions`, `notification-scheduler`, `create-mercadopago-preference`, `generate-monthly-report`, `send-verification-email`, `process-receipt-ocr`, `whatsapp-manager`) están en los archivos del proyecto. Si necesitas alguna específica, dímelo y te la paso completa.

---

## ⚠️ IMPORTANTE: Actualizar el código del frontend

Para que `api-patients` funcione, también necesitas actualizar el hook para enviar el API key. Ya lo hice en `src/hooks/useOptimizedPatients.tsx`, pero asegúrate de agregar `VITE_API_KEY` a tu archivo `.env`:

```env
VITE_API_KEY=tu-api-key-secreta-123
```

Y configurar la misma clave en Supabase como `API_KEY`.

