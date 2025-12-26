-- Asegurar que la función add_psychologist_to_patient existe y tiene los permisos correctos

-- Eliminar la función si existe (para recrearla)
DROP FUNCTION IF EXISTS public.add_psychologist_to_patient(UUID, TEXT);

-- Recrear la función con la sintaxis correcta
CREATE OR REPLACE FUNCTION public.add_psychologist_to_patient(
  patient_id_param UUID,
  professional_code_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  psychologist_id_result UUID;
  existing_relation UUID;
  current_user_id UUID;
BEGIN
  -- Verificar que el usuario autenticado es el paciente
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF current_user_id != patient_id_param THEN
    RAISE EXCEPTION 'Can only add psychologists to your own account';
  END IF;
  
  -- Validar código profesional y obtener psychologist_id
  SELECT id INTO psychologist_id_result
  FROM public.psychologists
  WHERE professional_code = professional_code_param;
  
  IF psychologist_id_result IS NULL THEN
    RAISE EXCEPTION 'Professional code not found: %', professional_code_param;
  END IF;
  
  -- Verificar si ya existe la relación
  SELECT id INTO existing_relation
  FROM public.patient_psychologists
  WHERE patient_id = patient_id_param 
    AND psychologist_id = psychologist_id_result;
  
  IF existing_relation IS NOT NULL THEN
    RAISE EXCEPTION 'Patient already linked to this psychologist';
  END IF;
  
  -- Crear la relación
  INSERT INTO public.patient_psychologists (
    patient_id,
    psychologist_id,
    professional_code
  ) VALUES (
    patient_id_param,
    psychologist_id_result,
    professional_code_param
  ) RETURNING id INTO existing_relation;
  
  RETURN existing_relation;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.add_psychologist_to_patient(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_psychologist_to_patient(UUID, TEXT) TO anon;

COMMENT ON FUNCTION public.add_psychologist_to_patient IS 'Agrega un psicólogo a un paciente mediante código profesional';

