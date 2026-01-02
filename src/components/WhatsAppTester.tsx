import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatArgentinePhoneNumber, isValidPhoneNumber } from '@/utils/notificationHelpers';
import { PhoneNumberValidator } from './PhoneNumberValidator';
import { 
  Smartphone, 
  Send, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Play,
  RefreshCw,
  MessageSquare,
  History,
  Info
} from 'lucide-react';

interface TestResult {
  id: string;
  type: 'individual' | 'bulk' | 'reminder' | 'status';
  timestamp: string;
  request: any;
  response: any;
  success: boolean;
  phoneNumber?: string;
  message?: string;
}

interface WhatsAppStatus {
  connected: boolean;
  timestamp: string;
  qr?: string;
  phoneNumber?: string;
}

export const WhatsAppTester = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Estados para envío individual
  const [singleNumber, setSingleNumber] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  
  // Estados para envío masivo
  const [bulkNumbers, setBulkNumbers] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  
  // Estados para recordatorio
  const [reminderNumber, setReminderNumber] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderDelay, setReminderDelay] = useState('5');
  
  const { toast } = useToast();
  const API_BASE_URL = "https://api.proconnection.me/api";

  const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = response.ok ? await response.json() : null;
      
      const statusResult = data || { connected: false, timestamp: new Date().toISOString() };
      setStatus(statusResult);
      
      addTestResult({
        type: 'status',
        request: { endpoint: '/status' },
        response: statusResult,
        success: response.ok
      });
      
      toast({
        title: statusResult.connected ? "✅ Conectado" : "❌ Desconectado",
        description: statusResult.connected ? "WhatsApp está listo" : "WhatsApp no está conectado",
        variant: statusResult.connected ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error checking status:', error);
      const errorStatus = { connected: false, timestamp: new Date().toISOString() };
      setStatus(errorStatus);
      
      addTestResult({
        type: 'status',
        request: { endpoint: '/status' },
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      });
      
      toast({
        title: "❌ Error",
        description: "No se pudo verificar el estado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSingleMessage = async () => {
    if (!singleNumber || !singleMessage) {
      toast({
        title: "❌ Error",
        description: "Ingresa número y mensaje",
        variant: "destructive"
      });
      return;
    }

    const formattedNumber = formatArgentinePhoneNumber(singleNumber);
    const isValid = isValidPhoneNumber(singleNumber);
    
    if (!isValid) {
      toast({
        title: "⚠️ Número formateado",
        description: `${singleNumber} → ${formattedNumber}`,
      });
    }

    setLoading(true);
    try {
      const requestBody = {
        phoneNumber: formattedNumber,
        message: singleMessage
      };
      
      const response = await fetch(`${API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      addTestResult({
        type: 'individual',
        request: requestBody,
        response: result,
        success: result.success || false,
        phoneNumber: formattedNumber,
        message: singleMessage
      });
      
      if (result.success) {
        toast({
          title: "📤 Mensaje Enviado",
          description: `Enviado a ${formattedNumber}`
        });
        setSingleMessage('');
      } else {
        throw new Error(result.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al enviar mensaje",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBulkMessages = async () => {
    if (!bulkNumbers || !bulkMessage) {
      toast({
        title: "❌ Error",
        description: "Ingresa números y mensaje",
        variant: "destructive"
      });
      return;
    }

    const numbers = bulkNumbers.split('\n').filter(n => n.trim());
    const messages = numbers.map(phoneNumber => ({
      phoneNumber: formatArgentinePhoneNumber(phoneNumber.trim()),
      message: bulkMessage
    }));

    setLoading(true);
    try {
      const requestBody = { messages };
      
      const response = await fetch(`${API_BASE_URL}/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      addTestResult({
        type: 'bulk',
        request: requestBody,
        response: result,
        success: !!result.results
      });
      
      if (result.results) {
        const successCount = result.results.filter((r: any) => r.success).length;
        const failCount = result.results.length - successCount;
        
        toast({
          title: "📤 Envío Masivo Completado",
          description: `${successCount} enviados${failCount > 0 ? `, ${failCount} fallaron` : ''}`
        });
        setBulkMessage('');
      } else {
        throw new Error('Error en envío masivo');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error en envío masivo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleReminder = async () => {
    if (!reminderNumber || !reminderMessage || !reminderDelay) {
      toast({
        title: "❌ Error",
        description: "Completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const formattedNumber = formatArgentinePhoneNumber(reminderNumber);

    setLoading(true);
    try {
      const requestBody = {
        phoneNumber: formattedNumber,
        message: reminderMessage,
        delay: parseInt(reminderDelay)
      };
      
      const response = await fetch(`${API_BASE_URL}/schedule-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      addTestResult({
        type: 'reminder',
        request: requestBody,
        response: result,
        success: result.success || false,
        phoneNumber: formattedNumber,
        message: reminderMessage
      });
      
      if (result.success) {
        toast({
          title: "⏰ Recordatorio Programado",
          description: `Enviará a ${formattedNumber} en ${reminderDelay} minutos`
        });
        setReminderMessage('');
      } else {
        throw new Error(result.message || 'Error al programar recordatorio');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error al programar recordatorio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    toast({
      title: "🗑️ Historial Limpio",
      description: "Se eliminaron todos los resultados de prueba"
    });
  };

  const getStatusBadge = () => {
    if (!status) {
      return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1" />Verificando...</Badge>;
    }
    
    if (status.connected) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Desconectado</Badge>;
    }
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+54')) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Pruebas API WhatsApp</h2>
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

      {/* Información sobre números argentinos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Formato de números argentinos</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Para móviles: <code>+54 9 11 1234-5678</code> (con 9)</p>
                <p>• Fijos también funcionan: <code>+54 11 1234-5678</code> (sin 9)</p>
                <p>• El sistema formatea automáticamente números incompletos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Estado de la API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {status.connected ? '✅' : '❌'}
                </div>
                <p className="text-sm text-slate-600">Conexión</p>
              </div>
              {status.phoneNumber && (
                <div className="text-center">
                  <div className="text-lg font-mono mb-1">
                    {formatPhone(status.phoneNumber)}
                  </div>
                  <p className="text-sm text-slate-600">Número Activo</p>
                </div>
              )}
              <div className="text-center">
                <div className="text-sm mb-1">
                  {new Date(status.timestamp).toLocaleString('es-ES')}
                </div>
                <p className="text-sm text-slate-600">Última Verificación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual">
            <Send className="w-4 h-4 mr-2" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Users className="w-4 h-4 mr-2" />
            Masivo
          </TabsTrigger>
          <TabsTrigger value="reminder">
            <Clock className="w-4 h-4 mr-2" />
            Recordatorio
          </TabsTrigger>
          <TabsTrigger value="results">
            <History className="w-4 h-4 mr-2" />
            Resultados ({testResults.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Envío Individual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhoneNumberValidator
                value={singleNumber}
                onChange={setSingleNumber}
                placeholder="+54 11 1234-5678 o 11 1234-5678"
                label="Número de WhatsApp"
                required
              />
              
              <div>
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  placeholder="Escribe tu mensaje de prueba..."
                  value={singleMessage}
                  onChange={(e) => setSingleMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Caracteres: {singleMessage.length}
                </p>
              </div>
              <Button 
                onClick={sendSingleMessage}
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
              <CardTitle>Envío Masivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Números (uno por línea)</label>
                <Textarea
                  placeholder="+54 11 1234-5678&#10;11 2345-6789&#10;+54 9 11 3456-7890"
                  value={bulkNumbers}
                  onChange={(e) => setBulkNumbers(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Números: {bulkNumbers.split('\n').filter(n => n.trim()).length}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  placeholder="Mensaje para envío masivo..."
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={sendBulkMessages}
                disabled={loading || !status?.connected}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar a Todos'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminder">
          <Card>
            <CardHeader>
              <CardTitle>Recordatorio Programado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhoneNumberValidator
                value={reminderNumber}
                onChange={setReminderNumber}
                placeholder="+54 11 1234-5678"
                label="Número de WhatsApp"
                required
              />
              
              <div>
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  placeholder="Mensaje del recordatorio..."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Retraso (minutos)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="5"
                  value={reminderDelay}
                  onChange={(e) => setReminderDelay(e.target.value)}
                  min="1"
                  max="1440"
                />
              </div>
              <Button 
                onClick={scheduleReminder}
                disabled={loading || !status?.connected}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                {loading ? 'Programando...' : 'Programar Recordatorio'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Resultados de Pruebas
                </div>
                {testResults.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearResults}>
                    Limpiar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                            {result.type.toUpperCase()}
                          </Badge>
                          {result.phoneNumber && (
                            <span className="text-sm font-mono">{formatPhone(result.phoneNumber)}</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(result.timestamp).toLocaleTimeString('es-ES')}
                        </span>
                      </div>
                      
                      {result.message && (
                        <p className="text-sm mb-2 text-slate-700">{result.message}</p>
                      )}
                      
                      <details className="text-xs">
                        <summary className="cursor-pointer text-slate-600 hover:text-slate-800">
                          Ver detalles técnicos
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <strong>Request:</strong>
                            <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.request, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <strong>Response:</strong>
                            <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.response, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                  {testResults.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay resultados de pruebas aún</p>
                      <p className="text-sm">Realiza algunas pruebas para ver los resultados aquí</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
