-- ============================================================================
-- Migración: Crear funciones para manejo de trial
-- ============================================================================
-- Crea las funciones is_trial_expired y get_trial_days_remaining
-- Fecha: 2025-01-16
-- ============================================================================

-- Función para verificar si el trial ha expirado
CREATE OR REPLACE FUNCTION public.is_trial_expired(psychologist_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_end_date TIMESTAMP WITH TIME ZONE;
  subscription_status_value TEXT;
  now_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener datos del psicólogo
  SELECT p.trial_end_date, p.subscription_status
  INTO trial_end_date, subscription_status_value
  FROM public.psychologists p
  WHERE p.id = psychologist_id;
  
  -- Si no se encuentra el psicólogo, retornar false
  IF trial_end_date IS NULL AND subscription_status_value IS NULL THEN
    RETURN false;
  END IF;
  
  now_timestamp := NOW();
  
  -- Si el status es 'expired' o 'cancelled', el trial está expirado
  IF subscription_status_value IN ('expired', 'cancelled') THEN
    RETURN true;
  END IF;
  
  -- Si hay trial_end_date y ya pasó, está expirado
  IF trial_end_date IS NOT NULL AND trial_end_date < now_timestamp THEN
    RETURN true;
  END IF;
  
  -- Si el status es 'active' y hay subscription_end_date que ya pasó, está expirado
  IF subscription_status_value = 'active' THEN
    DECLARE
      subscription_end_date TIMESTAMP WITH TIME ZONE;
    BEGIN
      SELECT p.subscription_end_date
      INTO subscription_end_date
      FROM public.psychologists p
      WHERE p.id = psychologist_id;
      
      IF subscription_end_date IS NOT NULL AND subscription_end_date < now_timestamp THEN
        RETURN true;
      END IF;
    END;
  END IF;
  
  -- En cualquier otro caso, no está expirado
  RETURN false;
END;
$$;

-- Función para obtener los días restantes del trial
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(psychologist_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_end_date TIMESTAMP WITH TIME ZONE;
  subscription_end_date TIMESTAMP WITH TIME ZONE;
  subscription_status_value TEXT;
  now_timestamp TIMESTAMP WITH TIME ZONE;
  days_remaining INTEGER;
BEGIN
  -- Obtener datos del psicólogo
  SELECT p.trial_end_date, p.subscription_end_date, p.subscription_status
  INTO trial_end_date, subscription_end_date, subscription_status_value
  FROM public.psychologists p
  WHERE p.id = psychologist_id;
  
  now_timestamp := NOW();
  
  -- Si el status es 'active' y hay subscription_end_date, usar ese
  IF subscription_status_value = 'active' AND subscription_end_date IS NOT NULL THEN
    days_remaining := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (subscription_end_date - now_timestamp)) / 86400));
    RETURN days_remaining;
  END IF;
  
  -- Si hay trial_end_date, calcular días restantes
  IF trial_end_date IS NOT NULL THEN
    days_remaining := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (trial_end_date - now_timestamp)) / 86400));
    RETURN days_remaining;
  END IF;
  
  -- Si no hay fechas, retornar 0
  RETURN 0;
END;
$$;

COMMENT ON FUNCTION public.is_trial_expired(UUID) IS 'Verifica si el trial del psicólogo ha expirado';
COMMENT ON FUNCTION public.get_trial_days_remaining(UUID) IS 'Devuelve los días restantes del trial o suscripción del psicólogo';

