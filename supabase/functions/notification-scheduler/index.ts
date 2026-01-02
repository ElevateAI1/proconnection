
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROCONNECTION_API_URL = "https://api.proconnection.me/api";

interface ScheduledNotification {
  phoneNumber: string;
  message: string;
  delayMinutes: number;
  notificationType: string;
  recipientId: string;
}

interface BulkMessage {
  phoneNumber: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log(`🚀 Notification Scheduler - Action: ${action}`);

    switch (action) {
      case 'send_message':
        return await sendSingleMessage(supabaseClient, req);
      case 'send_bulk':
        return await sendBulkMessages(supabaseClient, req);
      case 'schedule_reminder':
        return await scheduleReminder(supabaseClient, req);
      case 'get_status':
        return await getProConnectionStatus(supabaseClient, req);
      case 'process_scheduled':
        return await processScheduledNotifications(supabaseClient, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('❌ Notification Scheduler Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendSingleMessage(supabaseClient: any, req: Request) {
  const { phoneNumber, message, notificationId, templateVariables } = await req.json();
  
  try {
    console.log(`📤 Sending single message to: ${phoneNumber}`);
    
    // Aplicar variables de template si existen
    let finalMessage = message;
    if (templateVariables) {
      finalMessage = applyTemplateVariables(message, templateVariables);
    }
    
    // Validar número de teléfono
    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(formattedNumber)) {
      throw new Error(`Número de teléfono inválido: ${phoneNumber}`);
    }
    
    // Enviar mensaje via ProConnection API
    const response = await fetch(`${PROCONNECTION_API_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedNumber,
        message: finalMessage
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      // Actualizar notificación si se proporciona ID
      if (notificationId) {
        await supabaseClient
          .from('system_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: { 
              ...templateVariables,
              phone_number: formattedNumber,
              message_id: result.messageId || `msg_${Date.now()}`
            }
          })
          .eq('id', notificationId);
      }
      
      console.log(`✅ Message sent successfully to ${formattedNumber}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.messageId || `msg_${Date.now()}`,
          phoneNumber: formattedNumber
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(result.message || 'Failed to send message');
    }
  } catch (error) {
    console.error(`❌ Error sending message to ${phoneNumber}:`, error);
    
    // Marcar notificación como fallida si se proporciona ID
    if (notificationId) {
      await supabaseClient
        .from('system_notifications')
        .update({ status: 'failed' })
        .eq('id', notificationId);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendBulkMessages(supabaseClient: any, req: Request) {
  const { messages }: { messages: BulkMessage[] } = await req.json();
  
  try {
    console.log(`📤 Sending bulk messages to ${messages.length} recipients`);
    
    // Validar y formatear números
    const validatedMessages = messages.map(msg => ({
      phoneNumber: formatPhoneNumber(msg.phoneNumber),
      message: msg.message
    })).filter(msg => isValidPhoneNumber(msg.phoneNumber));
    
    if (validatedMessages.length === 0) {
      throw new Error('No valid phone numbers provided');
    }
    
    // Enviar mensajes via ProConnection API
    const response = await fetch(`${PROCONNECTION_API_URL}/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: validatedMessages
      }),
    });

    const result = await response.json();
    
    console.log(`✅ Bulk messages sent: ${result.results?.length || 0} processed`);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error sending bulk messages:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function scheduleReminder(supabaseClient: any, req: Request) {
  const data: ScheduledNotification = await req.json();
  
  try {
    console.log(`⏰ Scheduling reminder for ${data.phoneNumber} in ${data.delayMinutes} minutes`);
    
    const formattedNumber = formatPhoneNumber(data.phoneNumber);
    if (!isValidPhoneNumber(formattedNumber)) {
      throw new Error(`Número de teléfono inválido: ${data.phoneNumber}`);
    }
    
    // Calcular fecha de envío
    const scheduledFor = new Date(Date.now() + data.delayMinutes * 60 * 1000);
    
    // Crear notificación programada en la base de datos
    const { data: notification, error } = await supabaseClient
      .from('system_notifications')
      .insert({
        recipient_id: data.recipientId,
        recipient_type: 'patient',
        notification_type: data.notificationType,
        title: 'Recordatorio Programado',
        message: data.message,
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
        delivery_method: 'whatsapp',
        metadata: {
          phone_number: formattedNumber,
          delay_minutes: data.delayMinutes,
          scheduled_via: 'api'
        }
      })
      .select()
      .single();

    if (error) throw error;
    
    // También enviar a ProConnection API para programación inmediata
    const response = await fetch(`${PROCONNECTION_API_URL}/schedule-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedNumber,
        message: data.message,
        delay: data.delayMinutes
      }),
    });

    const result = await response.json();
    
    console.log(`✅ Reminder scheduled successfully for ${formattedNumber}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        notificationId: notification.id,
        scheduledFor: scheduledFor.toISOString(),
        proConnectionResult: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error scheduling reminder:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getProConnectionStatus(supabaseClient: any, req: Request) {
  try {
    console.log('📊 Checking ProConnection API status');
    
    const response = await fetch(`${PROCONNECTION_API_URL}/status`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log(`✅ ProConnection API status: ${data.connected ? 'connected' : 'disconnected'}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          connected: data.connected,
          phoneNumber: data.phoneNumber,
          timestamp: data.timestamp || new Date().toISOString(),
          apiStatus: 'online'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('ProConnection API not responding');
    }
  } catch (error) {
    console.error('❌ Error checking ProConnection status:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        connected: false,
        apiStatus: 'offline',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function processScheduledNotifications(supabaseClient: any, req: Request) {
  try {
    console.log('🔄 Processing scheduled notifications');
    
    // Obtener notificaciones pendientes que deben enviarse ahora
    const { data: pendingNotifications, error } = await supabaseClient
      .from('system_notifications')
      .select('*')
      .eq('delivery_method', 'whatsapp')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(20);

    if (error) throw error;
    
    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('✅ No pending notifications to process');
      return new Response(
        JSON.stringify({ 
          success: true,
          processed: 0,
          message: 'No pending notifications'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`📤 Processing ${pendingNotifications.length} scheduled notifications`);
    
    let processed = 0;
    let failed = 0;
    
    for (const notification of pendingNotifications) {
      try {
        const metadata = notification.metadata as any;
        const phoneNumber = metadata?.phone_number;
        
        if (!phoneNumber) {
          console.error(`❌ No phone number for notification ${notification.id}`);
          failed++;
          continue;
        }
        
        // Enviar mensaje
        const response = await fetch(`${PROCONNECTION_API_URL}/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            message: notification.message
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Marcar como enviado
          await supabaseClient
            .from('system_notifications')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id);
          
          processed++;
          console.log(`✅ Processed notification ${notification.id}`);
        } else {
          throw new Error(result.message || 'Failed to send message');
        }
        
        // Pequeña pausa entre mensajes
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to process notification ${notification.id}:`, error);
        
        // Marcar como fallido
        await supabaseClient
          .from('system_notifications')
          .update({ status: 'failed' })
          .eq('id', notification.id);
        
        failed++;
      }
    }
    
    console.log(`🎯 Processing complete: ${processed} sent, ${failed} failed`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        processed,
        failed,
        total: pendingNotifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error processing scheduled notifications:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Utilidades
function applyTemplateVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  return result;
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+') && !cleaned.startsWith('54')) {
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    if (cleaned.length === 10 && !cleaned.startsWith('9')) {
      cleaned = '9' + cleaned;
    }
    
    cleaned = '+54' + cleaned;
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('+')) {
    const numberPart = cleaned.substring(2);
    if (numberPart.length === 10 && !numberPart.startsWith('9')) {
      cleaned = '+54' + '9' + numberPart;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^\+549\d{8,12}$/.test(formatted);
}
