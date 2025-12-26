-- Función para validar código profesional y retornar el ID del psicólogo
CREATE OR REPLACE FUNCTION public.validate_professional_code(code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    psychologist_id UUID;
BEGIN
    -- Buscar el psicólogo con el código profesional
    SELECT id INTO psychologist_id
    FROM public.psychologists
    WHERE professional_code = code;
    
    -- Si no se encuentra, lanzar excepción
    IF psychologist_id IS NULL THEN
        RAISE EXCEPTION 'Professional code not found: %', code;
    END IF;
    
    RETURN psychologist_id;
END;
$function$;

COMMENT ON FUNCTION public.validate_professional_code IS 'Valida un código profesional y retorna el UUID del psicólogo asociado';

