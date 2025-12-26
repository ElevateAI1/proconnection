-- Corregir la política RLS para que los pacientes puedan ver sus psicólogos vinculados
-- El problema es que la política con EXISTS puede no estar funcionando correctamente

-- Eliminar la política existente
DROP POLICY IF EXISTS "Patients can view their linked psychologists" ON public.psychologists;

-- Crear una nueva política más directa usando una función helper o una verificación más simple
-- Opción 1: Usar una función SECURITY DEFINER para verificar la relación
CREATE OR REPLACE FUNCTION public.check_patient_psychologist_relation(
  psychologist_id_param UUID,
  patient_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Verificar si existe la relación en patient_psychologists
  RETURN EXISTS (
    SELECT 1 
    FROM public.patient_psychologists
    WHERE patient_psychologists.psychologist_id = psychologist_id_param
      AND patient_psychologists.patient_id = patient_id_param
  )
  OR EXISTS (
    SELECT 1 
    FROM public.patients
    WHERE patients.psychologist_id = psychologist_id_param
      AND patients.id = patient_id_param
  );
END;
$$;

-- Crear la política usando la función helper
CREATE POLICY "Patients can view their linked psychologists" ON public.psychologists
  FOR SELECT USING (
    public.check_patient_psychologist_relation(psychologists.id, auth.uid())
  );

-- Otorgar permisos de ejecución a la función
GRANT EXECUTE ON FUNCTION public.check_patient_psychologist_relation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_patient_psychologist_relation(UUID, UUID) TO anon;

COMMENT ON FUNCTION public.check_patient_psychologist_relation IS 'Verifica si un paciente está vinculado a un psicólogo';
COMMENT ON POLICY "Patients can view their linked psychologists" ON public.psychologists IS 'Permite que los pacientes vean información básica de sus psicólogos vinculados';

