
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Check, X, FileText } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AppointmentRequest {
  id: string;
  patient_id: string;
  preferred_date: string;
  preferred_time: string;
  type: string;
  notes: string;
  status: string;
  created_at: string;
  patient?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

export const AppointmentRequests = () => {
  const { psychologist } = useProfile();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (psychologist) {
      fetchRequests();
    }
  }, [psychologist]);

  const fetchRequests = async () => {
    if (!psychologist) return;

    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
          *,
          patient:patients(first_name, last_name, phone)
        `)
        .eq('psychologist_id', psychologist.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de citas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    
    try {
      const { error } = await supabase
        .from('appointment_requests')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'approved' ? "Solicitud Aprobada" : "Solicitud Rechazada",
        description: `La solicitud de cita ha sido ${action === 'approved' ? 'aprobada' : 'rechazada'} exitosamente.`,
      });

      // Refresh the requests list
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      individual: "Terapia Individual",
      couple: "Terapia de Pareja",
      family: "Terapia Familiar",
      evaluation: "Evaluación",
      follow_up: "Seguimiento"
    };
    return labels[type] || type;
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
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-5 h-5" />
          Solicitudes de Citas Pendientes
          {requests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
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
                          {request.patient?.first_name} {request.patient?.last_name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          Solicitud enviada el {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(request.preferred_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
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
                      Aprobar
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
