
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOptimizedProfile } from "@/hooks/useOptimizedProfile";
import { useUnifiedDashboardStats } from "@/hooks/useUnifiedDashboardStats";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { AffiliateSystem } from "@/components/AffiliateSystem";
import { SeoProfileManager } from "@/components/SeoProfileManager";
import { AdvancedReports } from "@/components/AdvancedReports";
import { PrioritySupport } from "@/components/PrioritySupport";
import { EarlyAccess } from "@/components/EarlyAccess";
import { VisibilityConsulting } from "@/components/VisibilityConsulting";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { PatientPortal } from "@/components/landing/PatientPortal";
import { LandingPage } from "@/pages/LandingPage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PsychologistRatesManager } from "@/components/PsychologistRatesManager";
import { AccountingDashboard } from "@/components/AccountingDashboard";
import { DocumentsSection } from "@/components/DocumentsSection";
import { AppointmentRequests } from "@/components/AppointmentRequests";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ReminderSettingsManager } from "@/components/ReminderSettingsManager";
import { AdvancedReminderSettings } from "@/components/AdvancedReminderSettings";
import { NotificationDashboard } from "@/components/NotificationDashboard";
import { ClinicAdminDashboard } from "@/components/ClinicAdminDashboard";
import { ClinicReports } from "@/components/ClinicReports";
import { ApiIntegrations } from "@/components/ApiIntegrations";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { MobileNavigation } from "@/components/MobileNavigation";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { activatePlusPlan } from "@/utils/activatePlusPlan";

