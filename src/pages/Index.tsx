
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAdmin } from "@/hooks/useAdmin";
import { AuthPage } from "@/components/AuthPage";
import { ProfileSetup } from "@/components/ProfileSetup";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { AdminPanel } from "@/components/AdminPanel";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { MessagingHub } from "@/components/MessagingHub";
import { PatientPortal } from "@/components/PatientPortal";
import { supabase } from "@/integrations/supabase/client";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "portal" | "admin";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading } = useProfile();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [checkingTrial, setCheckingTrial] = useState(false);

  // Check trial status for psychologists
  useEffect(() => {
    if (psychologist && profile?.user_type === 'psychologist') {
      checkTrialStatus();
    }
  }, [psychologist, profile]);

  // Set admin view if user is admin
  useEffect(() => {
    if (isAdmin && currentView === "dashboard") {
      setCurrentView("admin");
    }
  }, [isAdmin, currentView]);

  const checkTrialStatus = async () => {
    if (!psychologist) return;

    setCheckingTrial(true);
    try {
      const { data: expired, error } = await supabase
        .rpc('is_trial_expired', { psychologist_id: psychologist.id });

      if (error) {
        console.error('Error checking trial status:', error);
      } else {
        setIsTrialExpired(expired || false);
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    } finally {
      setCheckingTrial(false);
    }
  };

  const handleUpgrade = () => {
    // Aquí iría la lógica para redirigir al sistema de pagos
    console.log('Redirecting to payment system...');
    // Por ahora, solo mostramos un alert
    alert('Redirección al sistema de pagos (función pendiente de implementar)');
  };

  // Show loading while checking authentication and profile
  if (authLoading || profileLoading || checkingTrial || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user || !profile) {
    return <AuthPage />;
  }

  // Show admin panel if user is admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                PsiConnect - Admin
              </h1>
              <p className="text-slate-600 text-sm">Panel de Administración</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  Administrador
                </p>
                <p className="text-xs text-slate-500">{profile.email}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          <AdminPanel />
        </div>
      </div>
    );
  }

  // Show profile setup if user hasn't completed their profile
  const needsProfileSetup = profile.user_type === 'psychologist' ? !psychologist : !patient;
  
  if (needsProfileSetup) {
    return (
      <ProfileSetup 
        userType={profile.user_type} 
        onComplete={() => window.location.reload()} 
      />
    );
  }

  const renderContent = () => {
    if (profile.user_type === "patient") {
      return <PatientPortal />;
    }

    // Bloquear acceso si el trial ha expirado
    if (isTrialExpired) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Acceso Restringido</h2>
            <p className="text-slate-600">Tu período de prueba ha expirado. Activa tu suscripción para continuar.</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "patients":
        return <PatientManagement />;
      case "calendar":
        return <Calendar />;
      case "messages":
        return <MessagingHub />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Modal de trial expirado para psicólogos */}
      {profile.user_type === "psychologist" && isTrialExpired && (
        <TrialExpiredModal onUpgrade={handleUpgrade} />
      )}

      {profile.user_type === "psychologist" && (
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      )}
      
      <main className={`flex-1 ${profile.user_type === "psychologist" ? "ml-64" : ""}`}>
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                PsiConnect
              </h1>
              <p className="text-slate-600 text-sm">
                {profile.user_type === "psychologist" ? "Plataforma de Gestión Profesional" : "Portal del Paciente"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {profile.user_type === "psychologist" 
                    ? `Dr. ${psychologist?.first_name} ${psychologist?.last_name}`
                    : `${patient?.first_name} ${patient?.last_name}`
                  }
                </p>
                <p className="text-xs text-slate-500">
                  {profile.user_type === "psychologist" ? "Psicólogo" : "Paciente"}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                {profile.user_type === "psychologist" ? "Dr" : "P"}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
