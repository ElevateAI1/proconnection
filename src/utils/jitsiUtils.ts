import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const createJitsiMeetingForAppointment = async (
  appointmentId: string,
  appointmentDate: string,
  patientName?: string,
  psychologistName?: string
): Promise<string | null> => {
  try {
    // Validar que la cita no haya pasado
    const appointmentDateTime = new Date(appointmentDate);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      toast({
        title: "Cita pasada",
        description: "Esta cita ya pasó. No se puede crear una reunión para citas pasadas.",
        variant: "destructive"
      });
      return null;
    }

    const roomName = `psiconnect-${appointmentId}`;
    const meetingTime = new Date(appointmentDate).getTime();
    const duration = 60;

    const { data, error } = await supabase.functions.invoke('proconnection-api', {
      body: {
        resource: 'create-jitsi-meeting',
        roomName: roomName,
        startTime: meetingTime,
        duration: duration,
        appointmentId: appointmentId,
        patientName: patientName || 'Paciente',
        psychologistName: psychologistName || 'Psicólogo'
      }
    });

    if (error) {
      console.error('Error creating Jitsi meeting:', error);
      toast({
        title: "Error",
        description: "Error al crear la reunión virtual",
        variant: "destructive"
      });
      return null;
    }

    if (data?.meetingUrl) {
      toast({
        title: "Reunión creada",
        description: "La videollamada ha sido creada exitosamente"
      });
      return data.meetingUrl;
    }

    return null;
  } catch (error) {
    console.error('Error in createJitsiMeetingForAppointment:', error);
    toast({
      title: "Error",
      description: "Error al crear la reunión virtual",
      variant: "destructive"
    });
    return null;
  }
};

