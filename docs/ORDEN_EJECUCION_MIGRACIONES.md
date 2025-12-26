# 📋 Orden de Ejecución de Migraciones

## ⚠️ IMPORTANTE: Ejecuta estos scripts EN ORDEN en Supabase SQL Editor

### 1️⃣ Primera Migración: Validar Código Profesional
**Archivo:** `supabase/migrations/20250102000000_add_validate_professional_code.sql`

**Qué hace:**
- Crea la función `validate_professional_code` que valida códigos y retorna el psychologist_id

**Cuándo ejecutar:** PRIMERO

---

### 2️⃣ Segunda Migración: Tabla de Relación y Función RPC
**Archivo:** `supabase/migrations/20250102000001_add_patient_psychologists_relation.sql`

**Qué hace:**
- Crea la tabla `patient_psychologists` (relación muchos-a-muchos)
- Hace `psychologist_id` opcional en `patients` (compatibilidad)
- Crea la función `add_psychologist_to_patient` para vincular mediante código

**Cuándo ejecutar:** SEGUNDO (después de la primera)

---

### 3️⃣ Tercera Migración: Políticas RLS para Pacientes
**Archivo:** `supabase/migrations/20250102000002_fix_patient_rls_policies.sql`

**Qué hace:**
- Agrega políticas RLS para que pacientes puedan gestionar sus propios datos
- Agrega políticas RLS para `patient_psychologists`
- Permite que pacientes vean información de sus psicólogos vinculados

**Cuándo ejecutar:** TERCERO (después de la segunda)

---

### 4️⃣ Cuarta Migración: Reparar Función RPC
**Archivo:** `supabase/migrations/20250102000003_fix_rpc_function_and_permissions.sql`

**Qué hace:**
- Elimina y recrea la función `add_psychologist_to_patient` con sintaxis correcta
- Otorga permisos de ejecución a usuarios autenticados

**Cuándo ejecutar:** CUARTO (después de la tercera)

---

## 🚀 Pasos para Ejecutar

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta cada script **uno por uno** en el orden indicado
5. Verifica que cada script se ejecute sin errores antes de pasar al siguiente

## ✅ Verificación Post-Ejecución

Después de ejecutar todas las migraciones, verifica que todo esté correcto:

```sql
-- 1. Verificar que las funciones existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('validate_professional_code', 'add_psychologist_to_patient');

-- 2. Verificar que la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'patient_psychologists';

-- 3. Verificar permisos de las funciones
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('validate_professional_code', 'add_psychologist_to_patient');
```

## 📝 Notas Importantes

- ⚠️ **NO regeneres códigos profesionales existentes** - son permanentes
- ✅ Los códigos profesionales son únicos y permanentes
- ✅ Si un psicólogo no tiene código, se generará automáticamente al crear su perfil
- ✅ Los pacientes pueden tener múltiples psicólogos vinculados

