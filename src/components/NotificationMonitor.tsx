
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { RefreshCw, Bell, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface NotificationRecord {
  id: string;
  recipient_id: string;
  recipient_type: string;
  notification_type: string;
  title: string;
  message: string;
  metadata: any;
  priority: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  recipient_phone?: string;
}

export const NotificationMonitor = () => {
  const { psychologist } = useProfile();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    scheduled: 0
  });

  const fetchNotifications = async () => {
    if (!psychologist?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('metadata->>psychologist_id', psychologist.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Map database data to match our interface
      const mappedNotifications: NotificationRecord[] = (data || []).map(notification => ({
        id: notification.id.toString(),
        recipient_id: '', // Not available in current schema
        recipient_type: 'patient', // Default value
        notification_type: notification.notification_type,
        title: notification.title,
        message: notification.message,
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
      
      // Calculate stats
      const total = mappedNotifications.length;
      const pending = mappedNotifications.filter(n => n.status === 'pending').length;
      const sent = mappedNotifications.filter(n => n.status === 'sent').length;
      const failed = mappedNotifications.filter(n => n.status === 'failed').length;
      const scheduled = mappedNotifications.filter(n => 
        n.status === 'pending' && new Date(n.scheduled_for) > new Date()
      ).length;

      setStats({ total, pending, sent, failed, scheduled });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const retryNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(notificationId));

      if (error) {
        console.error('Error retrying notification:', error);
        return;
      }

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error retrying notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications_monitor')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'system_notifications',
          filter: `metadata->>psychologist_id=eq.${psychologist?.id}`
        }, 
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [psychologist?.id]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programadas</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviadas</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fallidas</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Monitor de Notificaciones
            </CardTitle>
            <Button
              onClick={fetchNotifications}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay notificaciones para mostrar</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(notification.status)}
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge className={`text-xs ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notification.notification_type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Programada: {formatDate(notification.scheduled_for)}</span>
                        {notification.sent_at && (
                          <span>Enviada: {formatDate(notification.sent_at)}</span>
                        )}
                        {notification.recipient_phone && (
                          <span>Tel: {notification.recipient_phone}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {notification.status === 'failed' && (
                        <Button
                          onClick={() => retryNotification(notification.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Reintentar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
