<!-- 24bea3f3-e48a-4a38-b744-966ef71fe32d f9e6c7a8-3643-4fd7-8b05-985a6445de24 -->
# Plan: Actualizar a 3 Tiers de Planes

## Objetivo

Actualizar el sistema de suscripción de 2 planes (Starter, Plus) a 3 tiers (Starter, ProConnection, Teams) con nuevas características, precios en USD, y restricciones de acceso apropiadas.

## Cambios en Base de Datos

### 1. Actualizar schema de `psychologists.plan_type`

- **Archivo**: `supabase/migrations/20250101000000_complete_schema.sql` (línea 167)
- **Cambio**: Modificar CHECK constraint de `('basic', 'plus', 'premium')` a `('starter', 'proconnection', 'teams')`
- **Migración**: Crear script de migración para actualizar valores existentes:
- `'basic'` → `'starter'`
- `'plus'` → `'proconnection'`
- `'premium'` → `'teams'`

### 2. Actualizar tabla `subscription_plans`

- Agregar/actualizar registros para los 3 nuevos planes con features correctas
- Precios en centavos USD (1500, 3900, 9900)

## Componentes de Landing Page

### 1. Actualizar `PricingEditorial.tsx`

- **Archivo**: `src/components/landing/PricingEditorial.tsx`
- **Cambios**:
- Convertir grid de 2 columnas a 3 columnas (responsive: 1 col mobile, 3 cols desktop)
- Actualizar precios: $15 USD (Starter), $39 USD (ProConnection), $99 USD (Teams)
- Actualizar features de cada plan según especificaciones
- Mantener estilo neo-brutalista y animaciones
- Badge "Más elegido" en ProConnection (tier medio)
- Actualizar grid de mini-features debajo

### 2. Verificar otros componentes de pricing

- `src/components/landing/PricingSection.tsx` (si aún se usa)
- `src/components/SubscriptionPlans.tsx` (componente interno)

## Sistema de Restricciones de Acceso

### 1. Actualizar `MinimalistSidebar.tsx`

- **Archivo**: `src/components/MinimalistSidebar.tsx`
- **Cambios**:
- Actualizar `requiredPlan` en items del menú:
- Features Starter: `'starter'` (dashboard, pacientes, calendario, solicitudes, tarifas, notificaciones básicas)
- Features ProConnection: `'proconnection'` (finanzas, documentos avanzados, reportes, SEO, notificaciones avanzadas, soporte prioritario)
- Features Teams: `'teams'` (multiusuario, gestión de equipo, reportes de clínica, early access, consultoría, integraciones, dashboard admin)
- Actualizar lógica `hasPlus` → `hasProConnection` o función más genérica `hasTierOrHigher(tier)`
- Actualizar badges y visualización de plan requerido

### 2. Actualizar `usePlanCapabilities.tsx`

- **Archivo**: `src/hooks/usePlanCapabilities.tsx`
- **Cambios**:
- Mapear nuevas capacidades por tier:
- Starter: `basic_features: true`, resto `false`
- ProConnection: `seo_profile`, `advanced_reports`, `priority_support`, `financial_features`, `advanced_documents` → `true`
- Teams: todas anteriores + `team_features`, `early_access`, `visibility_consulting`, `api_integrations`, `dedicated_support` → `true`
- Actualizar función `isPlusUser` → `isProConnectionUser` o funciones más específicas
- Actualizar función que determina capacidades desde `plan_type`

### 3. Actualizar `PlanGate.tsx`

- **Archivo**: `src/components/PlanGate.tsx`
- **Cambios**:
- Actualizar tipos de `capability` para incluir nuevas capacidades (team_features, financial_features, etc.)
- Actualizar mensajes de upgrade para mencionar el tier correcto

### 4. Proteger componentes por tier

- **Archivos a revisar**:
- `src/components/AccountingDashboard.tsx` → Solo ProConnection+
- `src/components/AdvancedReports.tsx` → Solo ProConnection+
- `src/components/SeoProfileManager.tsx` → Solo ProConnection+
- `src/components/EarlyAccess.tsx` → Solo Teams
- `src/components/VisibilityConsulting.tsx` → Solo Teams
- Crear nuevos componentes para Teams si no existen:
- Gestión de equipo/multiusuario
- Dashboard de administración de clínica
- Reportes consolidados

## Componentes del Dashboard

### 1. Actualizar referencias a nombres de planes

- **Archivo**: `src/components/MinimalistDashboard.tsx`
- Actualizar display de plan type: mostrar "STARTER", "PROCONNECTION", "TEAMS"
- **Archivo**: `src/components/TrialStatus.tsx`
- Actualizar referencias de "Plus" a "ProConnection"
- **Archivo**: `src/pages/Index.tsx`
- Actualizar `handleActivatePlus` → función más genérica o remover si no aplica
- Actualizar lógica de verificación de plan

### 2. Actualizar `SubscriptionPlans.tsx`

- **Archivo**: `src/components/SubscriptionPlans.tsx`
- **Cambios**:
- Actualizar array de planes con 3 tiers
- Actualizar precios y features
- Marcar ProConnection como `is_recommended: true`

### 3. Actualizar `activatePlusPlan.ts`

- **Archivo**: `src/utils/activatePlusPlan.ts`
- **Cambios**: Renombrar o crear funciones específicas por tier, o hacer genérica `activatePlan(planType)`

## Otras Referencias

### 1. Hooks y utilidades

- `src/hooks/useUnifiedDashboardStats.tsx` → Actualizar mapeo de `planType`
- `src/hooks/usePsychologistData.tsx` → Verificar tipos si es necesario
- `src/utils/apiDocumentation.ts` → Actualizar documentación de API si menciona planes

### 2. Admin

- `src/pages/AdminDashboard.tsx` → Actualizar visualización de planes
- `src/hooks/useAdmin.tsx` → Actualizar tipos si es necesario

## Testing y Validación

1. Verificar que usuarios Starter solo ven funciones de Starter
2. Verificar que usuarios ProConnection ven funciones Starter + ProConnection
3. Verificar que usuarios Teams ven todas las funciones
4. Probar responsive en landing page (3 columnas → 1 columna en mobile)
5. Verificar migración de planes existentes en base de datos

## Notas Importantes

- Mantener compatibilidad: usar funciones helper como `hasTierOrHigher(tier)` que permitan comparaciones jerárquicas
- Los precios se mostrarán en USD según especificación del usuario
- El plan medio se llamará "ProConnection" (nombre completo) en la UI pero puede usar 'proconnection' o 'pro' en código según decisión del usuario