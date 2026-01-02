
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Bell, Clock, CheckCircle, AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

interface PendingReminder {
  id: string;
  recipient_id: string;
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

export const ReminderSystemMonitor = () => {
  const { psychologist } = useProfile();
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    overdue: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchPendingReminders = async () => {
    if (!psychologist?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('notification_type', 'appointment_reminder')
        .eq('status', 'pending')
        .eq('metadata->>psychologist_id', psychologist.id)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching pending reminders:', error);
        return;
      }

      // Map database data to match our interface
      const mappedReminders: PendingReminder[] = (data || []).map(reminder => ({
        id: reminder.id.toString(),
        recipient_id: '', // Not available in current schema
        notification_type: reminder.notification_type,
        title: reminder.title,
        message: reminder.message,
        metadata: reminder.metadata,
        priority: reminder.priority,
        status: reminder.status,
        scheduled_for: reminder.scheduled_for,
        sent_at: reminder.sent_at,
        created_at: reminder.created_at,
        updated_at: reminder.updated_at,
        recipient_phone: reminder.recipient_phone
      }));

      setPendingReminders(mappedReminders);

      // Calculate stats
      const now = new Date();
      const total = mappedReminders.length;
      const overdue = mappedReminders.filter(r => new Date(r.scheduled_for) < now).length;
      const upcoming = mappedReminders.filter(r => {
        const scheduledTime = new Date(r.scheduled_for);
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return scheduledTime > now && scheduledTime <= in24Hours;
      }).length;

      setStats({
        total,
        pending: total,
        overdue,
        upcoming
      });
    } catch (error) {
      console.error('Error in fetchPendingReminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminderNow = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ 
          scheduled_for: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(reminderId));

      if (error) {
        console.error('Error updating reminder:', error);
        return;
      }

      // Refresh the list
      fetchPendingReminders();
    } catch (error) {
      console.error('Error sending reminder now:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReminderStatus = (scheduledFor: string) => {
    const now = new Date();
    const scheduledTime = new Date(scheduledFor);
    
    if (scheduledTime < now) {
      return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (scheduledTime <= new Date(now.getTime() + 60 * 60 * 1000)) {
      return { status: 'due-soon', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    } else {
      return { status: 'scheduled', color: 'bg-blue-100 text-blue-800', icon: Bell };
    }
  };

  useEffect(() => {
    fetchPendingReminders();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchPendingReminders, 30000);
    
    return () => clearInterval(interval);
  }, [psychologist?.id]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendientes</p>
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
                <p className="text-sm font-medium text-gray-600">Próximas 24h</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <p className="text-sm font-bold text-green-600">Activo</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recordatorios Pendientes
            </CardTitle>
            <Button
              onClick={fetchPendingReminders}
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
            {pendingReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay recordatorios pendientes</p>
              </div>
            ) : (
              pendingReminders.map((reminder) => {
                const { status, color, icon: StatusIcon } = getReminderStatus(reminder.scheduled_for);
                const patientName = reminder.metadata?.patient_name || 'Paciente';
                const appointmentDate = reminder.metadata?.appointment_date;
                
                return (
                  <div
                    key={reminder.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className="w-4 h-4" />
                          <h3 className="font-medium">{reminder.title}</h3>
                          <Badge className={`text-xs ${color}`}>
                            {status === 'overdue' ? 'Vencido' : 
                             status === 'due-soon' ? 'Próximo' : 'Programado'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Paciente: <strong>{patientName}</strong>
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Envío programado: {formatDate(reminder.scheduled_for)}</span>
                          {appointmentDate && (
                            <span>Cita: {formatDate(appointmentDate)}</span>
                          )}
                          {reminder.recipient_phone && (
                            <span>Tel: {reminder.recipient_phone}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {status === 'overdue' && (
                          <Button
                            onClick={() => sendReminderNow(reminder.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Enviar Ahora
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
