
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { AuthPage } from "@/components/AuthPage";
import { PatientPortal } from "@/components/PatientPortal";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { MessagingHub } from "@/components/MessagingHub";
import { AffiliateSystem } from "@/components/AffiliateSystem";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ProfileSetup } from "@/components/ProfileSetup";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";

const Index = () => {
  const { user, loading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading } = useProfile();
  const [currentView, setCurrentView] = useState<"dashboard" | "patients" | "calendar" | "messages" | "affiliates">("dashboard");

  useEffect(() => {
    if (!user && !loading) {
      console.log('No user, redirecting to auth page');
      return;
    }

    if (user && !profile && !profileLoading) {
      console.log('User logged in, but no profile found. Redirecting to profile setup.');
      return;
    }
  }, [user, profile, loading, profileLoading]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!profile) {
    return <ProfileSetup userType="psychologist" onComplete={() => window.location.reload()} />;
  }

  if (profile?.user_type === 'patient' && patient) {
    return <PatientPortal />;
  }

  if (profile?.user_type === 'psychologist' && psychologist) {
    const renderPsychologistContent = () => {
      switch (currentView) {
        case "dashboard":
          return <Dashboard onViewChange={setCurrentView} />;
        case "patients":
          return <PatientManagement />;
        case "calendar":
          return <div className="text-center py-8"><p className="text-slate-600">Vista de calendario próximamente</p></div>;
        case "messages":
          return <MessagingHub />;
        case "affiliates":
          return <AffiliateSystem />;
        default:
          return <Dashboard onViewChange={setCurrentView} />;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex w-full">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 ml-64">
          <div className="p-8">
            {renderPsychologistContent()}
          </div>
        </div>
        <TrialExpiredModal onUpgrade={() => console.log('Upgrade triggered')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600">Error: Tipo de usuario desconocido.</p>
      </div>
    </div>
  );
};

export default Index;
