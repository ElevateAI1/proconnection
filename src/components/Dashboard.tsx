import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MessageSquare, Users, FileText, Settings, Bell } from "lucide-react";
import { Calendar as CalendarComponent } from "./CalendarView";
import { PatientManagement } from "./PatientManagement";
import { MessagingHub } from "./MessagingHub";
import { DocumentsSection } from "./DocumentsSection";
import { AppointmentRequests } from "./AppointmentRequests";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";
import { TrialStatus } from "./TrialStatus";
import { MeetingLinksCard } from "./MeetingLinksCard";
export const Dashboard = () => {
  const {
    user
  } = useAuth();
  const {
    profile,
    psychologist,
    patient,
    loading
  } = useProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>;
  }
  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">No se pudo cargar la información del perfil</p>
          </CardContent>
        </Card>
      </div>;
  }
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Bienvenido, {profile.user_type === 'psychologist' ? psychologist?.first_name : patient?.first_name}
              </h1>
              <p className="text-slate-600 mt-1">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {profile.user_type === 'psychologist' ? 'Psicólogo' : 'Paciente'}
              </Badge>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        </div>

        {profile.user_type === 'psychologist' ? <>
            {/* Trial Status for Psychologists */}
            {psychologist && <TrialStatus />}
            
            {/* Professional Code Display */}
            {psychologist && psychologist.professional_code && <ProfessionalCodeDisplay code={psychologist.professional_code} />}

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 my-[28px]">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="calendar">Calendario</TabsTrigger>
                <TabsTrigger value="patients">Pacientes</TabsTrigger>
                <TabsTrigger value="messages">Mensajes</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="requests">Solicitudes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Quick Stats */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground">
                        +2 desde ayer
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
                      <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">
                        +1 esta semana
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Mensajes Nuevos</CardTitle>
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                      <p className="text-xs text-muted-foreground">
                        Responder pronto
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Meeting Links */}
                <MeetingLinksCard />

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nueva cita programada</p>
                          <p className="text-xs text-slate-600">María García - Hoy 3:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Mensaje recibido</p>
                          <p className="text-xs text-slate-600">Carlos López - Hace 30 min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Documento completado</p>
                          <p className="text-xs text-slate-600">Evaluación psicológica - Hace 1 hora</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarComponent />
              </TabsContent>

              <TabsContent value="patients">
                <PatientManagement />
              </TabsContent>

              <TabsContent value="messages">
                <MessagingHub />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsSection />
              </TabsContent>

              <TabsContent value="requests">
                <AppointmentRequests />
              </TabsContent>
            </Tabs>
          </> : (/* Patient Dashboard - Simplified view */
      <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Hoy 3:00 PM</div>
                  <p className="text-xs text-muted-foreground">
                    Con tu psicólogo
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">2 nuevos</div>
                  <p className="text-xs text-muted-foreground">
                    De tu psicólogo
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">3 documentos</div>
                  <p className="text-xs text-muted-foreground">
                    Disponibles para revisar
                  </p>
                </CardContent>
              </Card>
            </div>

            <DocumentsSection />
          </div>)}
      </div>
    </div>;
};