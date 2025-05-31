import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentRequests } from "./AppointmentRequests";
import { MeetingLinksCard } from "./MeetingLinksCard";
import { TrialStatus } from "./TrialStatus";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingRequests: number;
}

interface DashboardProps {
  onViewChange?: (view: "dashboard" | "patients" | "calendar" | "messages") => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { psychologist } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        pendingRequests: requestsResult.count || 0
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

  const handleQuickAction = (action: "calendar" | "patients") => {
    if (onViewChange) {
      onViewChange(action);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              ¡Bienvenido, Dr. {psychologist?.first_name}!
            </h1>
            <p className="text-slate-600 mb-1">
              {formatDate(currentTime)}
            </p>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                Dr
              </div>
              <div>
                <p className="font-semibold text-slate-800">Dr. {psychologist?.first_name} {psychologist?.last_name}</p>
                <p className="text-sm text-slate-500">Psicólogo Profesional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pacientes Totales</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.totalPatients}</div>
            <p className="text-xs text-slate-500">Pacientes registrados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Citas Hoy</CardTitle>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.appointmentsToday}</div>
            <p className="text-xs text-slate-500">Programadas para hoy</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Solicitudes Pendientes</CardTitle>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.pendingRequests}</div>
            <p className="text-xs text-slate-500">Esperando aprobación</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for Pending Requests */}
      {stats.pendingRequests > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-1">
                  {stats.pendingRequests} Solicitud{stats.pendingRequests > 1 ? 'es' : ''} Pendiente{stats.pendingRequests > 1 ? 's' : ''}
                </h3>
                <p className="text-orange-700 text-sm">
                  Revisa las solicitudes de citas para aprobar o rechazar las nuevas consultas.
                </p>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Acción requerida</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trial Status and Professional Code */}
        <div className="lg:col-span-1 space-y-6">
          {psychologist && <TrialStatus />}
          {psychologist && psychologist.professional_code && (
            <ProfessionalCodeDisplay code={psychologist.professional_code} />
          )}
          
          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-800 text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => handleQuickAction("calendar")}
                className="w-full p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-800">Ver Calendario</h4>
                    <p className="text-sm text-blue-600">Revisar citas programadas</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction("patients")}
                className="w-full p-3 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-medium text-emerald-800">Gestionar Pacientes</h4>
                    <p className="text-sm text-emerald-600">Ver lista de pacientes</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Requests */}
          <AppointmentRequests 
            onRequestProcessed={handleRequestProcessed} 
            maxDisplayItems={3}
            isDashboardView={true}
          />
          
          {/* Meeting Links */}
          <MeetingLinksCard />
        </div>
      </div>
    </div>
  );
};
