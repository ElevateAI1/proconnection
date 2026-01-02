
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemNotification {
  id: number;
  notification_type: string;
  title?: string;
  message?: string;
  metadata?: any;
  priority?: string;
  status?: string;
  scheduled_for?: string;
  sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
  recipient_phone?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching notifications:', fetchError);
        setError('Error al cargar las notificaciones');
        return;
      }

      // Map database data to match our interface
      const mappedNotifications: SystemNotification[] = (data || []).map(notification => ({
        id: notification.id,
        notification_type: notification.notification_type,
        title: notification.title || '',
        message: notification.message || '',
        metadata: notification.metadata,
        priority: notification.priority,
        status: notification.status,
        scheduled_for: notification.scheduled_for,
        sent_at: notification.sent_at,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
        recipient_phone: notification.recipient_phone
      }));

      setNotifications(mappedNotifications);
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
      setError('Error inesperado al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read' }
            : notification
        )
      );
    } catch (err) {
      console.error('Error in markAsRead:', err);
    }
  };

  const createNotification = async (notification: Omit<SystemNotification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .insert({
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata,
          priority: notification.priority,
          status: notification.status,
          scheduled_for: notification.scheduled_for,
          recipient_phone: notification.recipient_phone
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      // Map the response and add to local state
      const newNotification: SystemNotification = {
        id: data.id,
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        priority: data.priority,
        status: data.status,
        scheduled_for: data.scheduled_for,
        sent_at: data.sent_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        recipient_phone: data.recipient_phone
      };

      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (err) {
      console.error('Error in createNotification:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    createNotification,
    refetch: fetchNotifications
  };
};
