
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateMeetingRequest {
  appointmentId: string;
  patientName: string;
  psychologistName: string;
  appointmentDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointmentId, patientName, psychologistName, appointmentDate }: CreateMeetingRequest = await req.json();
    
    console.log('Creating Jitsi meeting for appointment:', appointmentId);

    // Generate a unique room name for the meeting
    const roomName = `therapy-session-${appointmentId}-${Date.now()}`;
    
    // Create Jitsi meet URL
    const jitsiMeetUrl = `https://meet.jit.si/${roomName}`;
    
    // Update the appointment with the meeting URL
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        meeting_url: jitsiMeetUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Error updating appointment with meeting URL:', updateError);
      throw new Error('No se pudo guardar el enlace de la reunión');
    }

    console.log('Meeting URL created and saved successfully:', jitsiMeetUrl);

    // Return the meeting details
    return new Response(JSON.stringify({
      success: true,
      meetingUrl: jitsiMeetUrl,
      roomName: roomName,
      message: 'Reunión creada exitosamente'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error creating Jitsi meeting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
