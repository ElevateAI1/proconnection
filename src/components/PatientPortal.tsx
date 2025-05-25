import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, FileText, Clock, Video } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentRequestForm } from "./AppointmentRequestForm";
import { MeetingLinksCard } from "./MeetingLinksCard";
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
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at?: string;
  created_at: string;
}

interface Stats {
  nextAppointment: Appointment | null;
  unreadMessages: number;
  totalSessions: number;
}

export const PatientPortal = () => {
  const { patient } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    nextAppointment: null,
    unreadMessages: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patient?.id) {
      fetchPatientData();
    }
  }, [patient]);

  const fetchPatientData = async () => {
    if (!patient?.id) {
      setError("No se pudo identificar al paciente");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching patient data for:', patient.id);
      
      // Crear fecha actual en formato ISO para comparación
      const now = new Date();
      const currentDateTime = now.toISOString();
      
      // Fetch upcoming appointments con mejor filtrado
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .gte('appointment_date', currentDateTime)
        .in('status', ['scheduled', 'confirmed', 'accepted'])
        .order('appointment_date', { ascending: true });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw new Error('Error al cargar las citas');
      }

      console.log('Fetched appointments:', appointmentsData);
      const validAppointments = appointmentsData || [];
      setAppointments(validAppointments);

      // Fetch recent messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        // No lanzar error para mensajes, solo log
      }

      const validMessages = messagesData || [];
      setMessages(validMessages);

      // Calculate stats
      const nextAppointment = validAppointments.length > 0 ? validAppointments[0] : null;
      const unreadMessages = validMessages.filter(msg => !msg.read_at).length;

      console.log('Next appointment:', nextAppointment);

      // Fetch total completed sessions
      const { data: completedSessions, error: completedError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('patient_id', patient.id)
        .eq('status', 'completed');

      if (completedError) {
        console.error('Error fetching completed sessions:', completedError);
      }

      setStats({
        nextAppointment,
        unreadMessages,
        totalSessions: completedSessions?.length || 0
      });

    } catch (error) {
      console.error('Error fetching patient data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Hora inválida';
    }
  };

  const formatDateLong = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "confirmed": "Confirmada",
      "accepted": "Confirmada",
      "scheduled": "Programada",
      "pending": "Pendiente",
      "completed": "Completada",
      "cancelled": "Cancelada"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "confirmed": "bg-green-100 text-green-700",
      "accepted": "bg-green-100 text-green-700",
      "scheduled": "bg-blue-100 text-blue-700",
      "pending": "bg-yellow-100 text-yellow-700",
      "completed": "bg-gray-100 text-gray-700",
      "cancelled": "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "individual": "Terapia Individual",
      "couple": "Terapia de Pareja", 
      "family": "Terapia Familiar",
      "evaluation": "Evaluación",
      "follow_up": "Seguimiento"
    };
    return types[type] || type;
  };

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil de paciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Error al cargar datos</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={fetchPatientData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Portal del Paciente</h2>
        <p className="text-slate-600">
          Bienvenida, {patient.first_name} {patient.last_name}
        </p>
      </div>

      {/* Meeting Links Card */}
      <MeetingLinksCard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Próxima Cita</p>
                {stats.nextAppointment ? (
                  <>
                    <p className="text-2xl font-bold text-slate-800">
                      {formatDate(stats.nextAppointment.appointment_date)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatTime(stats.nextAppointment.appointment_date)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-800">--</p>
                    <p className="text-sm text-slate-600">Sin citas programadas</p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Mensajes Nuevos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.unreadMessages}</p>
                <p className="text-sm text-slate-600">Sin leer</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Sesiones Realizadas</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalSessions}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5" />
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {new Date(appointment.appointment_date).getDate()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 capitalize">
                          {getTypeLabel(appointment.type)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatTime(appointment.appointment_date)} - {appointment.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes citas programadas</p>
                  <p className="text-sm">Solicita una nueva cita usando el botón de abajo</p>
                </div>
              )}
              <AppointmentRequestForm onSuccess={fetchPatientData} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageCircle className="w-5 h-5" />
              Mensajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-slate-800 text-sm">Tu psicólogo</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">
                          {formatDateLong(message.created_at)}
                        </p>
                        {!message.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{message.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes mensajes</p>
                  <p className="text-sm">Aquí aparecerán los mensajes de tu psicólogo</p>
                </div>
              )}
              <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Ver todos los mensajes
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5" />
            Documentos y Formularios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay documentos disponibles</p>
            <p className="text-sm">Los documentos y formularios aparecerán aquí cuando tu psicólogo los comparta</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
