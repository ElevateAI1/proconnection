
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

interface TemplatePreviewProps {
  template: TemplateData;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Safely get sections from either template.sections or template.template_content.sections
  const sections = template.sections || template.template_content?.sections || [];

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'patient_editable_text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
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
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={field.config?.rows || 4}
            />
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
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
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
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(newValue) => handleFieldChange(field.id, newValue)}>
              <SelectTrigger>
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vista Previa: {template.name || 'Plantilla sin nombre'}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto" style={{ height: 'calc(100% - 100px)' }}>
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="space-y-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.fields?.map(renderField) || []}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg mb-2">Sin campos para mostrar</p>
            <p>Agrega campos en el editor para ver la vista previa</p>
          </div>
        )}
        
        {sections.length > 0 && sections.some(section => section.fields?.length > 0) && (
          <div className="pt-6 border-t">
            <Button className="w-full">
              Enviar Formulario (Vista Previa)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
