-- ============================================================================
-- Migración: Actualizar tipos de planes a nuevo sistema de 3 tiers
-- ============================================================================
-- Este script actualiza los valores existentes de plan_type y ajusta el constraint
-- Fecha: 2025-01-15
-- ============================================================================

-- Paso 1: Actualizar valores existentes en psychologists
UPDATE public.psychologists
SET plan_type = CASE
  WHEN plan_type = 'basic' THEN 'starter'
  WHEN plan_type = 'plus' THEN 'proconnection'
  WHEN plan_type = 'premium' THEN 'teams'
  ELSE plan_type
END
WHERE plan_type IN ('basic', 'plus', 'premium');

-- Paso 2: Eliminar el constraint antiguo si existe
ALTER TABLE public.psychologists
DROP CONSTRAINT IF EXISTS psychologists_plan_type_check;

-- Paso 3: Crear el nuevo constraint con los valores actualizados
ALTER TABLE public.psychologists
ADD CONSTRAINT psychologists_plan_type_check 
CHECK (plan_type IS NULL OR plan_type IN ('starter', 'proconnection', 'teams'));

-- Paso 4: Actualizar/insertar planes en subscription_plans
-- Eliminar planes antiguos si existen
DELETE FROM public.subscription_plans WHERE plan_key IN ('starter', 'plus', 'pro', 'basic', 'premium');

-- Insertar los 3 nuevos planes
INSERT INTO public.subscription_plans (plan_key, title, period, price_cents, price_display, features, is_recommended, savings_text)
VALUES 
  (
    'starter',
    'Plan Starter',
    'monthly',
    1500, -- $15 USD
    '$15',
    ARRAY[
      'Dashboard básico',
      'Gestión de Pacientes (CRM simple)',
      'Calendario & Programación de Citas',
      'Solicitudes de Citas (recibir y aprobar)',
      'Gestión de Tarifas (fijar precios para pacientes)',
      'Centro de Notificaciones básicas'
    ],
    false,
    NULL
  ),
  (
    'proconnection',
    'Plan ProConnection',
    'monthly',
    3900, -- $39 USD
    '$39',
    ARRAY[
      'Todo del Plan Starter',
      'Finanzas (Sistema Contable Mensual completo)',
      'Validación de Comprobantes (manejo de pagos/facturas)',
      'Documentos (historial clínico, notas, adjuntos)',
      'Reportes Avanzados (análisis y estadísticas mensuales)',
      'Perfil SEO (para aparecer en búsquedas)',
      'Notificaciones avanzadas (recordatorios automáticos a pacientes)',
      'Soporte prioritario'
    ],
    true,
    '⭐ Más elegido'
  ),
  (
    'teams',
    'Plan ProConnection Teams',
    'monthly',
    9900, -- $99 USD
    '$99',
    ARRAY[
      'Todo del Plan ProConnection',
      'Multiusuario (agregar otros psicólogos/asistentes)',
      'Gestión de equipo (permisos, roles, asignación de pacientes)',
      'Reportes de Clínica (consolidados, visibilidad global)',
      'Early Access (nuevas features antes que otros)',
      'Consultoría de Visibilidad PRO (SEO avanzado, marketing)',
      'Integraciones (APIs para sistemas externos, facturación)',
      'Soporte dedicado (llamadas, onboarding)',
      'Dashboard de administración (métricas de equipo, ingresos consolidados)'
    ],
    false,
    NULL
  )
ON CONFLICT (plan_key) DO UPDATE
SET
  title = EXCLUDED.title,
  period = EXCLUDED.period,
  price_cents = EXCLUDED.price_cents,
  price_display = EXCLUDED.price_display,
  features = EXCLUDED.features,
  is_recommended = EXCLUDED.is_recommended,
  savings_text = EXCLUDED.savings_text,
  updated_at = NOW();

COMMENT ON COLUMN public.psychologists.plan_type IS 'Tipo de plan: starter, proconnection, o teams';

