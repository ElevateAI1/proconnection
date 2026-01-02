
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, Clock, AlertCircle, Mail, MessageSquare, Phone, Plus, RefreshCw, Zap } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationCenter: React.FC = () => {
  const { notifications, loading, error, markAsRead, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.status === filter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return <Clock className="w-4 h-4" />;
      case 'payment_due':
        return <AlertCircle className="w-4 h-4" />;
      case 'document_ready':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'whatsapp':
        return <MessageSquare className="w-3 h-3" />;
      case 'sms':
        return <Phone className="w-3 h-3" />;
      default:
        return <Bell className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appointment_reminder: 'Recordatorio de Cita',
      payment_due: 'Pago Pendiente',
      document_ready: 'Documento Listo',
      system_alert: 'Alerta del Sistema'
    };
    return labels[type] || type;
  };

  const handleCreateTestNotification = async () => {
    console.log('Test notification creation not implemented');
  };

  if (loading && notifications.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando notificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchNotifications} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Centro de Notificaciones
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateTestNotification}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear Prueba
            </Button>
            <Button
              onClick={fetchNotifications}
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes ({notifications.filter(n => n.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="sent">Enviadas ({notifications.filter(n => n.status === 'sent').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-6">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 mb-4">
                    {filter === 'all' 
                      ? 'No hay notificaciones' 
                      : `No hay notificaciones ${filter === 'pending' ? 'pendientes' : 'enviadas'}`
                    }
                  </p>
                  {filter === 'all' && (
                    <Button
                      onClick={handleCreateTestNotification}
                      variant="outline"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Crear notificación de prueba
                    </Button>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-800">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.notification_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              📨 Sistema
                            </span>
                            <span>
                              Programado: {formatDistanceToNow(new Date(notification.scheduled_for), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                            {notification.sent_at && (
                              <span>
                                Enviado: {formatDistanceToNow(new Date(notification.sent_at), { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status === 'pending' && 'Pendiente'}
                          {notification.status === 'sent' && 'Enviado'}
                          {notification.status === 'delivered' && 'Entregado'}
                          {notification.status === 'failed' && 'Fallido'}
                        </Badge>
                        {notification.status === 'sent' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
