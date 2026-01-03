import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDateArgentina, formatTimeArgentina, dateFormatOptions } from "@/utils/dateFormatting";
import type { AppointmentRequest } from "./AppointmentRequestCard";

interface PaymentReceiptData {
  psychologist_id: string;
  patient_id: string;
  payment_proof_url: string;
  preferred_date: string;
  payment_amount?: number;
  notes: string;
  id: string;
}

const sendAutoMessage = async (
  psychologistId: string,
  patientId: string,
  message: string
) => {
  try {
    // Buscar o crear conversación
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('psychologist_id', psychologistId)
      .eq('patient_id', patientId)
      .single();

    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          psychologist_id: psychologistId,
          patient_id: patientId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        return;
      }

      conversationId = newConversation.id;
    }

    // Enviar mensaje
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: psychologistId,
        content: message,
        message_type: 'text'
      });

    if (messageError) {
      console.error('Error sending auto message:', messageError);
    } else {
      // Actualizar last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }
  } catch (error) {
    console.error('Error in sendAutoMessage:', error);
    // No mostramos error al usuario, solo logueamos
  }
};

export const createPaymentReceipt = async (requestData: PaymentReceiptData) => {
  if (!requestData.payment_proof_url || !requestData.payment_amount) {
    console.log('AppointmentRequestActions: No payment proof or amount, skipping receipt creation');
    return;
  }

  try {
    console.log('AppointmentRequestActions: Creating payment receipt for request:', requestData.id);
    
    let amount = requestData.payment_amount;
    if (!amount && requestData.notes) {
      const amountMatch = requestData.notes.match(/\$?([\d,]+\.?\d*)/);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(',', ''));
      }
    }

    const { data: receiptData, error: receiptError } = await supabase
      .from('payment_receipts')
      .insert({
        psychologist_id: requestData.psychologist_id,
        patient_id: requestData.patient_id,
        original_file_url: requestData.payment_proof_url,
        receipt_date: requestData.preferred_date,
        amount: amount || 0,
        receipt_type: 'comprobante_pago',
        payment_method: 'transferencia',
        extraction_status: 'pending',
        validation_status: 'pending',
        include_in_report: false,
        validation_notes: `Comprobante desde solicitud de cita ${requestData.id}`,
      })
      .select()
      .single();

    if (receiptError) {
      console.error('AppointmentRequestActions: Error creating payment receipt:', receiptError);
      throw receiptError;
    }

    console.log('AppointmentRequestActions: Payment receipt created successfully:', receiptData);

    // Call OCR Edge Function
    if (receiptData) {
      try {
        const { error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
          body: { 
            fileUrl: requestData.payment_proof_url, 
            receiptId: receiptData.id 
          }
        });

        if (ocrError) {
          console.error('AppointmentRequestActions: Error calling OCR function:', ocrError);
        } else {
          console.log('AppointmentRequestActions: OCR processing initiated successfully');
        }
      } catch (ocrError) {
        console.error('AppointmentRequestActions: Error in OCR processing:', ocrError);
      }
    }
  } catch (error) {
    console.error('AppointmentRequestActions: Error in createPaymentReceipt:', error);
  }
};

export const createJitsiMeeting = async (
  appointment: any,
  request: AppointmentRequest,
  userId: string | undefined
) => {
  try {
    const roomName = `psiconnect-${appointment.id}`;
    const meetingTime = new Date(appointment.appointment_date).getTime();
    const duration = 60;

    // Usar proconnection-api en lugar de create-jitsi-meeting
    // Pasar el resource en el body para que la función sepa qué endpoint usar
    const { data, error } = await supabase.functions.invoke('proconnection-api', {
      body: {
        resource: 'create-jitsi-meeting', // Especificar el recurso en el body
        roomName: roomName,
        startTime: meetingTime,
        duration: duration,
        appointmentId: appointment.id,
        patientName: request.patient?.first_name || 'Paciente',
        psychologistName: 'Psicólogo'
      }
    });

    if (error) {
      console.error('Error creating Jitsi meeting:', error);
      toast({
        title: "Error",
        description: "Error al crear la reunión virtual",
        variant: "destructive"
      });
    } else {
      console.log('Jitsi meeting created successfully:', data);
    }
  } catch (error) {
    console.error('Error in createJitsiMeeting:', error);
    toast({
      title: "Error",
      description: "Error al crear la reunión virtual",
      variant: "destructive"
    });
  }
};

