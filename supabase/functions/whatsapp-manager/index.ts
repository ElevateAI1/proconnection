
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, getRateLimitIdentifier, createRateLimitResponse } from '../_shared/rate-limiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: 20 requests per minute
const RATE_LIMIT_CONFIG = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
}

const PROCONNECTION_API_URL = "https://api.proconnection.me/api";

interface WhatsAppMessage {
  to: string;
  message: string;
  type?: string;
  notificationId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Check rate limit (skip for status/health checks)
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const isStatusCheck = action === 'status' || action === 'health';
  
  if (!isStatusCheck) {
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await checkRateLimit(identifier, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.allowed) {
      const response = createRateLimitResponse(rateLimitResult);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log(`🔄 WhatsApp Manager - Action: ${action}`);

    switch (action) {
      case 'initialize':
      case 'status':
        return await getStatus(supabaseClient, req);
      case 'send':
        return await sendMessage(supabaseClient, req);
      case 'disconnect':
        return await disconnectSession(supabaseClient, req);
      case 'get_messages':
        return await getMessages(supabaseClient, req);
      case 'get_config':
        return await getConfig(supabaseClient, req);
      case 'update_config':
        return await updateConfig(supabaseClient, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('❌ WhatsApp Manager Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getStatus(supabaseClient: any, req: Request) {
  try {
    console.log('🔄 Checking ProConnection API status...');
    
    // Check ProConnection API status with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${PROCONNECTION_API_URL}/status`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ProConnection API response:', data);
      
      const status = {
        connected: data.connected || data.status === 'connected',
        phoneNumber: data.phoneNumber || data.phone_number,
        timestamp: new Date().toISOString()
      };
      
      // Update session in database if connected
      if (status.connected) {
        await supabaseClient.rpc('update_whatsapp_session_status', {
          session_id_param: 'default',
          new_status: 'connected',
          phone_number_param: status.phoneNumber || null
        });
      }
      
      return new Response(
        JSON.stringify(status),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error(`❌ ProConnection API returned status ${response.status}`);
      
      // Update session as disconnected
      await supabaseClient.rpc('update_whatsapp_session_status', {
        session_id_param: 'default',
        new_status: 'disconnected'
      });
      
      return new Response(
        JSON.stringify({ 
          connected: false,
          timestamp: new Date().toISOString(),
          error: `API returned status ${response.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('❌ Error checking status:', error);
    
    // Update session as error
    await supabaseClient.rpc('update_whatsapp_session_status', {
      session_id_param: 'default',
      new_status: 'error'
    });
    
    return new Response(
      JSON.stringify({ 
        connected: false,
        timestamp: new Date().toISOString(),
        error: error.message || 'Connection timeout or network error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendMessage(supabaseClient: any, req: Request) {
  const { to, message, notificationId }: WhatsAppMessage & { sessionId?: string } = await req.json();
  
  try {
    console.log(`📤 Sending message to ${to}: ${message}`);
    
    // Send message through ProConnection API
    const response = await fetch(`${PROCONNECTION_API_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: to,
        message: message
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      // Get session info for logging
      const { data: session } = await supabaseClient
        .from('whatsapp_sessions')
        .select('*')
        .eq('session_id', 'default')
        .single();

      // Log the message
      if (session) {
        await supabaseClient.rpc('log_whatsapp_message', {
          session_id_param: session.id,
          from_number_param: session.phone_number || 'system',
          to_number_param: to,
          message_body_param: message,
          direction_param: 'outgoing',
          whatsapp_message_id_param: result.messageId || `msg_${Date.now()}`,
          notification_id_param: notificationId || null
        });
      }

      // Update notification status if provided
      if (notificationId) {
        await supabaseClient
          .from('system_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notificationId);
      }

      console.log(`✅ Message sent successfully to ${to}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.messageId || `msg_${Date.now()}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error(`❌ Failed to send message to ${to}:`, result.message);
      
      // Update notification as failed if provided
      if (notificationId) {
        await supabaseClient
          .from('system_notifications')
          .update({ status: 'failed' })
          .eq('id', notificationId);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.message || 'Failed to send message'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    
    // Update notification as failed if provided
    if (notificationId) {
      await supabaseClient
        .from('system_notifications')
        .update({ status: 'failed' })
        .eq('id', notificationId);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function disconnectSession(supabaseClient: any, req: Request) {
  const { sessionId = 'default' } = await req.json();
  
  try {
    console.log(`📴 Disconnecting WhatsApp session: ${sessionId}`);
    
    // Update status in database
    await supabaseClient.rpc('update_whatsapp_session_status', {
      session_id_param: sessionId,
      new_status: 'disconnected',
      qr_code_param: null,
      phone_number_param: null
    });
    
    console.log(`✅ WhatsApp session ${sessionId} disconnected successfully`);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Failed to disconnect:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getMessages(supabaseClient: any, req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  const { data, error } = await supabaseClient
    .from('whatsapp_messages')
    .select(`
      *,
      whatsapp_sessions(phone_number, status)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ messages: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getConfig(supabaseClient: any, req: Request) {
  const { data, error } = await supabaseClient
    .from('whatsapp_config')
    .select('*');
  
  if (error) throw error;
  
  const config = data.reduce((acc: any, item: any) => {
    acc[item.config_key] = item.config_value;
    return acc;
  }, {});
  
  // Add default settings if not present
  if (!config.settings) {
    config.settings = {
      auto_reply_enabled: false,
      business_hours_enabled: false
    };
  }
  
  if (!config.message_templates) {
    config.message_templates = {
      appointment_reminder: "Hola {{patient_name}}, te recordamos tu cita para el {{date}} a las {{time}}.",
      payment_reminder: "Hola {{patient_name}}, tienes un pago pendiente de ${{amount}}.",
      document_ready: "Hola {{patient_name}}, tu documento {{document_name}} está listo.",
      payment_confirmed: "Hola {{patient_name}}, hemos confirmado tu pago de ${{amount}}.",
      appointment_confirmation: "Hola {{patient_name}}, tu cita para el {{date}} a las {{time}} ha sido confirmada."
    };
  }
  
  return new Response(
    JSON.stringify(config),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateConfig(supabaseClient: any, req: Request) {
  const { config_key, config_value } = await req.json();
  
  const { error } = await supabaseClient
    .from('whatsapp_config')
    .upsert({
      config_key,
      config_value,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
