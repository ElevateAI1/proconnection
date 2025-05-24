
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { PatientManagement } from "@/components/PatientManagement";
import { Calendar } from "@/components/CalendarView";
import { MessagingHub } from "@/components/MessagingHub";
import { PatientPortal } from "@/components/PatientPortal";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "portal";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [userType, setUserType] = useState<"psychologist" | "patient">("psychologist");

  const renderContent = () => {
    if (userType === "patient") {
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
      {userType === "psychologist" && (
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      )}
      
      <main className={`flex-1 ${userType === "psychologist" ? "ml-64" : ""}`}>
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                PsiConnect
              </h1>
              <p className="text-slate-600 text-sm">
                {userType === "psychologist" ? "Plataforma de Gestión Profesional" : "Portal del Paciente"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUserType(userType === "psychologist" ? "patient" : "psychologist")}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Ver como {userType === "psychologist" ? "Paciente" : "Psicólogo"}
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userType === "psychologist" ? "Dr" : "P"}
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
