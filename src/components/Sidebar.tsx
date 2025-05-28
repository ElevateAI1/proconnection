import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
  MessageSquare,
  Settings,
  Share2,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ProfessionalCodeDisplay } from './ProfessionalCodeDisplay';
import { TrialStatus } from './TrialStatus';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { signOut } = useAuth();
  const { psychologist } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'messaging', label: 'Mensajes', icon: MessageSquare },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'subscription', label: 'Suscripción', icon: CreditCard },
    { id: 'affiliates', label: 'Afiliados', icon: Share2 },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            PsiConnect
          </h1>
        </div>

        {/* Professional Code Display */}
        {psychologist && <ProfessionalCodeDisplay />}

        {/* Trial Status */}
        <TrialStatus />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
