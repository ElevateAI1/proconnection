
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, User, FileText, CreditCard, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePatientData } from "@/hooks/usePatientData";
import { PatientInfo } from "@/components/patient-detail/PatientInfo";
import { PatientDocuments } from "@/components/patient-detail/PatientDocuments";
import { PatientBilling } from "@/components/patient-detail/PatientBilling";
import { PatientAppointments } from "@/components/patient-detail/PatientAppointments";
import { PatientSkeleton } from "@/components/patient-detail/PatientSkeleton";

export const PatientDetailView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("info");
  
  const { 
    patient, 
    documents, 
    loading, 
    error,
    refetch,
    refetchDocuments 
  } = usePatientData(patientId!);

  const handlePatientUpdate = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header Skeleton */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" disabled>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <PatientSkeleton />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Paciente no encontrado</h3>
              <p className="text-slate-500 mb-6">No se pudo encontrar la información del paciente solicitado.</p>
              <Button 
                onClick={() => navigate(-1)} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100/70 rounded-lg p-2 transition-all duration-200"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {patient.first_name} {patient.last_name}
                  </h1>
                  <p className="text-slate-600 text-sm flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Paciente desde {new Date(patient.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
            {profile?.user_type === 'psychologist' && (
              <Button 
                onClick={() => navigate(`/patients/edit/${patientId}`)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                size="sm"
              >
                <Pencil className="w-3 h-3 mr-2" />
                Editar Paciente
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Tabs 
          defaultValue="info" 
          className="w-full" 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 h-auto">
            <TabsTrigger 
              value="info" 
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 hover:bg-slate-100/80 font-medium text-slate-700 text-sm"
            >
              <div className="w-4 h-4 rounded flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
              <span className="font-medium">Información</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="appointments"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/25 hover:bg-slate-100/80 font-medium text-slate-700 text-sm"
            >
              <div className="w-4 h-4 rounded flex items-center justify-center">
                <Calendar className="w-3 h-3" />
              </div>
              <span className="font-medium">Citas</span>
            </TabsTrigger>
            
            {profile?.user_type === 'psychologist' && (
              <>
                <TabsTrigger 
                  value="documents"
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/25 hover:bg-slate-100/80 font-medium text-slate-700 text-sm"
                >
                  <div className="w-4 h-4 rounded flex items-center justify-center">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Documentos</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="billing"
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-orange-500/25 hover:bg-slate-100/80 font-medium text-slate-700 text-sm"
                >
                  <div className="w-4 h-4 rounded flex items-center justify-center">
                    <CreditCard className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Facturación</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="info" className="mt-0">
              <div className="animate-fade-in-up">
                <PatientInfo 
                  patient={patient} 
                  onUpdate={handlePatientUpdate}
                  patientId={patientId!}
                />
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="mt-0">
              <div className="animate-fade-in-up">
                <PatientAppointments patientId={patientId!} />
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0">
              <div className="animate-fade-in-up">
                <PatientDocuments 
                  documents={documents}
                  patientId={patientId}
                  onRefresh={refetchDocuments}
                  patient={patient}
                />
              </div>
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              {profile?.user_type === 'psychologist' ? (
                <div className="animate-fade-in-up">
                  <PatientBilling patientId={patientId} />
                </div>
              ) : (
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Acceso Restringido</h3>
                    <p className="text-slate-500">
                      Solo los psicólogos pueden ver la información de facturación.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
