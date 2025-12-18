-- ============================================================================
-- Migración: Crear tabla de categorías de monotributo y poblar datos
-- Fecha: 2025-01-21
-- ============================================================================
-- Esta migración crea la tabla de categorías de monotributo y la puebla
-- con las categorías oficiales de Argentina (2024-2025)
-- ============================================================================

-- ============================================================================
-- 1. CREAR TABLA DE CATEGORÍAS DE MONOTRIBUTO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.monotax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code TEXT NOT NULL UNIQUE,
  annual_limit DECIMAL(12,2) NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.monotax_categories IS 'Categorías de monotributo de Argentina';
COMMENT ON COLUMN public.monotax_categories.category_code IS 'Código de la categoría (A, B, C, D, E, F, G, H, I, J, K)';
COMMENT ON COLUMN public.monotax_categories.annual_limit IS 'Límite de facturación anual en ARS';
COMMENT ON COLUMN public.monotax_categories.monthly_limit IS 'Límite de facturación mensual en ARS';

-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_monotax_categories_code ON public.monotax_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_monotax_categories_active ON public.monotax_categories(is_active) WHERE is_active = true;

-- ============================================================================
-- 3. RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE public.monotax_categories ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer las categorías activas
CREATE POLICY "Anyone can read active monotax categories" 
ON public.monotax_categories FOR SELECT 
USING (is_active = true);

-- ============================================================================
-- 4. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_monotax_categories_updated_at ON public.monotax_categories;
CREATE TRIGGER trigger_update_monotax_categories_updated_at
  BEFORE UPDATE ON public.monotax_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. POBLAR CATEGORÍAS DE MONOTRIBUTO (Valores 2024-2025)
-- ============================================================================

-- Insertar categorías si no existen
INSERT INTO public.monotax_categories (category_code, annual_limit, monthly_limit, description, is_active)
VALUES
  ('A', 840000, 70000, 'Categoría A - Hasta $840.000 anuales', true),
  ('B', 1260000, 105000, 'Categoría B - Hasta $1.260.000 anuales', true),
  ('C', 1680000, 140000, 'Categoría C - Hasta $1.680.000 anuales', true),
  ('D', 2520000, 210000, 'Categoría D - Hasta $2.520.000 anuales', true),
  ('E', 3360000, 280000, 'Categoría E - Hasta $3.360.000 anuales', true),
  ('F', 4200000, 350000, 'Categoría F - Hasta $4.200.000 anuales', true),
  ('G', 5040000, 420000, 'Categoría G - Hasta $5.040.000 anuales', true),
  ('H', 5880000, 490000, 'Categoría H - Hasta $5.880.000 anuales', true),
  ('I', 6720000, 560000, 'Categoría I - Hasta $6.720.000 anuales', true),
  ('J', 7560000, 630000, 'Categoría J - Hasta $7.560.000 anuales', true),
  ('K', 8400000, 700000, 'Categoría K - Hasta $8.400.000 anuales', true)
ON CONFLICT (category_code) DO UPDATE SET
  annual_limit = EXCLUDED.annual_limit,
  monthly_limit = EXCLUDED.monthly_limit,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================================
-- 6. VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM public.monotax_categories WHERE is_active = true;
  
  IF category_count < 11 THEN
    RAISE WARNING 'Solo se encontraron % categorías activas. Se esperaban 11.', category_count;
  ELSE
    RAISE NOTICE '✅ Migración de categorías de monotributo completada exitosamente';
    RAISE NOTICE '   - Tabla monotax_categories creada';
    RAISE NOTICE '   - % categorías insertadas/actualizadas', category_count;
    RAISE NOTICE '   - Políticas RLS configuradas';
  END IF;
END $$;

