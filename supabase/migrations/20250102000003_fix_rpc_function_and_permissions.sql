-- Asegurar que la función add_psychologist_to_patient existe y tiene los permisos correctos

-- Eliminar la función si existe (para recrearla)
DROP FUNCTION IF EXISTS public.add_psychologist_to_patient(UUID, TEXT);

-- Recrear la función con la sintaxis correcta y logs
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
  code_count INTEGER;
BEGIN
  -- Log inicial
  RAISE NOTICE '=== add_psychologist_to_patient CALLED ===';
  RAISE NOTICE 'patient_id_param: %', patient_id_param;
  RAISE NOTICE 'professional_code_param: %', professional_code_param;
  
  -- Verificar que el usuario autenticado es el paciente
  current_user_id := auth.uid();
  RAISE NOTICE 'current_user_id (auth.uid()): %', current_user_id;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF current_user_id != patient_id_param THEN
    RAISE EXCEPTION 'Can only add psychologists to your own account. Current: %, Provided: %', current_user_id, patient_id_param;
  END IF;
  
  -- Verificar cuántos códigos existen (para debugging)
  SELECT COUNT(*) INTO code_count
  FROM public.psychologists
  WHERE UPPER(TRIM(professional_code)) = UPPER(TRIM(professional_code_param));
  RAISE NOTICE 'Códigos encontrados con ese valor (normalized): %', code_count;
  
  -- Validar código profesional y obtener psychologist_id
  -- Primero intentar búsqueda normalizada (trim y uppercase) para ser más flexible
  SELECT id INTO psychologist_id_result
  FROM public.psychologists
  WHERE UPPER(TRIM(professional_code)) = UPPER(TRIM(professional_code_param));
  
  RAISE NOTICE 'psychologist_id_result (normalized search): %', psychologist_id_result;
  
  -- Si no se encuentra, intentar búsqueda exacta
  IF psychologist_id_result IS NULL THEN
    SELECT id INTO psychologist_id_result
    FROM public.psychologists
    WHERE professional_code = professional_code_param;
    RAISE NOTICE 'psychologist_id_result (exact search): %', psychologist_id_result;
  END IF;
  
  IF psychologist_id_result IS NULL THEN
    -- Log adicional para debugging
    RAISE NOTICE 'Código no encontrado. Buscando códigos similares...';
    RAISE EXCEPTION 'Professional code not found: %. Verifica que el código sea correcto.', professional_code_param;
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

