import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppointmentRequestCard, type AppointmentRequest } from "./AppointmentRequestCard";
import { approveAppointmentRequest, rejectAppointmentRequest, cancelAppointment } from "./AppointmentRequestActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentRequestListProps {
  isDashboardView?: boolean;
}

interface RequestWithAppointment extends AppointmentRequest {
  appointment_id?: string;
}

export const AppointmentRequestList = ({ isDashboardView = false }: AppointmentRequestListProps) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestWithAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user?.id) {
      console.log('AppointmentRequestList: No user ID available');
      setLoading(false);
      return;
    }

    console.log('AppointmentRequestList: === FETCHING APPOINTMENT REQUESTS ===');
    console.log('AppointmentRequestList: User ID (Psychologist ID):', user.id);

    try {
      setLoading(true);
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('psychologist_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('AppointmentRequestList: Error fetching requests:', requestsError);
        throw requestsError;
      }

      console.log('AppointmentRequestList: Raw requests data:', requestsData);

      if (requestsData && requestsData.length > 0) {
        const patientIds = [...new Set(requestsData.map(req => req.patient_id))];
        
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, first_name, last_name, phone')
          .in('id', patientIds);

        if (patientsError) {
          console.error('AppointmentRequestList: Error fetching patients:', patientsError);
        }

        // Para solicitudes aprobadas, buscar la cita asociada
        const approvedRequests = requestsData.filter(req => req.status === 'approved');
        let appointmentsMap: Record<string, string> = {};
        
        if (approvedRequests.length > 0) {
          // Buscar citas que coincidan con las solicitudes aprobadas
          // Por patient_id, psychologist_id y fecha similar
          for (const request of approvedRequests) {
            const requestDate = new Date(request.preferred_date);
            const startOfDay = new Date(requestDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(requestDate);
            endOfDay.setHours(23, 59, 59, 999);

            const { data: appointmentData } = await supabase
              .from('appointments')
              .select('id')
              .eq('patient_id', request.patient_id)
              .eq('psychologist_id', user.id)
              .gte('appointment_date', startOfDay.toISOString())
              .lte('appointment_date', endOfDay.toISOString())
              .in('status', ['scheduled', 'confirmed', 'accepted'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (appointmentData) {
              appointmentsMap[request.id] = appointmentData.id;
            }
          }
        }

        const requestsWithPatients = requestsData.map(request => ({
          ...request,
          patient: patientsData?.find(p => p.id === request.patient_id),
          appointment_id: appointmentsMap[request.id]
        }));

        console.log('AppointmentRequestList: Processed requests with patients:', requestsWithPatients);
        
        const filteredRequests = isDashboardView 
          ? requestsWithPatients.filter(req => req.status === 'pending').slice(0, 3)
          : requestsWithPatients;
        
        console.log('AppointmentRequestList: Setting requests state with', filteredRequests.length, 'items');
        setRequests(filteredRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('AppointmentRequestList: Error in fetchRequests:', error);
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
    fetchRequests();
  }, [user?.id]);

  const handleApprove = async (request: AppointmentRequest, finalDate?: string, finalTime?: string) => {
    if (!user?.id || approvingId) return;

    setApprovingId(request.id);
    try {
      await approveAppointmentRequest(request, user.id, () => {
        setApprovingId(null);
        fetchRequests();
      }, finalDate, finalTime);
    } catch (error) {
      setApprovingId(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId, () => {
        fetchRequests();
      });
    } catch (error) {
      // Error ya manejado en cancelAppointment
    }
  };

  const handleRejectClick = (requestId: string) => {
    setRejectingId(requestId);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleReject = async (rejectionReason?: string) => {
    if (!rejectingId || !user?.id) return;

    const request = requests.find(r => r.id === rejectingId);
    if (!request) return;

    try {
      await rejectAppointmentRequest(rejectingId, user.id, request.patient_id, rejectionReason, () => {
        setShowRejectDialog(false);
        setRejectingId(null);
        setRejectionReason('');
        fetchRequests();
      });
    } catch (error) {
      // Error already handled in rejectAppointmentRequest
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
              <AppointmentRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                onCancel={handleCancel}
                isApproving={approvingId === request.id}
                appointmentId={request.appointment_id}
              />
            ))}
            {isDashboardView && requests.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="link">Ver todas las solicitudes</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Dialog de rechazo con razón */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas rechazar esta solicitud? El paciente recibirá un mensaje informando el rechazo. Puedes agregar una razón (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Razón del rechazo (opcional)</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Ej: La fecha solicitada no está disponible. Por favor, solicita otra fecha."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReject(rejectionReason.trim() || undefined)}
            >
              Rechazar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

