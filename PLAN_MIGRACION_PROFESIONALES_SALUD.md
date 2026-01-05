# Plan de Migración: De Psicólogos a Profesionales de Salud

## 📋 Resumen Ejecutivo

**Objetivo**: Migrar la plataforma de ser exclusiva para psicólogos a soportar TODOS los tipos de profesionales de salud.

**Alcance**: 
- Base de datos (tablas, constraints, RLS, funciones)
- Edge Functions (15+ funciones)
- Frontend (186 archivos con referencias)
- Tipos TypeScript
- Documentación

**Estimación**: 
- **Alta Complejidad** - ~132 archivos a modificar
- **Tiempo estimado**: 2-3 semanas de desarrollo + testing
- **Riesgo**: MEDIO-ALTO (muchas dependencias)

---

## 🎯 Estrategia de Migración

### Opción 1: Renombrar tabla (RECOMENDADA)
- Renombrar `psychologists` → `professionals`
- Mantener compatibilidad durante transición
- Requiere migración cuidadosa de datos

### Opción 2: Mantener tabla y agregar aliases
- Mantener tabla `psychologists` (por compatibilidad)
- Crear views/aliases como `professionals`
- Menos invasivo pero más confuso a largo plazo

**RECOMENDACIÓN: Opción 1** - Es más limpio y sostenible a largo plazo.

---

## 📊 Análisis del Estado Actual

### ✅ Ya implementado (Ventajas)
1. ✅ Tabla `professional_specialties` ya existe con soporte multi-profesión
2. ✅ Campo `profession_type` en tabla `psychologists` (default: 'psychologist')
3. ✅ Tabla `profiles` con `user_type` (permite extensión)
4. ✅ Sistema de especialidades por tipo de profesión
5. ✅ UI en `ProfessionalAuthPage` ya tiene categorías de profesionales

### ❌ Necesita cambios
1. ❌ Tabla `psychologists` tiene nombre específico
2. ❌ Foreign keys: `psychologist_id` en múltiples tablas
3. ❌ RLS policies hacen referencia a `psychologists`
4. ❌ 919 referencias en 132 archivos al término "psychologist"
5. ❌ Nombres de funciones, hooks, componentes hardcodeados

---

## 🗂️ FASE 1: Base de Datos

### 1.1 Crear nueva tabla `professionals`
```sql
-- Nueva migración: 20250201000001_rename_psychologists_to_professionals.sql

-- 1. Crear nueva tabla professionals (copiar estructura de psychologists)
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  license_number TEXT,
  profession_type TEXT NOT NULL DEFAULT 'psychologist',
  -- ... resto de campos iguales
);

-- 2. Migrar datos
INSERT INTO public.professionals 
SELECT * FROM public.psychologists;

-- 3. Actualizar foreign keys en tablas relacionadas
-- Tablas que referencian psychologist_id:
-- - patients
-- - psychologist_rates → professional_rates
-- - psychologist_directories → professional_directories  
-- - psychologist_seo_config → professional_seo_config
-- - psychologist_social_strategy → professional_social_strategy
-- - appointments
-- - clinical_records
-- - payment_receipts
-- - invoices
-- - reminder_settings
-- - document_templates
-- - clinic_teams (professional_id ya es genérico)
-- - clinic_invitations
-- - affiliate_codes
-- - public_psychologist_profiles → public_professional_profiles

-- 4. Renombrar constraints
ALTER TABLE patients 
  RENAME CONSTRAINT patients_psychologist_id_fkey 
  TO patients_professional_id_fkey;

-- 5. Actualizar RLS policies
-- Buscar todas las policies que referencian psychologists
-- Actualizar para usar professionals

-- 6. Actualizar funciones de DB
-- Buscar funciones que usen psychologists
-- Actualizar para usar professionals

-- 7. Crear views/compatibilidad temporal (opcional)
CREATE VIEW psychologists AS SELECT * FROM professionals;
```

**Archivos a crear/modificar:**
- `supabase/migrations/20250201000001_rename_psychologists_to_professionals.sql` (NUEVO)
- `supabase/migrations/20250101000000_complete_schema.sql` (actualizar comentarios)

**Tablas afectadas:** 15+ tablas con foreign keys

---

## ⚙️ FASE 2: Edge Functions

### 2.1 Funciones que requieren cambios

