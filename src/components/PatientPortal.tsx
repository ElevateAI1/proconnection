import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MessageSquare, FileText, User, CheckCircle, XCircle, AlertCircle, LogOut, Sparkles, Heart, Star } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="text-center z-10 relative">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 animate-pulse">
              <Heart className="w-10 h-10 text-white animate-bounce" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-full blur-lg animate-ping"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-xl font-semibold text-white mb-2">Cargando tu portal personal</p>
            <p className="text-white/70">Preparando tu experiencia única...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-semibold">No se pudo cargar la información del paciente</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Enhanced background with animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1.5s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-300/40 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-20 w-1 h-1 bg-emerald-300/40 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex justify-between items-center animate-fade-in-up">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-emerald-500/30 rounded-2xl blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                    Hola, {patient.first_name}
                  </h1>
                  <p className="text-white/70 mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bienvenido a tu portal personal
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <LogOut size={16} className="mr-2" />
            {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="relative animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-2xl blur-lg"></div>
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 relative shadow-2xl">
              <TabsTrigger value="overview" className="relative rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white">
                Resumen
              </TabsTrigger>
              <TabsTrigger value="appointments" className="relative rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white">
                Citas
              </TabsTrigger>
              <TabsTrigger value="messages" className="relative rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white">
                Mensajes
              </TabsTrigger>
              <TabsTrigger value="documents" className="relative rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white">
                Documentos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Card className="group relative border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-purple-500/25">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Próxima Cita</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {nextAppointment ? (
                    <div>
                      <div className="text-lg font-bold text-white">
                        {formatDate(nextAppointment.appointment_date)}
                      </div>
                      <p className="text-xs text-white/60">
                        {formatTime(nextAppointment.appointment_date)} - {getTypeLabel(nextAppointment.type)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-bold text-white">Sin citas</div>
                      <p className="text-xs text-white/60">
                        No tienes citas programadas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="group relative border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-emerald-500/25">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Mensajes</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg relative">
                    <MessageSquare className="h-5 w-5 text-white" />
                    {unreadMessages > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{unreadMessages}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-lg font-bold text-white">{unreadMessages}</div>
                  <p className="text-xs text-white/60">
                    {unreadMessages === 0 ? 'No hay mensajes nuevos' : 'Mensajes nuevos'}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-blue-500/25">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Solicitudes</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-lg font-bold text-white">
                    {appointmentRequests.filter(req => req.status === 'pending').length}
                  </div>
                  <p className="text-xs text-white/60">
                    Solicitudes pendientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Appointment Requests Status */}
            {appointmentRequests.length > 0 && (
              <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/50 to-red-500/50 rounded-lg blur"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    Estado de Solicitudes
                    <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {appointmentRequests.slice(0, 3).map((request, index) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg hover:bg-white/15 transition-all duration-300 animate-fade-in-left"
                        style={{animationDelay: `${0.7 + index * 0.1}s`}}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-white">
                            {formatDate(request.preferred_date)} a las {request.preferred_time}
                          </p>
                          <p className="text-xs text-white/60">
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
            {/* Enhanced appointment request form */}
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-fade-in-up">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-lg blur"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Solicitar Nueva Cita
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <PatientAppointmentRequestForm onRequestCreated={fetchPatientData} />
              </CardContent>
            </Card>

            {/* Enhanced confirmed appointments */}
            {appointments.length > 0 && (
              <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-lg blur"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Citas Confirmadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    {appointments.map((appointment, index) => (
                      <div 
                        key={appointment.id} 
                        className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg hover:bg-white/15 transition-all duration-300 group animate-fade-in-right"
                        style={{animationDelay: `${0.3 + index * 0.1}s`}}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-emerald-200 transition-colors">
                              {formatDate(appointment.appointment_date)}
                            </h4>
                            <p className="text-sm text-white/70">
                              {formatTime(appointment.appointment_date)} - {getTypeLabel(appointment.type)}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-white/50 mt-1">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                          <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                            {appointment.status === 'scheduled' ? 'Programada' : 
                             appointment.status === 'confirmed' ? 'Confirmada' : 'Aceptada'}
                          </Badge>
                        </div>
                        {appointment.meeting_url && (
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => window.open(appointment.meeting_url, '_blank')}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
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

            {/* Enhanced appointment requests history */}
            {appointmentRequests.length > 0 && (
              <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-lg blur"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Historial de Solicitudes
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    {appointmentRequests.map((request, index) => (
                      <div 
                        key={request.id} 
                        className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg hover:bg-white/15 transition-all duration-300 animate-fade-in-scale"
                        style={{animationDelay: `${0.5 + index * 0.1}s`}}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              {formatDate(request.preferred_date)}
                            </h4>
                            <p className="text-sm text-white/70">
                              {request.preferred_time} - {getTypeLabel(request.type)}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-white/50 mt-1">
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

          <TabsContent value="messages" className="animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <PatientMessaging onBack={() => setActiveTab("overview")} />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <DocumentsSection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
