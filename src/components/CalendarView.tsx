import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  appointment_date: string;
  type: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  meeting_url?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

export const Calendar = () => {
  const { psychologist } = useProfile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Updated time slots to include half-hour intervals
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["L", "M", "X", "J", "V", "S", "D"];

  useEffect(() => {
    if (psychologist?.id) {
      fetchAppointments();
    }
  }, [psychologist?.id, selectedDate.toDateString()]); // Use toDateString to avoid infinite loops

  const fetchAppointments = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      console.log('Fetching appointments for psychologist:', psychologist.id);
      console.log('Selected date:', selectedDate.toISOString());

      // Create date range in local timezone
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Date range:', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      });

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name)
        `)
        .eq('psychologist_id', psychologist.id)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted'])
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive"
        });
        setAppointments([]);
        return;
      }

      console.log('Fetched appointments for selected date:', data);
      if (data && data.length > 0) {
        data.forEach(apt => {
          const aptDate = new Date(apt.appointment_date);
          console.log(`Appointment ${apt.id}:`, {
            originalTime: apt.appointment_date,
            localTime: aptDate.toLocaleString(),
            timeOnly: aptDate.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })
          });
        });
      }
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar las citas",
        variant: "destructive"
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoize appointment mapping to prevent infinite re-calculations
  const appointmentsByTime = useMemo(() => {
    const mapping: Record<string, Appointment> = {};
    
    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointment_date);
      const aptTime = aptDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      mapping[aptTime] = apt;
    });
    
    console.log('Appointment mapping created:', mapping);
    return mapping;
  }, [appointments]);

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

  const getAppointmentForTime = (time: string) => {
    return appointmentsByTime[time] || null;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    if (day) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(newDate);
      console.log('Selected new date:', newDate.toISOString());
    }
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleJoinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Calendario</h2>
          <p className="text-slate-600">Gestiona tus citas y horarios</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
          Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    !day 
                      ? "invisible"
                      : isSelected(day)
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                      : isToday(day)
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Clock className="w-5 h-5" />
                Agenda del Día - {formatSelectedDate()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Cargando citas...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {timeSlots.map((time) => {
                    const appointment = getAppointmentForTime(time);
                    return (
                      <div key={time} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="w-16 text-sm font-medium text-slate-600 text-center">
                          {time}
                        </div>
                        {appointment ? (
                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {appointment.patient 
                                    ? `${appointment.patient.first_name} ${appointment.patient.last_name}` 
                                    : 'Paciente'
                                  }
                                </p>
                                <p className="text-sm text-slate-600">{getTypeLabel(appointment.type)}</p>
                                {appointment.meeting_url && (
                                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                    <Video className="w-3 h-3" />
                                    <span>Reunión virtual disponible</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">
                                {appointment.duration_minutes ? `${appointment.duration_minutes} min` : '60 min'}
                              </span>
                              {appointment.meeting_url && (
                                <button
                                  onClick={() => handleJoinMeeting(appointment.meeting_url!)}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                  <Video className="w-3 h-3" />
                                  Unirse
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-slate-400 text-sm">
                            Disponible
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {!loading && appointments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay citas programadas para este día</p>
                  <p className="text-sm">Las citas aparecerán aquí cuando sean confirmadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
