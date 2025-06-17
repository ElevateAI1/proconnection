
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MessageSquare, FileText, User, CheckCircle, XCircle, AlertCircle, LogOut, Sparkles } from "lucide-react";
import { PatientMessaging } from "./PatientMessaging";
import { DocumentsSection } from "./DocumentsSection";
import { PatientAppointmentRequestForm } from "./PatientAppointmentRequestForm";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  appointment_date: string;
  type: string;
  status: string;
  notes?: string;
  meeting_url?: string;
}

interface AppointmentRequest {
  id: string;
  preferred_date: string;
  preferred_time: string;
  type: string;
  status: string;
  notes?: string;
  created_at: string;
}

export const PatientPortal = () => {
  const { patient, loading: profileLoading } = useProfile();
  const { signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [psychologistName, setPsychologistName] = useState<string | null>(null);

  useEffect(() => {
    if (patient?.id) {
      fetchPatientData();
    }
  }, [patient]);

  useEffect(() => {
    const fetchPsychologistName = async () => {
      if (patient?.psychologist_id) {
        try {
          const { data, error } = await supabase
            .from("psychologists")
            .select("first_name, last_name")
            .eq("id", patient.psychologist_id)
            .maybeSingle();
          if (!error && data) {
            let fullPsyName = "";
            if (data.first_name) fullPsyName += data.first_name;
            if (data.last_name) fullPsyName += (fullPsyName ? " " : "") + data.last_name;
            setPsychologistName(fullPsyName || null);
          } else {
            setPsychologistName(null);
          }
        } catch {
          setPsychologistName(null);
        }
      } else {
        setPsychologistName(null);
      }
    };
    fetchPsychologistName();
  }, [patient?.psychologist_id]);

  const fetchPatientData = async () => {
    if (!patient?.id) return;

    try {
      console.log('Fetching patient data for:', patient.id);
      console.log('Patient psychologist_id:', patient.psychologist_id);

      setLoading(true);

      // Fetch confirmed appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .in('status', ['scheduled', 'confirmed', 'accepted'])
        .order('appointment_date', { ascending: true });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        console.log('Fetched appointments:', appointmentsData);
        setAppointments(appointmentsData || []);
        
        // Find next appointment
        const now = new Date();
        const upcoming = (appointmentsData || []).find(apt => 
          new Date(apt.appointment_date) > now
        );
        setNextAppointment(upcoming || null);
        console.log('Next appointment:', upcoming);
      }

      // Fetch appointment requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching appointment requests:', requestsError);
      } else {
        console.log('Fetched appointment requests:', requestsData);
        setAppointmentRequests(requestsData || []);
      }

      // Fetch unread messages count
      if (patient.psychologist_id) {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('patient_id', patient.id)
          .eq('psychologist_id', patient.psychologist_id);

        if (conversations && conversations.length > 0) {
          const { data: messages } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conversations[0].id)
            .neq('sender_id', patient.id)
            .is('read_at', null);

          setUnreadMessages(messages?.length || 0);
          console.log('Unread messages count:', messages?.length || 0);
        }
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Si es una fecha en formato YYYY-MM-DD, crear la fecha directamente sin UTC
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Para fechas con timestamp completo
      return new Date(dateString).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Terapia Individual",
      couple: "Terapia de Pareja", 
      family: "Terapia Familiar",
      evaluation: "Evaluación",
      follow_up: "Seguimiento"
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "Pendiente", className: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
      approved: { label: "Aprobada", className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
      rejected: { label: "Rechazada", className: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
      scheduled: { label: "Programada", className: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
      confirmed: { label: "Confirmada", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
      accepted: { label: "Aceptada", className: "bg-teal-100 text-teal-700 border-teal-200", icon: CheckCircle },
    };

    const { label, className, icon: Icon } = config[status as keyof typeof config] || 
      { label: status, className: "bg-gray-100 text-gray-700 border-gray-200", icon: AlertCircle };

    return (
      <Badge variant="outline" className={`font-medium border ${className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Logging out patient');
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Cargando tu portal...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No se pudo cargar la información del paciente. Por favor, intente de nuevo más tarde.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 text-transparent bg-clip-text">
                  {(() => {
                    const patientFullName = [patient?.first_name, patient?.last_name].filter(Boolean).join(' ').trim();
                    if (psychologistName && patientFullName) {
                      return `Hola, ${patientFullName}`;
                    } else if (patientFullName) {
                      return `Hola, ${patientFullName}`;
                    }
                    return "Hola, paciente";
                  })()}
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                {psychologistName ? `Paciente de ${psychologistName}` : 'Bienvenido a tu portal personal'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="w-full md:w-auto"
          >
            <LogOut size={16} className="mr-2" />
            {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </Button>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent p-0 h-auto rounded-none border-b border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2">Resumen</TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2">Citas</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2">Mensajes</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Próxima Cita</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {nextAppointment ? (
                    <div>
                      <div className="text-2xl font-bold">
                        {formatDate(nextAppointment.appointment_date)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatTime(nextAppointment.appointment_date)} - {getTypeLabel(nextAppointment.type)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600 pt-2">No tienes citas programadas.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Mensajes sin leer</CardTitle>
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unreadMessages}</div>
                  <p className="text-xs text-gray-500">
                    {unreadMessages === 0 ? 'No hay mensajes nuevos' : 'Mensajes esperando respuesta'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Solicitudes Pendientes</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentRequests.filter(req => req.status === 'pending').length}
                  </div>
                  <p className="text-xs text-gray-500">
                    Solicitudes de cita por aprobar
                  </p>
                </CardContent>
              </Card>
            </div>

            {appointmentRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Solicitudes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointmentRequests.slice(0, 3).map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">
                            {formatDate(request.preferred_date)} a las {request.preferred_time}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTypeLabel(request.type)}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Nueva Cita</CardTitle>
              </CardHeader>
              <CardContent>
                {!showRequestForm ? (
                  <Button 
                    onClick={() => setShowRequestForm(true)}
                    className="w-full md:w-auto text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Nueva Solicitud de Cita
                  </Button>
                ) : (
                  <PatientAppointmentRequestForm 
                    psychologistId={patient.psychologist_id || ''} 
                    onClose={() => setShowRequestForm(false)}
                    onRequestCreated={fetchPatientData}
                  />
                )}
              </CardContent>
            </Card>

            {appointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Citas Confirmadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {formatDate(appointment.appointment_date)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatTime(appointment.appointment_date)} - {getTypeLabel(appointment.type)}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 mt-1">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        {appointment.meeting_url && (
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => window.open(appointment.meeting_url, '_blank')}
                            >
                              <span className="mr-2">🎥</span>
                              Unirse a la reunión
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {appointmentRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    Historial de Solicitudes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {formatDate(request.preferred_date)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {request.preferred_time} - {getTypeLabel(request.type)}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-gray-500 mt-1">
                                {request.notes}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <PatientMessaging onBack={() => setActiveTab("overview")} />
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <DocumentsSection />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientPortal;
