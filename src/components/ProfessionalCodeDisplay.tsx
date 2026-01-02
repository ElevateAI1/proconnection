
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalCodeDisplayProps {
  code: string;
  onRegenerateCode?: () => void;
  compact?: boolean;
}

export const ProfessionalCodeDisplay = ({ code, onRegenerateCode, compact = false }: ProfessionalCodeDisplayProps) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Código copiado",
        description: "El código profesional ha sido copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerateCode) return;
    
    setIsRegenerating(true);
    try {
      await onRegenerateCode();
      toast({
        title: "Código regenerado",
        description: "Se ha generado un nuevo código profesional",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo regenerar el código",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (compact) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-600 mb-1">Código Profesional</p>
              <div className="text-lg font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-200">
                {code}
              </div>
            </div>
            
            <p className="text-xs text-slate-500 text-center">
              Comparte este código con tus pacientes
            </p>
            
            <div className="flex gap-1">
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                variant="outline"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              
              {onRegenerateCode && (
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  size="sm"
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                  variant="outline"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? '...' : 'Nuevo'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          Código Profesional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-blue-600 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              {code}
            </div>
          </div>
          
          <p className="text-sm text-slate-600 text-center">
            Comparte este código con tus pacientes para que puedan registrarse y asignarse automáticamente a tu consulta.
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Código
            </Button>
            
            {onRegenerateCode && (
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerando...' : 'Regenerar'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
