import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClinicTeam } from "@/hooks/useClinicTeam";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Plus,
  Eye,
  TrendingUp,
  UserCheck,
  CalendarCheck,
  Bell
} from "lucide-react";
import { useUnifiedDashboardStats } from "@/hooks/useUnifiedDashboardStats";
import { useProfile } from "@/hooks/useProfile";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { usePendingAppointmentRequests } from "@/hooks/usePendingAppointmentRequests";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatDateArgentina, dateFormatOptions } from "@/utils/dateFormatting";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  onClick: () => void;
  variant?: "default" | "urgent" | "success";
}

const QuickAction = ({ icon, title, description, count, onClick, variant = "default" }: QuickActionProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "urgent":
        return "border-peach-pale/50 bg-white-warm/90 backdrop-blur-md hover:bg-white-warm shadow-lg shadow-peach-pale/20";
      case "success":
        return "border-green-mint/50 bg-white-warm/90 backdrop-blur-md hover:bg-white-warm shadow-lg shadow-green-mint/20";
      default:
        return "border-celeste-gray/50 bg-white-warm/90 backdrop-blur-md hover:bg-white-warm shadow-lg shadow-blue-soft/10";
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border rounded-2xl ${getVariantStyles()}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-2xl flex items-center justify-center shadow-lg shadow-blue-soft/30">
              <div className="text-white">
                {icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-petrol text-base mb-1">{title}</h3>
              <p className="text-sm text-blue-petrol/70">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {count !== undefined && count > 0 && (
              <Badge className="text-sm font-semibold px-4 py-1.5 bg-blue-soft text-white border-0 shadow-md rounded-full">
                {count}
              </Badge>
            )}
            <div className="w-10 h-10 bg-gray-light/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-celeste-gray/50 hover:scale-110 hover:shadow-lg transition-all duration-300 group">
              <ChevronRight className="w-5 h-5 text-blue-petrol group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon, trend, color = "warm", onClick }: StatCardProps) => {
  const getColorStyles = () => {
    switch (color) {
      case "emerald":
        return "text-blue-petrol bg-green-mint/30 backdrop-blur-sm";
      case "amber":
        return "text-blue-petrol bg-peach-pale/30 backdrop-blur-sm";
      case "stone":
        return "text-blue-petrol bg-celeste-gray/30 backdrop-blur-sm";
      case "warm":
      default:
        return "text-blue-petrol bg-blue-soft/30 backdrop-blur-sm";
    }
  };

  return (
    <Card 
      className={`border border-celeste-gray/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white-warm/90 backdrop-blur-md rounded-2xl ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-petrol/70 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-blue-petrol">{value}</p>
            {trend && (
              <p className="text-xs text-blue-petrol/60 font-medium">{trend}</p>
            )}
          </div>
          <div className={`w-16 h-16 ${getColorStyles()} rounded-2xl flex items-center justify-center shadow-lg`}>
            <div className="text-2xl text-blue-petrol">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MinimalistDashboardProps {
  onNavigate?: (view: string) => void;
}

export const MinimalistDashboard = ({ onNavigate }: MinimalistDashboardProps) => {
  const { psychologist } = useProfile();
  
  // Memoizar psychologistInfo para evitar recrearlo en cada render
  const psychologistInfo = useMemo(() => {
    if (!psychologist) return undefined;
    return {
      first_name: psychologist.first_name,
      last_name: psychologist.last_name,
      plan_type: psychologist.plan_type,
      subscription_status: psychologist.subscription_status
    };
  }, [psychologist?.first_name, psychologist?.last_name, psychologist?.plan_type, psychologist?.subscription_status]);

  const unifiedStats = useUnifiedDashboardStats(psychologist?.id, psychologistInfo);
  const { receipts } = usePaymentReceipts(psychologist?.id);
  const { pendingCount } = usePendingAppointmentRequests(psychologist?.id);
  const { todayAppointments, activePatients } = useDashboardStats();
  const { clinicTeam, loading: clinicLoading } = useClinicTeam();
  const [dashboardView, setDashboardView] = useState<'personal' | 'clinic'>('personal');
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Calculate financial metrics
  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;
  const approvedReceipts = receipts.filter(r => r.validation_status === 'approved').length;
  const monthlyIncome = receipts.filter(r => {
    const receiptDate = new Date(r.receipt_date || r.created_at);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return receiptDate.getMonth() === currentMonth && 
           receiptDate.getFullYear() === currentYear && 
           r.validation_status === 'approved';
  }).reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getSubscriptionStatus = () => {
    if (!psychologist) return { status: 'Cargando...', color: 'text-stone-600' };
    
    const now = new Date();
    const trialEnd = psychologist.trial_end_date ? new Date(psychologist.trial_end_date) : null;
    
    if (psychologist.subscription_status === 'trial' && trialEnd && trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: `${daysLeft} días de trial`,
        color: 'text-amber-600'
      };
    } else if (psychologist.subscription_status === 'active') {
      return {
        status: 'Suscripción activa',
        color: 'text-emerald-600'
      };
    } else {
      return {
        status: 'Suscripción inactiva',
        color: 'text-red-600'
      };
    }
  };

  const subscriptionInfo = getSubscriptionStatus();

  const formatPlanType = (planType?: string | null) => {
    if (!planType) return 'STARTER';
    const plan = planType.toLowerCase();
    if (plan === 'proconnection') return 'PROCONNECTION';
    if (plan === 'clinicas') return 'CLÍNICAS';
    if (plan === 'teams') return 'CLÍNICAS'; // Deprecated
    if (plan === 'dev') return 'DEV';
    return 'STARTER';
  };

  const isClinicAdmin = clinicTeam?.is_admin || false;
  const showClinicView = isClinicAdmin && !clinicLoading;

  const renderPersonalDashboard = () => (
    <>
      {/* Header neogolpista */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-blue-petrol">{getGreeting()}, </span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-soft via-celeste-gray to-blue-soft bg-clip-text text-transparent">
                  {unifiedStats.psychologistName || 'Profesional'}
                </span>
              </span>
            </h1>
            <p className="text-blue-petrol/70 text-lg sm:text-xl font-medium">
              {formatDateArgentina(new Date(), { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="text-sm px-5 py-2.5 bg-blue-soft/15 backdrop-blur-sm border border-blue-soft/30 text-blue-petrol font-semibold rounded-full shadow-sm">
              {formatPlanType(unifiedStats.planType || psychologist?.plan_type)}
            </Badge>
            <Badge 
              className={`text-sm px-5 py-2.5 font-semibold rounded-full backdrop-blur-sm border cursor-pointer transition-all hover:scale-105 ${
                subscriptionInfo.color.includes('emerald') 
                  ? 'bg-green-mint/20 border-green-mint/40 text-blue-petrol' 
                  : subscriptionInfo.color.includes('amber') 
                  ? 'bg-peach-pale/20 border-peach-pale/40 text-blue-petrol' 
                  : 'bg-celeste-gray/20 border-celeste-gray/40 text-blue-petrol hover:bg-red-50 hover:border-red-200'
              }`}
              onClick={() => {
                if (subscriptionInfo.status === 'Suscripción inactiva') {
                  setShowPlansModal(true);
                }
              }}
            >
              {subscriptionInfo.status}
            </Badge>
          </div>
        </div>

      {/* Acciones rápidas - Tareas de HOY */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-soft via-celeste-gray to-green-mint rounded-full shadow-lg shadow-blue-soft/30"></div>
          <h2 className="text-3xl font-bold text-blue-petrol tracking-tight">Tareas de hoy</h2>
          <Badge className="text-sm px-4 py-1.5 bg-peach-pale/20 backdrop-blur-sm border border-peach-pale/40 text-blue-petrol font-semibold rounded-full">
            {todayAppointments + pendingCount} pendientes
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Citas de hoy"
            description={`${todayAppointments} programadas`}
            count={todayAppointments}
            onClick={() => onNavigate?.('calendar')}
            variant={todayAppointments > 0 ? "default" : "success"}
          />
          
          <QuickAction
            icon={<CalendarCheck className="w-6 h-6" />}
            title="Solicitudes de cita"
            description="Esperando aprobación"
            count={pendingCount}
            onClick={() => onNavigate?.('appointment-requests')}
            variant={pendingCount > 0 ? "urgent" : "success"}
          />
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-gradient-to-b from-green-mint via-blue-soft to-celeste-gray rounded-full shadow-lg shadow-green-mint/30"></div>
          <h2 className="text-3xl font-bold text-blue-petrol tracking-tight">Resumen general</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pacientes activos"
            value={activePatients}
            icon={<Users className="w-8 h-8" />}
            color="emerald"
            onClick={() => onNavigate?.('patients')}
          />
          
          <StatCard
            title="Ingresos del mes"
            value={`$${monthlyIncome.toLocaleString()}`}
            icon={<DollarSign className="w-8 h-8" />}
            color="warm"
            trend="Comprobantes aprobados"
            onClick={() => onNavigate?.('accounting')}
          />
          
          <StatCard
            title="Comprobantes pendientes"
            value={pendingReceipts}
            icon={<Clock className="w-8 h-8" />}
            color="amber"
            onClick={() => onNavigate?.('accounting')}
          />
          
          <StatCard
            title="Comprobantes aprobados"
            value={approvedReceipts}
            icon={<CheckCircle className="w-8 h-8" />}
            color="emerald"
            onClick={() => onNavigate?.('accounting')}
          />
        </div>
      </div>

      {/* Acciones secundarias */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-gradient-to-b from-lavender-soft via-blue-soft to-celeste-gray rounded-full shadow-lg shadow-lavender-soft/30"></div>
          <h2 className="text-3xl font-bold text-blue-petrol tracking-tight">Gestión rápida</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAction
            icon={<Plus className="w-6 h-6" />}
            title="Nuevo paciente"
            description="Agregar paciente"
            onClick={() => onNavigate?.('patients')}
          />
          
          <QuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Programar cita"
            description="Crear nueva cita"
            onClick={() => onNavigate?.('calendar')}
          />
          
          <QuickAction
            icon={<Eye className="w-6 h-6" />}
            title="Ver pacientes"
            description="Lista completa"
            onClick={() => onNavigate?.('patients')}
          />
          
          <QuickAction
            icon={<TrendingUp className="w-6 h-6" />}
            title="Reportes"
            description="Análisis y estadísticas"
            onClick={() => onNavigate?.('reports')}
          />
        </div>
      </div>

        {/* Estado del sistema - Solo si hay información importante */}
        {(pendingReceipts > 0 || pendingCount > 0) && (
          <Card className="border border-peach-pale/50 shadow-xl bg-white-warm/90 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-4 text-blue-petrol text-xl font-bold">
                <div className="w-12 h-12 bg-gradient-to-br from-peach-pale to-sand-light rounded-2xl flex items-center justify-center shadow-lg shadow-peach-pale/30">
                  <AlertCircle className="w-7 h-7 text-blue-petrol" />
                </div>
                Atención requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {pendingCount > 0 && (
                  <div 
                    className="flex items-center justify-between p-5 bg-white-warm backdrop-blur-sm rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-peach-pale/30"
                    onClick={() => onNavigate?.('appointment-requests')}
                  >
                    <span className="text-blue-petrol font-semibold text-base">Solicitudes de cita pendientes</span>
                    <Badge className="bg-peach-pale text-blue-petrol border-0 px-4 py-1.5 font-semibold rounded-full shadow-md">
                      {pendingCount}
                    </Badge>
                  </div>
                )}
                {pendingReceipts > 0 && (
                  <div 
                    className="flex items-center justify-between p-5 bg-white-warm backdrop-blur-sm rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-peach-pale/30"
                    onClick={() => onNavigate?.('accounting')}
                  >
                    <span className="text-blue-petrol font-semibold text-base">Comprobantes pendientes</span>
                    <Badge className="bg-peach-pale text-blue-petrol border-0 px-4 py-1.5 font-semibold rounded-full shadow-md">
                      {pendingReceipts}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </>
  );

  const renderClinicView = () => {
    if (!clinicTeam) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vista Clínica - {clinicTeam.team_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Esta vista muestra métricas consolidadas de todo el equipo. 
              Para gestionar miembros y ver reportes detallados, ve a "Administración de Clínica" en el menú.
            </p>
            <Button onClick={() => onNavigate?.('clinic-admin')}>
              Ir a Administración de Clínica
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {/* Elementos flotantes de fondo */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-soft/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-green-mint/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-lavender-soft/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <div className="space-y-10 p-6 sm:p-8 lg:p-12 relative z-10">
        {showClinicView ? (
          <Tabs value={dashboardView} onValueChange={(v) => setDashboardView(v as 'personal' | 'clinic')} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="personal">Mi Consultorio</TabsTrigger>
              <TabsTrigger value="clinic">Vista Clínica</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-10">
              {renderPersonalDashboard()}
            </TabsContent>
            <TabsContent value="clinic" className="space-y-10">
              {renderClinicView()}
            </TabsContent>
          </Tabs>
        ) : (
          renderPersonalDashboard()
          )}
      </div>
      <SubscriptionModal open={showPlansModal} onOpenChange={setShowPlansModal} />
    </div>
  );
};
