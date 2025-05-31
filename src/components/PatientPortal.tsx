import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MessageSquare, FileText, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (patient?.id) {
      fetchPatientData();
    }
  }, [patient]);

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
      pending: { label: "Pendiente", variant: "secondary" as const, icon: AlertCircle },
      approved: { label: "Aprobada", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rechazada", variant: "destructive" as const, icon: XCircle }
    };

    const { label, variant, icon: Icon } = config[status as keyof typeof config] || 
      { label: status, variant: "secondary" as const, icon: AlertCircle };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando portal del paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">No se pudo cargar la información del paciente</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Hola, {patient.first_name}
          </h1>
          <p className="text-slate-600 mt-1">
            Bienvenido a tu portal personal
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  {nextAppointment ? (
                    <div>
                      <div className="text-lg font-bold">
                        {formatDate(nextAppointment.appointment_date)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(nextAppointment.appointment_date)} - {getTypeLabel(nextAppointment.type)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-bold">Sin citas</div>
                      <p className="text-xs text-muted-foreground">
                        No tienes citas programadas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{unreadMessages}</div>
                  <p className="text-xs text-muted-foreground">
                    {unreadMessages === 0 ? 'No hay mensajes nuevos' : 'Mensajes nuevos'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Solicitudes</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {appointmentRequests.filter(req => req.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Solicitudes pendientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Requests Status */}
            {appointmentRequests.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Estado de Solicitudes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointmentRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {formatDate(request.preferred_date)} a las {request.preferred_time}
                          </p>
                          <p className="text-xs text-slate-600">
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

          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Solicitar Nueva Cita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PatientAppointmentRequestForm onRequestCreated={fetchPatientData} />
              </CardContent>
            </Card>

            {/* Confirmed Appointments */}
            {appointments.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Citas Confirmadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {formatDate(appointment.appointment_date)}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {formatTime(appointment.appointment_date)} - {getTypeLabel(appointment.type)}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-slate-500 mt-1">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                          <Badge variant="default">
                            {appointment.status === 'scheduled' ? 'Programada' : 
                             appointment.status === 'confirmed' ? 'Confirmada' : 'Aceptada'}
                          </Badge>
                        </div>
                        {appointment.meeting_url && (
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => window.open(appointment.meeting_url, '_blank')}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
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

            {/* Appointment Requests */}
            {appointmentRequests.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Historial de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentRequests.map((request) => (
                      <div key={request.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {formatDate(request.preferred_date)}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {request.preferred_time} - {getTypeLabel(request.type)}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-slate-500 mt-1">
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

          <TabsContent value="messages">
            <PatientMessaging onBack={() => setActiveTab("overview")} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
