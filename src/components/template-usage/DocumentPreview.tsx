
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer, X } from 'lucide-react';

interface DocumentPreviewProps {
  document: {
    title: string;
    type: string;
    content: Record<string, any>;
    template_content?: {
      sections: Array<{
        id: string;
        title: string;
        fields: Array<{
          id: string;
          label: string;
          type: string;
        }>;
      }>;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  isOpen,
  onClose,
  onSave
}) => {
  // Early return if document is null or undefined
  if (!document) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Vista Previa del Documento
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="mt-6">
            <p className="text-slate-600">No hay documento disponible para mostrar.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatValue = (value: any, fieldType: string) => {
    if (value === undefined || value === null || value === '') {
      return '—';
    }

    switch (fieldType) {
      case 'checkbox':
        return value ? 'Sí' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString('es-ES');
      default:
        return String(value);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementar descarga como PDF
    console.log('Downloading document...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            Vista Previa: {document.title}
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            {onSave && (
              <Button onClick={onSave} size="sm">
                Guardar Documento
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Document Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {document.title}
            </h1>
            <p className="text-slate-600">
              Fecha: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-6">
            {document.template_content?.sections?.map((section) => (
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
                          {formatValue(document.content[field.id], field.type)}
                        </div>
                      </div>
                    ))}
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
                      <div key={key} className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium text-slate-700 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-slate-900">
                          {formatValue(value, 'text')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Document Footer */}
          <div className="text-center border-t pt-4 text-sm text-slate-600">
            <p>Documento generado automáticamente por ProConnection</p>
            <p>© {new Date().getFullYear()} - Todos los derechos reservados</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