export const approveAppointmentRequest = async (
  request: AppointmentRequest,
  userId: string,
  onSuccess: () => void,
  finalDate?: string,
  finalTime?: string
) => {
  console.log('AppointmentRequestActions: Approving request:', request.id);
  console.log('AppointmentRequestActions: Creating appointment for request:', request);
  console.log('AppointmentRequestActions: Final date:', finalDate, 'Final time:', finalTime);

  try {
    // Usar la fecha y hora finales si se proporcionaron, sino usar las sugeridas por el paciente
    const dateToUse = finalDate || request.preferred_date;
    const timeToUse = finalTime || request.preferred_time || '09:00';
    let appointmentDateTime = new Date(`${dateToUse}T${timeToUse}`);
    
    // Validar que la fecha no sea en el pasado
    const now = new Date();
    if (appointmentDateTime < now) {
      // Si la fecha es pasada, usar fecha actual con horario recomendado
      const recommendedTime = '09:00'; // Horario recomendado por defecto
      const [hours, minutes] = recommendedTime.split(':').map(Number);
      appointmentDateTime = new Date();
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      // Si el horario recomendado ya pasó hoy, usar mañana
      if (appointmentDateTime < now) {
        appointmentDateTime.setDate(appointmentDateTime.getDate() + 1);
      }
      
      toast({
        title: "Fecha ajustada",
        description: "La fecha seleccionada era pasada. Se ha programado para " + 
          (appointmentDateTime.toDateString() === new Date().toDateString() ? "hoy" : "mañana") + 
          " con horario recomendado.",
      });
    }
    
    const appointmentData = {
      patient_id: request.patient_id,
      psychologist_id: userId,
      appointment_date: appointmentDateTime.toISOString(),
      type: request.type || 'individual',
      notes: request.notes,
      status: 'confirmed'
    };

    console.log('AppointmentRequestActions: Creating appointment with data:', appointmentData);

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) throw appointmentError;

    console.log('AppointmentRequestActions: Appointment created successfully:', appointment);

    if (appointment) {
      await createJitsiMeeting(appointment, request, userId);
    }

    await createPaymentReceipt({
      psychologist_id: userId,
      patient_id: request.patient_id,
      payment_proof_url: request.payment_proof_url || '',
      preferred_date: request.preferred_date,
      payment_amount: request.payment_amount,
      notes: request.notes,
      id: request.id
    });

    const { error: updateError } = await supabase
      .from('appointment_requests')
      .update({ status: 'approved' })
      .eq('id', request.id);

    if (updateError) throw updateError;

    console.log('AppointmentRequestActions: Request status updated successfully');

    // Enviar mensaje automático al paciente
    const appointmentDate = new Date(appointmentDateTime);
    const formattedDate = formatDateArgentina(appointmentDate, dateFormatOptions.full);
    const formattedTime = formatTimeArgentina(appointmentDate);
    
    const approvalMessage = `✅ Tu solicitud de cita ha sido aprobada.\n\n📅 Fecha: ${formattedDate}\n🕐 Hora: ${formattedTime}\n\nSi necesitas modificar la fecha o hora, puedes responderme este mensaje y coordinamos. ¡Te esperamos!`;
    
    await sendAutoMessage(userId, request.patient_id, approvalMessage);

    toast({
      title: "Solicitud aprobada",
      description: "La cita ha sido programada exitosamente y se envió un mensaje al paciente"
    });

    onSuccess();
  } catch (error) {
    console.error('AppointmentRequestActions: Error approving request:', error);
    toast({
      title: "Error",
      description: "Error al aprobar la solicitud",
      variant: "destructive"
    });
    throw error;
  }
};

export const rejectAppointmentRequest = async (
  requestId: string,
  psychologistId: string,
  patientId: string,
  rejectionReason?: string,
  onSuccess?: () => void
) => {
  try {
    const { error } = await supabase
      .from('appointment_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw error;

    // Enviar mensaje automático al paciente
    const rejectionMessage = rejectionReason 
      ? `❌ Lamentablemente, tu solicitud de cita ha sido rechazada.\n\nMotivo: ${rejectionReason}\n\nSi tienes alguna pregunta o deseas coordinar otra fecha, puedes responderme este mensaje.`
      : `❌ Lamentablemente, tu solicitud de cita ha sido rechazada.\n\nSi tienes alguna pregunta o deseas coordinar otra fecha, puedes responderme este mensaje.`;
    
    await sendAutoMessage(psychologistId, patientId, rejectionMessage);

    toast({
      title: "Solicitud rechazada",
      description: "La solicitud ha sido rechazada y se envió un mensaje al paciente"
    });

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error rejecting request:', error);
    toast({
      title: "Error",
      description: "Error al rechazar la solicitud",
      variant: "destructive"
    });
    throw error;
  }
};

export const cancelAppointment = async (
  appointmentId: string,
  onSuccess: () => void,
  cancelledByUserId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = cancelledByUserId || user?.id;

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;

    toast({
      title: "Cita cancelada",
      description: "La cita ha sido cancelada exitosamente"
    });

    onSuccess();
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast({
      title: "Error",
      description: "Error al cancelar la cita",
      variant: "destructive"
    });
    throw error;
  }
};

