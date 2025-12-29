import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, CreditCard, Clock, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PatientAppointmentRequestForm } from '@/components/PatientAppointmentRequestForm';
import { ProfessionalCodeManager } from '@/components/landing/ProfessionalCodeManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Appointment {
  id: string;
  appointment_date: string;
  type: string;
  status: string;
  meeting_url?: string;
  notes?: string;
  psychologist?: {
    first_name: string;
    last_name: string;
  };
}

interface PaymentReceipt {
  id: string;
  amount: number;
  receipt_date?: string;
  created_at: string;
  validation_status: string;
  notes?: string;
}

interface PsychologistRelation {
  id: string;
  psychologist_id: string;
  professional_code: string;
  is_primary: boolean;
  psychologist: {
    first_name: string;
    last_name: string;
    professional_code: string;
  };
}

export const PatientPortal = () => {
  const { user, signOut } = useAuth();
  const { profile, patient } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [psychologistInfo, setPsychologistInfo] = useState<{ first_name: string; last_name: string } | null>(null);
  const [psychologistRelations, setPsychologistRelations] = useState<PsychologistRelation[]>([]);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(null);
  const [relationsLoading, setRelationsLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      // Primero cargar relaciones, luego datos
      if (user.id) {
        setRelationsLoading(true);
        fetchPsychologistRelations().then(() => {
          setRelationsLoading(false);
          fetchPatientData();
        });
      } else {
        setRelationsLoading(false);
        fetchPatientData();
      }
    } else if (!user) {
      setLoading(false);
      setRelationsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (patient?.psychologist_id) {
      fetchPsychologistInfo();
    }
  }, [patient]);
  
  const fetchPsychologistRelations = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_psychologists')
        .select(`
          id,
          psychologist_id,
          professional_code,
          is_primary,
          psychologist:psychologists!inner(
            first_name,
            last_name,
            professional_code
          )
        `)
        .eq('patient_id', user.id)
        .order('is_primary', { ascending: false })
        .order('added_at', { ascending: false });

      if (error) throw error;
      
      const relations = data || [];
      setPsychologistRelations(relations);
      
      // Establecer el psicólogo principal como seleccionado por defecto
      const primary = relations.find(r => r.is_primary);
      if (primary) {
        setSelectedPsychologistId(primary.psychologist_id);
      } else if (relations.length > 0) {
        setSelectedPsychologistId(relations[0].psychologist_id);
      } else if (patient?.psychologist_id) {
        // Fallback al psychologist_id del patient (compatibilidad)
        setSelectedPsychologistId(patient.psychologist_id);
      }
      
      // Log para debugging
      console.log('Psychologist relations loaded:', relations.length, relations);
      
      return relations;
    } catch (error) {
      console.error('Error fetching psychologist relations:', error);
      // Si hay error pero tenemos patient.psychologist_id, usarlo como fallback
      if (patient?.psychologist_id) {
        setSelectedPsychologistId(patient.psychologist_id);
      }
      return [];
    }
  };

  const fetchPatientData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Obtener todos los psychologist_ids vinculados
      const psychologistIds: string[] = [];
      
      // De las relaciones actuales
      psychologistRelations.forEach(r => {
        if (!psychologistIds.includes(r.psychologist_id)) {
          psychologistIds.push(r.psychologist_id);
        }
      });
      
      // Del patient (compatibilidad)
      if (patient?.psychologist_id && !psychologistIds.includes(patient.psychologist_id)) {
        psychologistIds.push(patient.psychologist_id);
      }
      
      // Fetch appointments - de todos los psicólogos vinculados
      let appointmentsQuery = supabase
        .from('appointments')
        .select(`
          *,
          psychologist:psychologists(first_name, last_name)
        `)
        .eq('patient_id', user.id)
        .gte('appointment_date', new Date().toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted']);
      
      // Si hay psicólogos vinculados, filtrar por ellos también (opcional, para mostrar solo citas de psicólogos vinculados)
      // Si no hay filtro, mostrará todas las citas del paciente
      
      const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery
        .order('appointment_date', { ascending: true });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        setAppointments(appointmentsData || []);
      }

      // Fetch payment receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (receiptsError) {
        console.error('Error fetching receipts:', receiptsError);
      } else {
        setReceipts(receiptsData || []);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPsychologistInfo = async () => {
    if (!patient?.psychologist_id) return;

    try {
      const { data, error } = await supabase
        .from('psychologists')
        .select('first_name, last_name')
        .eq('id', patient.psychologist_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching psychologist info:', error);
        // Si no se puede obtener, no es crítico
        setPsychologistInfo(null);
      } else if (data) {
        setPsychologistInfo(data);
      } else {
        setPsychologistInfo(null);
      }
    } catch (error) {
      console.error('Error fetching psychologist info:', error);
    }
  };

  // Mostrar preloader mientras cargan datos
  if (loading || relationsLoading || (!patient && user && profile)) {
    return (
      <div className="min-h-screen bg-white-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-petrol border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-petrol font-semibold">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-white-warm flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-petrol mb-4">Acceso no autorizado</h1>
          <p className="text-blue-petrol/70 font-medium">Por favor, inicia sesión para acceder a tu portal.</p>
        </div>
      </div>
    );
  }

  const patientName = patient 
    ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() 
    : profile.email || 'Usuario';
  const pendingPayment = receipts.find(r => r.validation_status === 'pending');

  return (
    <div className="min-h-screen bg-white-warm relative overflow-hidden">
      {/* Elementos flotantes de fondo - igual que el dashboard profesional */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-soft/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-green-mint/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-lavender-soft/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      {/* Header */}
      <header className="bg-white-warm/90 backdrop-blur-md shadow-sm border-b border-celeste-gray/30 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-soft via-celeste-gray to-green-mint rounded-lg flex items-center justify-center shadow-lg shadow-blue-soft/30">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="text-lg font-bold text-blue-petrol">ProConnection</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-soft/30">
                  {patientName.charAt(0).toUpperCase()}
                </div>
                <span className="text-blue-petrol font-semibold">{patientName}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/auth';
                }}
                className="border-2 border-celeste-gray/50 bg-white-warm/90 backdrop-blur-sm hover:bg-white-warm hover:scale-105 hover:shadow-lg transition-all duration-300 text-blue-petrol"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Welcome - estilo neogolpista */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
            <span className="text-blue-petrol">Hola, </span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-soft via-celeste-gray to-blue-soft bg-clip-text text-transparent">
                {patientName.split(' ')[0]}
              </span>
            </span>
            <span className="text-blue-petrol"> 👋</span>
          </h1>
          <p className="text-blue-petrol/70 text-lg sm:text-xl font-medium mb-4">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-blue-petrol/80 text-lg">
            Aquí podés gestionar tus citas y pagos de forma segura
          </p>
          {(psychologistInfo || (psychologistRelations.length > 0)) && (
            <div className="mt-4 p-4 bg-blue-soft/20 backdrop-blur-sm border-2 border-blue-soft/30 rounded-xl shadow-lg">
              <p className="text-sm text-blue-petrol font-semibold">
                <strong>Tu profesional:</strong> {
                  psychologistInfo 
                    ? `${psychologistInfo.first_name} ${psychologistInfo.last_name}`
                    : psychologistRelations.length > 0
                      ? `${psychologistRelations[0].psychologist?.first_name || ''} ${psychologistRelations[0].psychologist?.last_name || ''}`.trim()
                      : 'Cargando...'
                }
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gestión de Psicólogos */}
          {user?.id && (
            <ProfessionalCodeManager 
              patientId={user.id} 
              onUpdate={() => {
                fetchPatientData();
                fetchPsychologistRelations();
                if (patient?.psychologist_id) {
                  fetchPsychologistInfo();
                }
              }}
            />
          )}
          
          {/* Próximas citas */}
          <Card className="border-2 border-celeste-gray/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white-warm/90 backdrop-blur-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-petrol font-bold">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-xl flex items-center justify-center shadow-lg shadow-blue-soft/30">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Mis próximas citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments
                    .filter((appointment) => {
                      // Filter out appointments with invalid dates
                      if (!appointment.appointment_date) return false;
                      const aptDate = new Date(appointment.appointment_date);
                      return !isNaN(aptDate.getTime());
                    })
                    .map((appointment) => {
                      const aptDate = new Date(appointment.appointment_date!);
                      const dateStr = aptDate.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      const timeStr = aptDate.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                    const isOnline = appointment.type === 'online' || appointment.meeting_url;
                    const statusLabels: Record<string, string> = {
                      'scheduled': 'Programada',
                      'confirmed': 'Confirmada',
                      'accepted': 'Confirmada',
                      'pending': 'Pendiente'
                    };

                    return (
                      <div key={appointment.id} className="bg-white-warm/90 backdrop-blur-sm border-2 border-celeste-gray/30 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-blue-petrol text-lg">
                              {dateStr}
                            </div>
                            <div className="text-blue-petrol/70 font-medium">{timeStr}</div>
                            {appointment.psychologist && (
                              <div className="text-sm text-blue-petrol/60 mt-1">
                                Con {appointment.psychologist.first_name} {appointment.psychologist.last_name}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'confirmed' || appointment.status === 'accepted'
                              ? 'bg-green-mint/30 text-blue-petrol border border-green-mint/50' 
                              : 'bg-peach-pale/30 text-blue-petrol border border-peach-pale/50'
                          }`}>
                            {statusLabels[appointment.status] || appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-petrol/70 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            !isOnline
                              ? 'bg-blue-soft/30 text-blue-petrol border border-blue-soft/50' 
                              : 'bg-lavender-soft/30 text-blue-petrol border border-lavender-soft/50'
                          }`}>
                            {!isOnline ? 'Presencial' : 'Online'}
                          </span>
                          {appointment.meeting_url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(appointment.meeting_url, '_blank')}
                              className="text-xs border-2 border-celeste-gray/50 bg-white-warm/90 backdrop-blur-sm hover:bg-white-warm hover:scale-105 hover:shadow-lg transition-all duration-300 text-blue-petrol"
                              aria-label="Unirse a reunión"
                            >
                              Unirse
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-soft/30">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-blue-petrol/70 font-medium mb-4">No tenés citas programadas</p>
                  <Button 
                    className="bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-3 px-6 rounded-lg transition-all duration-200"
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    Pedir turno
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagos */}
          <Card className="border-2 border-celeste-gray/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white-warm/90 backdrop-blur-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-petrol font-bold">
                <div className="w-10 h-10 bg-gradient-to-br from-peach-pale to-sand-light rounded-xl flex items-center justify-center shadow-lg shadow-peach-pale/30">
                  <CreditCard className="w-5 h-5 text-blue-petrol" />
                </div>
                Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pago pendiente destacado */}
              {pendingPayment && (
                <div className="bg-peach-pale/30 backdrop-blur-sm border-2 border-peach-pale/50 p-4 rounded-xl mb-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-peach-pale/50 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-petrol" />
                    </div>
                    <span className="font-semibold text-blue-petrol">Pago pendiente de validación</span>
                  </div>
                  <div className="text-blue-petrol font-medium">
                    Tenés un pago pendiente de ${pendingPayment.amount.toLocaleString()}
                  </div>
                  <p className="text-sm text-blue-petrol/70 mt-1">
                    Tu psicólogo está revisando el comprobante de pago
                  </p>
                </div>
              )}

              {/* Historial de pagos */}
              <div className="space-y-3">
                {receipts
                  .filter((receipt) => {
                    // Filter out receipts with invalid dates
                    const receiptDate = receipt.receipt_date || receipt.created_at;
                    if (!receiptDate) return false;
                    const receiptDateObj = new Date(receiptDate);
                    return !isNaN(receiptDateObj.getTime());
                  })
                  .map((receipt) => {
                    const receiptDate = receipt.receipt_date || receipt.created_at;
                    const receiptDateObj = new Date(receiptDate!);
                    const dateStr = receiptDateObj.toLocaleDateString('es-ES');
                  const statusLabels: Record<string, { label: string; color: string }> = {
                    'approved': { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
                    'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
                    'rejected': { label: 'Rechazado', color: 'bg-red-100 text-red-800' }
                  };
                  const status = statusLabels[receipt.validation_status] || { label: receipt.validation_status, color: 'bg-gray-100 text-gray-800' };

                  return (
                    <div key={receipt.id} className="flex items-center justify-between p-4 bg-white-warm/90 backdrop-blur-sm border-2 border-celeste-gray/30 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                      <div>
                        <div className="font-semibold text-blue-petrol">
                          {receipt.notes || `Pago del ${dateStr}`}
                        </div>
                        <div className="text-sm text-blue-petrol/60 font-medium">{dateStr}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-petrol text-lg">
                          ${receipt.amount.toLocaleString()}
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          receipt.validation_status === 'approved' 
                            ? 'bg-green-mint/30 text-blue-petrol border border-green-mint/50'
                            : receipt.validation_status === 'pending'
                            ? 'bg-peach-pale/30 text-blue-petrol border border-peach-pale/50'
                            : 'bg-red-100/30 text-blue-petrol border border-red-200/50'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 border-2 border-celeste-gray/50 bg-white-warm/90 backdrop-blur-sm hover:bg-white-warm hover:scale-105 hover:shadow-lg transition-all duration-300 text-blue-petrol font-semibold"
              >
                Ver historial completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-2 border-celeste-gray/50 shadow-xl bg-gradient-to-r from-blue-soft/20 via-green-mint/20 to-lavender-soft/20 backdrop-blur-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-blue-petrol mb-2">
              ¿Necesitás ayuda?
            </h3>
            <p className="text-blue-petrol/70 font-medium mb-4">
              Si tenés alguna duda sobre tu portal o necesitás asistencia, contactanos
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="outline"
                className="border-2 border-celeste-gray/50 bg-white-warm/90 backdrop-blur-sm hover:bg-white-warm hover:scale-105 hover:shadow-lg transition-all duration-300 text-blue-petrol font-semibold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar soporte
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-celeste-gray/50 bg-white-warm/90 backdrop-blur-sm hover:bg-white-warm hover:scale-105 hover:shadow-lg transition-all duration-300 text-blue-petrol font-semibold"
              >
                <User className="w-4 h-4 mr-2" />
                Hablar con mi psicólogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para pedir turno */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar una nueva cita</DialogTitle>
          </DialogHeader>
          {psychologistRelations.length > 0 || patient?.psychologist_id ? (
            <div className="space-y-4">
              {psychologistRelations.length > 1 && (
                <div>
                  <Label htmlFor="psychologist-select" className="mb-2 block">
                    Selecciona el psicólogo
                  </Label>
                  <Select
                    value={selectedPsychologistId || patient?.psychologist_id || ''}
                    onValueChange={setSelectedPsychologistId}
                  >
                    <SelectTrigger id="psychologist-select">
                      <SelectValue placeholder="Selecciona un psicólogo" />
                    </SelectTrigger>
                    <SelectContent>
                      {psychologistRelations.map((rel) => (
                        <SelectItem key={rel.id} value={rel.psychologist_id}>
                          {rel.psychologist.first_name} {rel.psychologist.last_name}
                          {rel.is_primary && ' (Principal)'}
                          {' - '}{rel.professional_code}
                        </SelectItem>
                      ))}
                      {patient?.psychologist_id && !psychologistRelations.find(r => r.psychologist_id === patient.psychologist_id) && (
                        <SelectItem value={patient.psychologist_id}>
                          Psicólogo actual
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <PatientAppointmentRequestForm
                psychologistId={selectedPsychologistId || patient?.psychologist_id || ''}
                onClose={() => setShowAppointmentModal(false)}
                onRequestCreated={() => {
                  fetchPatientData();
                  setShowAppointmentModal(false);
                }}
              />
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-blue-petrol/70 font-medium mb-4">
                No tienes psicólogos vinculados. Agrega un código profesional para poder solicitar citas.
              </p>
              <Button
                onClick={() => setShowAppointmentModal(false)}
                className="bg-blue-petrol text-white-warm"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
