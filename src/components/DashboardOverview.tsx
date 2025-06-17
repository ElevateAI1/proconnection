import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Users, Bell, Activity, DollarSign, TrendingUp, Clock, Target, UserCheck } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useUnifiedDashboardStats } from "@/hooks/useUnifiedDashboardStats";
import { useProfile } from "@/hooks/useProfile";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  bgColor?: string;
  textColor?: string;
}
const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  bgColor = "bg-slate-50",
  textColor = "text-slate-800"
}: StatCardProps) => <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
        </div>
        {trend && <div className="text-right">
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          </div>}
      </div>
    </CardContent>
  </Card>;
export const DashboardOverview = () => {
  const {
    psychologist,
    patient,
    profile
  } = useProfile();
  const {
    todayAppointments,
    activePatients,
    unreadMessages,
    loading: statsLoading
  } = useDashboardStats();
  const unifiedStats = useUnifiedDashboardStats(psychologist?.id);
  const {
    receipts
  } = usePaymentReceipts(psychologist?.id);

  // Calculate additional metrics
  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;
  const approvedReceipts = receipts.filter(r => r.validation_status === 'approved').length;
  const monthlyIncome = receipts.filter(r => {
    const receiptDate = new Date(r.receipt_date || r.created_at);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear && r.validation_status === 'approved';
  }).reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

  // Calculate trial/subscription status
  const getSubscriptionStatus = () => {
    if (!psychologist) return {
      status: 'Cargando...',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100'
    };
    const now = new Date();
    const trialEnd = psychologist.trial_end_date ? new Date(psychologist.trial_end_date) : null;
    const subEnd = psychologist.subscription_end_date ? new Date(psychologist.subscription_end_date) : null;
    if (psychologist.subscription_status === 'trial') {
      if (trialEnd && trialEnd > now) {
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          status: `Trial: ${daysLeft} días restantes`,
          color: 'text-orange-700',
          bgColor: 'bg-orange-100'
        };
      } else {
        return {
          status: 'Trial expirado',
          color: 'text-red-700',
          bgColor: 'bg-red-100'
        };
      }
    } else if (psychologist.subscription_status === 'active') {
      return {
        status: 'Suscripción activa',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      };
    } else {
      return {
        status: 'Suscripción inactiva',
        color: 'text-red-700',
        bgColor: 'bg-red-100'
      };
    }
  };
  const subscriptionInfo = getSubscriptionStatus();
  if (profile?.user_type === 'psychologist') {
    return <div className="space-y-6">
        {/* Header con información del profesional */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              ¡Bienvenido, {unifiedStats.psychologistName || 'Profesional'}!
            </h1>
            <p className="text-slate-600 mt-1">Resumen de tu actividad profesional</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm font-medium bg-sky-400">
              Plan {(unifiedStats.planType || psychologist?.plan_type || 'Plus').toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={`text-sm ${subscriptionInfo.color} ${subscriptionInfo.bgColor} border-0`}>
              {subscriptionInfo.status}
            </Badge>
          </div>
        </div>

        {/* Grid de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Citas de hoy" value={unifiedStats.statsLoading ? "..." : todayAppointments} icon={<Calendar className="w-6 h-6 text-blue-600" />} description="Programadas para hoy" bgColor="bg-blue-100" textColor="text-blue-800" />
          
          <StatCard title="Pacientes activos" value={unifiedStats.statsLoading ? "..." : activePatients} icon={<Users className="w-6 h-6 text-emerald-600" />} description="En seguimiento" bgColor="bg-emerald-100" textColor="text-emerald-800" />
          
          <StatCard title="Mensajes sin leer" value={unifiedStats.statsLoading ? "..." : unreadMessages} icon={<MessageSquare className="w-6 h-6 text-purple-600" />} description="Requieren atención" bgColor="bg-purple-100" textColor="text-purple-800" />
          
          <StatCard title="Ingresos del mes" value={`$${monthlyIncome.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-green-600" />} description="Comprobantes aprobados" bgColor="bg-green-100" textColor="text-green-800" />
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Comprobantes pendientes" value={pendingReceipts} icon={<Clock className="w-6 h-6 text-orange-600" />} description="Esperando validación" bgColor="bg-orange-100" textColor="text-orange-800" />
          
          <StatCard title="Comprobantes aprobados" value={approvedReceipts} icon={<UserCheck className="w-6 h-6 text-green-600" />} description="Este mes" bgColor="bg-green-100" textColor="text-green-800" />
          
          <StatCard title="Referidos totales" value={(psychologist as any)?.total_referrals || 0} icon={<Target className="w-6 h-6 text-indigo-600" />} description="Sistema de afiliados" bgColor="bg-indigo-100" textColor="text-indigo-800" />
        </div>

        {/* Sección de actividad reciente */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unifiedStats.statsLoading ? <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-slate-600">Cargando estado...</span>
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 mb-3">Actividad de hoy</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-700">Citas programadas</span>
                      </div>
                      <span className="font-semibold text-slate-800">{todayAppointments}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-slate-700">Mensajes nuevos</span>
                      </div>
                      <span className="font-semibold text-slate-800">{unreadMessages}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 mb-3">Gestión financiera</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-slate-700">Comprobantes pendientes</span>
                      </div>
                      <span className="font-semibold text-slate-800">{pendingReceipts}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Ganancias afiliados</span>
                      </div>
                      <span className="font-semibold text-slate-800">
                        ${((psychologist as any)?.affiliate_earnings || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>}
            </div>
          </CardContent>
        </Card>
      </div>;
  }

  // Patient view - simplified
  return <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Bell className="w-5 h-5" />
          Tu Resumen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Bienvenido, {patient?.first_name}</h3>
            <p className="text-slate-600 text-sm">Tu espacio personal de consultas psicológicas</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700">Próxima cita</span>
              </div>
              <span className="text-sm font-medium text-slate-800">Pendiente</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Mensajes</span>
              </div>
              <span className="text-sm font-medium text-slate-800">2 nuevos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};