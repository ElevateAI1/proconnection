
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  AlertCircle,
  DollarSign,
  Settings
} from "lucide-react";
import { useUnifiedDashboardStats } from "@/hooks/useUnifiedDashboardStats";
import { AppointmentRequests } from "./AppointmentRequests";
import { TrialStatus } from "./TrialStatus";
import { PlanBadge } from "./PlanBadge";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates";

interface OptimizedDashboardProps {
  onViewChange: (view: ViewType) => void;
  psychologistId?: string;
  psychologistName?: string;
  planType?: string;
}

export const OptimizedDashboard = ({ onViewChange, psychologistId, psychologistName, planType }: OptimizedDashboardProps) => {
  const { todayAppointments, activePatients, unreadMessages, statsLoading, psychologistName: statsName, planType: statsPlan } = useUnifiedDashboardStats(psychologistId);

  // Use fallback values from props if stats haven't loaded yet, with proper cleaning
  const displayName = (statsName || psychologistName || 'Profesional').trim();
  const displayPlan = statsPlan || planType || 'plus';

  const quickActions = [
    {
      title: "Gestionar Pacientes",
      description: "Ver y organizar pacientes",
      icon: Users,
      action: () => onViewChange("patients"),
      color: "bg-blue-500"
    },
    {
      title: "Ver Calendario",
      description: "Revisar citas programadas",
      icon: Calendar,
      action: () => onViewChange("calendar"),
      color: "bg-emerald-500"
    },
    {
      title: "Mensajes",
      description: "Comunicación con pacientes",
      icon: MessageSquare,
      action: () => onViewChange("messages"),
      color: "bg-purple-500"
    },
    {
      title: "Configurar Tarifas",
      description: "Gestionar precios por consulta",
      icon: DollarSign,
      action: () => onViewChange("rates"),
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Dashboard Profesional
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Bienvenido, {displayName}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {displayPlan && <PlanBadge />}
          <TrialStatus />
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Pacientes Activos</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {statsLoading ? "..." : activePatients}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Citas de Hoy</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {statsLoading ? "..." : todayAppointments}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Mensajes No Leídos</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {statsLoading ? "..." : unreadMessages}
                </p>
                {unreadMessages > 0 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Requieren atención
                  </Badge>
                )}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Tasa de Respuesta</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">95%</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Promedio semanal
                </Badge>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left flex flex-col items-start gap-3 hover:bg-slate-50 min-h-[80px] sm:min-h-[100px]"
                onClick={action.action}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-800 text-sm sm:text-base">{action.title}</p>
                  <p className="text-xs sm:text-sm text-slate-600">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Requests */}
      <AppointmentRequests isDashboardView={true} />

      {/* Upcoming Appointments */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-slate-500">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">No tienes citas programadas próximamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
