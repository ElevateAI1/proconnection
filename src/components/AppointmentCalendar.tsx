
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Plus } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  type: string;
  notes?: string;
  patient?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

interface AppointmentCalendarProps {
  onBack: () => void;
  patientId?: string;
}

export const AppointmentCalendar = ({ onBack, patientId }: AppointmentCalendarProps) => {
  const { psychologist } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (psychologist?.id) {
      fetchAppointments();
    }
  }, [psychologist, patientId]);

  const fetchAppointments = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          appointment_date,
          duration_minutes,
          status,
          type,
          notes,
          patients!inner(
            first_name,
            last_name,
            phone
          )
        `)
        .eq('psychologist_id', psychologist.id)
        .order('appointment_date', { ascending: true });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive"
        });
        return;
      }

      const appointmentsWithPatients = (data || []).map(appointment => ({
        ...appointment,
        patient: appointment.patients
      }));

      setAppointments(appointmentsWithPatients);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800">
            {patientId ? 'Citas del Paciente' : 'Calendario de Citas'}
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800">
            {patientId ? 'Citas del Paciente' : 'Calendario de Citas'}
          </h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximas Citas ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.patient ? 
                          `${appointment.patient.first_name?.[0] || ''}${appointment.patient.last_name?.[0] || ''}` 
                          : 'P'
                        }
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {appointment.patient ? 
                            `${appointment.patient.first_name} ${appointment.patient.last_name}` 
                            : 'Paciente'
                          }
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(appointment.appointment_date).toLocaleDateString('es-ES')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(appointment.appointment_date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span>{appointment.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {patientId ? 'No hay citas para este paciente' : 'No hay citas programadas'}
              </h3>
              <p className="text-sm">
                {patientId ? 'Este paciente no tiene citas programadas' : 'Programa tu primera cita para comenzar'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