| Función | Cambios necesarios |
|---------|-------------------|
| `api-psychologists` | Renombrar a `api-professionals` o crear alias |
| `api-patients` | Cambiar `psychologist_id` → `professional_id` |
| `proconnection-api` | Actualizar handlers de psychologists |
| `create-mercadopago-subscription` | Actualizar queries a `professionals` |
| `mercadopago-webhook` | Actualizar referencias |
| `generate-monthly-report` | Actualizar queries |
| `create-mercadopago-preference` | Actualizar queries |
| `api-subscriptions` | Actualizar queries |
| `api-stats` | Actualizar queries |
| `api-accounts` | Actualizar queries |
| `api-clinic-management` | Actualizar queries |
| `api-external-integrations` | Actualizar queries |
| `create-jitsi-meeting` | Actualizar queries |
| `send-verification-email` | Actualizar templates |
| `generate-autocomplete-suggestions` | Actualizar queries |

**Total**: ~15 edge functions

**Archivos afectados:**
```
supabase/functions/
  ├── api-psychologists/index.ts → api-professionals/index.ts
  ├── api-patients/index.ts
  ├── proconnection-api/index.ts
  ├── create-mercadopago-subscription/index.ts
  ├── mercadopago-webhook/index.ts
  ├── generate-monthly-report/index.ts
  ├── create-mercadopago-preference/index.ts
  ├── api-subscriptions/index.ts
  ├── api-stats/index.ts
  ├── api-accounts/index.ts
  ├── api-clinic-management/index.ts
  ├── api-external-integrations/index.ts
  ├── create-jitsi-meeting/index.ts
  ├── send-verification-email/index.ts
  └── generate-autocomplete-suggestions/index.ts
```

---

## 🎨 FASE 3: Frontend - Hooks

### 3.1 Hooks a modificar (prioridad alta)

| Hook | Cambios |
|------|---------|
| `useProfile.tsx` | Cambiar `psychologist` → `professional` |
| `useOptimizedProfile.tsx` | Actualizar queries |
| `usePatients.tsx` | Cambiar `psychologist_id` → `professional_id` |
| `useOptimizedPatients.tsx` | Actualizar queries |
| `useDashboardStats.tsx` | Actualizar queries |
| `useUnifiedDashboardStats.tsx` | Actualizar queries |
| `usePaymentReceipts.tsx` | Actualizar queries |
| `useAccountingReports.tsx` | Actualizar queries |
| `usePsychologistRates.tsx` | Renombrar a `useProfessionalRates.tsx` |
| `useReminderSettings.tsx` | Actualizar queries |
| `usePublicProfiles.tsx` | Actualizar queries |
| `useExpandedPublicProfiles.tsx` | Actualizar queries |
| `useDocumentTemplates.tsx` | Actualizar queries |
| `useClinicTeam.tsx` | Actualizar queries |
| `useAffiliateAdmin.tsx` | Actualizar queries |
| `usePsychologistData.tsx` | Renombrar a `useProfessionalData.tsx` |

**Total**: ~20 hooks

**Archivos afectados:**
```
src/hooks/
  ├── useProfile.tsx
  ├── useOptimizedProfile.tsx
  ├── usePatients.tsx
  ├── useOptimizedPatients.tsx
  ├── useDashboardStats.tsx
  ├── useUnifiedDashboardStats.tsx
  ├── usePaymentReceipts.tsx
  ├── useAccountingReports.tsx
  ├── usePsychologistRates.tsx → useProfessionalRates.tsx
  ├── useReminderSettings.tsx
  ├── usePublicProfiles.tsx
  ├── useExpandedPublicProfiles.tsx
  ├── useDocumentTemplates.tsx
  ├── useClinicTeam.tsx
  ├── useAffiliateAdmin.tsx
  ├── usePsychologistData.tsx → useProfessionalData.tsx
  └── ... (otros hooks relacionados)
```

---

## 🎨 FASE 4: Frontend - Componentes

### 4.1 Componentes críticos

**Alta prioridad:**
- `MinimalistSidebar.tsx` - Referencias a "Psicólogo"
- `MinimalistDashboard.tsx` - Textos hardcodeados
- `PatientManagement.tsx` - Queries a psychologists
- `CalendarView.tsx` - Referencias a psychologist_id
- `NewAppointmentModal.tsx` - Queries a psychologists
- `SubscriptionPlans.tsx` - Referencias a psychologist
- `SettingsModal.tsx` - Queries a psychologists
- `ProfessionalAuthPage.tsx` - Ya tiene categorías, solo ajustes menores
- `PatientDetailView.tsx` - Referencias múltiples
- `AccountingDashboard.tsx` - Queries a psychologists

