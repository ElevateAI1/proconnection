
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Copy, ExternalLink, Calendar, Clock, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AppointmentWithMeeting {
  id: string;
  appointment_date: string;
  type: string;
  duration_minutes: number;
  meeting_url: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
  psychologist?: {
    first_name: string;
    last_name: string;
  };
}

export const MeetingLinksCard = () => {
  const { psychologist, patient } = useProfile();
  const [appointmentsWithMeetings, setAppointmentsWithMeetings] = useState<AppointmentWithMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (psychologist?.id || patient?.id) {
      fetchAppointmentsWithMeetings();
    }
  }, [psychologist, patient]);

  const fetchAppointmentsWithMeetings = async () => {
    try {
      setLoading(true);
      
      const userId = psychologist?.id || patient?.id;
      const userField = psychologist?.id ? 'psychologist_id' : 'patient_id';
      
      if (!userId) return;

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name),
          psychologist:psychologists(first_name, last_name)
        `)
        .eq(userField, userId)
        .gte('appointment_date', now)
        .not('meeting_url', 'is', null)
        .in('status', ['scheduled', 'confirmed', 'accepted'])
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments with meetings:', error);
        return;
      }

      setAppointmentsWithMeetings(data || []);
    } catch (error) {
      console.error('Error fetching appointments with meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyMeetingLink = async (meetingUrl: string) => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace de la reunión se ha copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
  };

  const openMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
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

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando reuniones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointmentsWithMeetings.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Video className="w-5 h-5" />
          Próximas Reuniones Virtuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointmentsWithMeetings.map((appointment) => {
            const { date, time } = formatDateTime(appointment.appointment_date);
            const otherPerson = psychologist?.id 
              ? appointment.patient 
              : appointment.psychologist;
            
            return (
              <div key={appointment.id} className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {getTypeLabel(appointment.type)}
                        </h4>
                        {otherPerson && (
                          <p className="text-sm text-slate-600">
                            {psychologist?.id ? 'Paciente' : 'Psicólogo'}: {otherPerson.first_name} {otherPerson.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{time} ({appointment.duration_minutes} min)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <span>Enlace de reunión:</span>
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                        {appointment.meeting_url.substring(0, 50)}...
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openMeeting(appointment.meeting_url)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Unirse
                    </button>
                    <button
                      onClick={() => copyMeetingLink(appointment.meeting_url)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
