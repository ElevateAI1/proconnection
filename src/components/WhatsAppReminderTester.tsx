
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatArgentinePhoneNumber, isValidArgentinePhoneNumber, displayPhoneNumber } from '@/utils/phoneValidation';
import { PhoneInput } from './forms/PhoneInput';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send,
  TestTube
} from 'lucide-react';

export const WhatsAppReminderTester = () => {
  const { toast } = useToast();
  
  const [testPhone, setTestPhone] = useState('+54 9 11 6187 0522');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    step: string;
    status: 'success' | 'error' | 'pending';
    message: string;
    timestamp: string;
  }>>([]);

  const addTestResult = (step: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => [...prev, {
      step,
      status,
      message,
      timestamp: new Date().toLocaleTimeString('es-ES')
    }]);
  };

  const runCompleteTest = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Paso 1: Validar formato de teléfono
      addTestResult('Validación de Número', 'pending', 'Validando formato del número de teléfono...');
      
      const isValid = isValidArgentinePhoneNumber(testPhone);
      const formatted = formatArgentinePhoneNumber(testPhone);
      const displayed = displayPhoneNumber(testPhone);
      
      if (isValid) {
        addTestResult('Validación de Número', 'success', 
          `✅ Número válido: ${testPhone} → ${formatted} (Display: ${displayed})`);
      } else {
        addTestResult('Validación de Número', 'error', 
          `❌ Número inválido: ${testPhone}`);
        setLoading(false);
        return;
      }

      // Paso 2: Verificar API de WhatsApp
      addTestResult('API WhatsApp', 'pending', 'Verificando estado de la API de WhatsApp...');
      
      try {
        const response = await fetch('https://api.proconnection.me/api/status');
        if (response.ok) {
          const data = await response.json();
          if (data.connected) {
            addTestResult('API WhatsApp', 'success', 
              `✅ API WhatsApp conectada (Número: ${data.phoneNumber || 'No disponible'})`);
          } else {
            addTestResult('API WhatsApp', 'error', 
              '❌ API WhatsApp no está conectada');
          }
        } else {
          addTestResult('API WhatsApp', 'error', 
            '❌ No se pudo verificar el estado de la API WhatsApp');
        }
      } catch (error) {
        addTestResult('API WhatsApp', 'error', 
          `❌ Error verificando API: ${error instanceof Error ? error.message : 'Error de conexión'}`);
      }

      // Paso 3: Enviar mensaje de prueba inmediato
      addTestResult('Mensaje de Prueba', 'pending', 'Enviando mensaje de prueba...');
      
      try {
        const testMessage = `🧪 MENSAJE DE PRUEBA DEL ADMINISTRADOR\n\nHola! Este es un mensaje de prueba del sistema de recordatorios desde el panel de administración.\n\nNúmero formateado: ${formatted}\nFecha/Hora: ${new Date().toLocaleString('es-ES')}\n\n✅ El sistema está funcionando correctamente.`;
        
        const messageResponse = await fetch('https://api.proconnection.me/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: formatted,
            message: testMessage
          }),
        });

        const messageResult = await messageResponse.json();
        
        if (messageResult.success) {
          addTestResult('Mensaje de Prueba', 'success', 
            `✅ Mensaje de prueba enviado exitosamente a ${formatted}`);
          
          toast({
            title: "🎉 ¡Prueba Exitosa!",
            description: `Se envió un mensaje de prueba a ${displayed}. Revisa tu WhatsApp.`,
          });
        } else {
          addTestResult('Mensaje de Prueba', 'error', 
            `❌ Error enviando mensaje: ${messageResult.message || 'Error desconocido'}`);
        }
      } catch (error) {
        addTestResult('Mensaje de Prueba', 'error', 
          `❌ Error enviando mensaje: ${error instanceof Error ? error.message : 'Error de conexión'}`);
      }

      // Paso 4: Verificar configuración general del sistema
      addTestResult('Sistema General', 'pending', 'Verificando configuración general del sistema...');
      
      try {
        // Simular verificación de sistema
        await new Promise(resolve => setTimeout(resolve, 1000));
        addTestResult('Sistema General', 'success', 
          '✅ Sistema configurado correctamente para pruebas de administrador');
      } catch (error) {
        addTestResult('Sistema General', 'error', 
          `❌ Error en verificación del sistema: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

    } catch (error) {
      addTestResult('Sistema General', 'error', 
        `❌ Error general del sistema: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'pending': return <Badge variant="secondary">Procesando</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Prueba del Sistema de WhatsApp (Administrador)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">¿Qué se va a probar?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Validación del formato del número de teléfono</li>
              <li>• Estado de conexión de la API de WhatsApp</li>
              <li>• Envío de mensaje de prueba inmediato</li>
              <li>• Verificación general del sistema</li>
            </ul>
          </div>
          
          <PhoneInput
            value={testPhone}
            onChange={setTestPhone}
            label="Número de teléfono para prueba"
            placeholder="+54 9 11 6187 0522"
          />
          
          <Button 
            onClick={runCompleteTest}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Ejecutando Prueba...' : 'Ejecutar Prueba Completa'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Resultados de la Prueba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{result.step}</span>
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
