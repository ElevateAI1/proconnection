
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { MessagingHub } from "@/components/MessagingHub";
import { AffiliateSystem } from "@/components/AffiliateSystem";
import { SeoProfileManager } from "@/components/SeoProfileManager";
import { AdvancedReports } from "@/components/AdvancedReports";
import { PrioritySupport } from "@/components/PrioritySupport";
import { EarlyAccess } from "@/components/EarlyAccess";
import { VisibilityConsulting } from "@/components/VisibilityConsulting";
import { Sidebar } from "@/components/Sidebar";
import { ProfileSetup } from "@/components/ProfileSetup";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { Button } from "@/components/ui/button";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading, error: profileError, forceRefresh } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const navigate = useNavigate();

  // Manejar verificación de email desde URL
  useEmailVerification();

  useEffect(() => {
    console.log('=== INDEX EFFECT ===', { 
      authLoading, 
      user: !!user, 
      profile: !!profile,
      psychologist: !!psychologist,
      patient: !!patient,
      profileError 
    });

    // Si ya terminó de cargar y no hay usuario, redirigir al auth
    if (!authLoading && !user) {
      console.log('=== NO USER, REDIRECTING TO AUTH ===');
      navigate("/auth");
      return;
    }

    if (psychologist && psychologist.trial_end_date) {
      const trialEndDate = new Date(psychologist.trial_end_date);
      const now = new Date();
      if (trialEndDate < now) {
        setShowTrialModal(true);
      }
    }
  }, [user, authLoading, navigate, psychologist, profile, profileError]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, no mostrar nada (ya se redirigió)
  if (!user) {
    return null;
  }

  // Si hay error de perfil o no hay perfil base
  if (profileError || (!profile && !profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Error al cargar el perfil
            </h2>
            <p className="text-red-600 mb-4">
              {profileError || 'No se pudo encontrar tu perfil en la base de datos.'}
            </p>
            <Button 
              onClick={forceRefresh}
              className="bg-red-600 hover:bg-red-700"
            >
              Reintentar
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            Si el problema persiste, contacta con soporte.
          </p>
        </div>
      </div>
    );
  }

  // Show profile setup if psychologist profile needs completion
  if (profile?.user_type === 'psychologist' && (!psychologist || !psychologist.first_name || !psychologist.last_name)) {
    return (
      <ProfileSetup 
        userType="psychologist" 
        onComplete={() => window.location.reload()} 
      />
    );
  }

  // Show profile setup if patient profile needs completion  
  if (profile?.user_type === 'patient' && (!patient || !patient.first_name || !patient.last_name)) {
    return (
      <ProfileSetup 
        userType="patient" 
        onComplete={() => window.location.reload()} 
      />
    );
  }

  // Patient portal (simplified)
  if (patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Portal del Paciente</h1>
          <p className="text-slate-600">En desarrollo...</p>
        </div>
      </div>
    );
  }

  // Check if we have a complete psychologist profile
  if (!psychologist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-700 mb-2">
              Perfil Incompleto
            </h2>
            <p className="text-yellow-600 mb-4">
              Tu cuenta está registrada pero necesitas completar tu perfil profesional.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Completar Perfil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={handleViewChange} />;
      case "patients":
        return <PatientManagement />;
      case "calendar":
        return <Calendar />;
      case "messages":
        return <MessagingHub />;
      case "affiliates":
        return <AffiliateSystem />;
      case "seo":
        return <SeoProfileManager />;
      case "reports":
        return <AdvancedReports />;
      case "support":
        return <PrioritySupport />;
      case "early-access":
        return <EarlyAccess />;
      case "visibility":
        return <VisibilityConsulting />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 p-6 ml-64">
        {renderCurrentView()}
      </main>
      {showTrialModal && (
        <TrialExpiredModal onUpgrade={() => setShowTrialModal(false)} />
      )}
    </div>
  );
}
