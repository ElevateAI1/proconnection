
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { scheduleAppointmentReminder } from '@/utils/notificationHelpers';

interface ReminderSetting {
  id: string;
  psychologist_id: string;
  reminder_type: string;
  enabled: boolean;
  hours_before: number;
  delivery_methods: string[];
  custom_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useReminderSettings = () => {
  const { psychologist } = useProfile();
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useReminderSettings - psychologist:', psychologist?.id);

  const fetchSettings = useCallback(async () => {
    if (!psychologist?.id) {
      console.log('useReminderSettings - No psychologist ID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useReminderSettings - Fetching settings for psychologist:', psychologist.id);

      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (error) {
        console.error('useReminderSettings - Error fetching settings:', error);
        throw error;
      }

      console.log('useReminderSettings - Fetched settings:', data?.length || 0);
      setSettings(data || []);
    } catch (error) {
      console.error('useReminderSettings - Error in fetchSettings:', error);
      setError('No se pudieron cargar las configuraciones');
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [psychologist?.id]);

  const updateSetting = useCallback(async (reminderType: string, updates: Partial<ReminderSetting>) => {
    if (!psychologist?.id) {
      console.log('useReminderSettings - No psychologist ID for updating setting');
      return;
    }

    try {
      console.log('useReminderSettings - Updating setting:', reminderType, updates);

      // Validar WhatsApp delivery method availability
      if (updates.delivery_methods?.includes('whatsapp')) {
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke('notification-scheduler', {
            body: { action: 'get_status' }
          });
          
          if (statusError || !statusData?.connected) {
            toast({
              title: "⚠️ WhatsApp No Disponible",
              description: "WhatsApp no está conectado. La configuración se guardará pero los mensajes no se enviarán hasta que WhatsApp esté conectado.",
              variant: "destructive"
            });
          }
        } catch (whatsappError) {
          console.warn('Could not check WhatsApp status:', whatsappError);
          toast({
            title: "⚠️ No se pudo verificar WhatsApp",
            description: "La configuración se guardará pero se recomienda verificar la conexión de WhatsApp.",
          });
        }
      }

      // Check if setting already exists
      const existingSetting = settings.find(s => s.reminder_type === reminderType);
      
      if (existingSetting) {
        // Update existing setting
        const { data, error } = await supabase
          .from('reminder_settings')
          .update(updates)
          .eq('id', existingSetting.id)
          .select()
          .single();

        if (error) {
          console.error('useReminderSettings - Error updating existing setting:', error);
          throw error;
        }
        
        setSettings(prev => prev.map(s => s.id === existingSetting.id ? data : s));
        
        console.log('useReminderSettings - Existing setting updated successfully:', data.id);
      } else {
        // Create new setting
        const { data, error } = await supabase
          .from('reminder_settings')
          .insert({
            psychologist_id: psychologist.id,
            reminder_type: reminderType,
            ...updates
          })
          .select()
          .single();

        if (error) {
          console.error('useReminderSettings - Error creating new setting:', error);
          throw error;
        }
        
        setSettings(prev => [...prev, data]);
        
        console.log('useReminderSettings - New setting created successfully:', data.id);
      }

      toast({
        title: "✅ Configuración actualizada",
        description: "Los recordatorios se han configurado correctamente"
      });
    } catch (error) {
      console.error('useReminderSettings - Error updating reminder setting:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  }, [psychologist?.id, settings]);

  const getSetting = useCallback((reminderType: string) => {
    return settings.find(s => s.reminder_type === reminderType);
  }, [settings]);

  const createDefaultSettings = useCallback(async () => {
    if (!psychologist?.id) return;

    console.log('useReminderSettings - Creating default settings for psychologist:', psychologist.id);

    const defaultSettings = [
      {
        psychologist_id: psychologist.id,
        reminder_type: 'appointment',
        enabled: true,
        hours_before: 24,
        delivery_methods: ['email', 'whatsapp'],
        custom_message: 'Estimado/a {{patient_name}}, le recordamos su cita programada para el {{date}} a las {{time}}. Por favor confirme su asistencia.'
      },
      {
        psychologist_id: psychologist.id,
        reminder_type: 'payment',
        enabled: true,
        hours_before: 48,
        delivery_methods: ['email', 'whatsapp'],
        custom_message: 'Hola {{patient_name}}, te recordamos que tienes un pago pendiente de ${{amount}} por la sesión del {{date}}.'
      },
      {
        psychologist_id: psychologist.id,
        reminder_type: 'document',
        enabled: true,
        hours_before: 12,
        delivery_methods: ['email', 'whatsapp'],
        custom_message: 'Estimado/a {{patient_name}}, su {{document_name}} está listo y disponible para revisión.'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .upsert(defaultSettings)
        .select();

      if (error) throw error;

      setSettings(data || []);
      
      toast({
        title: "✅ Configuraciones creadas",
        description: "Se han creado las configuraciones por defecto con mensajes predeterminados que incluyen WhatsApp"
      });

      console.log('useReminderSettings - Default settings created successfully');
    } catch (error) {
      console.error('useReminderSettings - Error creating default settings:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron crear las configuraciones por defecto",
        variant: "destructive"
      });
    }
  }, [psychologist?.id]);

  // Función mejorada para crear notificación programada con número de teléfono
  const createScheduledNotification = useCallback(async (
    recipientId: string,
    notificationType: string,
    templateVariables: Record<string, any>,
    deliveryMethod: string = 'whatsapp'
  ) => {
    const setting = getSetting(notificationType);
    if (!setting || !setting.enabled) {
      console.log(`Reminder setting for ${notificationType} is disabled or not found`);
      return;
    }

    try {
      // Calcular fecha de envío
      const scheduledFor = new Date(Date.now() + setting.hours_before * 60 * 60 * 1000);
      
      // Aplicar variables al mensaje personalizado
      let message = setting.custom_message || '';
      Object.keys(templateVariables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, templateVariables[key] || '');
      });

      // Incluir número de teléfono en metadata para WhatsApp
      const metadata = {
        ...templateVariables,
        hours_before: setting.hours_before,
        auto_generated: true,
        ...(templateVariables.phone_number && { phone_number: templateVariables.phone_number })
      };

      // Crear notificación en la base de datos
      const { data, error } = await supabase
        .from('system_notifications')
        .insert({
          recipient_id: recipientId,
          recipient_type: 'patient',
          notification_type: notificationType,
          title: `Recordatorio: ${notificationType}`,
          message: message,
          status: 'pending',
          scheduled_for: scheduledFor.toISOString(),
          delivery_method: deliveryMethod,
          metadata: metadata
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`Scheduled notification created: ${data.id} with phone: ${templateVariables.phone_number}`);
      return data;
    } catch (error) {
      console.error('Error creating scheduled notification:', error);
      throw error;
    }
  }, [getSetting]);

  // Función específica para recordatorios de citas con WhatsApp
  const createAppointmentReminderWithPhone = useCallback(async (
    appointmentId: string,
    patientId: string,
    patientName: string,
    patientPhone: string,
    appointmentDate: Date
  ) => {
    if (!patientPhone) {
      console.warn('No phone number provided for appointment reminder');
      return;
    }

    try {
      await scheduleAppointmentReminder(
        appointmentId,
        patientId,
        psychologist?.id || '',
        appointmentDate.toISOString(),
        patientName,
        patientPhone,
        24 // 24 hours before
      );
      
      console.log('WhatsApp appointment reminder created successfully');
    } catch (error) {
      console.error('Error creating WhatsApp appointment reminder:', error);
    }
  }, [psychologist, scheduleAppointmentReminder]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    fetchSettings,
    createDefaultSettings,
    createScheduledNotification,
    createAppointmentReminderWithPhone
  };
};
