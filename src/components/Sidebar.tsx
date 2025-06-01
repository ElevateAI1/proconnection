

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { usePlanCapabilities } from "@/hooks/usePlanCapabilities";
import { ProfessionalCodeDisplay } from "./ProfessionalCodeDisplay";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { psychologist } = useProfile();
  const { capabilities, loading } = usePlanCapabilities();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-lg z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">PsicoManager</h2>
              <p className="text-xs text-slate-600">Panel Profesional</p>
            </div>
          </div>
        </div>

        {/* Professional Code */}
        {psychologist?.professional_code && (
          <div className="p-4 border-b border-slate-200">
            <ProfessionalCodeDisplay code={psychologist.professional_code} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    currentView === item.id 
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white" 
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => onViewChange(item.id)}
                  disabled={!item.available}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Advanced Features */}
            <div className="pt-6 mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-100 mb-3 font-medium"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-sm">Funciones Avanzadas</span>
              </Button>
              
              {showAdvanced && (
                <div className="space-y-2 pl-2">
                  {advancedItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 relative py-3 ${
                        currentView === item.id 
                          ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white" 
                          : item.available 
                            ? "text-slate-700 hover:bg-slate-50" 
                            : "text-slate-400 hover:bg-slate-50"
                      } ${!item.available ? "cursor-not-allowed" : ""}`}
                      onClick={() => onViewChange(item.id)}
                      disabled={!item.available}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                      {item.isPro && !item.available && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-1.5 py-0.5 border-amber-200 text-amber-700 bg-amber-50 font-medium"
                        >
                          PRO
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-slate-800">
              {psychologist?.first_name} {psychologist?.last_name}
            </p>
            <p className="text-xs text-slate-600">Psicólogo Profesional</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

