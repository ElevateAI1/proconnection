# Script de Verificación de Códigos Profesionales

## ⚠️ IMPORTANTE: Los códigos profesionales NO deben cambiar

Los códigos profesionales son **permanentes** y **únicos**. No deben regenerarse ni cambiarse.

## 🔍 Script de Verificación

Ejecuta este script en Supabase SQL Editor para verificar que todo esté correcto:

```sql
-- 1. Verificar que todos los psicólogos tienen código profesional
SELECT 
  id,
  first_name,
  last_name,
  professional_code,
  created_at
FROM public.psychologists
WHERE professional_code IS NULL OR professional_code = '';

-- 2. Verificar que no hay códigos duplicados
SELECT 
  professional_code,
  COUNT(*) as count
FROM public.psychologists
GROUP BY professional_code
HAVING COUNT(*) > 1;

-- 3. Verificar que la función validate_professional_code existe
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'validate_professional_code';

-- 4. Verificar que la función add_psychologist_to_patient existe
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'add_psychologist_to_patient';

-- 5. Probar la función validate_professional_code con un código existente
-- (Reemplaza 'PS-XXXXXX' con un código real de tu base de datos)
SELECT public.validate_professional_code('PS-XXXXXX');

-- 6. Verificar permisos de las funciones
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('validate_professional_code', 'add_psychologist_to_patient');
```

## 🛠️ Si hay psicólogos sin código profesional

Si encuentras psicólogos sin código (resultado del query #1), ejecuta esto para generarles uno:

```sql
-- Generar códigos para psicólogos que no tienen
DO $$
DECLARE
  psych_record RECORD;
  new_code TEXT;
BEGIN
  FOR psych_record IN 
    SELECT id FROM public.psychologists 
    WHERE professional_code IS NULL OR professional_code = ''
  LOOP
    -- Generar código
    SELECT public.generate_professional_code() INTO new_code;
    
    -- Actualizar el psicólogo
    UPDATE public.psychologists
    SET professional_code = new_code
    WHERE id = psych_record.id;
    
    RAISE NOTICE 'Código generado para psicólogo %: %', psych_record.id, new_code;
  END LOOP;
END;
$$;
```

## ⚠️ NO regenerar códigos existentes

**NUNCA** regeneres códigos que ya existen. Los códigos profesionales son:
- Permanentes
- Únicos
- Usados por pacientes para vincularse
- Parte de la identidad del profesional

Si regeneras un código, los pacientes que lo tienen no podrán vincularse.

