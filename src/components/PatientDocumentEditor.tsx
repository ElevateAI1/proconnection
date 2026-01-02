
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditableDocument {
  id: string;
  title: string;
  content: Record<string, any>;
  patient_edited_at: string | null;
  template_content?: {
    sections: Array<{
      id: string;
      title: string;
      fields: Array<{
        id: string;
        label: string;
        type: string;
        placeholder?: string;
        required?: boolean;
        patient_editable?: boolean;
        options?: string[];
      }>;
    }>;
  };
}

interface PatientDocumentEditorProps {
  document: EditableDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientDocumentEditor: React.FC<PatientDocumentEditorProps> = ({
  document,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isAlreadyEdited = !!document.patient_edited_at;

  useEffect(() => {
    if (document) {
      setFormData(document.content || {});
    }
  }, [document]);

  const handleFieldChange = (fieldId: string, value: any) => {
    if (isAlreadyEdited) return;
    
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (isAlreadyEdited) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('patient_documents')
        .update({
          content: formData,
          patient_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Documento guardado",
        description: "Tus cambios han sido guardados exitosamente. No podrás editarlo nuevamente.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el documento. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: any) => {
    const isEditable = field.patient_editable || field.type === 'patient_editable_text';
    const value = formData[field.id] || '';

    if (!isEditable && !isAlreadyEdited) {
      return (
        <div key={field.id} className="space-y-1">
          <Label className="text-sm font-medium text-slate-700">
            {field.label}
          </Label>
          <div className="text-slate-600 bg-slate-50 p-2 rounded border">
            {value || '—'}
          </div>
        </div>
      );
    }

    const fieldProps = {
      value: value,
      onChange: (e: any) => handleFieldChange(field.id, e.target?.value || e),
      disabled: isAlreadyEdited,
      className: isAlreadyEdited ? 'bg-slate-50' : ''
    };

    switch (field.type) {
      case 'textarea':
      case 'patient_editable_text':
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              {field.label}
              {isEditable && !isAlreadyEdited && (
                <span className="text-blue-600 text-xs ml-2">(Editable una sola vez)</span>
              )}
            </Label>
            <Textarea
              {...fieldProps}
              placeholder={field.placeholder}
              rows={field.config?.rows || 4}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={isAlreadyEdited}
            />
            <Label className="text-sm font-medium text-slate-700">
              {field.label}
              {isEditable && !isAlreadyEdited && (
                <span className="text-blue-600 text-xs ml-2">(Editable una sola vez)</span>
              )}
            </Label>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              {field.label}
              {isEditable && !isAlreadyEdited && (
                <span className="text-blue-600 text-xs ml-2">(Editable una sola vez)</span>
              )}
            </Label>
            <select
              {...fieldProps}
              className="w-full p-2 border rounded-md bg-white disabled:bg-slate-50"
            >
              <option value="">Selecciona una opción</option>
              {field.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              {field.label}
              {isEditable && !isAlreadyEdited && (
                <span className="text-blue-600 text-xs ml-2">(Editable una sola vez)</span>
              )}
            </Label>
            <Input
              {...fieldProps}
              type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            {isAlreadyEdited ? 'Ver Documento' : 'Completar Documento'}: {document.title}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {!isAlreadyEdited && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Importante</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Solo puedes editar este documento una sola vez. Una vez que guardes los cambios, 
                    no podrás modificarlo nuevamente. Revisa cuidadosamente antes de guardar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAlreadyEdited && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Documento Completado</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Completaste este documento el {new Date(document.patient_edited_at!).toLocaleDateString('es-ES')}.
                    Ya no es posible realizar más cambios.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {document.template_content?.sections?.map((section) => (
              <Card key={section.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                    {section.title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map(renderField)}
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Contenido del Documento
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(document.content || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </Label>
                        <Input
                          value={value as string || ''}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          disabled={isAlreadyEdited}
                          className={isAlreadyEdited ? 'bg-slate-50' : ''}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {isAlreadyEdited ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!isAlreadyEdited && (
              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Definitivamente'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
