import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";

export interface AppointmentRequest {
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

interface AppointmentRequestCardProps {
  request: AppointmentRequest;
  onApprove: (request: AppointmentRequest) => void;
  onReject: (requestId: string) => void;
  isApproving?: boolean;
}

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

export const AppointmentRequestCard = ({
  request,
  onApprove,
  onReject,
  isApproving = false
}: AppointmentRequestCardProps) => {
  return (
    <div className="p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {request.patient?.first_name} {request.patient?.last_name}
          </h3>
          <p className="text-sm text-slate-500">
            {new Date(request.created_at).toLocaleDateString()} - {request.patient?.phone}
          </p>
          <p className="text-sm text-slate-500">
            Fecha preferida: {new Date(request.preferred_date).toLocaleDateString()} {request.preferred_time}
          </p>
          {request.notes && (
            <p className="text-sm text-slate-500">
              {request.notes}
            </p>
          )}
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onApprove(request)}
                disabled={isApproving}
                aria-label={`Aprobar solicitud de ${request.patient?.first_name} ${request.patient?.last_name}`}
              >
                {isApproving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                    Aprobando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprobar
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onReject(request.id)}
                disabled={isApproving}
                aria-label={`Rechazar solicitud de ${request.patient?.first_name} ${request.patient?.last_name}`}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

