-- ============================================================================
-- Migración: Agregar campos de suscripción MercadoPago
-- ============================================================================
-- Este script agrega campos necesarios para manejar suscripciones recurrentes
-- con MercadoPago Preapproval
-- Fecha: 2025-01-25
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

