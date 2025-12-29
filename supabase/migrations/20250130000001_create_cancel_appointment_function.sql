-- ============================================================================
-- Migración: Crear función cancel_appointment
-- ============================================================================
-- Esta función permite cancelar citas y actualizar el estado relacionado
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cancel_appointment(
  p_appointment_id UUID,
  p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment RECORD;
  v_result JSON;
BEGIN
  -- Get appointment details
  SELECT * INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Appointment not found',
      'appointment_id', p_appointment_id
    );
  END IF;
  
  -- Check if already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Appointment is already cancelled',
      'appointment_id', p_appointment_id
    );
  END IF;
  
  -- Update appointment status
  UPDATE public.appointments
  SET 
    status = 'cancelled',
    notes = CASE 
      WHEN notes IS NULL OR notes = '' THEN 
        'Cancelación: ' || COALESCE(p_cancellation_reason, 'Sin razón especificada')
      ELSE 
        notes || E'\n\nCancelación: ' || COALESCE(p_cancellation_reason, 'Sin razón especificada')
    END,
    updated_at = NOW()
  WHERE id = p_appointment_id;
  
  -- Update related appointment request if exists and is approved
  UPDATE public.appointment_requests
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id IN (
    SELECT ar.id 
    FROM public.appointment_requests ar
    WHERE ar.patient_id = v_appointment.patient_id
    AND ar.psychologist_id = v_appointment.psychologist_id
    AND DATE(ar.preferred_date) = DATE(v_appointment.appointment_date)
    AND ar.status = 'approved'
    ORDER BY ar.created_at DESC
    LIMIT 1
  );
  
  -- Return success
  v_result := json_build_object(
    'success', true, 
    'appointment_id', p_appointment_id,
    'message', 'Appointment cancelled successfully'
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.cancel_appointment(UUID, TEXT) IS 'Cancela una cita y actualiza el estado relacionado de appointment_requests si existe. Retorna JSON con el resultado de la operación.';

