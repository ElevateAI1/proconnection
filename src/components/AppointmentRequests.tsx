import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Check, X, FileText, RefreshCw } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Patient {
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AppointmentRequest {
  id: string;
  patient_id: string;
  preferred_date: string;
  preferred_time: string;
  type: string;
  notes?: string;
  status: string;
  created_at: string;
  patient?: Patient | null;
}

interface AppointmentRequestsProps {
  onRequestProcessed?: () => void;
}

export const AppointmentRequests = ({ onRequestProcessed }: AppointmentRequestsProps) => {
  const { psychologist } = useProfile();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (psychologist?.id) {
      fetchRequests();
    }
  }, [psychologist]);

  const fetchRequests = async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching appointment requests for psychologist:', psychologist.id);
      
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
          *,
          patient:patients(first_name, last_name, phone)
        `)
        .eq('psychologist_id', psychologist.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching appointment requests:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes de citas",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched appointment requests:', data);
      
      const typedRequests = (data || []).map(request => ({
        ...request,
        patient: request.patient && typeof request.patient === 'object' && 'first_name' in request.patient 
          ? request.patient as Patient
          : null
      }));

      setRequests(typedRequests);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar las solicitudes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    if (!requestId) {
      toast({
        title: "Error",
        description: "ID de solicitud inválido",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(requestId);
    
    try {
      console.log(`${action === 'approved' ? 'Approving' : 'Rejecting'} request:`, requestId);
      
      if (action === 'approved') {
        // Find the request to get details for creating the appointment
        const request = requests.find(r => r.id === requestId);
        if (!request) {
          throw new Error('Solicitud no encontrada');
        }

        // Create appointment date by combining date and time
        const [year, month, day] = request.preferred_date.split('-');
        const [hours, minutes] = request.preferred_time.split(':');
        
        const appointmentDate = new Date();
        appointmentDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        console.log('Creating appointment with data:', {
          patient_id: request.patient_id,
          psychologist_id: psychologist.id,
          appointment_date: appointmentDate.toISOString(),
          type: request.type,
          notes: request.notes,
          status: 'confirmed'
        });

        // Create the actual appointment with all required fields
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: request.patient_id,
            psychologist_id: psychologist.id,
            appointment_date: appointmentDate.toISOString(),
            type: request.type,
            status: 'confirmed',
            notes: request.notes || null,
            duration_minutes: 60
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('Error creating appointment:', appointmentError);
          console.error('Appointment error details:', {
            code: appointmentError.code,
            message: appointmentError.message,
            details: appointmentError.details,
            hint: appointmentError.hint
          });
          
          // Provide more specific error messages
          if (appointmentError.message.includes('check constraint')) {
            throw new Error('Error de validación: Verifica que el estado y tipo de cita sean válidos');
          } else if (appointmentError.message.includes('foreign key')) {
            throw new Error('Error de referencia: Paciente o psicólogo no válido');
          } else {
            throw new Error(`No se pudo crear la cita: ${appointmentError.message}`);
          }
        }

        console.log('Appointment created successfully:', appointmentData);
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('appointment_requests')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request:', updateError);
        throw new Error('No se pudo actualizar la solicitud');
      }

      const actionLabel = action === 'approved' ? 'aprobada y programada' : 'rechazada';
      toast({
        title: `Solicitud ${actionLabel}`,
        description: action === 'approved' 
          ? 'La cita ha sido creada y confirmada exitosamente.'
          : 'La solicitud de cita ha sido rechazada.',
      });

      // Refresh the requests list and notify parent component
      await fetchRequests();
      onRequestProcessed?.();
    } catch (error) {
      console.error('Error processing request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Terapia Individual",
      couple: "Terapia de Pareja",
      family: "Terapia Familiar",
      evaluation: "Evaluación",
      follow_up: "Seguimiento"
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle className="text-slate-800">
              Solicitudes de Citas Pendientes
            </CardTitle>
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay solicitudes de citas pendientes</p>
            <p className="text-sm">Las nuevas solicitudes aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {request.patient 
                            ? `${request.patient.first_name} ${request.patient.last_name}` 
                            : 'Paciente Desconocido'
                          }
                        </h4>
                        <p className="text-sm text-slate-600">
                          Solicitud enviada el {formatCreatedDate(request.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.preferred_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{request.preferred_time}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Badge variant="outline" className="text-blue-700 border-blue-200">
                        {getTypeLabel(request.type)}
                      </Badge>
                    </div>

                    {request.notes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Notas del paciente:</p>
                            <p className="text-sm text-slate-600">{request.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestAction(request.id, 'rejected')}
                      disabled={processingId === request.id}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(request.id, 'approved')}
                      disabled={processingId === request.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {processingId === request.id ? "Procesando..." : "Aprobar"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
