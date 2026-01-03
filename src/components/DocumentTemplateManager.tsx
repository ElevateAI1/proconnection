
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Copy, Trash2, Eye } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { TemplateEditor } from './template-editor/TemplateEditor';
import { TemplatePreview } from './template-editor/TemplatePreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProfile } from '@/hooks/useProfile';

export const DocumentTemplateManager: React.FC = () => {
  const { psychologist } = useProfile();
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useDocumentTemplates();
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState('assessment');

  const handleCreateNew = async () => {
    if (!newTemplateName.trim()) return;
    
    try {
      await createTemplate({
        name: newTemplateName,
        document_type: newTemplateType,
        template_content: {},
        is_active: true,
        is_default: false
      });
      setNewTemplateName('');
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleUpdateTemplate = async (templateData: any) => {
    if (!editingTemplate) return;
    
    try {
      await updateTemplate(editingTemplate.id, {
        name: templateData.name,
        document_type: templateData.document_type,
        template_content: templateData.template_content,
        is_active: templateData.is_active,
        is_default: templateData.is_default
      });
      setShowEditor(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando plantillas...</p>
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
            Plantillas de Documentos
          </CardTitle>
          <CardDescription>
            Crea y gestiona plantillas reutilizables para tus documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Create new template section */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-medium mb-4">Crear Nueva Plantilla</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                  <Input
                    id="template-name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Ej: Evaluación Inicial"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTemplateName.trim() && psychologist?.id && !loading) {
                        handleCreateNew();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Tipo de Documento</Label>
                  <select
                    id="template-type"
                    value={newTemplateType}
                    onChange={(e) => setNewTemplateType(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    <option value="assessment">Evaluación</option>
                    <option value="consent">Consentimiento</option>
                    <option value="treatment_plan">Plan de Tratamiento</option>
                    <option value="progress_report">Reporte de Progreso</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateNew} 
                    disabled={!newTemplateName.trim() || !psychologist?.id || loading}
                    className="w-full md:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Plantilla
                  </Button>
                </div>
              </div>
              {!psychologist?.id && (
                <p className="text-sm text-amber-600 mt-2">
                  Cargando información del psicólogo...
                </p>
              )}
            </div>

            {/* Templates list */}
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">No tienes plantillas creadas</p>
                  <p className="text-sm text-slate-500">Crea tu primera plantilla para comenzar</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-800 mb-1">{template.name}</h3>
                        <p className="text-sm text-slate-600">
                          Tipo: {template.document_type} • Creado: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Badge variant="secondary">Por defecto</Badge>
                        )}
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(template)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Vista Previa
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Modal */}
      {showEditor && editingTemplate && (
        <Dialog open={showEditor} onOpenChange={(open) => {
          if (!open) {
            setShowEditor(false);
            setEditingTemplate(null);
          }
        }}>
          <DialogContent className="max-w-7xl max-h-[90vh] p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Editor de Plantilla</DialogTitle>
            </DialogHeader>
            <TemplateEditor
              template={editingTemplate}
              onSave={handleUpdateTemplate}
              onCancel={() => {
                setShowEditor(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <Dialog open={showPreview} onOpenChange={(open) => {
          if (!open) {
            setShowPreview(false);
            setPreviewTemplate(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Vista Previa de Plantilla</DialogTitle>
            </DialogHeader>
            <TemplatePreview template={previewTemplate} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
