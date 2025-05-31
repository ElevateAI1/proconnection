
import { useState } from "react";
import { LogOut, Calendar, Users, MessageCircle, DollarSign, Settings, Crown, Zap, BarChart3, Headphones, Rocket, Eye, TrendingUp, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePlanCapabilities } from "@/hooks/usePlanCapabilities";
import { SettingsModal } from "@/components/SettingsModal";
import { PlanBadge } from "@/components/PlanBadge";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { signOut } = useAuth();
  const { psychologist } = useProfile();
  const { isPlusUser, isProUser } = usePlanCapabilities();
  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { 
      id: "dashboard" as ViewType, 
      label: "Dashboard", 
      icon: Home,
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
      icon: MessageCircle,
      available: true
    },
    { 
      id: "affiliates" as ViewType, 
      label: "Afiliados", 
      icon: DollarSign,
      available: true
    },
  ];

  const proMenuItems = [
    { 
      id: "seo" as ViewType, 
      label: "Perfil SEO", 
      icon: TrendingUp,
      available: isProUser()
    },
    { 
      id: "reports" as ViewType, 
      label: "Reportes", 
      icon: BarChart3,
      available: isProUser()
    },
    { 
      id: "support" as ViewType, 
      label: "Soporte", 
      icon: Headphones,
      available: isProUser()
    },
    { 
      id: "early-access" as ViewType, 
      label: "Acceso Anticipado", 
      icon: Rocket,
      available: isProUser()
    },
    { 
      id: "visibility" as ViewType, 
      label: "Consultoría", 
      icon: Eye,
      available: isProUser()
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
            {psychologist?.first_name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800 truncate">
              Dr. {psychologist?.first_name}
            </h2>
            <p className="text-sm text-slate-500 truncate">
              {psychologist?.professional_code}
            </p>
          </div>
        </div>
        <PlanBadge />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Principal
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pro Features */}
        {isProUser() && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Crown className="w-3 h-3 text-purple-500" />
              Pro Features
            </h3>
            {proMenuItems.map((item) => {
              if (!item.available) return null;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-slate-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="w-full justify-start"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      {showSettings && (
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};
