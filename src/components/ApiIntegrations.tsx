import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Trash2, Copy, Globe, Plus, ExternalLink } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export const ApiIntegrations = () => {
  const { psychologist } = useProfile();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  useEffect(() => {
    fetchApiKeys();
    fetchWebhooks();
  }, []);

  const fetchApiKeys = async () => {
    // TODO: Implementar cuando tengamos la tabla de API keys
    setApiKeys([]);
    setLoading(false);
  };

  const fetchWebhooks = async () => {
    // TODO: Implementar cuando tengamos la tabla de webhooks
    setWebhooks([]);
    setLoading(false);
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un nombre para la API key',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingKey(true);
    try {
      // Generar API key aleatoria
      const apiKey = `pk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      // TODO: Guardar en base de datos cuando tengamos la tabla
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        name: newKeyName,
        key: apiKey,
        created_at: new Date().toISOString()
      };

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      
      toast({
        title: 'API Key generada',
        description: 'La API key se ha generado correctamente. Cópiala ahora, no podrás verla de nuevo.'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al generar la API key',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: 'API key copiada al portapapeles'
    });
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta API key?')) {
      return;
    }

    try {
      // TODO: Eliminar de base de datos
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      toast({
        title: 'API Key eliminada',
        description: 'La API key ha sido eliminada correctamente'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la API key',
        variant: 'destructive'
      });
    }
  };

  const createWebhook = async () => {
    if (!newWebhookUrl.trim() || !newWebhookUrl.startsWith('http')) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una URL válida',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingWebhook(true);
    try {
      // TODO: Guardar en base de datos
      const newWebhook: Webhook = {
        id: crypto.randomUUID(),
        url: newWebhookUrl,
        events: ['appointment.created', 'payment.received'],
        active: true,
        created_at: new Date().toISOString()
      };

      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl('');
      
      toast({
        title: 'Webhook creado',
        description: 'El webhook se ha creado correctamente'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al crear el webhook',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  return (
    <PlanGate capability="api_integrations">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-petrol mb-2">
            Integraciones API
          </h1>
          <p className="text-slate-600">
            Gestiona tus API keys y webhooks para integrar ProConnection con otros sistemas
          </p>
        </div>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de la API key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-48"
                />
                <Button onClick={generateApiKey} disabled={isCreatingKey}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No tienes API keys generadas. Genera una para comenzar a usar la API.
              </p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{key.name}</p>
                        <Badge variant="outline">{key.key.substring(0, 20)}...</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Creada: {new Date(key.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteApiKey(key.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Webhooks
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="https://tu-servidor.com/webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-64"
                />
                <Button onClick={createWebhook} disabled={isCreatingWebhook}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No tienes webhooks configurados. Crea uno para recibir notificaciones de eventos.
              </p>
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{webhook.url}</p>
                        <Badge variant={webhook.active ? 'default' : 'secondary'}>
                          {webhook.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Eventos: {webhook.events.join(', ')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentación */}
        <Card>
          <CardHeader>
            <CardTitle>Documentación de API</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              La documentación completa de la API estará disponible próximamente.
            </p>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Documentación
            </Button>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};

