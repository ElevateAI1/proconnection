
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MessageCircle, Clock } from "lucide-react";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";
import { TrialStatus } from "./TrialStatus";
import { AppointmentRequests } from "./AppointmentRequests";
import { MeetingLinksCard } from "./MeetingLinksCard";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const { psychologist } = useProfile();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    thisWeekSessions: 0,
    pendingRequests: 0
  });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (psychologist?.id) {
      fetchDashboardData();
    }
  }, [psychologist]);

  const fetchDashboardData = async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching dashboard data for psychologist:', psychologist.id);
      setLoading(true);

      // Fetch total patients
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw new Error('Error al cargar pacientes');
      }

      console.log('Found patients:', patients?.length || 0);
      setStats(prev => ({ ...prev, totalPatients: patients?.length || 0 }));
      setRecentPatients(patients?.slice(-5) || []);

      // Fetch today's appointments
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const { data: todayAppts, error: apptsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .gte('appointment_date', todayStart.toISOString())
        .lte('appointment_date', todayEnd.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);

      if (apptsError) {
        console.error('Error fetching appointments:', apptsError);
      } else {
        setStats(prev => ({ ...prev, todayAppointments: todayAppts?.length || 0 }));
      }

      // Fetch unread messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', psychologist.id)
        .is('read_at', null);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setStats(prev => ({ ...prev, unreadMessages: messages?.length || 0 }));
      }

      // Fetch pending appointment requests
      const { data: pendingRequests, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .eq('status', 'pending');

      if (requestsError) {
        console.error('Error fetching pending requests:', requestsError);
      } else {
        console.log('Found pending requests:', pendingRequests?.length || 0);
        setStats(prev => ({ ...prev, pendingRequests: pendingRequests?.length || 0 }));
      }

      // Fetch this week's sessions
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const { data: weekSessions, error: weekError } = await supabase
        .from('appointments')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .gte('appointment_date', weekStart.toISOString())
        .lte('appointment_date', weekEnd.toISOString())
        .in('status', ['completed']);

      if (weekError) {
        console.error('Error fetching week sessions:', weekError);
      } else {
        setStats(prev => ({ ...prev, thisWeekSessions: weekSessions?.length || 0 }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!psychologist) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
        <p className="text-slate-600">Bienvenido de vuelta, Dr. {psychologist.first_name}</p>
      </div>

      {/* Trial Status - Prominente en la parte superior */}
      <TrialStatus />

      {/* Meeting Links Card */}
      <MeetingLinksCard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pacientes Total</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Citas Hoy</p>
                <p className="text-3xl font-bold text-slate-800">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Mensajes Nuevos</p>
                <p className="text-3xl font-bold text-slate-800">{stats.unreadMessages}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Requests Section */}
      <AppointmentRequests onRequestProcessed={fetchDashboardData} />

      {/* Professional Code and Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfessionalCodeDisplay code={psychologist.professional_code} />

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="w-5 h-5" />
              Pacientes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.length > 0 ? (
                recentPatients.map((patient, index) => (
                  <div key={patient.id || index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-slate-600">
                        {patient.age ? `${patient.age} años` : 'Edad no especificada'}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay pacientes registrados aún</p>
                  <p className="text-sm">Comparte tu código profesional para que los pacientes se registren</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
