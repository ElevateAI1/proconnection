
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useRealtimeContext } from '@/contexts/RealtimeContext';

export const RealtimeStatus: React.FC = () => {
  const { isRealtimeEnabled, disabledChannels, setRealtimeEnabled, enableChannel } = useRealtimeContext();

  const handleReconnectAll = () => {
    // Re-habilitar todos los canales deshabilitados
    Array.from(disabledChannels).forEach(channelName => {
      enableChannel(channelName);
    });
    setRealtimeEnabled(true);
  };

  if (isRealtimeEnabled && disabledChannels.size === 0) {
    return null; // No mostrar nada si todo está funcionando bien
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRealtimeEnabled ? (
              <Wifi className="w-5 h-5 text-yellow-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-yellow-800">
                  {isRealtimeEnabled ? 'Actualizaciones en tiempo real limitadas' : 'Actualizaciones en tiempo real deshabilitadas'}
                </span>
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  {disabledChannels.size} canales deshabilitados
                </Badge>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Algunos datos se actualizarán automáticamente cada 30-60 segundos
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleReconnectAll}
            size="sm"
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconectar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
