-- ============================================================================
-- Script para aplicar las 4 migraciones nuevas de forma segura
-- ============================================================================
-- Ejecuta este script en Supabase Dashboard → SQL Editor
-- Este script aplica solo las migraciones nuevas sin conflictos
-- ============================================================================

-- ============================================================================
-- MIGRACIÓN 1: Actualizar planes a precios ARS y cambiar teams → clinicas
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
DELETE FROM public.subscription_plans WHERE plan_key IN ('starter', 'proconnection', 'teams', 'clinicas');

INSERT INTO public.subscription_plans (plan_key, title, period, price_cents, price_display, features, is_recommended, savings_text, included_professionals, additional_professional_price_cents)
VALUES
  (
    'starter',
    'Plan Starter',
    'monthly',
    0,
    'GRATIS',
    ARRAY[
      'Dashboard básico',
      'Gestión de Pacientes (CRM simple)',
      'Calendario & Programación de Citas',
      'Solicitudes de Citas (recibir y aprobar)',
      'Gestión de Tarifas (fijar precios para pacientes)',
      'Centro de Notificaciones básicas'
    ],
    false,
    NULL,
    1,
    NULL
  ),
  (
    'proconnection',
    'Plan ProConnection',
    'monthly',
    4490000,
    '$44.900',
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
    '⭐ Más elegido',
    1,
    NULL
  ),
  (
    'clinicas',
    'Plan Clínicas',
    'monthly',
    14900000,
    '$149.000',
    ARRAY[
      'Todo del Plan ProConnection',
      'Multiusuario (hasta 4 psicólogos/asistentes)',
      'Gestión de equipo (permisos, roles, asignación de pacientes)',
      'Reportes de Clínica (consolidados, visibilidad global)',
      'Early Access (nuevas features antes que otros)',
      'Consultoría de Visibilidad PRO (SEO avanzado, marketing)',
      'Integraciones (APIs para sistemas externos, facturación)',
      'Soporte dedicado (llamadas, onboarding)',
      'Dashboard de administración (métricas de equipo, ingresos consolidados)',
      'Profesional adicional: $19.900 ARS/mes'
    ],
    false,
    NULL,
    4,
    1990000
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

COMMENT ON COLUMN public.psychologists.plan_type IS 'Tipo de plan: starter, proconnection, clinicas, o dev (solo para pruebas)';

-- ============================================================================
-- MIGRACIÓN 2: Sistema Multiusuario para Plan Clínicas
-- ============================================================================

-- Tabla de equipos de clínica
CREATE TABLE IF NOT EXISTS public.clinic_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'clinicas' CHECK (plan_type = 'clinicas'),
  max_professionals INTEGER NOT NULL DEFAULT 4,
  current_professionals_count INTEGER NOT NULL DEFAULT 1,
  subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(admin_psychologist_id)
);

COMMENT ON TABLE public.clinic_teams IS 'Equipos de clínica creados por administradores con Plan Clínicas';

-- Tabla de miembros del equipo
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_team_id UUID NOT NULL REFERENCES public.clinic_teams(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'assistant')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'invited')),
  invited_by UUID REFERENCES public.psychologists(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_team_id, psychologist_id)
);

COMMENT ON TABLE public.team_members IS 'Miembros de un equipo de clínica, incluyendo psicólogos y asistentes';

-- RLS para clinic_teams
ALTER TABLE public.clinic_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage their clinic teams" ON public.clinic_teams;
CREATE POLICY "Admins can manage their clinic teams" ON public.clinic_teams
  FOR ALL USING (admin_psychologist_id = auth.uid()) WITH CHECK (admin_psychologist_id = auth.uid());

DROP POLICY IF EXISTS "Team members can view their clinic team" ON public.clinic_teams;
CREATE POLICY "Team members can view their clinic team" ON public.clinic_teams
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.team_members WHERE clinic_team_id = id AND psychologist_id = auth.uid()));

-- RLS para team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (EXISTS (SELECT 1 FROM public.clinic_teams WHERE id = clinic_team_id AND admin_psychologist_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clinic_teams WHERE id = clinic_team_id AND admin_psychologist_id = auth.uid()));

DROP POLICY IF EXISTS "Team members can view their own team members" ON public.team_members;
CREATE POLICY "Team members can view their own team members" ON public.team_members
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.clinic_team_id = clinic_team_id AND tm.psychologist_id = auth.uid()));

-- Función para obtener el equipo de una clínica
DROP FUNCTION IF EXISTS public.get_clinic_team(UUID);
CREATE FUNCTION public.get_clinic_team(p_psychologist_id UUID)
RETURNS SETOF public.clinic_teams
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ct.*
  FROM public.clinic_teams ct
  WHERE ct.admin_psychologist_id = p_psychologist_id
  UNION
  SELECT ct.*
  FROM public.clinic_teams ct
  JOIN public.team_members tm ON ct.id = tm.clinic_team_id
  WHERE tm.psychologist_id = p_psychologist_id AND tm.status = 'active';
END;
$$;

COMMENT ON FUNCTION public.get_clinic_team(UUID) IS 'Devuelve el equipo de clínica al que pertenece un psicólogo, ya sea como admin o miembro activo.';

