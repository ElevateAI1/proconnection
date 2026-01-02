
import { useState } from "react";
import { Plus, FileText, Download, Eye, Calendar, Printer, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentViewer } from "@/components/DocumentViewer";
import { AssessmentFormModal } from "@/components/forms/AssessmentFormModal";
import { ConsentFormModal } from "@/components/forms/ConsentFormModal";
import { TreatmentPlanModal } from "@/components/forms/TreatmentPlanModal";
import { ProgressReportModal } from "@/components/forms/ProgressReportModal";
import { TemplateUsageManager } from "@/components/template-usage/TemplateUsageManager";
import { exportAsText, exportAsJSON, printDocument, DocumentData } from "@/utils/documentExporter";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { formatDateArgentina } from "@/utils/dateFormatting";

interface PatientDocumentsProps {
  documents: any[];
  patientId: string;
  onRefresh: () => void;
  patient: any;
}

export const PatientDocuments = ({ documents, patientId, onRefresh, patient }: PatientDocumentsProps) => {
  const { psychologist } = useProfile();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [exportingDocument, setExportingDocument] = useState<string | null>(null);

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      assessment: "Evaluación",
      consent: "Consentimiento",
      treatment_plan: "Plan de Tratamiento",
      progress_report: "Reporte de Progreso",
    };
    return types[type] || type;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "draft":
        return "secondary";
      case "signed":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      draft: "Borrador",
      completed: "Completado",
      signed: "Firmado",
      archived: "Archivado",
    };
    return statuses[status] || status;
  };

  const handleView = (document: any) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const prepareDocumentData = (document: any): DocumentData => {
    return {
      title: document.title,
      type: document.type,
      content: document.content,
      patient: patient ? {
        first_name: patient.first_name,
        last_name: patient.last_name,
        age: patient.age,
        phone: patient.phone
      } : undefined,
      psychologist: psychologist ? {
        first_name: psychologist.first_name,
        last_name: psychologist.last_name,
        professional_code: psychologist.professional_code,
        license_number: psychologist.license_number,
        specialization: psychologist.specialization,
        phone: psychologist.phone
      } : undefined,
      created_at: document.created_at,
      updated_at: document.updated_at,
      status: document.status
    };
  };

  const handleExportText = (document: any) => {
    try {
      setExportingDocument(document.id);
      const documentData = prepareDocumentData(document);
      exportAsText(documentData);
      toast.success("Documento exportado como texto");
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error("Error al exportar el documento");
    } finally {
      setExportingDocument(null);
    }
  };

  const handleExportJSON = (document: any) => {
    try {
      setExportingDocument(document.id);
      const documentData = prepareDocumentData(document);
      exportAsJSON(documentData);
      toast.success("Documento exportado como JSON");
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error("Error al exportar el documento");
    } finally {
      setExportingDocument(null);
    }
  };

  const handlePrintDocument = (document: any) => {
    try {
      setExportingDocument(document.id);
      const documentData = prepareDocumentData(document);
      printDocument(documentData);
      toast.success("Abriendo ventana de impresión");
    } catch (error) {
      console.error('Error printing document:', error);
      toast.error("Error al abrir la impresión");
    } finally {
      setExportingDocument(null);
    }
  };

  const handleModalClose = (modalType: string) => {
    switch (modalType) {
      case 'assessment':
        setShowAssessmentModal(false);
        break;
      case 'consent':
        setShowConsentModal(false);
        break;
      case 'treatment':
        setShowTreatmentModal(false);
        break;
      case 'progress':
        setShowProgressModal(false);
        break;
      case 'template':
        setShowTemplateManager(false);
        break;
    }
    onRefresh();
  };

  if (showTemplateManager) {
    return (
      <TemplateUsageManager
        patientId={patientId}
        onBack={() => setShowTemplateManager(false)}
        onDocumentCreated={() => {
          setShowTemplateManager(false);
          onRefresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Documentos del Paciente</h3>
          <p className="text-sm text-gray-600">
            Gestiona evaluaciones, consentimientos y reportes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => setShowTemplateManager(true)}>
            <Palette className="h-4 w-4 mr-2" />
            Usar Plantillas
          </Button>
          <Button size="sm" onClick={() => setShowAssessmentModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Evaluación
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowConsentModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Consentimiento
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowTreatmentModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Plan de Tratamiento
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowProgressModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Reporte de Progreso
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No hay documentos creados para este paciente</p>
            <p className="text-sm text-gray-500 mt-2">
              Comienza creando una evaluación o consentimiento informado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{document.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {getDocumentTypeLabel(document.type)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDateArgentina(document.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(document.status)}>
                    {getStatusLabel(document.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(document)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintDocument(document)}
                    disabled={exportingDocument === document.id}
                    className="flex items-center"
                  >
                    {exportingDocument === document.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    Imprimir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportText(document)}
                    disabled={exportingDocument === document.id}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Texto
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportJSON(document)}
                    disabled={exportingDocument === document.id}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Form Modals */}
      <AssessmentFormModal
        isOpen={showAssessmentModal}
        onClose={() => handleModalClose('assessment')}
        psychologistId={psychologist?.id}
      />

      <ConsentFormModal
        isOpen={showConsentModal}
        onClose={() => handleModalClose('consent')}
        psychologistId={psychologist?.id}
      />

      <TreatmentPlanModal
        isOpen={showTreatmentModal}
        onClose={() => handleModalClose('treatment')}
        psychologistId={psychologist?.id}
      />

      <ProgressReportModal
        isOpen={showProgressModal}
        onClose={() => handleModalClose('progress')}
        psychologistId={psychologist?.id}
      />
    </div>
  );
};
