
import { supabase } from '@/integrations/supabase/client';
import { formatDateArgentina, formatTimeArgentina, dateFormatOptions } from './dateFormatting';

export interface CreateNotificationPayload {
  recipient_id: string;
  recipient_type: 'patient' | 'psychologist';
  notification_type: string;
  title: string;
  message: string;
  metadata?: any;
  priority?: 'low' | 'normal' | 'high';
  scheduled_for?: string;
  recipient_phone?: string;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  type: string;
}

export const NOTIFICATION_TEMPLATES = {
  APPOINTMENT_REMINDER: {
    title: 'Recordatorio de Cita',
    message: 'Estimado/a {patient_name}, le recordamos su cita programada para el {date} a las {time}.',
    type: 'appointment_reminder'
  },
  APPOINTMENT_CONFIRMATION: {
    title: 'Confirmación de Cita',
    message: 'Su cita ha sido confirmada para el {date} a las {time}.',
    type: 'appointment_confirmation'
  },
  DOCUMENT_READY: {
    title: 'Documento Listo',
    message: 'Su documento "{document_name}" está listo para revisar.',
    type: 'document_ready'
  },
  PAYMENT_REMINDER: {
    title: 'Recordatorio de Pago',
    message: 'Recordatorio: Tiene un pago pendiente por ${amount}.',
    type: 'payment_reminder'
  }
};