-- Función para verificar si un psicólogo es admin de una clínica
DROP FUNCTION IF EXISTS public.is_clinic_admin(UUID);
CREATE FUNCTION public.is_clinic_admin(p_psychologist_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.clinic_teams
    WHERE admin_psychologist_id = p_psychologist_id
  ) INTO is_admin;
  RETURN is_admin;
END;
$$;

COMMENT ON FUNCTION public.is_clinic_admin(UUID) IS 'Verifica si un psicólogo es el administrador de alguna clínica.';

-- ============================================================================
-- MIGRACIÓN 3: Actualizar función get_plan_capabilities
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_plan_capabilities(UUID);
CREATE FUNCTION public.get_plan_capabilities(psychologist_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_type_value TEXT;
  capabilities JSON;
  is_clinic_member BOOLEAN;
  is_clinic_admin BOOLEAN;
BEGIN
  -- Obtener el plan_type del psicólogo
  SELECT p.plan_type INTO plan_type_value
  FROM public.psychologists p
  WHERE p.id = psychologist_id;
  
  -- Si no se encuentra el psicólogo, retornar capacidades de starter
  IF plan_type_value IS NULL THEN
    plan_type_value := 'starter';
  END IF;
  
  plan_type_value := LOWER(plan_type_value);
  
  -- Verificar si es miembro o admin de clínica
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.clinic_teams ct ON tm.clinic_team_id = ct.id
    WHERE tm.psychologist_id = psychologist_id AND tm.status = 'active'
  ) INTO is_clinic_member;
  
  SELECT public.is_clinic_admin(psychologist_id) INTO is_clinic_admin;
  
  -- Determinar capacidades según el plan
  CASE plan_type_value
    WHEN 'starter' THEN
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', false,
        'advanced_reports', false,
        'priority_support', false,
        'financial_features', false,
        'advanced_documents', false,
        'team_features', false,
        'early_access', false,
        'visibility_consulting', false,
        'api_integrations', false,
        'dedicated_support', false,
        'is_clinic_admin', false,
        'is_clinic_member', false
      );
    
    WHEN 'proconnection' THEN
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', true,
        'advanced_reports', true,
        'priority_support', true,
        'financial_features', true,
        'advanced_documents', true,
        'team_features', false,
        'early_access', false,
        'visibility_consulting', false,
        'api_integrations', false,
        'dedicated_support', false,
        'is_clinic_admin', false,
        'is_clinic_member', false
      );
    
    WHEN 'clinicas' THEN
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', true,
        'advanced_reports', true,
        'priority_support', true,
        'financial_features', true,
        'advanced_documents', true,
        'team_features', true,
        'early_access', true,
        'visibility_consulting', true,
        'api_integrations', true,
        'dedicated_support', true,
        'is_clinic_admin', is_clinic_admin,
        'is_clinic_member', is_clinic_member OR is_clinic_admin
      );
    
    WHEN 'dev' THEN
      -- DEV tiene todas las capacidades
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', true,
        'advanced_reports', true,
        'priority_support', true,
        'financial_features', true,
        'advanced_documents', true,
        'team_features', true,
        'early_access', true,
        'visibility_consulting', true,
        'api_integrations', true,
        'dedicated_support', true,
        'is_clinic_admin', true,
        'is_clinic_member', true
      );
    
    ELSE
      -- Default: starter
      capabilities := json_build_object(
        'basic_features', true,
        'seo_profile', false,
        'advanced_reports', false,
        'priority_support', false,
        'financial_features', false,
        'advanced_documents', false,
        'team_features', false,
        'early_access', false,
        'visibility_consulting', false,
        'api_integrations', false,
        'dedicated_support', false,
        'is_clinic_admin', false,
        'is_clinic_member', false
      );
  END CASE;
  
  RETURN capabilities;
END;
$$;

COMMENT ON FUNCTION public.get_plan_capabilities(UUID) IS 'Devuelve las capacidades del plan basadas en el plan_type del psicólogo, incluyendo si es admin o miembro de clínica.';

-- ============================================================================
-- MIGRACIÓN 4: Agregar campos de suscripción MercadoPago
-- ============================================================================

-- Agregar campos a tabla psychologists
ALTER TABLE public.psychologists
ADD COLUMN IF NOT EXISTS mercadopago_preapproval_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'trial', 'pending', 'expired'));

-- Crear índice para búsquedas por preapproval_id
CREATE INDEX IF NOT EXISTS idx_psychologists_preapproval_id 
ON public.psychologists(mercadopago_preapproval_id) 
WHERE mercadopago_preapproval_id IS NOT NULL;

-- Comentarios
COMMENT ON COLUMN public.psychologists.mercadopago_preapproval_id IS 'ID de Preapproval de MercadoPago para suscripciones recurrentes';
COMMENT ON COLUMN public.psychologists.subscription_start_date IS 'Fecha de inicio de la suscripción activa';
COMMENT ON COLUMN public.psychologists.subscription_end_date IS 'Fecha de fin del período de suscripción actual';
COMMENT ON COLUMN public.psychologists.next_billing_date IS 'Fecha del próximo cobro recurrente';
COMMENT ON COLUMN public.psychologists.subscription_status IS 'Estado de la suscripción: active, cancelled, trial, pending, expired';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

