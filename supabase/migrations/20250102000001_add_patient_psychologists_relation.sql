-- Tabla de relación muchos-a-muchos entre pacientes y psicólogos
CREATE TABLE IF NOT EXISTS public.patient_psychologists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  professional_code TEXT NOT NULL, -- Código usado para vincular
  is_primary BOOLEAN DEFAULT false, -- Psicólogo principal
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id, psychologist_id) -- Evitar duplicados
);

COMMENT ON TABLE public.patient_psychologists IS 'Relación muchos-a-muchos entre pacientes y psicólogos';

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_patient_psychologists_patient ON public.patient_psychologists(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_psychologists_psychologist ON public.patient_psychologists(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_patient_psychologists_code ON public.patient_psychologists(professional_code);

-- Hacer psychologist_id opcional en patients (para compatibilidad)
ALTER TABLE public.patients 
  ALTER COLUMN psychologist_id DROP NOT NULL;

-- Función para agregar psicólogo a paciente mediante código profesional
CREATE OR REPLACE FUNCTION public.add_psychologist_to_patient(
  patient_id_param UUID,
  professional_code_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  psychologist_id_result UUID;
  existing_relation UUID;
BEGIN
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
$function$;

COMMENT ON FUNCTION public.add_psychologist_to_patient IS 'Agrega un psicólogo a un paciente mediante código profesional';

