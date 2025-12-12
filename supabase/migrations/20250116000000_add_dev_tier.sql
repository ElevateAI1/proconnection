-- ============================================================================
-- Migración: Agregar tier DEV para pruebas y desarrollo
-- ============================================================================
-- Este script agrega el plan 'dev' al constraint de plan_type
-- El plan DEV es especial y no será público, solo para pruebas internas
-- Fecha: 2025-01-16
-- ============================================================================

-- Paso 1: Eliminar el constraint actual
ALTER TABLE public.psychologists
DROP CONSTRAINT IF EXISTS psychologists_plan_type_check;

-- Paso 2: Crear el nuevo constraint incluyendo 'dev'
ALTER TABLE public.psychologists
ADD CONSTRAINT psychologists_plan_type_check 
CHECK (plan_type IS NULL OR plan_type IN ('starter', 'proconnection', 'teams', 'dev'));

-- Paso 3: Actualizar el comentario
COMMENT ON COLUMN public.psychologists.plan_type IS 'Tipo de plan: starter, proconnection, teams, o dev (solo para pruebas)';

-- Nota: No agregamos 'dev' a subscription_plans porque no es un plan público/comercial

