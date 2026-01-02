
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PROCONNECTION_API_URL = "https://api.proconnection.me/api";

interface WhatsAppConnectionStatus {
  connected: boolean;
  phoneNumber?: string;
  timestamp: string;
  error?: string;
}

export const WhatsAppStatus: React.FC = () => {
  const [status, setStatus] = useState<WhatsAppConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      console.log('🔄 Checking WhatsApp connection status...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${PROCONNECTION_API_URL}/status`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ProConnection API status:', data);
        
        const connectionStatus: WhatsAppConnectionStatus = {
          connected: data.connected || data.status === 'connected',
          phoneNumber: data.phoneNumber || data.phone_number,
          timestamp: new Date().toISOString()
        };
        
        setStatus(connectionStatus);
        
        if (connectionStatus.connected) {
          toast({
            title: "✅ Conexión Verificada",
            description: `WhatsApp conectado ${connectionStatus.phoneNumber ? `- ${connectionStatus.phoneNumber}` : ''}`,
          });
        }
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      
      const errorStatus: WhatsAppConnectionStatus = {
        connected: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection failed'
      };
      
      setStatus(errorStatus);
      
      toast({
        title: "❌ Error de Conexión",
        description: error.name === 'AbortError' 
          ? "Timeout al verificar WhatsApp"
          : "No se pudo conectar con la API de WhatsApp",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const getStatusColor = () => {
    if (loading) return "bg-gray-100 text-gray-700";
    return status?.connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  const getStatusText = () => {
    if (loading) return "Verificando...";
    return status?.connected ? "Conectado" : "Desconectado";
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-5 h-5 animate-spin" />;
    return status?.connected ? (
      <Wifi className="w-5 h-5 text-green-500" />
    ) : (
      <WifiOff className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="w-5 h-5" />
          Estado de Conexión WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
              {status?.phoneNumber && (
                <p className="text-sm text-slate-600 mt-1">
                  Número: {status.phoneNumber}
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={checkConnectionStatus}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
        </div>

        {status?.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error de conexión</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{status.error}</p>
          </div>
        )}

        {status?.connected && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">API funcionando correctamente</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Última verificación: {new Date(status.timestamp).toLocaleString('es-ES')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
