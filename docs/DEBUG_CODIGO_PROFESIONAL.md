# 🔍 Debug: Código Profesional No Encontrado

## 📋 Pasos para Diagnosticar

### 1. Verificar el código exacto en la base de datos

```sql
-- Ver todos los códigos profesionales existentes
SELECT 
  id,
  first_name,
  last_name,
  professional_code,
  LENGTH(professional_code) as code_length,
  professional_code = UPPER(professional_code) as is_uppercase
FROM public.psychologists
ORDER BY created_at DESC
LIMIT 20;
```

### 2. Verificar si hay espacios o caracteres especiales

```sql
-- Ver códigos con espacios o caracteres especiales
SELECT 
  id,
  professional_code,
  LENGTH(professional_code) as length,
  LENGTH(TRIM(professional_code)) as trimmed_length,
  professional_code != TRIM(professional_code) as has_spaces,
  professional_code != UPPER(TRIM(professional_code)) as not_uppercase
FROM public.psychologists
WHERE professional_code IS NOT NULL;
```

### 3. Probar la función validate_professional_code directamente

```sql
-- Reemplaza 'PS-XXXXXX' con el código exacto que estás probando
SELECT public.validate_professional_code('PS-XXXXXX');
```

### 4. Ver logs de Supabase

Los logs de `RAISE NOTICE` aparecen en:
- Supabase Dashboard → Logs → Postgres Logs
- O en el SQL Editor si ejecutas la función directamente

### 5. Verificar búsqueda case-insensitive

Si el código tiene mayúsculas/minúsculas diferentes, prueba:

```sql
-- Buscar sin importar mayúsculas/minúsculas
SELECT 
  id,
  first_name,
  last_name,
  professional_code
FROM public.psychologists
WHERE UPPER(TRIM(professional_code)) = UPPER(TRIM('PS-XXXXXX'));
-- Reemplaza 'PS-XXXXXX' con el código que estás probando
```

## 🐛 Problemas Comunes

### Problema 1: Espacios en blanco
**Solución:** El código se está normalizando con `TRIM()` y `UPPER()`, pero si en la DB hay espacios, puede fallar.

### Problema 2: Mayúsculas/Minúsculas
**Solución:** Verifica que el código en la DB esté en mayúsculas o modifica la búsqueda para ser case-insensitive.

### Problema 3: Caracteres especiales
**Solución:** Verifica que no haya caracteres invisibles o especiales.

## 🔧 Script de Limpieza (si es necesario)

Si encuentras códigos con espacios o formato incorrecto:

```sql
-- Limpiar códigos profesionales (ejecutar con cuidado)
UPDATE public.psychologists
SET professional_code = UPPER(TRIM(professional_code))
WHERE professional_code != UPPER(TRIM(professional_code));
```

## 📊 Verificar desde el Frontend

Abre la consola del navegador (F12) y busca estos logs cuando intentes agregar un código:

```
=== ADDING PSYCHOLOGIST ===
Code entered: [el código que ingresaste]
Code after trim/uppercase: [el código normalizado]
Step 1: Validating professional code...
Validation result: [resultado]
```

Estos logs te dirán exactamente qué se está enviando y qué está retornando.

