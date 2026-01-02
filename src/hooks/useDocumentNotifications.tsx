
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel';
import { toast } from '@/hooks/use-toast';

interface DocumentNotification {
  id: string;
  document_id: string;
  recipient_id: string;
  recipient_type: 'psychologist' | 'patient';
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  metadata: any;
}

export const useDocumentNotifications = () => {
  const { psychologist, patient } = useProfile();
  const [notifications, setNotifications] = useState<DocumentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = psychologist?.id || patient?.id;

  // Use the centralized realtime channel hook
  useRealtimeChannel({
    channelName: `document-notifications-${userId}`,
    enabled: !!userId,
    table: 'document_notifications',
    filter: `recipient_id=eq.${userId}`,
    onUpdate: () => {
      console.log('Document notifications updated, refetching...');
      fetchNotifications();
    }
  });

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('document_notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion to ensure the data matches our interface
      const typedData = (data || []).map(item => ({
        ...item,
        recipient_type: item.recipient_type as 'psychologist' | 'patient'
      }));

      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('document_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!userId) return;

      const { error } = await supabase
        .from('document_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas",
        variant: "destructive"
      });
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
