
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
import { PatientPortal } from "@/components/PatientPortal";
import { LandingPage } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PsychologistRatesManager } from "@/components/PsychologistRatesManager";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates";

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

    // Verificar si el trial ha expirado usando la función de Supabase
    const checkTrialStatus = async () => {
      if (psychologist?.id) {
        try {
          const { data: isExpired, error } = await supabase.rpc('is_trial_expired', {
            psychologist_id: psychologist.id
          });

          if (error) {
            console.error('Error checking trial status:', error);
            return;
          }

          const hasExpiredStatus = psychologist.subscription_status === 'expired' || 
                                 psychologist.subscription_status === 'cancelled';

          if (isExpired || hasExpiredStatus) {
            console.log('Trial expired, showing modal:', { isExpired, hasExpiredStatus, subscription_status: psychologist.subscription_status });
            setShowTrialModal(true);
          }
        } catch (error) {
          console.error('Error in trial status check:', error);
        }
      }
    };

    if (psychologist) {
      checkTrialStatus();
    }
  }, [user, authLoading, navigate, psychologist, profile, profileError]);

  // Mostrar loading mientras se cargan auth y profile
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar la landing page
  if (!user) {
    return <LandingPage />;
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

  // SIMPLIFICADO: Solo mostrar ProfileSetup si REALMENTE no hay datos de rol
  if (profile && profile.user_type === 'psychologist' && !psychologist) {
    console.log('=== SHOWING PROFILE SETUP FOR PSYCHOLOGIST - NO DATA FOUND ===');
    return (
      <ProfileSetup 
        userType="psychologist"
        onComplete={() => {
          console.log('=== PROFILE SETUP COMPLETED - FORCING REFRESH ===');
          forceRefresh();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }} 
      />
    );
  }

  if (profile && profile.user_type === 'patient' && !patient) {
    console.log('=== SHOWING PROFILE SETUP FOR PATIENT - NO DATA FOUND ===');
    return (
      <ProfileSetup 
        userType="patient"
        onComplete={() => {
          console.log('=== PROFILE SETUP COMPLETED - FORCING REFRESH ===');
          forceRefresh();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }} 
      />
    );
  }

  // Patient portal (using the complete PatientPortal component)
  if (patient) {
    return <PatientPortal />;
  }

  // Psychologist dashboard - si hay psychologist data, mostrar directamente
  if (psychologist) {
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
        case "rates":
          return <PsychologistRatesManager />;
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

  // Fallback: si llegamos aquí, hay un problema de datos
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">
            Configuración Incompleta
          </h2>
          <p className="text-yellow-600 mb-4">
            Tu cuenta necesita configuración adicional.
          </p>
          <Button 
            onClick={() => forceRefresh()}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Recargar
          </Button>
        </div>
      </div>
    </div>
  );
}
