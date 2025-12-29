import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista básica de dominios de email desechables (puedes expandir esto)
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email'
]

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return DISPOSABLE_EMAIL_DOMAINS.some(d => domain?.includes(d))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validación básica de formato
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({
          status: 'invalid',
          reason: 'Formato de email inválido'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar si es email desechable
    if (isDisposableEmail(email)) {
      return new Response(
        JSON.stringify({
          status: 'disposable',
          reason: 'No se permiten emails desechables'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificación adicional: verificar dominio MX (opcional, más costoso)
    // Por ahora, si pasa las validaciones básicas, lo consideramos válido
    // En producción podrías integrar con un servicio como ZeroBounce, Abstract API, etc.

    // Verificar si el dominio tiene registros MX válidos
    try {
      // Esta es una verificación básica. En producción, considera usar un servicio externo
      const domain = email.split('@')[1]
      
      // Por ahora, retornamos 'valid' si pasa las validaciones básicas
      // Puedes agregar más verificaciones aquí (MX records, etc.)
      
      return new Response(
        JSON.stringify({
          status: 'valid',
          reason: 'Email válido'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      // Si hay error en la verificación avanzada, retornar como 'risky'
      return new Response(
        JSON.stringify({
          status: 'risky',
          reason: 'No se pudo verificar completamente el email'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in verify-email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

