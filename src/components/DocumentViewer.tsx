import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: string;
  content: any;
  created_at: string;
  updated_at: string;
  status: string;
}

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewer = ({ document, isOpen, onClose }: DocumentViewerProps) => {
  if (!document) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const downloadDocument = () => {
    const content = JSON.stringify(document.content, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    const content = document.content;
    
    switch (document.type) {
      case 'assessment':
        return (
          <div className="space-y-4">
            {content.patientName && (
              <div>
                <h4 className="font-semibold text-slate-700">Paciente</h4>
                <p className="text-slate-600">{content.patientName}</p>
              </div>
            )}
            {content.assessmentType && (
              <div>
                <h4 className="font-semibold text-slate-700">Tipo de Evaluación</h4>
                <p className="text-slate-600">{content.assessmentType}</p>
              </div>
            )}
            {content.chiefComplaint && (
              <div>
                <h4 className="font-semibold text-slate-700">Motivo de Consulta</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{content.chiefComplaint}</p>
              </div>
            )}
            {content.diagnosticImpression && (
              <div>
                <h4 className="font-semibold text-slate-700">Impresión Diagnóstica</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{content.diagnosticImpression}</p>
              </div>
            )}
            {content.recommendations && (
              <div>
                <h4 className="font-semibold text-slate-700">Recomendaciones</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{content.recommendations}</p>
              </div>
            )}
          </div>
        );
      
      case 'treatment_plan':
        return (
          <div className="space-y-4">
            {content.patientName && (
              <div>
                <h4 className="font-semibold text-slate-700">Paciente</h4>
                <p className="text-slate-600">{content.patientName}</p>
              </div>
            )}
            {content.diagnosis && (
              <div>
                <h4 className="font-semibold text-slate-700">Diagnóstico</h4>
                <p className="text-slate-600">{content.diagnosis}</p>
              </div>
            )}
            {content.overallGoal && (
              <div>
                <h4 className="font-semibold text-slate-700">Objetivo General</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{content.overallGoal}</p>
              </div>
            )}
            {content.goals && content.goals.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700">Objetivos Específicos</h4>
                <div className="space-y-2">
                  {content.goals.map((goal: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium">{goal.description}</p>
                      <p className="text-sm text-slate-600">Plazo: {goal.timeline}</p>
                      <p className="text-sm text-slate-600">Medible: {goal.measurable}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content.interventions && content.interventions.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700">Intervenciones</h4>
                <div className="space-y-2">
                  {content.interventions.map((intervention: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium">{intervention.technique}</p>
                      <p className="text-sm text-slate-600">Frecuencia: {intervention.frequency}</p>
                      <p className="text-sm text-slate-600">Duración: {intervention.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{document.title}</DialogTitle>
              <p className="text-sm text-slate-600 mt-1">
                {getDocumentTypeLabel(document.type)} • {formatDate(document.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadDocument} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