**Media prioridad:**
- Todos los componentes en `patient-detail/`
- Todos los componentes en `psychologist/` (considerar renombrar carpeta)
- `PublicProfileManager.tsx`
- `ExpandedPublicProfileManager.tsx`
- `PsychologistRatesManager.tsx` → `ProfessionalRatesManager.tsx`
- `PsychologistMessagesView.tsx` → `ProfessionalMessagesView.tsx`

**Total**: ~50 componentes

**Carpetas/archivos a considerar renombrar:**
```
src/components/
  ├── psychologist/ → professional/ (considerar)
  ├── PsychologistMessagesView.tsx → ProfessionalMessagesView.tsx
  ├── PsychologistRatesManager.tsx → ProfessionalRatesManager.tsx
  └── ... (muchos otros)
```

---

## 📝 FASE 5: Tipos TypeScript

### 5.1 Actualizar tipos

**Archivo principal:**
- `src/integrations/supabase/types.ts` - Generar nuevos tipos desde DB

**Interfaces a actualizar:**
```typescript
// Antes
interface Psychologist {
  id: string;
  // ...
}

// Después  
interface Professional {
  id: string;
  profession_type: string;
  // ... (mismos campos)
}

// Mantener tipo alias para compatibilidad temporal
type Psychologist = Professional & { profession_type: 'psychologist' };
```

---

## 🧪 FASE 6: Testing

### 6.1 Tests a actualizar

- `useProfile.test.tsx`
- `useOptimizedPatients.test.tsx`
- `PatientManagement.test.tsx`
- `CalendarView.test.tsx`
- `useUnifiedDashboardStats.test.tsx`
- `usePaymentReceipts.test.tsx`
- `usePlanCapabilities.test.tsx`

**Total**: ~10 archivos de test

---

## 📚 FASE 7: Documentación

### 7.1 Documentos a actualizar

- `docs/project-knowledge-complete.md`
- `docs/API_EDGE_FUNCTIONS.md`
- `TODAS_LAS_EDGE_FUNCTIONS.md`
- `EDGE_FUNCTION_API_PATIENTS.md`
- README.md
- Comentarios en código

---

## 🔄 ESTRATEGIA DE IMPLEMENTACIÓN

### Opción A: Big Bang (NO RECOMENDADA)
- Cambiar todo de una vez
- ⚠️ Alto riesgo de romper producción
- ⚠️ Difícil hacer rollback

### Opción B: Migración Gradual (RECOMENDADA) ✅

#### Paso 1: Preparación (Sin romper nada)
1. ✅ Agregar campo `profession_type` (ya existe)
2. ✅ Crear tabla `professionals` paralela
3. ✅ Crear triggers para sincronizar datos
4. ✅ Crear views de compatibilidad

#### Paso 2: Migración de Datos
1. Copiar todos los datos de `psychologists` → `professionals`
2. Verificar integridad de datos
3. Actualizar foreign keys gradualmente

#### Paso 3: Actualizar Backend
1. Actualizar edge functions (una por una)
2. Testing exhaustivo de cada función
3. Deploy gradual

#### Paso 4: Actualizar Frontend
1. Actualizar hooks críticos primero
2. Actualizar componentes principales
3. Actualizar componentes secundarios
4. Testing de UI

#### Paso 5: Limpieza
1. Eliminar tabla `psychologists` (después de validación)
2. Eliminar views de compatibilidad
3. Eliminar código legacy

---

## 📋 CHECKLIST DE MIGRACIÓN

### Pre-migración
- [ ] Backup completo de base de datos
- [ ] Crear branch `feature/multi-professional-support`
- [ ] Documentar estado actual
- [ ] Notificar a equipo/stakeholders

### Fase 1: Base de Datos
- [ ] Crear migración SQL
- [ ] Crear tabla `professionals`
- [ ] Migrar datos
- [ ] Actualizar foreign keys
- [ ] Actualizar RLS policies
- [ ] Actualizar funciones DB
- [ ] Testing de integridad

### Fase 2: Edge Functions
- [ ] Actualizar `api-psychologists` → `api-professionals`
- [ ] Actualizar `api-patients`
- [ ] Actualizar `proconnection-api`
- [ ] Actualizar funciones de MercadoPago
- [ ] Actualizar funciones de reportes
- [ ] Testing de cada función
- [ ] Deploy gradual

