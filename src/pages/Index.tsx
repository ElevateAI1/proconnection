
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

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { psychologist, patient, loading: profileLoading } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const navigate = useNavigate();

  // Manejar verificación de email desde URL
  useEmailVerification();

  useEffect(() => {
    // Si ya terminó de cargar y no hay usuario, redirigir al auth
    if (!authLoading && !user) {
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
  }, [user, authLoading, navigate, psychologist]);

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

  // Show profile setup if psychologist exists but profile is incomplete
  if (psychologist && (!psychologist.first_name || !psychologist.last_name)) {
    return (
      <ProfileSetup 
        userType="psychologist" 
        onComplete={() => window.location.reload()} 
      />
    );
  }

  // Patient portal redirect (simplified for this example)
  if (patient) {
    return <div>Portal del Paciente (en desarrollo)</div>;
  }

  if (!psychologist) {
    return <div>Perfil de psicólogo no encontrado</div>;
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
