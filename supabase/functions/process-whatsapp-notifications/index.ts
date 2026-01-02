
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROCONNECTION_API_URL = "https://api.proconnection.me/api";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Processing WhatsApp notifications (Enhanced)...')

    // Verificar conexión de WhatsApp primero
    let whatsappConnected = false;
    try {
      const statusResponse = await fetch(`${PROCONNECTION_API_URL}/status`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        whatsappConnected = statusData.connected;
        console.log(`📱 WhatsApp API status: ${whatsappConnected ? 'connected' : 'disconnected'}`);
      } else {
        console.log('⚠️ Could not check WhatsApp API status');
      }
    } catch (error) {
      console.error('❌ Error checking WhatsApp status:', error);
    }
    
    if (!whatsappConnected) {
      console.log('⚠️ WhatsApp not connected, processing email fallbacks...')
      
      // Procesar notificaciones que pueden usar email como fallback
      const { data: fallbackNotifications, error: fallbackError } = await supabaseClient
        .from('system_notifications')
        .select('*')
        .eq('delivery_method', 'whatsapp')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .limit(10);

      if (!fallbackError && fallbackNotifications?.length > 0) {
        console.log(`📧 Converting ${fallbackNotifications.length} WhatsApp notifications to email fallback`);
        
        for (const notification of fallbackNotifications) {
          try {
            // Actualizar a método email como fallback
            await supabaseClient
              .from('system_notifications')
              .update({ 
                delivery_method: 'email',
                metadata: {
                  ...notification.metadata,
                  original_method: 'whatsapp',
                  fallback_reason: 'whatsapp_disconnected'
                }
              })
              .eq('id', notification.id);
            
            console.log(`✅ Converted notification ${notification.id} to email fallback`);
          } catch (error) {
            console.error(`❌ Error converting notification ${notification.id}:`, error);
          }
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'WhatsApp not connected, notifications converted to email fallback',
          whatsapp_status: 'disconnected',
          fallback_processed: fallbackNotifications?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get pending notifications
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from('system_notifications')
      .select('*')
      .eq('delivery_method', 'whatsapp')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      throw fetchError
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('✅ No pending WhatsApp notifications')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending notifications',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get message templates
    const { data: configData } = await supabaseClient
      .from('whatsapp_config')
      .select('*')
      .eq('config_key', 'message_templates');
    
    const templates = configData?.[0]?.config_value || {
      appointment_reminder: "Estimado/a {{patient_name}}, le recordamos su cita para el {{date}} a las {{time}}.",
      payment_due: "Hola {{patient_name}}, tienes un pago pendiente de ${{amount}}.",
      document_ready: "Hola {{patient_name}}, tu documento {{document_name}} está listo.",
      payment_confirmed: "Hola {{patient_name}}, hemos confirmado tu pago de ${{amount}}.",
      appointment_confirmed: "Hola {{patient_name}}, tu cita para el {{date}} a las {{time}} ha sido confirmada."
    };

    console.log(`📤 Processing ${pendingNotifications.length} notifications`)

    let processed = 0
    let failed = 0

    // Process each notification with enhanced error handling
    for (const notification of pendingNotifications) {
      try {
        const phoneNumber = notification.metadata?.phone_number
        if (!phoneNumber) {
          console.error(`❌ No phone number for notification ${notification.id}`)
          
          // Marcar como fallida
          await supabaseClient
            .from('system_notifications')
            .update({ 
              status: 'failed',
              metadata: {
                ...notification.metadata,
                error_reason: 'no_phone_number'
              }
            })
            .eq('id', notification.id)
          
          failed++
          continue
        }

        let message = notification.message
        
        // Apply template if specified
        if (notification.metadata?.use_template && notification.metadata?.template_variables) {
          const templateKey = getTemplateKey(notification.notification_type)
          if (templates[templateKey]) {
            message = applyTemplate(templates[templateKey], notification.metadata.template_variables)
          }
        }

        // Validate phone number format
        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (!isValidPhoneNumber(formattedNumber)) {
          console.error(`❌ Invalid phone number for notification ${notification.id}: ${phoneNumber}`)
          
          await supabaseClient
            .from('system_notifications')
            .update({ 
              status: 'failed',
              metadata: {
                ...notification.metadata,
                error_reason: 'invalid_phone_number',
                original_phone: phoneNumber
              }
            })
            .eq('id', notification.id)
          
          failed++
          continue
        }

        // Send WhatsApp message using ProConnection API
        const sendResponse = await fetch(`${PROCONNECTION_API_URL}/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: formattedNumber,
            message: message
          }),
        });

        const sendResult = await sendResponse.json();

        if (sendResult.success) {
          // Mark as sent with enhanced metadata
          await supabaseClient
            .from('system_notifications')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString(),
              metadata: {
                ...notification.metadata,
                message_id: sendResult.messageId || `msg_${Date.now()}`,
                formatted_phone: formattedNumber,
                processing_time: new Date().toISOString()
              }
            })
            .eq('id', notification.id)
          
          console.log(`✅ Sent notification ${notification.id} to ${formattedNumber}`)
          processed++
        } else {
          console.error(`❌ Failed to send notification ${notification.id}:`, sendResult.message)
          
          // Mark as failed with error details
          await supabaseClient
            .from('system_notifications')
            .update({ 
              status: 'failed',
              metadata: {
                ...notification.metadata,
                error_reason: 'api_error',
                error_message: sendResult.message,
                retry_count: (notification.metadata?.retry_count || 0) + 1
              }
            })
            .eq('id', notification.id)
          
          failed++
        }

        // Rate limiting - wait between messages
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Error processing notification ${notification.id}:`, error)
        
        // Mark as failed with exception details
        await supabaseClient
          .from('system_notifications')
          .update({ 
            status: 'failed',
            metadata: {
              ...notification.metadata,
              error_reason: 'processing_exception',
              error_message: error.message,
              retry_count: (notification.metadata?.retry_count || 0) + 1
            }
          })
          .eq('id', notification.id)
        
        failed++
      }
    }

    console.log(`🎯 Processing complete: ${processed} sent, ${failed} failed`)

    // Log summary for monitoring
    if (processed > 0 || failed > 0) {
      console.log(`📊 Session summary: Total: ${pendingNotifications.length}, Success rate: ${((processed / pendingNotifications.length) * 100).toFixed(2)}%`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        failed,
        total: pendingNotifications.length,
        success_rate: pendingNotifications.length > 0 ? ((processed / pendingNotifications.length) * 100).toFixed(2) : 0,
        whatsapp_status: 'connected'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getTemplateKey(notificationType: string): string {
  const mapping: Record<string, string> = {
    'appointment_reminder': 'appointment_reminder',
    'payment_due': 'payment_due',
    'document_ready': 'document_ready',
    'payment_confirmed': 'payment_confirmed',
    'appointment_confirmed': 'appointment_confirmation'
  }
  return mapping[notificationType] || 'default'
}

function applyTemplate(template: string, variables: Record<string, any>): string {
  let result = template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, variables[key] || '')
  })
  return result
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
