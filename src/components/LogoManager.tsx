
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, Link, Save, RotateCcw, Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FaviconBackgroundRemover } from './FaviconBackgroundRemover';

interface LogoManagerProps {
  onLogoChange: (logoUrl: string) => void;
  currentLogo?: string;
}

export const LogoManager = ({ onLogoChange, currentLogo }: LogoManagerProps) => {
  const [logoUrl, setLogoUrl] = useState(currentLogo || '');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentLogo || '');

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

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 2MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // In a real implementation, you would upload to Supabase Storage here
      // For now, we'll just use the object URL
      setLogoUrl(objectUrl);
      
      toast({
        title: "Logo cargado",
        description: "La imagen se ha cargado correctamente",
      });

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setLogoUrl(url);
    setPreviewUrl(url);
  };

  const handleSave = () => {
    if (!logoUrl.trim()) {
      toast({
        title: "Error",
        description: "Debes subir una imagen o proporcionar una URL",
        variant: "destructive"
      });
      return;
    }

    onLogoChange(logoUrl);
    toast({
      title: "Logo actualizado",
      description: "El logo se ha actualizado correctamente",
    });
  };

  const handleReset = () => {
    const defaultLogo = "/lovable-uploads/befe2e15-db81-4d89-805b-b994227673d5.png";
    setLogoUrl(defaultLogo);
    setPreviewUrl(defaultLogo);
    onLogoChange(defaultLogo);
    
    toast({
      title: "Logo restaurado",
      description: "Se ha restaurado el logo por defecto",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Subir Logo</TabsTrigger>
          <TabsTrigger value="remove-bg">Quitar Fondo</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Gestión de Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Current Logo Preview */}
              {previewUrl && (
                <div className="text-center">
                  <Label className="text-sm font-medium">Vista previa actual</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                    <img 
                      src={previewUrl} 
                      alt="Logo preview" 
                      className="max-h-20 mx-auto object-contain"
                      onError={() => {
                        setPreviewUrl('');
                        toast({
                          title: "Error",
                          description: "No se pudo cargar la imagen",
                          variant: "destructive"
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo-upload" className="text-sm font-medium">
                    Subir nueva imagen
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Formatos soportados: PNG, JPG, SVG. Máximo 2MB.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">O</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo-url" className="text-sm font-medium">
                    URL de imagen
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="logo-url"
                        type="url"
                        placeholder="https://ejemplo.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar original
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!logoUrl.trim() || uploading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {uploading ? 'Guardando...' : 'Guardar logo'}
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remove-bg">
          <FaviconBackgroundRemover />
        </TabsContent>
      </Tabs>
    </div>
  );
};
