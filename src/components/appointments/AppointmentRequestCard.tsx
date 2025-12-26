import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye, ChevronRight, User, Calendar, Phone, FileText, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse notes to extract structured information
  const parseNotes = (notes: string) => {
    const lines = notes.split('\n');
    const info: Record<string, string> = {};
    
    lines.forEach(line => {
      if (line.includes('Nombre:')) {
        info.name = line.replace('Nombre:', '').trim();
      } else if (line.includes('Edad:')) {
        info.age = line.replace('Edad:', '').trim();
      } else if (line.includes('Email:')) {
        info.email = line.replace('Email:', '').trim();
      } else if (line.includes('Teléfono:')) {
        info.phone = line.replace('Teléfono:', '').trim();
      } else if (line.includes('Motivo de consulta:')) {
        info.reason = line.replace('Motivo de consulta:', '').trim();
      } else if (line.includes('Notas adicionales:')) {
        info.additionalNotes = line.replace('Notas adicionales:', '').trim();
      }
    });
    
    return info;
  };

  const parsedInfo = request.notes ? parseNotes(request.notes) : {};
  const additionalNotes = parsedInfo.additionalNotes || (request.notes && !request.notes.includes('Nombre:') ? request.notes : '');

  return (
    <>
      <div 
        className="p-4 border rounded-md hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">
                {request.patient?.first_name} {request.patient?.last_name}
              </h3>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(request.preferred_date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} a las {request.preferred_time}
            </p>
            {request.patient?.phone && (
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {request.patient.phone}
              </p>
            )}
            {parsedInfo.reason && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {parsedInfo.reason}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {request.payment_proof_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(request.payment_proof_url, '_blank');
                }}
                className="flex-shrink-0"
              >
                <Eye className="w-4 h-4 mr-1" />
                Comprobante
              </Button>
            )}
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Modal con información completa */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Solicitud de Cita - {request.patient?.first_name} {request.patient?.last_name}
            </DialogTitle>
            <DialogDescription>
              Información completa de la solicitud
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Información del paciente */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Paciente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Nombre completo</p>
                  <p className="font-medium">{request.patient?.first_name} {request.patient?.last_name}</p>
                </div>
                {parsedInfo.age && (
                  <div>
                    <p className="text-xs text-slate-500">Edad</p>
                    <p className="font-medium">{parsedInfo.age}</p>
                  </div>
                )}
                {parsedInfo.email && (
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{parsedInfo.email}</p>
                  </div>
                )}
                {request.patient?.phone && (
                  <div>
                    <p className="text-xs text-slate-500">Teléfono</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {request.patient.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles de la cita */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Detalles de la Cita
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Fecha preferida</p>
                  <p className="font-medium">
                    {new Date(request.preferred_date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hora preferida</p>
                  <p className="font-medium">{request.preferred_time}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tipo de sesión</p>
                  <p className="font-medium capitalize">{request.type === 'individual' ? 'Individual' : request.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estado</p>
                  <div className="mt-1">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Motivo de consulta */}
            {parsedInfo.reason && (
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Motivo de Consulta
                </h4>
                <p className="text-slate-700 whitespace-pre-wrap">{parsedInfo.reason}</p>
              </div>
            )}

            {/* Notas adicionales */}
            {additionalNotes && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Notas Adicionales
                </h4>
                <p className="text-slate-700 whitespace-pre-wrap">{additionalNotes}</p>
              </div>
            )}

            {/* Información de pago */}
            {request.payment_proof_url && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Comprobante de Pago
                </h4>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(request.payment_proof_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Comprobante
                  </Button>
                  {request.payment_amount && (
                    <p className="text-sm text-slate-600">
                      Monto: ${request.payment_amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Información de fecha */}
            <div className="text-xs text-slate-500 border-t pt-4">
              <p>Solicitud creada: {new Date(request.created_at).toLocaleString('es-ES')}</p>
              {request.updated_at !== request.created_at && (
                <p>Última actualización: {new Date(request.updated_at).toLocaleString('es-ES')}</p>
              )}
            </div>

            {/* Acciones */}
            {request.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="default" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onApprove(request);
                    setIsExpanded(false);
                  }}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar Solicitud
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => {
                    onReject(request.id);
                    setIsExpanded(false);
                  }}
                  disabled={isApproving}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