export const createNotification = async (payload: CreateNotificationPayload) => {
  try {
    // Since the actual table doesn't have recipient_id/recipient_type, 
    // we'll store them in metadata for now
    const notificationData = {
      notification_type: payload.notification_type,
      title: payload.title,
      message: payload.message,
      metadata: {
        ...payload.metadata,
        recipient_id: payload.recipient_id,
        recipient_type: payload.recipient_type
      },
      priority: payload.priority || 'normal',
      status: 'pending',
      scheduled_for: payload.scheduled_for || new Date().toISOString(),
      recipient_phone: payload.recipient_phone
    };

    const { data, error } = await supabase
      .from('system_notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
};

export const scheduleAppointmentReminder = async (
  appointmentId: string,
  patientId: string,
  psychologistId: string,
  appointmentDate: string,
  patientName: string,
  patientPhone?: string,
  hoursBeforeReminder: number = 24
) => {
  const reminderTime = new Date(appointmentDate);
  reminderTime.setHours(reminderTime.getHours() - hoursBeforeReminder);

  const template = NOTIFICATION_TEMPLATES.APPOINTMENT_REMINDER;
  const message = template.message
    .replace('{patient_name}', patientName)
    .replace('{date}', formatDateArgentina(new Date(appointmentDate), dateFormatOptions.full))
    .replace('{time}', formatTimeArgentina(new Date(appointmentDate), { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));

  const metadata = {
    appointment_id: appointmentId,
    appointment_date: appointmentDate,
    psychologist_id: psychologistId,
    patient_name: patientName,
    hours_before: hoursBeforeReminder,
    phone_number: patientPhone
  };

  return await createNotification({
    recipient_id: patientId,
    recipient_type: 'patient',
    notification_type: template.type,
    title: template.title,
    message,
    metadata,
    priority: 'normal',
    scheduled_for: reminderTime.toISOString(),
    recipient_phone: patientPhone
  });
};

export const getNotificationsByRecipient = async (recipientId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('*')
      .contains('metadata', { recipient_id: recipientId })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNotificationsByRecipient:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .update({ 
        status: 'read',
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(notificationId));

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .delete()
      .eq('id', parseInt(notificationId));

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return false;
  }
};

export const bulkCreateNotifications = async (notifications: CreateNotificationPayload[]) => {
  try {
    const notificationData = notifications.map(payload => ({
      notification_type: payload.notification_type,
      title: payload.title,
      message: payload.message,
      metadata: {
        ...payload.metadata,
        recipient_id: payload.recipient_id,
        recipient_type: payload.recipient_type
      },
      priority: payload.priority || 'normal',
      status: 'pending',
      scheduled_for: payload.scheduled_for || new Date().toISOString(),
      recipient_phone: payload.recipient_phone
    }));

    const { data, error } = await supabase
      .from('system_notifications')
      .insert(notificationData)
      .select();

    if (error) {
      console.error('Error bulk creating notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in bulkCreateNotifications:', error);
    return [];
  }
};

export const getNotificationStats = async (recipientId: string) => {
  try {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('status, notification_type')
      .contains('metadata', { recipient_id: recipientId });

    if (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total: 0,
        unread: 0,
        pending: 0,
        sent: 0,
        failed: 0
      };
    }

    const total = data?.length || 0;
    const unread = data?.filter(n => n.status === 'pending').length || 0;
    const pending = data?.filter(n => n.status === 'pending').length || 0;
    const sent = data?.filter(n => n.status === 'sent').length || 0;
    const failed = data?.filter(n => n.status === 'failed').length || 0;

    return {
      total,
      unread,
      pending,
      sent,
      failed
    };
  } catch (error) {
    console.error('Error in getNotificationStats:', error);
    return {
      total: 0,
      unread: 0,
      pending: 0,
      sent: 0,
      failed: 0
    };
  }
};

export const formatNotificationMessage = (template: string, variables: Record<string, string>) => {
  let message = template;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return message;
};

// Phone validation functions
export const formatArgentinePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (digits.startsWith('549')) {
    // Full international format
    const areaCode = digits.substring(3, 5);
    const number = digits.substring(5);
    return `+54 9 ${areaCode} ${number.substring(0, 4)}-${number.substring(4)}`;
  } else if (digits.startsWith('54')) {
    // Without 9
    const areaCode = digits.substring(2, 4);
    const number = digits.substring(4);
    return `+54 ${areaCode} ${number.substring(0, 4)}-${number.substring(4)}`;
  } else if (digits.length === 10 && digits.startsWith('9')) {
    // With 9 but without country code
    const areaCode = digits.substring(1, 3);
    const number = digits.substring(3);
    return `+54 9 ${areaCode} ${number.substring(0, 4)}-${number.substring(4)}`;
  } else if (digits.length === 10) {
    // Local format
    const areaCode = digits.substring(0, 2);
    const number = digits.substring(2);
    return `+54 9 ${areaCode} ${number.substring(0, 4)}-${number.substring(4)}`;
  } else if (digits.length === 8) {
    // Buenos Aires number
    return `+54 9 11 ${digits.substring(0, 4)}-${digits.substring(4)}`;
  }
  
  return phone;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  const digits = phone.replace(/\D/g, '');
  
  // Valid Argentine phone formats
  return (
    (digits.startsWith('549') && digits.length === 13) || // +54 9 XX XXXX-XXXX
    (digits.startsWith('54') && digits.length === 12) ||  // +54 XX XXXX-XXXX  
    (digits.length === 10 && digits.startsWith('9')) ||   // 9 XX XXXX-XXXX
    (digits.length === 10) ||                             // XX XXXX-XXXX
    (digits.length === 8)                                 // XXXX-XXXX (Buenos Aires)
  );
};

export const validateNotificationPayload = (payload: CreateNotificationPayload): string[] => {
  const errors: string[] = [];

  if (!payload.recipient_id) {
    errors.push('recipient_id es requerido');
  }

  if (!payload.recipient_type || !['patient', 'psychologist'].includes(payload.recipient_type)) {
    errors.push('recipient_type debe ser "patient" o "psychologist"');
  }

  if (!payload.notification_type) {
    errors.push('notification_type es requerido');
  }

  if (!payload.title || payload.title.trim().length === 0) {
    errors.push('title es requerido');
  }

  if (!payload.message || payload.message.trim().length === 0) {
    errors.push('message es requerido');
  }

  if (payload.priority && !['low', 'normal', 'high'].includes(payload.priority)) {
    errors.push('priority debe ser "low", "normal" o "high"');
  }

  return errors;
};
