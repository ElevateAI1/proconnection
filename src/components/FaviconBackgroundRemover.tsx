
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Wand2, Download, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

export const FaviconBackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setOriginalImage(objectUrl);
      setProcessedImage(null);
      
      toast({
        title: "Imagen cargada",
        description: "La imagen se ha cargado correctamente",
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive"
      });
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);

    try {
      // Convert image URL to HTMLImageElement
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImage;
      });

      // Remove background
      const processedBlob = await removeBackground(img);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);

      toast({
        title: "Fondo eliminado",
        description: "El fondo se ha eliminado exitosamente",
      });

    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el fondo. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'favicon-sin-fondo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Descarga iniciada",
      description: "La imagen sin fondo se está descargando",
    });
  };

  const handleUpdateFavicon = () => {
    if (!processedImage) return;

    // Update the favicon in the document head
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.setAttribute('href', processedImage);
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = processedImage;
      document.head.appendChild(newFavicon);
    }

    toast({
      title: "Favicon actualizado",
      description: "El favicon se ha actualizado. Refresca la página para ver los cambios.",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Eliminar Fondo del Favicon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="favicon-upload" className="text-sm font-medium">
              Subir imagen del favicon
            </Label>
            <div className="mt-2">
              <Input
                id="favicon-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Formatos soportados: PNG, JPG, SVG. Máximo 5MB.
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {originalImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="text-center">
              <Label className="text-sm font-medium">Imagen original</Label>
              <div className="mt-2 p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <img 
                  src={originalImage} 
                  alt="Original favicon" 
                  className="max-h-32 mx-auto object-contain"
                />
              </div>
            </div>

            {/* Processed Image */}
            <div className="text-center">
              <Label className="text-sm font-medium">Sin fondo</Label>
              <div className="mt-2 p-4 border-2 border-dashed border-slate-200 rounded-lg bg-transparent" 
                   style={{ 
                     backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                     backgroundSize: '20px 20px',
                     backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                   }}>
                {processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="Processed favicon" 
                    className="max-h-32 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {originalImage && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRemoveBackground}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {isProcessing ? 'Procesando...' : 'Eliminar Fondo'}
            </Button>

            {processedImage && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </Button>

                <Button
                  variant="default"
                  onClick={handleUpdateFavicon}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Usar como Favicon
                </Button>
              </>
            )}
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información importante:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Esta herramienta usa IA para detectar y eliminar automáticamente el fondo</li>
                <li>El procesamiento se realiza completamente en tu navegador</li>
                <li>Para mejores resultados, usa imágenes con buen contraste entre el objeto y el fondo</li>
                <li>El favicon se actualizará temporalmente; guarda la imagen para uso permanente</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
