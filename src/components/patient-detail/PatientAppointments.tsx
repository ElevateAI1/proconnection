
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patient_id: string;
  psychologist_id: string;
  appointment_date: string;
  duration_minutes: number;
  type: string;
  status: string;
  notes?: string;
  meeting_url?: string;
  created_at: string;
}

interface PatientAppointmentsProps {
  patientId: string;
}

export const PatientAppointments = ({ patientId }: PatientAppointmentsProps) => {
  const { psychologist } = useProfile();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId && psychologist?.id) {
      fetchAppointments();
    }
  }, [patientId, psychologist]);

  const fetchAppointments = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologist.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'scheduled':
      case 'confirmed':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Programada",
      confirmed: "Confirmada",
      completed: "Completada",
      cancelled: "Cancelada",
      no_show: "No asistió"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700",
      confirmed: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
      no_show: "bg-orange-100 text-orange-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Individual",
      couple: "Pareja",
      family: "Familia",
      group: "Grupo"
    };
    return labels[type] || type;
  };

  const isUpcoming = (appointmentDate: string) => {
    return new Date(appointmentDate) > new Date();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) {
      return { date: 'Fecha no disponible', time: 'Hora no disponible' };
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { date: 'Fecha inválida', time: 'Hora inválida' };
    }
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.appointment_date));
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.appointment_date));

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando citas...</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddAppointment = () => {
    // Guardar el patientId en localStorage para que el calendario pueda usarlo
    if (patientId) {
      localStorage.setItem('selectedPatientId', patientId);
    }
    // Navegar al dashboard y cambiar la vista a calendar
    navigate('/?view=calendar');
  };

  return (
    <div className="space-y-6">
      {/* Botón para agregar cita - Solo visible para psicólogos */}
      {psychologist && (
        <div className="flex justify-end">
          <Button
            onClick={handleAddAppointment}
            className="bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Cita
          </Button>
        </div>
      )}

      {/* Header con estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
            <p className="text-sm text-slate-600">Total Citas</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-slate-800">
              {appointments.filter(apt => apt.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-600">Completadas</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-slate-800">{upcomingAppointments.length}</p>
            <p className="text-sm text-slate-600">Próximas</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas citas */}
      {upcomingAppointments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Próximas Citas ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.appointment_date);
                return (
                  <div key={appointment.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <h4 className="font-semibold text-slate-800 capitalize">
                            {dateTime.date}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {dateTime.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {appointment.duration_minutes} min
                            </span>
                            {appointment.meeting_url && (
                              <span className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                Virtual
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(appointment.type)}
                        </Badge>
                        {appointment.meeting_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={appointment.meeting_url} target="_blank" rel="noopener noreferrer">
                              <Video className="w-4 h-4 mr-2" />
                              Unirse
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Notas:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de citas */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Historial de Citas ({pastAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.appointment_date);
                return (
                  <div key={appointment.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <h4 className="font-semibold text-slate-800 capitalize">
                            {dateTime.date}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {dateTime.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {appointment.duration_minutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(appointment.type)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Notas:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay citas anteriores</h3>
              <p className="text-sm">Las citas completadas aparecerán aquí</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