### Fase 3: Frontend Hooks
- [ ] Actualizar `useProfile`
- [ ] Actualizar hooks de pacientes
- [ ] Actualizar hooks de dashboard
- [ ] Renombrar hooks específicos
- [ ] Testing de hooks

### Fase 4: Frontend Componentes
- [ ] Actualizar componentes críticos
- [ ] Actualizar textos/UI
- [ ] Renombrar componentes
- [ ] Testing de UI
- [ ] Validar UX

### Fase 5: Tipos TypeScript
- [ ] Regenerar tipos desde DB
- [ ] Actualizar interfaces
- [ ] Crear aliases de compatibilidad
- [ ] Validar tipos

### Fase 6: Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Testing manual exhaustivo

### Post-migración
- [ ] Monitoreo de errores
- [ ] Validar performance
- [ ] Actualizar documentación
- [ ] Eliminar código legacy
- [ ] Comunicar cambios a usuarios

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos durante migración | Baja | Alto | Backups + migración en transacción |
| Breaking changes en producción | Media | Alto | Deploy gradual + feature flags |
| Performance degradation | Baja | Medio | Índices + queries optimizadas |
| Errores en RLS policies | Media | Alto | Testing exhaustivo + rollback plan |
| Confusión de usuarios | Media | Bajo | Documentación + comunicación |

---

## 📊 MÉTRICAS DE ÉXITO

### Técnicas
- ✅ 0 errores en logs después de migración
- ✅ Todas las funcionalidades funcionando
- ✅ Performance igual o mejor que antes
- ✅ 100% de tests pasando

### Negocio
- ✅ Nuevos tipos de profesionales pueden registrarse
- ✅ Funcionalidades existentes siguen funcionando
- ✅ No hay pérdida de datos
- ✅ UX mejorada (más genérica)

---

## 🚀 PLAN DE ROLLBACK

Si algo sale mal:

1. **Rollback inmediato** (< 1 hora)
   - Revertir último deploy de edge functions
   - Usar tabla `psychologists` original
   - Reactivar views de compatibilidad

2. **Rollback parcial** (< 4 horas)
   - Mantener datos en ambas tablas
   - Reactivar código legacy con feature flags
   - Migración gradual de usuarios

3. **Plan de recuperación** (> 4 horas)
   - Restaurar backup de DB
   - Deploy de versión anterior
   - Análisis post-mortem

---

## 📅 ESTIMACIÓN DE TIEMPO

| Fase | Tiempo Estimado | Prioridad |
|------|----------------|-----------|
| Fase 1: Base de Datos | 3-4 días | CRÍTICA |
| Fase 2: Edge Functions | 5-7 días | CRÍTICA |
| Fase 3: Frontend Hooks | 3-4 días | ALTA |
| Fase 4: Frontend Componentes | 4-5 días | ALTA |
| Fase 5: Tipos TypeScript | 1 día | MEDIA |
| Fase 6: Testing | 3-4 días | CRÍTICA |
| Fase 7: Documentación | 1-2 días | BAJA |
| **TOTAL** | **20-27 días** | |

**Con testing en paralelo**: ~15-18 días hábiles

---

## 💡 RECOMENDACIONES FINALES

### ✅ HACER
1. **Migración gradual** - Una fase a la vez
2. **Feature flags** - Para poder activar/desactivar cambios
3. **Backups frecuentes** - Antes de cada cambio mayor
4. **Testing exhaustivo** - En cada fase
5. **Comunicación** - Mantener equipo informado

### ❌ NO HACER
1. **Big bang migration** - Cambiar todo de una vez
2. **Romper compatibilidad** - Sin migración de datos
3. **Ignorar testing** - Cada cambio debe probarse
4. **Cambiar producción** - Sin tener rollback listo

---

## 📞 PRÓXIMOS PASOS

1. **Revisar este plan** con el equipo
2. **Validar estimaciones** de tiempo
3. **Priorizar fases** según necesidades de negocio
4. **Crear tickets** en el sistema de gestión de proyectos
5. **Asignar recursos** (desarrolladores, QA, etc.)
6. **Iniciar Fase 1** cuando esté aprobado

---

## 📝 NOTAS ADICIONALES

- Este plan asume que queremos soportar TODOS los profesionales de salud
- El sistema ya tiene buena base con `profession_type` y especialidades
- La migración es posible pero requiere cuidado y testing
- Considerar crear un ambiente de staging para testing completo antes de producción

---

**Última actualización**: [Fecha]
**Versión del plan**: 1.0
**Estado**: Pendiente de aprobación

