
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationRequest {
  phoneNumber: string;
  message: string;
  notificationType: string;
  recipientId: string;
  templateVariables?: Record<string, any>;
  delayMinutes?: number;
}

interface BulkNotificationRequest {
  messages: Array<{
    phoneNumber: string;
    message: string;
  }>;
}

const PROCONNECTION_API_URL = "https://api.proconnection.me/api";

export const useAdvancedNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    phoneNumber?: string;
    timestamp?: string;
  } | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Checking WhatsApp connection...');
      
      // Check directly with ProConnection API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`${PROCONNECTION_API_URL}/status`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ProConnection API status:', data);
        
        const status = {
          connected: data.connected || data.status === 'connected',
          phoneNumber: data.phoneNumber || data.phone_number,
          timestamp: new Date().toISOString()
        };
        
        setConnectionStatus(status);
        
        if (status.connected) {
          toast({
            title: "✅ WhatsApp Conectado",
            description: `Estado verificado - ${status.phoneNumber || 'API conectada'}`,
          });
        }
        
        return status;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      const errorStatus = { connected: false, timestamp: new Date().toISOString() };
      setConnectionStatus(errorStatus);
      
      toast({
        title: "❌ Error de Conexión",
        description: error.name === 'AbortError' 
          ? "Timeout al verificar WhatsApp - revisa tu conexión"
          : "No se pudo verificar el estado de WhatsApp",
        variant: "destructive"
      });
      
      return errorStatus;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (request: NotificationRequest) => {
    try {
      setLoading(true);
      console.log(`📤 Sending WhatsApp message to ${request.phoneNumber}`);
      
      const response = await fetch(`${PROCONNECTION_API_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: request.phoneNumber,
          message: request.message
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Mensaje Enviado",
          description: `Mensaje enviado exitosamente a ${request.phoneNumber}`,
        });
        return data;
      } else {
        throw new Error(data.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "❌ Error al Enviar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendBulkMessages = useCallback(async (request: BulkNotificationRequest) => {
    try {
      setLoading(true);
      console.log(`📤 Sending ${request.messages.length} bulk WhatsApp messages`);
      
      const response = await fetch(`${PROCONNECTION_API_URL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages
        }),
      });

      const data = await response.json();

      if (data.success) {
        const successCount = data.results?.filter((r: any) => r.success).length || 0;
        const totalCount = request.messages.length;

        toast({
          title: "📤 Envío Masivo Completado",
          description: `${successCount}/${totalCount} mensajes enviados exitosamente`,
        });

        return data;
      } else {
        throw new Error(data.message || 'Error en envío masivo');
      }
    } catch (error) {
      console.error('❌ Error sending bulk messages:', error);
      toast({
        title: "❌ Error en Envío Masivo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReminder = useCallback(async (request: NotificationRequest) => {
    if (!request.delayMinutes) {
      throw new Error('delayMinutes is required for scheduling');
    }

    try {
      setLoading(true);
      console.log(`⏰ Scheduling reminder for ${request.delayMinutes} minutes`);
      
      const response = await fetch(`${PROCONNECTION_API_URL}/schedule-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: request.phoneNumber,
          message: request.message,
          delay: request.delayMinutes
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "⏰ Recordatorio Programado",
          description: `Recordatorio programado para ${request.delayMinutes} minutos`,
        });
        return data;
      } else {
        throw new Error(data.message || 'Error al programar recordatorio');
      }
    } catch (error) {
      console.error('❌ Error scheduling reminder:', error);
      toast({
        title: "❌ Error al Programar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const processScheduledNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Processing scheduled notifications via Supabase function...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-whatsapp-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🔄 Notificaciones Procesadas",
          description: `${data.processed} notificaciones enviadas, ${data.failed || 0} fallidas`,
        });
      } else {
        throw new Error(data.message || 'Error en procesamiento');
      }

      return data;
    } catch (error) {
      console.error('❌ Error processing scheduled notifications:', error);
      toast({
        title: "❌ Error en Procesamiento",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear notificación rápida con template
  const createQuickNotification = useCallback(async (
    patientId: string,
    patientName: string,
    patientPhone: string,
    notificationType: 'appointment_reminder' | 'payment_due' | 'document_ready' | 'followup' | 'welcome',
    templateVariables: Record<string, any> = {},
    delayMinutes: number = 0
  ) => {
    const baseTemplates = {
      appointment_reminder: 'Hola {{patient_name}}, te recordamos tu cita para el {{date}} a las {{time}}.',
      payment_due: 'Hola {{patient_name}}, tienes un pago pendiente de ${{amount}}.',
      document_ready: 'Hola {{patient_name}}, tu {{document_name}} está listo para revisión.',
      followup: 'Hola {{patient_name}}, ¿cómo te has sentido después de nuestra sesión?',
      welcome: '¡Bienvenido/a {{patient_name}}! Estamos aquí para acompañarte en tu proceso.'
    };

    let message = baseTemplates[notificationType];
    const variables = {
      patient_name: patientName,
      ...templateVariables
    };

    // Apply template variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, variables[key] || '');
    });

    const request: NotificationRequest = {
      phoneNumber: patientPhone,
      message,
      notificationType,
      recipientId: patientId,
      templateVariables: variables,
      delayMinutes
    };

    if (delayMinutes > 0) {
      return await scheduleReminder(request);
    } else {
      return await sendMessage(request);
    }
  }, [sendMessage, scheduleReminder]);

  return {
    loading,
    connectionStatus,
    checkConnection,
    sendMessage,
    sendBulkMessages,
    scheduleReminder,
    processScheduledNotifications,
    createQuickNotification
  };
};
