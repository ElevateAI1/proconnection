
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Download, RefreshCw } from 'lucide-react';
import { downloadSitemap, generateSitemap } from '@/utils/sitemapGenerator';
import { toast } from '@/hooks/use-toast';

export const SeoAdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [sitemapPreview, setSitemapPreview] = useState<string>('');

  const handleGenerateSitemap = async () => {
    setLoading(true);
    try {
      const sitemap = await generateSitemap();
      setSitemapPreview(sitemap);
      toast({
        title: "Sitemap generado",
        description: "El sitemap se ha generado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el sitemap",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSitemap = async () => {
    try {
      await downloadSitemap();
      toast({
        title: "Sitemap descargado",
        description: "El archivo sitemap.xml ha sido descargado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al descargar el sitemap",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Panel de SEO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={handleGenerateSitemap}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Generar Sitemap
          </Button>
          
          <Button 
            onClick={handleDownloadSitemap}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Sitemap
          </Button>
        </div>

        {sitemapPreview && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Vista Previa del Sitemap:</h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {sitemapPreview}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">URLs del Sitemap:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Página principal: /</li>
            <li>• Demo: /demo</li>
            <li>• Registro: /register</li>
            <li>• Perfiles públicos: /perfil/[url-personalizada]</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
