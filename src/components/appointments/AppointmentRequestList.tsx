import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppointmentRequestCard, type AppointmentRequest } from "./AppointmentRequestCard";
import { approveAppointmentRequest, rejectAppointmentRequest } from "./AppointmentRequestActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentRequestListProps {
  isDashboardView?: boolean;
}

export const AppointmentRequestList = ({ isDashboardView = false }: AppointmentRequestListProps) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
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

        const requestsWithPatients = requestsData.map(request => ({
          ...request,
          patient: patientsData?.find(p => p.id === request.patient_id)
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

  const handleApprove = async (request: AppointmentRequest) => {
    if (!user?.id || approvingId) return;

    setApprovingId(request.id);
    try {
      await approveAppointmentRequest(request, user.id, () => {
        setApprovingId(null);
        fetchRequests();
      });
    } catch (error) {
      setApprovingId(null);
    }
  };

  const handleRejectClick = (requestId: string) => {
    setRejectingId(requestId);
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!rejectingId) return;

    try {
      await rejectAppointmentRequest(rejectingId, () => {
        setShowRejectDialog(false);
        setRejectingId(null);
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
                isApproving={approvingId === request.id}
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

      {/* Dialog de confirmación para rechazar */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar rechazo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta solicitud de cita? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

