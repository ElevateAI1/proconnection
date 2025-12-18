
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  config?: any;
}

interface TemplateSection {
  id: string;
  title: string;
  fields: FormField[];
}

interface Template {
  id: string;
  name: string;
  document_type: string;
  template_content?: {
    name?: string;
    document_type?: string;
    sections?: TemplateSection[];
  };
}

interface TemplateFormProps {
  template: Template;
  patientId?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  onPreview: (data: any) => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  patientId,
  onSave,
  onCancel,
  onPreview
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const sections = template.template_content?.sections || [];
    sections.forEach(section => {
      const fields = section.fields || [];
      fields.forEach(field => {
        if (field.required && (!formData[field.id] || formData[field.id] === '')) {
          newErrors[field.id] = `${field.label} es requerido`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const documentData = {
        title: template.name,
        type: template.document_type,
        template_id: template.id,
        content: formData,
        patient_id: patientId,
        status: 'completed'
      };
      onSave(documentData);
    }
  };

  const handlePreview = () => {
    const documentData = {
      title: template.name,
      type: template.document_type,
      template_id: template.id,
      content: formData,
      template_content: template.template_content
    };
    onPreview(documentData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const hasError = !!errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              min={field.config?.min}
              max={field.config?.max}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={field.config?.rows || 4}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label className={hasError ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(newValue) => handleFieldChange(field.id, newValue)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || "Selecciona una opción"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-red-600">{errors[field.id]}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{template.name}</h1>
            <p className="text-slate-600">Completa los campos para generar el documento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            disabled={!template.template_content?.sections || template.template_content.sections.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!template.template_content?.sections || template.template_content.sections.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Documento
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {template.template_content?.sections && template.template_content.sections.length > 0 ? (
          template.template_content.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields?.map(renderField) || []}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  Esta plantilla aún no tiene secciones configuradas.
                </p>
                <p className="text-sm text-slate-500">
                  Por favor, edita la plantilla desde la pestaña "Plantillas" para agregar campos y secciones.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
