
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  document_type: string;
  template_content: any;
  created_at: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  loading?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelectTemplate,
  loading = false
}) => {
  const getTypeLabel = (type: string) => {
    const typeLabels = {
      'assessment': 'Evaluación',
      'consent': 'Consentimiento',
      'treatment_plan': 'Plan de Tratamiento',
      'progress_report': 'Reporte de Progreso'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeColor = (type: string) => {
    const typeColors = {
      'assessment': 'bg-blue-100 text-blue-700',
      'consent': 'bg-green-100 text-green-700',
      'treatment_plan': 'bg-purple-100 text-purple-700',
      'progress_report': 'bg-orange-100 text-orange-700'
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No hay plantillas disponibles
        </h3>
        <p className="text-slate-600 mb-4">
          Crea tu primera plantilla para comenzar a generar documentos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base mb-2">{template.name}</CardTitle>
                <Badge className={getTypeColor(template.document_type)}>
                  {getTypeLabel(template.document_type)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Users className="w-4 h-4 mr-2" />
                {template.template_content?.sections?.length || 0} secciones
              </div>
              
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(template.created_at).toLocaleDateString()}
              </div>
              
              <Button 
                className="w-full group-hover:bg-blue-600 transition-colors"
                onClick={() => onSelectTemplate(template)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Usar Plantilla
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
