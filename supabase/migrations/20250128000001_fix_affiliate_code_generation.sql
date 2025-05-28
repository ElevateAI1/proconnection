
-- Fix the generate_affiliate_code function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    generated_code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generar código como AF-ABC123
        generated_code := 'AF-' || upper(substring(md5(random()::text) from 1 for 6));
        
        -- Verificar si el código ya existe usando el nombre de variable diferente
        SELECT EXISTS(
            SELECT 1 FROM public.affiliate_codes 
            WHERE affiliate_codes.code = generated_code
        ) INTO exists_check;
        
        -- Si no existe, retornarlo
        IF NOT exists_check THEN
            RETURN generated_code;
        END IF;
    END LOOP;
END;
$function$;
