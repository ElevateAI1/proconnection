
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Save, ArrowLeft } from 'lucide-react';
import { FieldTypeSelector } from './FieldTypeSelector';
import { DraggableField } from './DraggableField';
import { FieldConfigModal } from './FieldConfigModal';
import { TemplatePreview } from './TemplatePreview';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  config?: any;
}

interface TemplateData {
  name: string;
  document_type: string;
  template_content?: {
    sections?: {
      id: string;
      title: string;
      fields: FormField[];
    }[];
  };
  sections?: {
    id: string;
    title: string;
    fields: FormField[];
  }[];
}

interface TemplateEditorProps {
  template?: TemplateData;
  onSave: (template: TemplateData) => void;
  onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [templateData, setTemplateData] = useState<TemplateData>(
    template || {
      name: '',
      document_type: '',
      sections: [
        {
          id: 'section-1',
          title: 'Información General',
          fields: []
        }
      ]
    }
  );

  const [activeTab, setActiveTab] = useState('editor');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  const addField = (fieldType: any) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType.name,
      label: `Nuevo ${fieldType.label}`,
      required: fieldType.defaultConfig.required || false,
      placeholder: fieldType.defaultConfig.placeholder,
      options: fieldType.defaultConfig.options,
      config: fieldType.defaultConfig
    };

    setTemplateData(prev => ({
      ...prev,
      sections: prev.sections?.map((section, index) => 
        index === 0 // Add to first section for now
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ) || [
        {
          id: 'section-1',
          title: 'Información General',
          fields: [newField]
        }
      ]
    }));
  };

  const editField = (field: FormField) => {
    setEditingField(field);
    setIsFieldModalOpen(true);
  };

  const saveField = (updatedField: FormField) => {
    setTemplateData(prev => ({
      ...prev,
      sections: prev.sections?.map(section => ({
        ...section,
        fields: section.fields.map(field => 
          field.id === updatedField.id ? updatedField : field
        )
      })) || []
    }));
  };

  const deleteField = (fieldId: string) => {
    setTemplateData(prev => ({
      ...prev,
      sections: prev.sections?.map(section => ({
        ...section,
        fields: section.fields.filter(field => field.id !== fieldId)
      })) || []
    }));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (destination.index === source.index) return;

    setTemplateData(prev => {
      const sections = prev.sections || [];
      const section = sections[0]; // Working with first section for now
      if (!section) return prev;
      
      const newFields = Array.from(section.fields);
      const [reorderedField] = newFields.splice(source.index, 1);
      newFields.splice(destination.index, 0, reorderedField);

      return {
        ...prev,
        sections: sections.map((s, index) =>
          index === 0 ? { ...s, fields: newFields } : s
        )
      };
    });
  };

  const handleSave = () => {
    onSave(templateData);
  };

  // Get the first section safely
  const firstSection = templateData.sections?.[0];
  const sectionFields = firstSection?.fields || [];

  return (
    <div className="h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">Editor de Plantillas</h1>
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={!templateData.name || !templateData.document_type}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Plantilla
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Field Types */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Campos Disponibles</CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto">
              <FieldTypeSelector onFieldSelect={addField} />
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Editor/Preview */}
        <div className="col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="h-full mt-0">
              <Card className="h-full">
                <CardHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Nombre de la Plantilla</Label>
                      <Input
                        id="templateName"
                        value={templateData.name}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Evaluación Psicológica Inicial"
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentType">Tipo de Documento</Label>
                      <Select 
                        value={templateData.document_type} 
                        onValueChange={(value) => setTemplateData(prev => ({ ...prev, document_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assessment">Evaluación</SelectItem>
                          <SelectItem value="consent">Consentimiento</SelectItem>
                          <SelectItem value="treatment_plan">Plan de Tratamiento</SelectItem>
                          <SelectItem value="progress_report">Reporte de Progreso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="form-fields">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {sectionFields.map((field, index) => (
                            <DraggableField
                              key={field.id}
                              field={field}
                              index={index}
                              onEdit={editField}
                              onDelete={deleteField}
                            />
                          ))}
                          {provided.placeholder}
                          
                          {sectionFields.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                              <p className="text-lg mb-2">No hay campos añadidos</p>
                              <p>Arrastra campos desde el panel izquierdo para comenzar</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="h-full mt-0">
              <TemplatePreview template={templateData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FieldConfigModal
        field={editingField}
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField(null);
        }}
        onSave={saveField}
      />
    </div>
  );
};
