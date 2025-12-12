-- ============================================================================
-- Migración: Asegurar que el constraint incluya 'dev'
-- ============================================================================
-- Este script asegura que el constraint de plan_type incluya 'dev'
-- Fecha: 2025-01-16
-- ============================================================================

-- Eliminar el constraint actual si existe
ALTER TABLE public.psychologists
DROP CONSTRAINT IF EXISTS psychologists_plan_type_check;

-- Crear el nuevo constraint incluyendo 'dev'
ALTER TABLE public.psychologists
ADD CONSTRAINT psychologists_plan_type_check 
CHECK (plan_type IS NULL OR plan_type IN ('starter', 'proconnection', 'teams', 'dev'));

-- Actualizar el comentario
COMMENT ON COLUMN public.psychologists.plan_type IS 'Tipo de plan: starter, proconnection, teams, o dev (solo para pruebas)';

