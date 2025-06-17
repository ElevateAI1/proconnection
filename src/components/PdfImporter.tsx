
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Loader2, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PdfImporterProps {
  onTextExtracted: (text: string, fileName: string) => void;
  onClose: () => void;
}

export const PdfImporter = ({ onTextExtracted, onClose }: PdfImporterProps) => {
  const [uploading, setUploading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('pdf', file);

      // Call our edge function to process the PDF
      const { data, error } = await supabase.functions.invoke('process-pdf-to-text', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setExtractedText(data.text || '');
      setStep('preview');
      
      toast({
        title: "PDF procesado exitosamente",
        description: "El texto ha sido extraído del PDF",
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error al procesar PDF",
        description: "No se pudo extraer el texto del PDF. Intenta con otro archivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleAcceptText = () => {
    onTextExtracted(extractedText, fileName);
    setStep('complete');
  };

  const handleTryAgain = () => {
    setStep('upload');
    setExtractedText('');
    setFileName('');
  };

  if (step === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">¡Texto importado exitosamente!</h3>
          <p className="text-slate-600 mb-4">
            El texto del PDF se ha convertido en un documento editable.
          </p>
          <Button onClick={onClose} className="w-full">
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'preview') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vista previa del texto extraído
          </CardTitle>
          <p className="text-sm text-slate-600">
            Archivo: {fileName}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap text-sm text-slate-700">
              {extractedText}
            </pre>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleTryAgain}>
              Subir otro PDF
            </Button>
            <Button onClick={handleAcceptText}>
              Usar este texto
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Importar PDF a texto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
              <div>
                <p className="font-medium text-slate-700">Procesando PDF...</p>
                <p className="text-sm text-slate-500">Extrayendo texto del archivo</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="font-medium text-slate-700">
                  {isDragActive ? 'Suelta el PDF aquí' : 'Arrastra un PDF aquí'}
                </p>
                <p className="text-sm text-slate-500">
                  o haz clic para seleccionar un archivo
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
