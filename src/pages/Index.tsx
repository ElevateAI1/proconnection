
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { AuthPage } from "@/components/AuthPage";
import { ProfileSetup } from "@/components/ProfileSetup";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { MessagingHub } from "@/components/MessagingHub";
import { PatientPortal } from "@/components/PatientPortal";
import { AffiliateSystem } from "@/components/AffiliateSystem";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "portal" | "affiliates";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading, refetch } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [trialChecked, setTrialChecked] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle email verification from URL
  useEmailVerification();

  // Check trial status for psychologists only once
  useEffect(() => {
    if (psychologist && profile?.user_type === 'psychologist' && !trialChecked) {
      checkTrialStatus();
    }
  }, [psychologist, profile, trialChecked]);

  const checkTrialStatus = async () => {
    if (!psychologist) return;

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
      setTrialChecked(true);
    }
  };

  const handleUpgrade = () => {
    console.log('Redirecting to payment system...');
    alert('Redirección al sistema de pagos (función pendiente de implementar)');
  };

  const handleNavigateToMessages = (patientId?: string) => {
    setCurrentView("messages");
    // You could add logic here to select the specific patient's conversation
    console.log('Navigating to messages for patient:', patientId);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Logging out user');
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  // Show loading during initial authentication check
  if (authLoading) {
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
  if (!user) {
    return <AuthPage />;
  }

  // Show loading while profile is being fetched (but only if we don't have any profile data yet)
  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // If no profile exists after loading is complete, show auth page
  if (!profileLoading && !profile) {
    return <AuthPage />;
  }

  // Handle admin users differently - redirect them to admin login/dashboard
  if (profile && profile.user_type === 'admin') {
    // For admin users, redirect to admin interface
    window.location.href = '/admin/dashboard';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Redirigiendo al panel de administración...</p>
        </div>
      </div>
    );
  }

  // Only show profile setup if we have a profile but are missing required role-specific data
  const needsProfileSetup = () => {
    if (!profile || profileLoading) return false;
    
    if (profile.user_type === 'psychologist') {
      // Check if psychologist profile exists and has required fields
      const hasCompleteProfile = psychologist && psychologist.first_name && psychologist.last_name;
      
      console.log('Checking psychologist profile setup:', {
        hasCompleteProfile,
        psychologist,
        subscription_status: psychologist?.subscription_status
      });
      
      // If psychologist has complete profile data, NEVER ask for profile setup again
      // regardless of subscription status
      if (hasCompleteProfile) {
        console.log('Psychologist has complete profile, skipping profile setup');
        return false;
      }
      
      return !hasCompleteProfile;
    } else if (profile.user_type === 'patient') {
      // Check if patient profile exists and has required fields
      const hasCompleteProfile = patient && patient.first_name && patient.last_name && patient.psychologist_id;
      return !hasCompleteProfile;
    }
    
    // For any other user type, don't show profile setup
    return false;
  };
  
  // Only show profile setup if we're not loading and actually need setup
  if (!profileLoading && needsProfileSetup()) {
    return (
      <ProfileSetup 
        userType={profile.user_type as 'psychologist' | 'patient'} 
        onComplete={() => {
          console.log('Profile setup completed, refetching data');
          refetch();
        }} 
      />
    );
  }

  // If we're still loading profile but have a profile, show loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
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
        return <PatientManagement onNavigateToMessages={handleNavigateToMessages} />;
      case "calendar":
        return <Calendar />;
      case "messages":
        return <MessagingHub />;
      case "affiliates":
        return <AffiliateSystem />;
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
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleViewChange}
        />
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </Button>
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
