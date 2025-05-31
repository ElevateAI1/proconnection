
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MessageSquare, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentRequests } from "./AppointmentRequests";
import { MeetingLinksCard } from "./MeetingLinksCard";
import { DashboardOverview } from "./DashboardOverview";

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingRequests: number;
  messagesUnread: number;
}

export const Dashboard = () => {
  const { psychologist } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingRequests: 0,
    messagesUnread: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (psychologist?.id) {
      console.log('Dashboard: Loading data for psychologist:', psychologist.id);
      fetchDashboardData();
    }
  }, [psychologist]);

  const fetchDashboardData = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      console.log('Dashboard: Fetching dashboard data for psychologist:', psychologist.id);

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      console.log('Dashboard: Date range for today:', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      });

      // Fetch all data in parallel
      const [patientsResult, appointmentsResult, requestsResult] = await Promise.all([
        // Total patients
        supabase
          .from('patients')
          .select('id', { count: 'exact' })
          .eq('psychologist_id', psychologist.id),
        
        // Today's appointments
        supabase
          .from('appointments')
          .select('id', { count: 'exact' })
          .eq('psychologist_id', psychologist.id)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString())
          .in('status', ['scheduled', 'confirmed', 'accepted']),
        
        // Pending appointment requests
        supabase
          .from('appointment_requests')
          .select('id', { count: 'exact' })
          .eq('psychologist_id', psychologist.id)
          .eq('status', 'pending')
      ]);

      console.log('Dashboard: Fetch results:', {
        patients: patientsResult,
        appointments: appointmentsResult,
        requests: requestsResult
      });

      if (patientsResult.error) {
        console.error('Dashboard: Error fetching patients:', patientsResult.error);
      }
      if (appointmentsResult.error) {
        console.error('Dashboard: Error fetching appointments:', appointmentsResult.error);
      }
      if (requestsResult.error) {
        console.error('Dashboard: Error fetching requests:', requestsResult.error);
      }

      setStats({
        totalPatients: patientsResult.count || 0,
        appointmentsToday: appointmentsResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        messagesUnread: 0 // We'll implement this later
      });

      console.log('Dashboard: Stats updated:', {
        totalPatients: patientsResult.count || 0,
        appointmentsToday: appointmentsResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        messagesUnread: 0
      });

    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestProcessed = () => {
    console.log('Dashboard: Request processed, refreshing data');
    fetchDashboardData();
  };

  if (loading) {
    console.log('Dashboard: Loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering with stats:', stats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h2>
        <p className="text-slate-600 mt-1">
          Resumen de tu actividad profesional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes registrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              Programadas para hoy
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Esperando aprobación
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesUnread}</div>
            <p className="text-xs text-muted-foreground">
              Sin leer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending requests */}
      {stats.pendingRequests > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  Tienes {stats.pendingRequests} solicitud{stats.pendingRequests > 1 ? 'es' : ''} de cita pendiente{stats.pendingRequests > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-600">
                  Revisa las solicitudes a continuación para aprobar o rechazar las citas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Requests - Always show this */}
        <div className="lg:col-span-2">
          <AppointmentRequests onRequestProcessed={handleRequestProcessed} />
        </div>

        {/* Meeting Links */}
        <MeetingLinksCard />

        {/* Overview */}
        <DashboardOverview />
      </div>
    </div>
  );
};
