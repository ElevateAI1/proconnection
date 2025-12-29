-- ============================================================================
-- Migración: Actualizar planes a precios ARS y cambiar teams → clinicas
-- ============================================================================
-- Este script actualiza los planes con nuevos precios en ARS y renombra teams a clinicas
-- Fecha: 2025-01-25
-- ============================================================================

-- Paso 1: Actualizar valores existentes en psychologists (teams → clinicas)
UPDATE public.psychologists
SET plan_type = 'clinicas'
WHERE plan_type = 'teams';

-- Paso 2: Eliminar el constraint antiguo si existe
ALTER TABLE public.psychologists
DROP CONSTRAINT IF EXISTS psychologists_plan_type_check;

-- Paso 3: Crear el nuevo constraint con 'clinicas' en lugar de 'teams'
ALTER TABLE public.psychologists
ADD CONSTRAINT psychologists_plan_type_check 
CHECK (plan_type IS NULL OR plan_type IN ('starter', 'proconnection', 'clinicas', 'dev'));

-- Paso 4: Agregar columnas nuevas a subscription_plans si no existen
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS included_professionals INTEGER,
ADD COLUMN IF NOT EXISTS additional_professional_price_cents INTEGER;

-- Paso 5: Actualizar/insertar planes con nuevos precios ARS
-- Eliminar planes antiguos si existen
DELETE FROM public.subscription_plans WHERE plan_key IN ('starter', 'proconnection', 'teams', 'clinicas');

-- Insertar los 3 nuevos planes con precios ARS
INSERT INTO public.subscription_plans (
  plan_key, 
  title, 
  period, 
  price_cents, 
  price_display, 
  features, 
  is_recommended, 
  savings_text,
  included_professionals,
  additional_professional_price_cents
)
VALUES 
  (
    'starter',
    'Plan Starter',
    'monthly',
    0, -- Gratis
    'Gratis',
    ARRAY[
      'Dashboard básico: vista simple del estado del consultorio (pacientes, citas, notificaciones)',
      'Gestión de Pacientes (CRM simple): alta/baja/edición de pacientes, datos básicos y seguimiento general',
      'Calendario & Programación de Citas: agenda para agendar, mover y cancelar turnos manualmente',
      'Solicitudes de Citas: recepción y aprobación de solicitudes online de pacientes',
      'Gestión de Tarifas: configuración de aranceles por sesión/servicio',
      'Centro de Notificaciones básicas: recordatorios sencillos y avisos clave dentro de la plataforma'
    ],
    false,
    NULL,
    NULL,
    NULL
  ),
  (
    'proconnection',
    'Plan ProConnection',
    'monthly',
    4490000, -- $44.900 ARS
    '$44.900',
    ARRAY[
      'Todo lo del Plan Starter',
      'Finanzas (Sistema Contable Mensual completo): registro de ingresos por sesión, consolidado mensual y visión tipo "caja" del consultorio',
      'Validación de Comprobantes: control de que los pagos registrados tengan comprobantes válidos y consistentes',
      'Documentos (historial clínico, notas): módulo para almacenar historia clínica, evoluciones y notas por paciente',
      'Reportes Avanzados: métricas de facturación, ingresos por período y productividad',
      'Perfil SEO: perfil optimizado para aparecer en búsquedas y mejorar tu visibilidad online',
      'Notificaciones avanzadas: esquema más completo de recordatorios y avisos para reducir ausentismo'
    ],
    true,
    '⭐ Más elegido',
    NULL,
    NULL
  ),
  (
    'clinicas',
    'Plan Clínicas',
    'monthly',
    14900000, -- $149.000 ARS
    '$149.000',
    ARRAY[
      'Todo lo del Plan ProConnection',
      'Multiusuario: agregar otros psicólogos, asistentes o administrativos con usuarios separados',
      'Gestión de equipo (permisos, roles): definir qué puede ver y hacer cada usuario dentro del sistema',
      'Reportes de Clínica (consolidados): estadísticas y finanzas agregadas a nivel equipo/centro',
      'Early Access: acceso anticipado a nuevas funcionalidades antes del resto de los planes',
      'Consultoría de Visibilidad PRO: acompañamiento estratégico para mejorar presencia y captación de pacientes',
      'Integraciones (APIs para sistemas externos): conexión con otros sistemas (ERP, BI, etc.)',
      'Dashboard de administración: panel central para administración global del equipo/centro'
    ],
    false,
    NULL,
    4, -- 4 profesionales incluidos
    1990000 -- $19.900 ARS por profesional adicional
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
  included_professionals = EXCLUDED.included_professionals,
  additional_professional_price_cents = EXCLUDED.additional_professional_price_cents,
  updated_at = NOW();

COMMENT ON COLUMN public.psychologists.plan_type IS 'Tipo de plan: starter (gratis), proconnection, clinicas, o dev (solo para pruebas)';
COMMENT ON COLUMN public.subscription_plans.included_professionals IS 'Número de profesionales incluidos en el plan (solo para Plan Clínicas)';
COMMENT ON COLUMN public.subscription_plans.additional_professional_price_cents IS 'Precio en centavos por profesional adicional (solo para Plan Clínicas)';

