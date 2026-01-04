import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Calculator,
  CalendarCheck,
  Bell,
  BarChart3,
  UserPlus,
  Search,
  Eye,
  Zap,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { usePlanCapabilities } from "@/hooks/usePlanCapabilities";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { usePendingAppointmentRequests } from "@/hooks/usePendingAppointmentRequests";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ViewType = "dashboard" | "patients" | "calendar" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates" | "accounting" | "documents" | "appointment-requests" | "notifications" | "reminder-settings" | "advanced-reminder-settings" | "notification-dashboard" | "clinic-admin" | "clinic-reports" | "api-integrations" | "messages";

interface MinimalistSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function MinimalistSidebar({ currentView, onViewChange }: MinimalistSidebarProps) {
  const { psychologist } = useProfile();
  const { capabilities } = usePlanCapabilities();
  const { receipts } = usePaymentReceipts(psychologist?.id);
  const { pendingCount } = usePendingAppointmentRequests(psychologist?.id);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;

  // Determinar el plan actual del usuario y funciones helper
  const currentPlan = psychologist?.plan_type?.toLowerCase() || 'starter';
  const hasTierOrHigher = (requiredTier: string) => {
    // DEV tiene acceso a todo
    if (currentPlan === 'dev') return true;
    
    const normalizedTier = requiredTier === 'teams' ? 'clinicas' : requiredTier;
    const normalizedPlan = currentPlan === 'teams' ? 'clinicas' : currentPlan;
    
    const tierOrder = ['starter', 'proconnection', 'clinicas'];
    const currentIndex = tierOrder.indexOf(normalizedPlan);
    const requiredIndex = tierOrder.indexOf(normalizedTier.toLowerCase());
    return currentIndex >= requiredIndex;
  };
  
  const hasProConnection = hasTierOrHigher('proconnection');
  const hasClinicas = capabilities?.team_features || false;
  const isClinicAdmin = capabilities?.is_clinic_admin || false;

  // Navegación principal - Solo las funciones más importantes
  const mainMenuItems = [
    {
      id: "dashboard" as ViewType,
      label: "Dashboard",
      icon: LayoutDashboard,
      available: true
    },
    {
      id: "patients" as ViewType,
      label: "Pacientes",
      icon: Users,
      available: true
    },
    {
      id: "appointment-requests" as ViewType,
      label: "Solicitudes",
      icon: CalendarCheck,
      available: true,
      badge: pendingCount > 0 ? pendingCount.toString() : undefined
    },
    {
      id: "messages" as ViewType,
      label: "Mensajes",
      icon: MessageSquare,
      available: true
    },
    {
      id: "calendar" as ViewType,
      label: "Calendario",
      icon: Calendar,
      available: true
    },
    {
      id: "accounting" as ViewType,
      label: "Finanzas",
      icon: DollarSign,
      available: hasTierOrHigher('proconnection'),
      badge: pendingReceipts > 0 ? pendingReceipts.toString() : undefined,
      requiredPlan: 'proconnection'
    }
  ];

