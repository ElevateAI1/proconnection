import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  config?: any;
  patient_editable?: boolean;
  editable_until_days?: number;
}

interface FieldConfigModalProps {
  field: FormField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}

export const FieldConfigModal: React.FC<FieldConfigModalProps> = ({
  field,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: [],
    config: {},
    patient_editable: false,
    editable_until_days: 7
  });

  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (field) {
      setFormData(field);
    }
  }, [field]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const needsOptions = ['radio', 'select'].includes(formData.type);
  const isPatientEditableType = formData.type === 'patient_editable_text';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Campo</DialogTitle>
          <DialogDescription>
            Personaliza las propiedades del campo de formulario
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="fieldLabel">Etiqueta del Campo</Label>
            <Input
              id="fieldLabel"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Ej: Nombre completo"
            />
          </div>

          {formData.type !== 'checkbox' && (
            <div>
              <Label htmlFor="fieldPlaceholder">Texto de Ayuda</Label>
              <Input
                id="fieldPlaceholder"
                value={formData.placeholder || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Ej: Ingrese su nombre completo"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fieldRequired"
              checked={formData.required}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, required: !!checked }))
              }
            />
            <Label htmlFor="fieldRequired">Campo requerido</Label>
          </div>

          {!isPatientEditableType && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="patientEditable"
                checked={formData.patient_editable || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, patient_editable: !!checked }))
                }
              />
              <Label htmlFor="patientEditable">Editable por paciente (una sola vez)</Label>
            </div>
          )}

          {(formData.patient_editable || isPatientEditableType) && (
            <div>
              <Label htmlFor="editableDays">Días límite para editar</Label>
              <Input
                id="editableDays"
                type="number"
                value={formData.editable_until_days || 7}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  editable_until_days: parseInt(e.target.value) || 7
                }))}
                min="1"
                max="365"
              />
              <p className="text-xs text-slate-600 mt-1">
                El paciente tendrá este tiempo para editar el campo después de recibir el documento
              </p>
            </div>
          )}

          {formData.type === 'textarea' && (
            <div>
              <Label htmlFor="textareaRows">Número de filas</Label>
              <Input
                id="textareaRows"
                type="number"
                value={formData.config?.rows || 4}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, rows: parseInt(e.target.value) || 4 }
                }))}
                min="2"
                max="10"
              />
            </div>
          )}

          {formData.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numberMin">Valor mínimo</Label>
                <Input
                  id="numberMin"
                  type="number"
                  value={formData.config?.min || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config, min: e.target.value ? parseInt(e.target.value) : undefined }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="numberMax">Valor máximo</Label>
                <Input
                  id="numberMax"
                  type="number"
                  value={formData.config?.max || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config, max: e.target.value ? parseInt(e.target.value) : undefined }
                  }))}
                />
              </div>
            </div>
          )}

          {needsOptions && (
            <div>
              <Label>Opciones</Label>
              <div className="space-y-2">
                {formData.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1 justify-start">
                      {option}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Nueva opción"
                    onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  />
                  <Button onClick={addOption} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.label.trim()}>
            Guardar Campo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
