import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  FileText,
  DollarSign,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AppointmentRequest {
  id: string;
  patient_id: string;
  psychologist_id: string;
  preferred_date: string;
  preferred_time: string;
  type: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  payment_proof_url?: string;
  payment_amount?: number;
  payment_status?: string;
  patient?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface AppointmentRequestsProps {
  isDashboardView?: boolean;
}

export const AppointmentRequests = ({ isDashboardView = false }: AppointmentRequestsProps) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [psychologistId, setPsychologistId] = useState<string | null>(null);

  useEffect(() => {
    const getPsychologistId = async () => {
      if (user) {
        try {
          const { data: psychologistData, error: psychologistError } = await supabase
            .from('psychologists')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (psychologistError) {
            console.error('Error fetching psychologist ID:', psychologistError);
            toast({
              title: "Error",
              description: "Error al obtener el ID del psicólogo",
              variant: "destructive"
            });
            return;
          }

          if (psychologistData && psychologistData.id) {
            setPsychologistId(psychologistData.id);
            console.log('AppointmentRequests: Psychologist ID set to:', psychologistData.id);
          } else {
            console.warn('AppointmentRequests: No psychologist ID found for user:', user.id);
          }
        } catch (error) {
          console.error('AppointmentRequests: Unexpected error fetching psychologist ID:', error);
          toast({
            title: "Error",
            description: "Error inesperado al obtener el ID del psicólogo",
            variant: "destructive"
          });
        }
      }
    };

    getPsychologistId();
  }, [user]);

  const fetchRequests = async () => {
    if (!psychologistId) return;

    console.log('AppointmentRequests: === FETCHING APPOINTMENT REQUESTS ===');
    console.log('AppointmentRequests: Psychologist ID:', psychologistId);

    try {
      setLoading(true);
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('AppointmentRequests: Error fetching requests:', requestsError);
        throw requestsError;
      }

      console.log('AppointmentRequests: Raw requests data:', requestsData);
      console.log('AppointmentRequests: Requests error:', requestsError);

      if (requestsData && requestsData.length > 0) {
        const patientIds = [...new Set(requestsData.map(req => req.patient_id))];
        
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, first_name, last_name, phone')
          .in('id', patientIds);

        if (patientsError) {
          console.error('AppointmentRequests: Error fetching patients:', patientsError);
        }

        const requestsWithPatients = requestsData.map(request => ({
          ...request,
          patient: patientsData?.find(p => p.id === request.patient_id)
        }));

        console.log('AppointmentRequests: Processed requests with patients:', requestsWithPatients);
        
        const filteredRequests = isDashboardView 
          ? requestsWithPatients.filter(req => req.status === 'pending').slice(0, 3)
          : requestsWithPatients;
        
        console.log('AppointmentRequests: Setting requests state with', filteredRequests.length, 'items');
        setRequests(filteredRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('AppointmentRequests: Error in fetchRequests:', error);
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes de citas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (psychologistId) {
      fetchRequests();
    }
  }, [psychologistId]);

  const createPaymentReceipt = async (requestData: {
    psychologist_id: string;
    patient_id: string;
    payment_proof_url: string;
    preferred_date: string;
    payment_amount?: number;
    notes: string;
    id: string;
  }) => {
    if (!requestData.payment_proof_url || !requestData.payment_amount) {
      console.log('AppointmentRequests: No payment proof or amount, skipping receipt creation');
      return;
    }

    try {
      console.log('AppointmentRequests: Creating payment receipt for request:', requestData.id);
      
      let amount = requestData.payment_amount;
      if (!amount && requestData.notes) {
        const amountMatch = requestData.notes.match(/\$?([\d,]+\.?\d*)/);
        if (amountMatch) {
          amount = parseFloat(amountMatch[1].replace(',', ''));
        }
      }

      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          psychologist_id: requestData.psychologist_id,
          patient_id: requestData.patient_id,
          original_file_url: requestData.payment_proof_url,
          receipt_date: requestData.preferred_date,
          amount: amount || 0,
          receipt_type: 'comprobante_pago',
          payment_method: 'transferencia',
          extraction_status: 'processing',
          validation_status: 'pending',
          include_in_report: false,
          validation_notes: `Comprobante en procesamiento desde solicitud de cita ${requestData.id}`,
          validated_by: psychologistId,
          validated_at: new Date().toISOString()
        });

      if (receiptError) {
        console.error('AppointmentRequests: Error creating payment receipt:', receiptError);
        throw receiptError;
      }

      console.log('AppointmentRequests: Payment receipt created successfully');
    } catch (error) {
      console.error('AppointmentRequests: Error in createPaymentReceipt:', error);
    }
  };

  const approveRequest = async (request: AppointmentRequest) => {
    console.log('AppointmentRequests: Approving request:', request.id);
    console.log('AppointmentRequests: Creating appointment for request:', request);

    try {
      const appointmentDateTime = new Date(`${request.preferred_date}T${request.preferred_time || '09:00'}`);
      
      const appointmentData = {
        patient_id: request.patient_id,
        psychologist_id: request.psychologist_id,
        appointment_date: appointmentDateTime.toISOString(),
        type: request.type || 'individual',
        notes: request.notes,
        status: 'confirmed'
      };

      console.log('AppointmentRequests: Creating appointment with data:', appointmentData);

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      console.log('AppointmentRequests: Appointment created successfully:', appointment);

      if (appointment) {
        await createJitsiMeeting(appointment, request);
      }

      await createPaymentReceipt({
        psychologist_id: request.psychologist_id,
        patient_id: request.patient_id,
        payment_proof_url: request.payment_proof_url || '',
        preferred_date: request.preferred_date,
        payment_amount: request.payment_amount,
        notes: request.notes,
        id: request.id
      });

      const { error: updateError } = await supabase
        .from('appointment_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      console.log('AppointmentRequests: Request status updated successfully');

      toast({
        title: "Solicitud aprobada",
        description: "La cita ha sido programada exitosamente"
      });

      fetchRequests();
    } catch (error) {
      console.error('AppointmentRequests: Error approving request:', error);
      toast({
        title: "Error",
        description: "Error al aprobar la solicitud",
        variant: "destructive"
      });
    }
  };

  const createJitsiMeeting = async (appointment: any, request: AppointmentRequest) => {
    try {
      const roomName = `psiconnect-${appointment.id}`;
      const meetingTime = new Date(appointment.appointment_date).getTime();
      const duration = 60;

      const { data, error } = await supabase.functions.invoke('create-jitsi-meeting', {
        body: {
          roomName: roomName,
          startTime: meetingTime,
          duration: duration,
          appointmentId: appointment.id,
          patientName: request.patient?.first_name || 'Paciente',
          psychologistName: user?.user_metadata?.full_name || 'Psicólogo'
        }
      });

      if (error) {
        console.error('Error creating Jitsi meeting:', error);
        toast({
          title: "Error",
          description: "Error al crear la reunión virtual",
          variant: "destructive"
        });
      } else {
        console.log('Jitsi meeting created successfully:', data);
      }
    } catch (error) {
      console.error('Error in createJitsiMeeting:', error);
      toast({
        title: "Error",
        description: "Error al crear la reunión virtual",
        variant: "destructive"
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('appointment_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada"
      });

      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Error al rechazar la solicitud",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Solicitudes de Citas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Cargando solicitudes...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-4">No hay solicitudes de citas pendientes.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{request.patient?.first_name} {request.patient?.last_name}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(request.created_at).toLocaleDateString()} - {request.patient?.phone}
                    </p>
                    <p className="text-sm text-slate-500">
                      Fecha preferida: {new Date(request.preferred_date).toLocaleDateString()} {request.preferred_time}
                    </p>
                    <p className="text-sm text-slate-500">
                      {request.notes}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(request.status)}
                    {request.payment_proof_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.payment_proof_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Comprobante
                        </a>
                      </Button>
                    )}
                    {request.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => approveRequest(request)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => rejectRequest(request.id)}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isDashboardView && requests.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="link">Ver todas las solicitudes</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
