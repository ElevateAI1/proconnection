import { cn } from "@/lib/utils";
import { Calendar, MessageCircle, Users, BarChart3, Settings, Home, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsModal } from "@/components/SettingsModal";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "patients" | "calendar" | "messages") => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "calendar", label: "Calendario", icon: Calendar },
    { id: "messages", label: "Mensajes", icon: MessageCircle },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Logging out user');
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-slate-200 z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Dr. María González</h2>
              <p className="text-sm text-slate-600">Psicóloga Clínica</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  currentView === item.id
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <Home size={20} />
            <span className="font-medium">Inicio</span>
          </Link>
          
          <button 
            onClick={handleSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </button>

          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={20} />
            <span className="font-medium">
              {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};
