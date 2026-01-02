
import { supabase } from '@/integrations/supabase/client';

export interface AppointmentReminderData {
  id: string;
  appointment_date: string;
  patient_id: string;
  psychologist_id: string;
  patient_name: string;
  phone_number?: string;
}

export interface ReminderStats {
  totalScheduled: number;
  pending: number;
  sent: number;
  failed: number;
  overdueCount: number;
}

export const getReminderStats = async (psychologistId: string): Promise<ReminderStats> => {
  try {
    const { data: notifications, error } = await supabase
      .from('system_notifications')
      .select('*')
      .eq('notification_type', 'appointment_reminder')
      .eq('metadata->>psychologist_id', psychologistId);

    if (error) {
      console.error('Error fetching reminder stats:', error);
      return {
        totalScheduled: 0,
        pending: 0,
        sent: 0,
        failed: 0,
        overdueCount: 0
      };
    }

    const now = new Date();
    const totalScheduled = notifications?.length || 0;
    const pending = notifications?.filter(n => n.status === 'pending').length || 0;
    const sent = notifications?.filter(n => n.status === 'sent').length || 0;
    const failed = notifications?.filter(n => n.status === 'failed').length || 0;
    const overdueCount = notifications?.filter(n => 
      n.status === 'pending' && new Date(n.scheduled_for) < now
    ).length || 0;

    return {
      totalScheduled,
      pending,
      sent,
      failed,
      overdueCount
    };
  } catch (error) {
    console.error('Error in getReminderStats:', error);
    return {
      totalScheduled: 0,
      pending: 0,
      sent: 0,
      failed: 0,
      overdueCount: 0
    };
  }
};

export const getPendingReminders = async (psychologistId: string) => {
  try {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('*')
      .eq('notification_type', 'appointment_reminder')
      .eq('status', 'pending')
      .eq('metadata->>psychologist_id', psychologistId)
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Error fetching pending reminders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPendingReminders:', error);
    return [];
  }
};

export const getOverdueReminders = async (psychologistId: string) => {
  const now = new Date().toISOString();
  
  try {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('*')
      .eq('notification_type', 'appointment_reminder')
      .eq('status', 'pending')
      .eq('metadata->>psychologist_id', psychologistId)
      .lt('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Error fetching overdue reminders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOverdueReminders:', error);
    return [];
  }
};

export const rescheduleReminder = async (notificationId: string, newScheduledTime: string) => {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .update({ 
        scheduled_for: newScheduledTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(notificationId));

    if (error) {
      console.error('Error rescheduling reminder:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in rescheduleReminder:', error);
    return false;
  }
};

export const sendReminderNow = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .update({ 
        scheduled_for: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(notificationId));

    if (error) {
      console.error('Error sending reminder now:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendReminderNow:', error);
    return false;
  }
};

export const cancelReminder = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(notificationId));

    if (error) {
      console.error('Error cancelling reminder:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelReminder:', error);
    return false;
  }
};
