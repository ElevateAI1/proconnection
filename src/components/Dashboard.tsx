import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, AlertCircle, TrendingUp, Crown, Zap, BarChart3, Headphones, Rocket, Eye } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePlanCapabilities } from "@/hooks/usePlanCapabilities";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentRequests } from "./AppointmentRequests";
import { MeetingLinksCard } from "./MeetingLinksCard";
import { TrialStatus } from "./TrialStatus";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingRequests: number;
}

interface DashboardProps {
  onViewChange?: (view: "dashboard" | "patients" | "calendar" | "messages" | "seo" | "reports" | "support" | "early-access" | "visibility") => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { psychologist, forceRefresh: refreshProfile } = useProfile();
  const { capabilities, isPlusUser, isProUser, refreshCapabilities } = usePlanCapabilities();
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

  // Escuchar eventos de actualización de plan CON REFRESH INMEDIATO
  useEffect(() => {
    const handlePlanUpdate = () => {
      console.log('Dashboard: Plan update event received - IMMEDIATE REFRESH');
      refreshProfile();
      refreshCapabilities();
    };

    const handleAdminPlanUpdate = (event: CustomEvent) => {
      const { psychologistId } = event.detail;
      console.log('Dashboard: Admin plan update event:', event.detail);
      console.log('Current psychologist ID:', psychologist?.id);
      console.log('Target psychologist ID:', psychologistId);
      
      if (psychologist?.id === psychologistId) {
        console.log('Dashboard: MATCH! Refreshing immediately...');
        refreshProfile();
        refreshCapabilities();
      }
    };

    const handleForceRefresh = () => {
      console.log('Dashboard: Force refresh event received');
      refreshProfile();
      refreshCapabilities();
    };

    // Escuchar múltiples tipos de eventos
    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
    window.addEventListener('forceRefreshCapabilities', handleForceRefresh);
    
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('adminPlanUpdated', handleAdminPlanUpdate as EventListener);
      window.removeEventListener('forceRefreshCapabilities', handleForceRefresh);
    };
  }, [psychologist?.id, refreshProfile, refreshCapabilities]);

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

  const handleQuickAction = (action: "calendar" | "patients" | "seo" | "reports" | "support" | "early-access" | "visibility") => {
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

  const getPlanIcon = () => {
    const isProUserValue = isProUser();
    const isPlusUserValue = isPlusUser();
    console.log('Dashboard: Getting plan icon - isProUser:', isProUserValue, 'isPlusUser:', isPlusUserValue);
    console.log('Dashboard: Current capabilities:', capabilities);
    
    if (isProUserValue) {
      return <Crown className="w-5 h-5 text-purple-500" />;
    } else if (isPlusUserValue) {
      return <Zap className="w-5 h-5 text-blue-500" />;
    }
    return <Users className="w-5 h-5 text-gray-500" />;
  };

  const getPlanName = () => {
    const isProUserValue = isProUser();
    const isPlusUserValue = isPlusUser();
    console.log('Dashboard: Getting plan name - isProUser:', isProUserValue, 'isPlusUser:', isPlusUserValue);
    
    if (isProUserValue) return "PRO";
    if (isPlusUserValue) return "PLUS";
    return "BASIC";
  };

  const getPlanColor = () => {
    if (isProUser()) return "from-purple-600 to-pink-600";
    if (isPlusUser()) return "from-blue-600 to-cyan-600";
    return "from-gray-600 to-gray-700";
  };

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
              <div className={`w-10 h-10 bg-gradient-to-r ${getPlanColor()} rounded-full flex items-center justify-center text-white font-bold`}>
                {getPlanIcon()}
              </div>
              <div>
                <p className="font-semibold text-slate-800">Dr. {psychologist?.first_name} {psychologist?.last_name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Plan {getPlanName()}</span>
                  {isProUser() && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      Funcionalidades Premium
                    </span>
                  )}
                </div>
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

          {/* Pro Features Quick Access */}
          {isProUser() && (
            <Card className="border-0 shadow-md border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Funcionalidades PRO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => handleQuickAction("reports")}
                  className="w-full p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-purple-800">Reportes Avanzados</h4>
                      <p className="text-sm text-purple-600">Analytics detallados</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction("seo")}
                  className="w-full p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Perfil SEO</h4>
                      <p className="text-sm text-green-600">Optimizar presencia online</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction("support")}
                  className="w-full p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Headphones className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-orange-800">Soporte Prioritario</h4>
                      <p className="text-sm text-orange-600">Asistencia exclusiva</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction("early-access")}
                  className="w-full p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-800">Acceso Anticipado</h4>
                      <p className="text-sm text-red-600">Nuevas funcionalidades</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction("visibility")}
                  className="w-full p-3 bg-teal-50 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="font-medium text-teal-800">Consultoría Visibilidad</h4>
                      <p className="text-sm text-teal-600">Análisis de presencia</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          )}
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