  // Funciones avanzadas - Agrupadas y colapsables
  const advancedItems = [
    {
      id: "documents" as ViewType,
      label: "Documentos",
      icon: FileText,
      available: true,
      requiredPlan: 'starter' // Todos tienen acceso
    },
    {
      id: "rates" as ViewType,
      label: "Tarifas",
      icon: DollarSign,
      available: true,
      requiredPlan: 'starter' // Todos tienen acceso
    },
    {
      id: "notifications" as ViewType,
      label: "Notificaciones",
      icon: Bell,
      available: true,
      requiredPlan: 'starter' // Todos tienen acceso
    },
    {
      id: "affiliates" as ViewType,
      label: "Afiliados",
      icon: UserPlus,
      available: true,
      requiredPlan: 'starter' // Todos tienen acceso
    },
    {
      id: "seo" as ViewType,
      label: "Perfil SEO",
      icon: Search,
      available: capabilities?.seo_profile || false,
      requiredPlan: 'proconnection' // Requiere ProConnection o superior
    },
    {
      id: "reports" as ViewType,
      label: "Reportes",
      icon: BarChart3,
      available: capabilities?.advanced_reports || false,
      requiredPlan: 'proconnection' // Requiere ProConnection o superior
    },
    {
      id: "support" as ViewType,
      label: "Soporte",
      icon: Settings,
      available: capabilities?.priority_support || false,
      requiredPlan: 'proconnection' // Requiere ProConnection o superior
    },
    {
      id: "early-access" as ViewType,
      label: "Early Access",
      icon: Zap,
      available: capabilities?.early_access || false,
      requiredPlan: 'clinicas' // Requiere Clínicas
    },
    {
      id: "visibility" as ViewType,
      label: "Consultoría Visibilidad",
      icon: Eye,
      available: capabilities?.visibility_consulting || false,
      requiredPlan: 'clinicas' // Requiere Clínicas
    },
    {
      id: "clinic-admin" as ViewType,
      label: "Administración de Clínica",
      icon: Users,
      available: isClinicAdmin,
      requiredPlan: 'clinicas' // Solo para admins de clínica
    },
    {
      id: "clinic-reports" as ViewType,
      label: "Reportes de Clínica",
      icon: BarChart3,
      available: hasClinicas,
      requiredPlan: 'clinicas' // Requiere Clínicas
    },
    {
      id: "api-integrations" as ViewType,
      label: "Integraciones API",
      icon: Settings,
      available: capabilities?.api_integrations || false,
      requiredPlan: 'clinicas' // Requiere Clínicas
    }
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-xl">
      <SidebarHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="w-12 h-12">
            <img 
              src="/lovable-uploads/0adde073-8c94-4864-adb4-28526516f9da.png" 
              alt="ProConnection Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">ProConnection</h2>
            <p className="text-sm text-slate-600 font-medium">Panel Profesional</p>
          </div>
        </div>
        
        {psychologist?.professional_code && (
          <div className="px-4 pb-3 group-data-[collapsible=icon]:hidden">
            <ProfessionalCodeDisplay code={psychologist.professional_code} compact />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Navegación principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={currentView === item.id}
                    disabled={!item.available}
                    className={`w-full h-12 rounded-xl transition-all duration-200 group ${
                      currentView === item.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:shadow-md'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className={`ml-auto text-xs px-2 py-1 font-semibold ${
                        currentView === item.id 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-600 group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-amber-600'
                      }`}>
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Funciones avanzadas */}
        <SidebarGroup>
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors mb-3 px-2 py-2 rounded-lg hover:bg-slate-100">
                Más opciones
                {showAdvanced ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {advancedItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onViewChange(item.id)}
                        isActive={currentView === item.id}
                        disabled={!item.available}
                        className={`w-full h-11 rounded-xl transition-all duration-200 text-sm ${
                          currentView === item.id 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                            : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:shadow-md'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                        {item.requiredPlan === 'proconnection' && (
                          <Badge 
                            variant="outline" 
                            className={`ml-auto text-xs px-2 py-1 font-semibold ${
                              hasProConnection 
                                ? 'border-amber-200 text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50' 
                                : 'border-amber-300 text-amber-800 bg-gradient-to-r from-amber-100 to-orange-100'
                            }`}
                          >
                            PRO
                          </Badge>
                        )}
                        {item.requiredPlan === 'clinicas' && (
                          <Badge 
                            variant="outline" 
                            className={`ml-auto text-xs px-2 py-1 font-semibold ${
                              hasClinicas 
                                ? 'border-purple-200 text-purple-700 bg-gradient-to-r from-purple-50 to-indigo-50' 
                                : 'border-purple-300 text-purple-800 bg-gradient-to-r from-purple-100 to-indigo-100'
                            }`}
                          >
                            CLÍNICAS
                          </Badge>
                        )}
                        {item.requiredPlan === 'teams' && (
                          <Badge 
                            variant="outline" 
                            className={`ml-auto text-xs px-2 py-1 font-semibold ${
                              hasClinicas 
                                ? 'border-purple-200 text-purple-700 bg-gradient-to-r from-purple-50 to-indigo-50' 
                                : 'border-purple-300 text-purple-800 bg-gradient-to-r from-purple-100 to-indigo-100'
                            }`}
                          >
                            CLÍNICAS
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 px-3 py-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {psychologist?.first_name?.[0]}{psychologist?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {psychologist?.first_name} {psychologist?.last_name}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {psychologist?.profession_type || 'Profesional'}
                  </p>
                </div>
              </div>
            </div>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="w-full h-12 rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 hover:shadow-md"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
