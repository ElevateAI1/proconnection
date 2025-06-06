
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  UserPlus, 
  Search, 
  BarChart3, 
  HeadphonesIcon, 
  Zap, 
  Eye, 
  DollarSign, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { usePlanCapabilities } from "@/hooks/usePlanCapabilities";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates" | "accounting";

interface AppSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { psychologist } = useProfile();
  const { capabilities } = usePlanCapabilities();
  const { receipts } = usePaymentReceipts(psychologist?.id);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;

  const menuItems = [
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
      id: "calendar" as ViewType,
      label: "Calendario",
      icon: Calendar,
      available: true
    },
    {
      id: "messages" as ViewType,
      label: "Mensajes",
      icon: MessageSquare,
      available: true
    },
    {
      id: "accounting" as ViewType,
      label: "Sistema Contable",
      icon: Calculator,
      available: true,
      badge: pendingReceipts > 0 ? pendingReceipts.toString() : undefined
    },
    {
      id: "rates" as ViewType,
      label: "Tarifas",
      icon: DollarSign,
      available: true,
      badge: "Nuevo"
    }
  ];

  const advancedItems = [
    {
      id: "affiliates" as ViewType,
      label: "Sistema de Afiliados",
      icon: UserPlus,
      available: true
    },
    {
      id: "seo" as ViewType,
      label: "Perfil SEO",
      icon: Search,
      available: capabilities?.seo_profile || false,
      isPro: true
    },
    {
      id: "reports" as ViewType,
      label: "Reportes Avanzados",
      icon: BarChart3,
      available: capabilities?.advanced_reports || false,
      isPro: true
    },
    {
      id: "support" as ViewType,
      label: "Soporte Prioritario",
      icon: HeadphonesIcon,
      available: capabilities?.priority_support || false,
      isPro: true
    },
    {
      id: "early-access" as ViewType,
      label: "Acceso Anticipado",
      icon: Zap,
      available: capabilities?.early_access || false,
      isPro: true
    },
    {
      id: "visibility" as ViewType,
      label: "Consultoría de Visibilidad",
      icon: Eye,
      available: capabilities?.visibility_consulting || false,
      isPro: true
    }
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-slate-800">ProConnection</h2>
            <p className="text-xs text-slate-600">Panel Profesional</p>
          </div>
        </div>
        
        {psychologist?.professional_code && (
          <div className="px-4 group-data-[collapsible=icon]:hidden">
            <ProfessionalCodeDisplay code={psychologist.professional_code} />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={currentView === item.id}
                    disabled={!item.available}
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                Funciones Avanzadas
                {showAdvanced ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {advancedItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onViewChange(item.id)}
                        isActive={currentView === item.id}
                        disabled={!item.available}
                        className="w-full"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.isPro && !item.available && (
                          <Badge variant="outline" className="ml-auto text-xs border-amber-200 text-amber-700 bg-amber-50">
                            PRO
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-1 px-2 py-2 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-slate-800">
                {psychologist?.first_name} {psychologist?.last_name}
              </p>
              <p className="text-xs text-slate-600">Psicólogo Profesional</p>
            </div>
            <SidebarMenuButton onClick={handleLogout} className="w-full text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
