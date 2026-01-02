import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  Activity,
  RefreshCw,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';
import { WhatsAppStatus } from '@/components/WhatsAppStatus';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationDashboard: React.FC = () => {
  const { notifications, loading: notificationsLoading, fetchNotifications } = useNotifications();
  const { 
    loading: connectionLoading, 
    processScheduledNotifications 
  } = useAdvancedNotifications();
  
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    deliveryRate: 0
  });

  // Calcular estadísticas
  useEffect(() => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length;
    const pending = notifications.filter(n => n.status === 'pending').length;
    const failed = notifications.filter(n => n.status === 'failed').length;
    const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    setStats({ total, sent, pending, failed, deliveryRate });
  }, [notifications]);

  // Auto-refresh cada 30 segundos si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      await fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchNotifications]);

  const handleRefreshAll = async () => {
    await fetchNotifications();
  };

  const handleProcessScheduled = async () => {
    await processScheduledNotifications();
    await fetchNotifications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const recentNotifications = notifications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard de Notificaciones</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            Auto-refresh
          </Button>
          <Button
            onClick={handleRefreshAll}
            size="sm"
            variant="outline"
            disabled={notificationsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${notificationsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={handleProcessScheduled}
            size="sm"
            variant="outline"
            disabled={connectionLoading}
          >
            <Activity className={`w-4 h-4 mr-1 ${connectionLoading ? 'animate-spin' : ''}`} />
            Procesar Pendientes
          </Button>
        </div>
      </div>

      {/* Estado de conexión WhatsApp */}
      <WhatsAppStatus />

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Notificaciones</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Enviadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tasa de Entrega</p>
                <p className="text-2xl font-bold text-slate-800">{stats.deliveryRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress value={stats.deliveryRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal con tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">
            <Activity className="w-4 h-4 mr-2" />
            Actividad Reciente
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="failed">
            <AlertCircle className="w-4 h-4 mr-2" />
            Fallos ({stats.failed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notificaciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Cargando notificaciones...</p>
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600">No hay notificaciones recientes</p>
                  </div>
                ) : (
                  recentNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-800 truncate">{notification.title}</p>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            📨 Sistema
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { 
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enviadas</span>
                    <span className="text-sm font-medium">{stats.sent}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.sent / stats.total) * 100 : 0} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pendientes</span>
                    <span className="text-sm font-medium">{stats.pending}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fallidas</span>
                    <span className="text-sm font-medium">{stats.failed}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.failed / stats.total) * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Tasa de Éxito</span>
                    <span className="text-lg font-bold text-green-600">{stats.deliveryRate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Total Procesadas</span>
                    <span className="text-lg font-bold text-blue-600">{stats.total}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">En Cola</span>
                    <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Notificaciones Fallidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.status === 'failed').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-4" />
                    <p className="text-slate-600">¡Excelente! No hay notificaciones fallidas</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => n.status === 'failed')
                    .map((notification) => (
                      <div key={notification.id} className="flex items-start gap-4 p-4 border border-red-200 rounded-lg bg-red-50">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 mb-1">{notification.title}</p>
                          <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>📨 Sistema</span>
                            <span>
                              Falló: {formatDistanceToNow(new Date(notification.updated_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Reintentar
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
