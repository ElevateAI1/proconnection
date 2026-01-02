
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TemplateField {
  id: string;
  label: string;
  type: string;
}

interface TemplateSection {
  id: string;
  title: string;
  fields: TemplateField[];
}

interface TemplateDocumentRendererProps {
  content: Record<string, any>;
  templateContent?: {
    sections?: TemplateSection[];
  };
}

export const TemplateDocumentRenderer: React.FC<TemplateDocumentRendererProps> = ({
  content,
  templateContent
}) => {
  const formatValue = (value: any, fieldType: string) => {
    if (value === undefined || value === null || value === '') {
      return '—';
    }

    switch (fieldType) {
      case 'checkbox':
        return value ? 'Sí' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString('es-ES');
      case 'textarea':
        return (
          <div className="whitespace-pre-wrap text-slate-900">
            {String(value)}
          </div>
        );
      default:
        return String(value);
    }
  };

  // If we have template content with sections, render using the template structure
  if (templateContent?.sections && templateContent.sections.length > 0) {
    return (
      <div className="space-y-6">
        {templateContent.sections.map((section) => (
          <Card key={section.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      {field.label}:
                    </label>
                    <div className="text-slate-900 bg-slate-50 p-2 rounded border min-h-[40px] flex items-center">
                      {formatValue(content[field.id], field.type)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Fallback: render all content fields generically
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Contenido del Documento
        </h2>
        <div className="space-y-3">
          {Object.entries(content || {}).map(([key, value]) => {
            // Skip technical fields
            if (['template_id', 'generated_from_template', 'template_name'].includes(key)) {
              return null;
            }
            
            return (
              <div key={key} className="flex justify-between items-start py-2 border-b">
                <span className="font-medium text-slate-700 capitalize min-w-[120px]">
                  {key.replace(/_/g, ' ').replace(/field-\d+/g, 'Campo')}:
                </span>
                <div className="text-slate-900 flex-1 ml-4">
                  {formatValue(value, 'text')}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
