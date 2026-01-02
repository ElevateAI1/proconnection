
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  User,
  MessageSquare
} from 'lucide-react';

interface RecoveryResult {
  appointment_id: string;
  patient_name: string;
  reminders_created: number;
  status: string;
}

export const MissingReminderRecovery = () => {
  const { toast } = useToast();
  const [recoveryResults, setRecoveryResults] = useState<RecoveryResult[]>([]);
  const [loading, setLoading] = useState(false);

  const executeRecovery = async () => {
    setLoading(true);
    try {
      console.log('🔄 Ejecutando recuperación de recordatorios faltantes...');

      const { data, error } = await supabase.rpc('create_missing_appointment_reminders');

      if (error) {
        console.error('Error en recuperación de recordatorios:', error);
        throw error;
      }

      console.log('✅ Recuperación completada:', data);
      setRecoveryResults(data || []);

      const totalReminders = data?.reduce((sum: number, result: RecoveryResult) => 
        sum + result.reminders_created, 0) || 0;

      toast({
        title: "✅ Recuperación Completada",
        description: `Se crearon ${totalReminders} recordatorios para ${data?.length || 0} citas`
      });

    } catch (error) {
      console.error('Error ejecutando recuperación:', error);
      toast({
        title: "❌ Error",
        description: "Error al ejecutar la recuperación de recordatorios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'no_reminders_needed': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Creados</Badge>;
      case 'no_reminders_needed': return <Badge variant="secondary">Sin necesidad</Badge>;
      default: return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Recuperación de Recordatorios Faltantes
          <Button 
            onClick={executeRecovery} 
            disabled={loading} 
            size="sm" 
            className="ml-auto"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {loading ? 'Ejecutando...' : 'Ejecutar Recuperación'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">¿Qué hace esta función?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Busca citas futuras que no tienen recordatorios programados</li>
              <li>• Crea automáticamente los recordatorios faltantes</li>
              <li>• Respeta las configuraciones de cada psicólogo</li>
              <li>• Valida números de teléfono para WhatsApp</li>
            </ul>
          </div>

          {recoveryResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Resultados de la Recuperación:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800 mb-1">Citas Procesadas</div>
                  <div className="text-2xl font-bold text-green-900">
                    {recoveryResults.length}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800 mb-1">Recordatorios Creados</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {recoveryResults.reduce((sum, result) => sum + result.reminders_created, 0)}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-sm text-amber-800 mb-1">Exitosos</div>
                  <div className="text-2xl font-bold text-amber-900">
                    {recoveryResults.filter(r => r.status === 'success').length}
                  </div>
                </div>
              </div>

              {recoveryResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{result.patient_name}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <div className="text-sm text-slate-600">
                        ID: {result.appointment_id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {result.reminders_created} recordatorios
                    </div>
                    <div className="text-xs text-slate-500">
                      {result.status === 'success' ? 'Creados exitosamente' : 'Sin necesidad'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recoveryResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">
                Haz clic en "Ejecutar Recuperación" para buscar y crear recordatorios faltantes
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