type ViewType = "dashboard" | "patients" | "calendar" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates" | "accounting" | "documents" | "appointment-requests" | "notifications" | "reminder-settings" | "advanced-reminder-settings" | "notification-dashboard" | "clinic-admin" | "clinic-reports" | "api-integrations";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { profile, psychologist, patient, loading: profileLoading, error: profileError, forceRefresh } = useOptimizedProfile();
  const unifiedStats = useUnifiedDashboardStats(psychologist?.id);
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const navigate = useNavigate();

  // Leer query parameter para cambiar la vista
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && ['dashboard', 'patients', 'calendar', 'documents', 'appointment-requests'].includes(viewParam)) {
      setCurrentView(viewParam as ViewType);
      // Limpiar el query parameter después de leerlo
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Handle email verification from URL
  useEmailVerification();

  useEffect(() => {
    console.log('Index state:', {
      authLoading,
      profileLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileUserType: profile?.user_type,
      profileError,
      psychologistName: unifiedStats.psychologistName,
      planType: unifiedStats.planType,
      profileStatsLoading: unifiedStats.profileLoading,
      dashboardStatsLoading: unifiedStats.statsLoading
    });
  }, [user, authLoading, profile, profileLoading, profileError, unifiedStats]);

  useEffect(() => {
    // Check trial status using Supabase function
    const checkTrialStatus = async () => {
      if (psychologist?.id) {
        try {
          console.log('Checking trial status for psychologist:', psychologist.id);
          
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
            console.log('Trial expired, showing modal');
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
  }, [psychologist]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Error al cargar el perfil
            </h2>
            <p className="text-red-600 mb-4">
              {profileError}
            </p>
            <Button 
              onClick={forceRefresh}
              className="bg-red-600 hover:bg-red-700 w-full"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-700 mb-2">
              Configurando tu perfil...
            </h2>
            <p className="text-yellow-600 mb-4">
              Tu cuenta está siendo configurada. Este proceso puede tomar unos segundos.
            </p>
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Button 
              onClick={() => forceRefresh()}
              className="bg-yellow-600 hover:bg-yellow-700 w-full"
            >
              Recargar perfil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (profile.user_type === 'patient') {
    console.log('=== REDIRECTING TO PATIENT PORTAL ===');
    console.log('Profile:', profile);
    return <PatientPortal />;
  }

  if (profile.user_type === 'admin') {
    navigate('/admin/dashboard');
    return null;
  }

  // Psychologist dashboard - Now loads immediately when profile is ready
  if (profile.user_type === 'psychologist') {
    const renderCurrentView = () => {
      switch (currentView) {
        case "dashboard":
          return <Dashboard onNavigate={handleViewChange} />;
        case "patients":
          return <PatientManagement />;
        case "appointment-requests":
          return <AppointmentRequests />;
        case "calendar":
          return <Calendar />;
        case "documents":
          return <DocumentsSection />;
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
        case "accounting":
          return <AccountingDashboard psychologistId={psychologist?.id || ''} />;
        case "notifications":
          return <NotificationCenter />;
        case "reminder-settings":
          return <ReminderSettingsManager />;
        case "advanced-reminder-settings":
          return <AdvancedReminderSettings />;
        case "notification-dashboard":
          return <NotificationDashboard />;
        case "clinic-admin":
          return <ClinicAdminDashboard />;
        case "clinic-reports":
          return <ClinicReports />;
        case "api-integrations":
          return <ApiIntegrations />;
        default:
          return <Dashboard />;
      }
    };

    const firstName = (psychologist?.first_name ?? '').trim();
    const lastName = (psychologist?.last_name ?? '').trim();
    const displayName = unifiedStats.psychologistName || 
                       [firstName, lastName].filter(Boolean).join(' ') || 
                       'Profesional';

    const handleViewChange = (view: ViewType) => {
      setCurrentView(view);
    };


    return (
      <SidebarProvider>
        <RealtimeProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <MinimalistSidebar currentView={currentView} onViewChange={handleViewChange} />
            </div>
            
            {/* Mobile Navigation */}
            <MobileNavigation currentView={currentView} onViewChange={handleViewChange} />
            
            <SidebarInset className="bg-gradient-to-br from-white to-slate-50">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-6 shadow-sm">
                <SidebarTrigger className="-ml-1 lg:hidden" />
                <div className="ml-auto flex items-center space-x-3">
                  <span className="text-sm text-slate-600 font-semibold hidden sm:block">
                    {displayName}
                  </span>
                  {(unifiedStats.planType || psychologist?.plan_type) && (
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full font-semibold border border-blue-200">
                      {(() => {
                        const planType = (unifiedStats.planType || psychologist?.plan_type || '').toLowerCase();
                        if (planType === 'proconnection') return 'PROCONNECTION';
                        if (planType === 'teams') return 'TEAMS';
                        if (planType === 'dev') return 'DEV';
                        return 'STARTER';
                      })()}
                    </span>
                  )}
                  {(!psychologist?.plan_type || !['proconnection', 'teams'].includes(psychologist.plan_type.toLowerCase())) && (
                    <Link to="/plans">
                      <Button
                        size="sm"
                        className="bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 text-xs px-3 py-1 h-7"
                        aria-label="Ver planes de suscripción"
                      >
                        ⚡ Ver Planes
                      </Button>
                    </Link>
                  )}
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
                {renderCurrentView()}
              </div>
            </SidebarInset>
            {showTrialModal && (
              <TrialExpiredModal
                onUpgrade={() => setShowTrialModal(false)}
                onClose={() => setShowTrialModal(false)}
              />
            )}
          </div>
        </RealtimeProvider>
      </SidebarProvider>
    );
  }

  console.error('Unexpected state reached:', {
    hasUser: !!user,
    hasProfile: !!profile,
    userType: profile?.user_type
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-orange-700 mb-2">
            Estado inesperado detectado
          </h2>
          <p className="text-orange-600 mb-4">
            La aplicación está en un estado no manejado. Tipo de usuario: {profile?.user_type || 'desconocido'}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 w-full"
            >
              Recargar página completa
            </Button>
            <Button 
              onClick={forceRefresh}
              variant="outline"
              className="w-full"
            >
              Refrescar perfil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
