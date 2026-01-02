
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  QrCode, 
  Send, 
  MessageSquare, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from "lucide-react";

interface WhatsAppStatus {
  connected: boolean;
  timestamp: string;
  qr?: string;
  phoneNumber?: string;
}

interface WhatsAppMessage {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  direction: 'outgoing' | 'incoming';
  status: 'sent' | 'delivered' | 'failed';
}

export const WhatsAppManager = () => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [bulkMessages, setBulkMessages] = useState([{ phoneNumber: "", message: "" }]);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = "https://api.proconnection.me/api";

  useEffect(() => {
    checkStatus();
    startStatusPolling();

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  const startStatusPolling = () => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
    
    statusCheckInterval.current = setInterval(checkStatus, 5000);
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setStatus({ connected: false, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setStatus({ connected: false, timestamp: new Date().toISOString() });
    }
  };

  const sendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      toast({
        title: "❌ Error",
        description: "Ingresa número y mensaje",
        variant: "destructive",
      });
      return;
    }

    if (!status?.connected) {
      toast({
        title: "❌ Error",
        description: "WhatsApp no está conectado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testNumber,
          message: testMessage
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestMessage("");
        
        // Agregar mensaje a la lista local
        const newMessage: WhatsAppMessage = {
          id: Date.now().toString(),
          phoneNumber: testNumber,
          message: testMessage,
          timestamp: new Date().toISOString(),
          direction: 'outgoing',
          status: 'sent'
        };
        setMessages(prev => [newMessage, ...prev]);
        
        toast({
          title: "📤 Mensaje Enviado",
          description: `Mensaje enviado a ${testNumber}`,
        });
      } else {
        throw new Error(result.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al enviar mensaje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBulkMessages = async () => {
    const validMessages = bulkMessages.filter(msg => msg.phoneNumber && msg.message);
    
    if (validMessages.length === 0) {
      toast({
        title: "❌ Error",
        description: "Agrega al menos un mensaje válido",
        variant: "destructive",
      });
      return;
    }

    if (!status?.connected) {
      toast({
        title: "❌ Error",
        description: "WhatsApp no está conectado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: validMessages
        }),
      });
      
      const result = await response.json();
      
      if (result.results) {
        const successCount = result.results.filter((r: any) => r.success).length;
        const failCount = result.results.length - successCount;
        
        // Agregar mensajes exitosos a la lista local
        const newMessages = result.results
          .filter((r: any) => r.success)
          .map((r: any, index: number) => ({
            id: (Date.now() + index).toString(),
            phoneNumber: r.phoneNumber,
            message: validMessages.find(m => m.phoneNumber === r.phoneNumber)?.message || '',
            timestamp: new Date().toISOString(),
            direction: 'outgoing' as const,
            status: 'sent' as const
          }));
        
        setMessages(prev => [...newMessages, ...prev]);
        
        toast({
          title: "📤 Envío Masivo Completado",
          description: `${successCount} mensajes enviados${failCount > 0 ? `, ${failCount} fallaron` : ''}`,
        });
        
        // Limpiar mensajes exitosos
        setBulkMessages([{ phoneNumber: "", message: "" }]);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error en envío masivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBulkMessage = () => {
    setBulkMessages([...bulkMessages, { phoneNumber: "", message: "" }]);
  };

  const removeBulkMessage = (index: number) => {
    setBulkMessages(bulkMessages.filter((_, i) => i !== index));
  };

  const updateBulkMessage = (index: number, field: 'phoneNumber' | 'message', value: string) => {
    const updated = [...bulkMessages];
    updated[index][field] = value;
    setBulkMessages(updated);
  };

  const getStatusBadge = () => {
    if (!status) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Verificando...</Badge>;
    }
    
    if (status.connected) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
    } else {
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Desconectado</Badge>;
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+54')) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Sistema WhatsApp</h2>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button 
            onClick={checkStatus} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connection">
            <Smartphone className="w-4 h-4 mr-2" />
            Estado
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="w-4 h-4 mr-2" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="test">
            <Send className="w-4 h-4 mr-2" />
            Envío Individual
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Users className="w-4 h-4 mr-2" />
            Envío Masivo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Estado de Conexión WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {status && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Estado:</span>
                    {getStatusBadge()}
                  </div>
                  {status.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="font-medium">Número:</span>
                      <span className="font-mono">{formatPhoneNumber(status.phoneNumber)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Última verificación:</span>
                    <span className="text-sm text-slate-600">
                      {new Date(status.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>
              )}

              {status?.qr && (
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-300 text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-2">
                      Escanea este código QR con WhatsApp
                    </p>
                    <code className="text-xs bg-slate-100 p-2 rounded block break-all">
                      {status.qr}
                    </code>
                  </div>
                </div>
              )}

              {!status?.connected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Para usar WhatsApp, asegúrate de que el servidor esté ejecutándose y WhatsApp Web esté conectado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Mensajes Enviados
                </div>
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {messages.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-3 rounded-lg border bg-blue-50 border-blue-200 ml-8"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            Para: {formatPhoneNumber(message.phoneNumber)}
                          </span>
                          <Badge 
                            variant={message.status === 'sent' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {message.status === 'sent' ? 'Enviado' : message.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(message.timestamp).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay mensajes enviados aún</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Enviar Mensaje Individual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de WhatsApp</label>
                <Input
                  placeholder="+549111234567"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={sendTestMessage}
                disabled={loading || !status?.connected}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Envío Masivo de Mensajes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {bulkMessages.map((msg, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mensaje {index + 1}</span>
                      {bulkMessages.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBulkMessage(index)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Número</label>
                        <Input
                          placeholder="+549111234567"
                          value={msg.phoneNumber}
                          onChange={(e) => updateBulkMessage(index, 'phoneNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mensaje</label>
                        <Textarea
                          placeholder="Mensaje personalizado..."
                          value={msg.message}
                          onChange={(e) => updateBulkMessage(index, 'message', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={addBulkMessage}>
                  Agregar Mensaje
                </Button>
                <Button 
                  onClick={sendBulkMessages}
                  disabled={loading || !status?.connected}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Enviando...' : 'Enviar Todos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
