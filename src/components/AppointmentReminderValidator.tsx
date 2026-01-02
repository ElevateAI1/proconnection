
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useReminderSettings } from '@/hooks/useReminderSettings';
import { isValidArgentinePhoneNumber, formatArgentinePhoneNumber } from '@/utils/phoneValidation';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  MessageSquare,
  Settings,
  User,
  Calendar
} from 'lucide-react';

interface ValidationResult {
  patientId: string;
  patientName: string;
  phone: string;
  appointmentId: string;
  appointmentDate: string;
  isPhoneValid: boolean;
  hasReminderSettings: boolean;
  reminderScheduled: boolean;
  issues: string[];
}

export const AppointmentReminderValidator = () => {
  const { toast } = useToast();
  const { settings, createScheduledNotification } = useReminderSettings();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const validateAppointmentReminders = async () => {
    setLoading(true);
    try {
      console.log('🔍 Validando sistema de recordatorios...');

      // Obtener citas futuras
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          patients!inner(
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      const results: ValidationResult[] = [];

      for (const appointment of appointments || []) {
        const patient = appointment.patients;
        const issues: string[] = [];
        
        // Validar teléfono
        const isPhoneValid = patient.phone ? isValidArgentinePhoneNumber(patient.phone) : false;
        if (!patient.phone) {
          issues.push('Sin número de teléfono');
        } else if (!isPhoneValid) {
          issues.push('Número de teléfono inválido');
        }

        // Verificar configuración de recordatorios
        const reminderSetting = settings.find(s => s.reminder_type === 'appointment_reminder');
        const hasReminderSettings = reminderSetting ? reminderSetting.enabled : false;
        
        if (!hasReminderSettings) {
          issues.push('Recordatorios deshabilitados');
        }

        // Verificar si ya existe notificación programada
        const { data: existingNotifications } = await supabase
          .from('system_notifications')
          .select('id')
          .contains('metadata', { recipient_id: patient.id })
          .eq('notification_type', 'appointment_reminder')
          .eq('status', 'pending');

        const reminderScheduled = (existingNotifications?.length || 0) > 0;

        results.push({
          patientId: patient.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          phone: patient.phone || 'Sin teléfono',
          appointmentId: appointment.id,
          appointmentDate: appointment.appointment_date,
          isPhoneValid,
          hasReminderSettings,
          reminderScheduled,
          issues
        });
      }

      setValidationResults(results);
      
      const totalIssues = results.reduce((acc, r) => acc + r.issues.length, 0);
      
      toast({
        title: "✅ Validación completada",
        description: `Se validaron ${results.length} citas. ${totalIssues} problemas encontrados.`
      });

    } catch (error) {
      console.error('Error validating reminders:', error);
      toast({
        title: "❌ Error",
        description: "Error al validar recordatorios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fixAppointmentReminder = async (result: ValidationResult) => {
    try {
      console.log('🔧 Corrigiendo recordatorio para:', result.patientName);

      // Si no tiene teléfono válido, no podemos enviar WhatsApp
      if (!result.isPhoneValid) {
        toast({
          title: "⚠️ No se puede corregir",
          description: "El paciente necesita un número de teléfono válido",
          variant: "destructive"
        });
        return;
      }

      // Crear recordatorio programado
      await createScheduledNotification(
        result.patientId,
        'appointment_reminder',
        {
          patient_name: result.patientName,
          appointment_date: new Date(result.appointmentDate).toLocaleDateString('es-ES'),
          appointment_time: new Date(result.appointmentDate).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          phone_number: formatArgentinePhoneNumber(result.phone)
        },
        'whatsapp'
      );

      toast({
        title: "✅ Recordatorio programado",
        description: `Recordatorio creado para ${result.patientName}`
      });

      // Revalidar
      validateAppointmentReminders();

    } catch (error) {
      console.error('Error fixing reminder:', error);
      toast({
        title: "❌ Error",
        description: "Error al programar recordatorio",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (result: ValidationResult) => {
    if (result.issues.length === 0 && result.reminderScheduled) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-600" />;
  };

  const getStatusBadge = (result: ValidationResult) => {
    if (result.issues.length === 0 && result.reminderScheduled) {
      return <Badge className="bg-green-100 text-green-800">Configurado</Badge>;
    }
    if (result.issues.length > 0) {
      return <Badge variant="destructive">Problemas</Badge>;
    }
    return <Badge variant="secondary">Revisar</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Validador de Recordatorios
          <Button onClick={validateAppointmentReminders} disabled={loading} size="sm" className="ml-auto">
            Validar Sistema
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validationResults.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">
              Haz clic en "Validar Sistema" para revisar el estado de los recordatorios
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Resumen de Validación</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-800 font-medium">Total Citas:</span>
                  <div className="text-lg font-bold">{validationResults.length}</div>
                </div>
                <div>
                  <span className="text-green-800 font-medium">Sin Problemas:</span>
                  <div className="text-lg font-bold text-green-600">
                    {validationResults.filter(r => r.issues.length === 0 && r.reminderScheduled).length}
                  </div>
                </div>
                <div>
                  <span className="text-amber-800 font-medium">Con Problemas:</span>
                  <div className="text-lg font-bold text-amber-600">
                    {validationResults.filter(r => r.issues.length > 0).length}
                  </div>
                </div>
                <div>
                  <span className="text-red-800 font-medium">Sin Recordatorio:</span>
                  <div className="text-lg font-bold text-red-600">
                    {validationResults.filter(r => !r.reminderScheduled).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {validationResults.map((result) => (
                <div key={result.appointmentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result)}
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{result.patientName}</span>
                          {getStatusBadge(result)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(result.appointmentDate).toLocaleString('es-ES')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {result.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {result.issues.length > 0 && result.isPhoneValid && (
                      <Button 
                        size="sm" 
                        onClick={() => fixAppointmentReminder(result)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Corregir
                      </Button>
                    )}
                  </div>

                  {/* Mostrar problemas encontrados */}
                  {result.issues.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Problemas encontrados:</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {result.issues.map((issue, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mostrar estado de configuración */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 pt-3 border-t text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className={result.isPhoneValid ? "text-green-600" : "text-red-600"}>
                        {result.isPhoneValid ? "Teléfono válido" : "Teléfono inválido"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span className={result.hasReminderSettings ? "text-green-600" : "text-red-600"}>
                        {result.hasReminderSettings ? "Configuración OK" : "Sin configurar"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className={result.reminderScheduled ? "text-green-600" : "text-amber-600"}>
                        {result.reminderScheduled ? "Programado" : "Sin programar"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
