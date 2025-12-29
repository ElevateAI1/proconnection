-- ============================================================================
-- Script para aplicar los últimos cambios a la base de datos
-- ============================================================================
-- Ejecuta este script en Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. Actualizar función get_plan_capabilities (fix columna ambigua)
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_plan_capabilities(UUID);
CREATE FUNCTION public.get_plan_capabilities(p_psychologist_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_type_value TEXT;
  capabilities JSON;
  is_clinic_member BOOLEAN;
  is_clinic_admin BOOLEAN;
BEGIN
  -- Obtener el plan_type del psicólogo
  SELECT p.plan_type INTO plan_type_value
  FROM public.psychologists p
  WHERE p.id = p_psychologist_id;
  
  -- Si no se encuentra el psicólogo, retornar capacidades de starter
  IF plan_type_value IS NULL THEN
    plan_type_value := 'starter';
  END IF;
  
  plan_type_value := LOWER(plan_type_value);
  
  -- Verificar si es miembro o admin de clínica
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.clinic_teams ct ON tm.clinic_team_id = ct.id
    WHERE tm.psychologist_id = p_psychologist_id AND tm.status = 'active'
  ) INTO is_clinic_member;
  
  SELECT public.is_clinic_admin(p_psychologist_id) INTO is_clinic_admin;
  
  -- Determinar capacidades según el plan
  CASE plan_type_value
    WHEN 'starter' THEN
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', false,
        'advanced_reports', false,
        'priority_support', false,
        'financial_features', false,
        'advanced_documents', false,
        'team_features', false,
        'early_access', false,
        'visibility_consulting', false,
        'api_integrations', false,
        'dedicated_support', false,
        'is_clinic_admin', false,
        'is_clinic_member', false
      );
    
    WHEN 'proconnection' THEN
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', true,
        'advanced_reports', true,
        'priority_support', true,
        'financial_features', true,
        'advanced_documents', true,
        'team_features', false,
        'early_access', false,
        'visibility_consulting', false,
        'api_integrations', false,
        'dedicated_support', false,
        'is_clinic_admin', false,
        'is_clinic_member', false
      );
    
    WHEN 'clinicas' THEN
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', true,
        'advanced_reports', true,
        'priority_support', true,
        'financial_features', true,
        'advanced_documents', true,
        'team_features', true,
        'early_access', true,
        'visibility_consulting', true,
        'api_integrations', true,
        'dedicated_support', true,
        'is_clinic_admin', is_clinic_admin,
        'is_clinic_member', is_clinic_member OR is_clinic_admin
      );
    
    WHEN 'dev' THEN
      -- DEV tiene todas las capacidades
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', true,
        'advanced_reports', true,
        'priority_support', true,
        'financial_features', true,
        'advanced_documents', true,
        'team_features', true,
        'early_access', true,
        'visibility_consulting', true,
        'api_integrations', true,
        'dedicated_support', true,
        'is_clinic_admin', true,
        'is_clinic_member', true
      );
    
    ELSE
      -- Default: starter
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', false,
        'advanced_reports', false,
        'priority_support', false,
        'financial_features', false,
        'advanced_documents', false,
        'team_features', false,
        'early_access', false,
        'visibility_consulting', false,
        'api_integrations', false,
        'dedicated_support', false,
        'is_clinic_admin', false,
        'is_clinic_member', false
      );
  END CASE;
  
  RETURN capabilities;
END;
$$;

COMMENT ON FUNCTION public.get_plan_capabilities(UUID) IS 'Devuelve las capacidades del plan basadas en el plan_type del psicólogo, incluyendo si es admin o miembro de clínica.';

-- ============================================================================
-- 2. Crear función cancel_appointment
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

