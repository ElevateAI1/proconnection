
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { AuthPage } from "@/components/AuthPage";
import { ProfileSetup } from "@/components/ProfileSetup";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { MessagingHub } from "@/components/MessagingHub";
import { PatientPortal } from "@/components/PatientPortal";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "portal";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  // Show loading while checking authentication and profile
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

  // Show auth page if not logged in
  if (!user || !profile) {
    return <AuthPage />;
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
