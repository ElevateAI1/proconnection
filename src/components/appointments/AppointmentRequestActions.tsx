import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
    const appointmentDateTime = new Date(`${dateToUse}T${timeToUse}`);
    
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

    toast({
      title: "Solicitud aprobada",
      description: "La cita ha sido programada exitosamente"
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
  onSuccess: () => void
) => {
  try {
    const { error } = await supabase
      .from('appointment_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw error;

    toast({
      title: "Solicitud rechazada",
      description: "La solicitud ha sido rechazada"
    });

    onSuccess();
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

