import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Plus, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AssessmentFormModal } from "./forms/AssessmentFormModal";
import { ConsentFormModal } from "./forms/ConsentFormModal";
import { TreatmentPlanModal } from "./forms/TreatmentPlanModal";
import { ProgressReportModal } from "./forms/ProgressReportModal";
import { DocumentViewer } from "./DocumentViewer";

interface PatientDocument {
  id: string;
  title: string;
  type: string;
  content: any;
  created_at: string;
  updated_at: string;
  status: string;
}

export const DocumentsSection = () => {
  const { profile, patient, psychologist } = useProfile();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchDocuments();
    }
  }, [profile]);

  const fetchDocuments = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('patient_documents')
        .select('*')
        .eq(profile.user_type === 'patient' ? 'patient_id' : 'psychologist_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'consent':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'treatment_plan':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'progress_report':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      assessment: "Evaluación Psicológica",
      consent: "Consentimiento Informado",
      treatment_plan: "Plan de Tratamiento",
      progress_report: "Reporte de Progreso"
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-blue-100 text-blue-700",
      signed: "bg-purple-100 text-purple-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Borrador",
      completed: "Completado",
      pending: "Pendiente",
      signed: "Firmado"
    };
    return labels[status] || status;
  };

  const handleCreateDocument = (type: string) => {
    setSelectedModal(type);
  };

  const handleCloseModal = () => {
    setSelectedModal(null);
    fetchDocuments();
  };

  const handleViewDocument = (document: PatientDocument) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleDownloadDocument = (document: PatientDocument) => {
    const content = JSON.stringify(document.content, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.json`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Documento descargado",
      description: `${document.title} se ha descargado correctamente`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5" />
            Documentos y Formularios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botones para crear nuevos documentos (solo para psicólogos) */}
          {profile?.user_type === 'psychologist' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Button
                onClick={() => handleCreateDocument('assessment')}
                className="flex flex-col items-center gap-2 h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                variant="outline"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Evaluación</span>
              </Button>
              
              <Button
                onClick={() => handleCreateDocument('consent')}
                className="flex flex-col items-center gap-2 h-20 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                variant="outline"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Consentimiento</span>
              </Button>
              
              <Button
                onClick={() => handleCreateDocument('treatment_plan')}
                className="flex flex-col items-center gap-2 h-20 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                variant="outline"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Plan Tratamiento</span>
              </Button>
              
              <Button
                onClick={() => handleCreateDocument('progress_report')}
                className="flex flex-col items-center gap-2 h-20 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                variant="outline"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Reporte Progreso</span>
              </Button>
            </div>
          )}

          {/* Lista de documentos */}
          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    {getDocumentIcon(document.type)}
                    <div>
                      <h4 className="font-semibold text-slate-800">{document.title}</h4>
                      <p className="text-sm text-slate-600">
                        {getDocumentTypeLabel(document.type)} • {formatDate(document.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusLabel(document.status)}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay documentos disponibles</p>
                {profile?.user_type === 'psychologist' ? (
                  <p className="text-sm">Crea un nuevo documento usando los botones de arriba</p>
                ) : (
                  <p className="text-sm">Los documentos y formularios aparecerán aquí cuando tu psicólogo los comparta</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modales para formularios */}
      {selectedModal === 'assessment' && (
        <AssessmentFormModal 
          isOpen={true} 
          onClose={handleCloseModal}
          psychologistId={psychologist?.id}
        />
      )}
      
      {selectedModal === 'consent' && (
        <ConsentFormModal 
          isOpen={true} 
          onClose={handleCloseModal}
          psychologistId={psychologist?.id}
        />
      )}
      
      {selectedModal === 'treatment_plan' && (
        <TreatmentPlanModal 
          isOpen={true} 
          onClose={handleCloseModal}
          psychologistId={psychologist?.id}
        />
      )}
      
      {selectedModal === 'progress_report' && (
        <ProgressReportModal 
          isOpen={true} 
          onClose={handleCloseModal}
          psychologistId={psychologist?.id}
        />
      )}

      {/* Visor de documentos */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedDocument(null);
        }}
      />
    </>
  );
};
