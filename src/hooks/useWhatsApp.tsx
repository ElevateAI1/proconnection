
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatArgentinePhoneNumber, isValidPhoneNumber } from '@/utils/notificationHelpers';

interface WhatsAppStatus {
  connected: boolean;
  timestamp: string;
  qr?: string;
  phoneNumber?: string;
}

interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  timestamp: string;
  direction: 'outgoing';
  status: 'sent' | 'failed';
}

const PROCONNECTION_API_URL = "https://api.proconnection.me/api";

export const useWhatsApp = () => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  const checkStatus = async () => {
    try {
      console.log('🔄 Checking WhatsApp status via ProConnection API...');
      
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
        console.log('✅ WhatsApp status response:', data);
        
        const statusData = {
          connected: data.connected || data.status === 'connected',
          timestamp: new Date().toISOString(),
          phoneNumber: data.phoneNumber || data.phone_number
        };
        
        setStatus(statusData);
        setConnected(statusData.connected);
        return statusData;
      } else {
        const errorStatus = { connected: false, timestamp: new Date().toISOString() };
        setStatus(errorStatus);
        setConnected(false);
        return errorStatus;
      }
    } catch (error) {
      console.error('❌ Error checking WhatsApp status:', error);
      const errorStatus = { connected: false, timestamp: new Date().toISOString() };
      setStatus(errorStatus);
      setConnected(false);
      return errorStatus;
    }
  };

  const sendMessage = async (to: string, message: string, notificationId?: string) => {
    try {
      // Formatear número de teléfono argentino
      const formattedNumber = formatArgentinePhoneNumber(to);
      
      if (!isValidPhoneNumber(to)) {
        toast({
          title: "⚠️ Número inválido",
          description: `El número ${to} no parece ser válido para Argentina`,
          variant: "destructive",
        });
      }

      console.log(`📤 Sending message to: ${to} -> formatted: ${formattedNumber}`);

      const response = await fetch(`${PROCONNECTION_API_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          message,
          notificationId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Agregar mensaje a la lista local
        const newMessage: WhatsAppMessage = {
          phoneNumber: formattedNumber,
          message,
          timestamp: new Date().toISOString(),
          direction: 'outgoing',
          status: 'sent'
        };
        setMessages(prev => [newMessage, ...prev]);
        
        toast({
          title: "📤 Mensaje Enviado",
          description: `Mensaje enviado a ${formattedNumber}`,
        });
        return result;
      } else {
        throw new Error(result.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al enviar mensaje",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendBulkMessages = async (messageList: Array<{ phoneNumber: string; message: string }>) => {
    try {
      console.log(`📤 Sending ${messageList.length} bulk messages via ProConnection API`);
      
      // Formatear todos los números de teléfono
      const formattedMessages = messageList.map(msg => ({
        phoneNumber: formatArgentinePhoneNumber(msg.phoneNumber),
        message: msg.message
      }));

      const response = await fetch(`${PROCONNECTION_API_URL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const successCount = result.results?.filter((r: any) => r.success).length || 0;
        const failCount = result.results?.length - successCount || 0;
        
        toast({
          title: "📤 Envío Masivo Completado",
          description: `${successCount} mensajes enviados${failCount > 0 ? `, ${failCount} fallaron` : ''}`,
        });
        
        return { results: result.results };
      } else {
        throw new Error(result.message || 'Error en envío masivo');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error en envío masivo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const scheduleReminder = async (phoneNumber: string, message: string, delayMinutes: number) => {
    try {
      const formattedNumber = formatArgentinePhoneNumber(phoneNumber);
      console.log(`⏰ Scheduling reminder for ${delayMinutes} minutes to ${formattedNumber}`);
      
      const response = await fetch(`${PROCONNECTION_API_URL}/schedule-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          message,
          delay: delayMinutes
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "⏰ Recordatorio Programado",
          description: `Recordatorio programado para ${delayMinutes} minutos a ${formattedNumber}`,
        });
        return result;
      } else {
        throw new Error(result.message || 'Error al programar recordatorio');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al programar recordatorio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const initialize = async () => {
    setLoading(true);
    try {
      const statusResult = await checkStatus();
      
      if (statusResult.connected) {
        toast({
          title: "✅ WhatsApp Conectado",
          description: "WhatsApp está listo para enviar mensajes",
        });
      } else {
        toast({
          title: "⚠️ WhatsApp Desconectado",
          description: "WhatsApp no está conectado",
          variant: "destructive",
        });
      }
      
      return statusResult;
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo verificar el estado de WhatsApp",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    await checkStatus();
    toast({
      title: "📴 Estado Verificado",
      description: "Estado de WhatsApp actualizado",
    });
  };

  const loadSession = async () => {
    return await checkStatus();
  };

  const loadMessages = async () => {
    return messages;
  };

  const processNotifications = async () => {
    try {
      console.log('🔄 Processing notifications via Supabase function...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-whatsapp-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Procesamiento Completo",
          description: `Se procesaron ${result.processed} notificaciones`
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.message || "Error al procesar notificaciones",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error processing notifications:', error);
      toast({
        title: "❌ Error",
        description: "Error al procesar notificaciones",
        variant: "destructive",
      });
      return { processed: 0 };
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    status,
    messages,
    loading,
    connected,
    initialize,
    disconnect,
    sendMessage,
    sendBulkMessages,
    scheduleReminder,
    loadSession,
    loadMessages,
    processNotifications,
    checkStatus
  };
};
