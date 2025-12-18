
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { TemplateSelector } from './TemplateSelector';
import { TemplateForm } from './TemplateForm';
import { DocumentPreview } from './DocumentPreview';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface TemplateUsageManagerProps {
  patientId?: string;
  onBack?: () => void;
  onDocumentCreated?: () => void;
}

type ViewState = 'selector' | 'form' | 'preview';

export const TemplateUsageManager: React.FC<TemplateUsageManagerProps> = ({
  patientId,
  onBack,
  onDocumentCreated
}) => {
  const { psychologist } = useProfile();
  const { templates, loading } = useDocumentTemplates();
  const [currentView, setCurrentView] = useState<ViewState>('selector');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCurrentView('form');
  };

  const handleFormSave = async (documentData: any) => {
    if (!psychologist?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Saving document with template data:', {
        documentData,
        selectedTemplate
      });

      const { data, error } = await supabase
        .from('patient_documents')
        .insert({
          psychologist_id: psychologist.id,
          patient_id: documentData.patient_id || patientId,
          title: documentData.title,
          type: documentData.type,
          content: {
            ...documentData.content,
            template_id: documentData.template_id,
            generated_from_template: true,
            template_name: selectedTemplate?.name,
            template_content: selectedTemplate?.template_content || {
              sections: selectedTemplate?.sections || []
            }
          },
          status: documentData.status || 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Document saved successfully:', data);

      toast({
        title: "Éxito",
        description: "Documento creado correctamente"
      });

      setCurrentView('selector');
      setSelectedTemplate(null);
      onDocumentCreated?.();
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el documento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFormPreview = (documentData: any) => {
    // Include template content in preview document
    setPreviewDocument({
      ...documentData,
      template_content: selectedTemplate?.template_content || {
        sections: selectedTemplate?.sections || []
      }
    });
  };

  const handlePreviewSave = () => {
    if (previewDocument) {
      handleFormSave(previewDocument);
      setPreviewDocument(null);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'selector':
        return (
          <TemplateSelector
            templates={templates}
            onSelectTemplate={handleTemplateSelect}
            loading={loading}
          />
        );

      case 'form':
        if (!selectedTemplate) {
          return (
            <div className="text-center py-8">
              <p className="text-slate-600">No se seleccionó ninguna plantilla</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentView('selector');
                  setSelectedTemplate(null);
                }}
                className="mt-4"
              >
                Volver
              </Button>
            </div>
          );
        }
        
        // Normalize template structure
        const normalizedTemplate = {
          ...selectedTemplate,
          template_content: selectedTemplate.template_content || {
            name: selectedTemplate.name,
            document_type: selectedTemplate.document_type,
            sections: selectedTemplate.template_content?.sections || []
          }
        };
        
        return (
          <TemplateForm
            template={normalizedTemplate}
            patientId={patientId}
            onSave={handleFormSave}
            onCancel={() => {
              setCurrentView('selector');
              setSelectedTemplate(null);
            }}
            onPreview={handleFormPreview}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {currentView === 'selector' && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Usar Plantillas
                </CardTitle>
                <CardDescription>
                  Selecciona una plantilla para generar un nuevo documento
                </CardDescription>
              </div>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {renderCurrentView()}
            </CardContent>
          </Card>
        </>
      )}

      {currentView === 'form' && renderCurrentView()}

      {/* Preview Modal */}
      <DocumentPreview
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        onSave={handlePreviewSave}
      />
    </div>
  );
};
