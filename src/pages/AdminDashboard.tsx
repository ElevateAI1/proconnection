
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Users, Database, Settings, Activity, UserPlus } from 'lucide-react';
import { AdminPanel } from '@/components/AdminPanel';
import { AffiliateAdminPanel } from '@/components/AffiliateAdminPanel';

type AdminSection = 'users' | 'affiliates' | 'database' | 'statistics' | 'settings';

export const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const navigationItems = [
    {
      id: 'users' as AdminSection,
      label: 'Gestión de Usuarios',
      icon: Users,
      isActive: activeSection === 'users'
    },
    {
      id: 'affiliates' as AdminSection,
      label: 'Sistema de Afiliados',
      icon: UserPlus,
      isActive: activeSection === 'affiliates'
    },
    {
      id: 'database' as AdminSection,
      label: 'Base de Datos',
      icon: Database,
      isActive: activeSection === 'database'
    },
    {
      id: 'statistics' as AdminSection,
      label: 'Estadísticas',
      icon: Activity,
      isActive: activeSection === 'statistics'
    },
    {
      id: 'settings' as AdminSection,
      label: 'Configuración',
      icon: Settings,
      isActive: activeSection === 'settings'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <AdminPanel />;
      case 'affiliates':
        return <AffiliateAdminPanel />;
      case 'database':
        return (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Sección de Base de Datos - Próximamente</p>
          </div>
        );
      case 'statistics':
        return (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Sección de Estadísticas - Próximamente</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Sección de Configuración - Próximamente</p>
          </div>
        );
      default:
        return <AdminPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header de Administración */}
      <header className="bg-white shadow-lg border-b border-purple-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ProConnection Admin
                </h1>
                <p className="text-gray-600 text-sm">Sistema de Administración Central</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  Administrador del Sistema
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-purple-200 hover:bg-purple-50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación secundaria */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex gap-6">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 pb-3 ${
                  item.isActive
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className={item.isActive ? 'font-medium' : ''}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};
