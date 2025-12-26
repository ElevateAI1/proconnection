-- Función para validar código profesional y retornar el ID del psicólogo
CREATE OR REPLACE FUNCTION public.validate_professional_code(code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    psychologist_id UUID;
    code_count INTEGER;
BEGIN
    RAISE NOTICE '=== validate_professional_code CALLED ===';
    RAISE NOTICE 'Code received: %', code;
    
    -- Verificar cuántos códigos existen (para debugging)
    SELECT COUNT(*) INTO code_count
    FROM public.psychologists
    WHERE professional_code = code;
    RAISE NOTICE 'Códigos encontrados con ese valor: %', code_count;
    
    -- Buscar el psicólogo con el código profesional
    -- Primero intentar búsqueda normalizada (trim y uppercase)
    SELECT id INTO psychologist_id
    FROM public.psychologists
    WHERE UPPER(TRIM(professional_code)) = UPPER(TRIM(code));
    
    RAISE NOTICE 'psychologist_id found (normalized search): %', psychologist_id;
    
    -- Si no se encuentra, intentar búsqueda exacta
    IF psychologist_id IS NULL THEN
        SELECT id INTO psychologist_id
        FROM public.psychologists
        WHERE professional_code = code;
        RAISE NOTICE 'psychologist_id found (exact search): %', psychologist_id;
    END IF;
    
    -- Si no se encuentra, lanzar excepción
    IF psychologist_id IS NULL THEN
        RAISE NOTICE 'Código no encontrado. Buscando códigos similares...';
        RAISE EXCEPTION 'Professional code not found: %. Verifica que el código sea correcto.', code;
    END IF;
    
    RETURN psychologist_id;
END;
$$;

COMMENT ON FUNCTION public.validate_professional_code IS 'Valida un código profesional y retorna el UUID del psicólogo asociado';

