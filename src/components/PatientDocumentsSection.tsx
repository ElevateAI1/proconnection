import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { DocumentViewer } from './DocumentViewer';

interface PatientDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  content: any;
  priority: string;
  workflow_step: number;
  updated_at: string;
}

interface PatientDocumentsSectionProps {
  patientId?: string;
  psychologistId?: string;
}

export const PatientDocumentsSection: React.FC<PatientDocumentsSectionProps> = ({ 
  patientId: propPatientId, 
  psychologistId: propPsychologistId 
}) => {
  const { psychologist, patient } = useProfile();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  // Determine the correct IDs to use
  const effectivePatientId = propPatientId || patient?.id;
  const effectivePsychologistId = propPsychologistId || psychologist?.id || patient?.psychologist_id;

  useEffect(() => {
    if (effectivePatientId && effectivePsychologistId) {
      fetchDocuments();
    } else {
      console.log('Missing required IDs:', { effectivePatientId, effectivePsychologistId });
      setLoading(false);
    }
  }, [effectivePatientId, effectivePsychologistId]);

  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents for:', { effectivePatientId, effectivePsychologistId });
      
      const { data, error } = await supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', effectivePatientId)
        .eq('psychologist_id', effectivePsychologistId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('Documents fetched:', data);
      
      // Mapear los datos para agregar campos faltantes
      const mappedDocuments = (data || []).map(doc => ({
        ...doc,
        priority: doc.priority || 'normal',
        workflow_step: doc.workflow_step || 1
      }));
      
      setDocuments(mappedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos del paciente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: PatientDocument) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedDocument(null);
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      'draft': { 
        label: 'Borrador', 
        color: 'bg-gray-100 text-gray-700',
        icon: <FileText className="w-4 h-4" />,
        progress: 10
      },
      'pending': { 
        label: 'Pendiente', 
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-4 h-4" />,
        progress: 25
      },
      'in_progress': { 
        label: 'En Progreso', 
        color: 'bg-blue-100 text-blue-700',
        icon: <Clock className="w-4 h-4" />,
        progress: 50
      },
      'completed': { 
        label: 'Completado', 
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />,
        progress: 75
      },
      'under_review': { 
        label: 'En Revisión', 
        color: 'bg-purple-100 text-purple-700',
        icon: <Eye className="w-4 h-4" />,
        progress: 85
      },
      'approved': { 
        label: 'Aprobado', 
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />,
        progress: 100
      },
      'rejected': { 
        label: 'Rechazado', 
        color: 'bg-red-100 text-red-700',
        icon: <AlertCircle className="w-4 h-4" />,
        progress: 0
      }
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      'assessment': 'Evaluación',
      'consent': 'Consentimiento',
      'treatment_plan': 'Plan de Tratamiento',
      'progress_report': 'Reporte de Progreso'
    };
    
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando documentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!effectivePatientId || !effectivePsychologistId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">No se pudo cargar la información del paciente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos del Paciente
          </CardTitle>
          <CardDescription>
            Gestión de documentos y formularios del paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 mb-4">No hay documentos para este paciente</p>
              </div>
            ) : (
              <>
                {documents.map((document) => {
                  const statusInfo = getStatusInfo(document.status);
                  return (
                    <div key={document.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-800">{document.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(document.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            Creado el {formatDate(document.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600">Progreso</span>
                          <span className="text-xs text-slate-600">{statusInfo.progress}%</span>
                        </div>
                        <Progress value={statusInfo.progress} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDocument(document)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {document.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={showViewer}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
};
