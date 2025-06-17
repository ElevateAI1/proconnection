
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { PatientManagement } from "@/components/PatientManagement";
import { PatientMessaging } from "@/components/PatientMessaging";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { PatientClinicalHistory } from "@/components/PatientClinicalHistory";
import { DocumentsSection } from "@/components/DocumentsSection";
import { ExpandedSettingsModal } from "@/components/ExpandedSettingsModal";
import { DashboardOverview } from "@/components/DashboardOverview";
import { Loader2 } from "lucide-react";

interface OptimizedDashboardProps {
  currentView: string;
  selectedPatientId?: string | null;
  onPatientSelect?: (patientId: string | null) => void;
}

export const OptimizedDashboard = ({ currentView, selectedPatientId, onPatientSelect }: OptimizedDashboardProps) => {
  const { profile, psychologist, patient } = useProfile();
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      console.log('Profile status:', { profile, psychologist, patient });
      setIsLoading(false);
    };

    checkProfile();
  }, [profile, psychologist, patient]);

  const handleNavigateToMessages = (patientId?: string) => {
    onPatientSelect && onPatientSelect(patientId || null);
  };

  const handleNavigateToAppointments = (patientId?: string) => {
    onPatientSelect && onPatientSelect(patientId || null);
  };

  const handleNavigateToClinicalHistory = (patientId: string) => {
    onPatientSelect && onPatientSelect(patientId);
  };

  const handleBackToPatients = () => {
    onPatientSelect && onPatientSelect(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      
      case 'patients':
        if (profile?.user_type === 'psychologist') {
          return <PatientManagement />;
        }
        return <div>No tienes permisos para ver esta sección</div>;
      
      case 'calendar':
        return (
          <AppointmentCalendar 
            onBack={handleBackToPatients}
            patientId={selectedPatientId || undefined}
          />
        );
      
      case 'clinical-history':
        if (selectedPatientId) {
          return (
            <PatientClinicalHistory 
              patientId={selectedPatientId}
              onBack={handleBackToPatients}
            />
          );
        }
        return <div>Selecciona un paciente para ver su historial clínico</div>;
      
      case 'messages':
        if (selectedPatientId) {
          return <PatientMessaging onBack={handleBackToPatients} />;
        }
        return <div>Selecciona un paciente para ver los mensajes</div>;
      
      case 'documents':
        return <DocumentsSection />;
      
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
      
      {showSettings && (
        <ExpandedSettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};
