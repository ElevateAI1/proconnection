-- ============================================================================
-- Migración: Correcciones para SEO, Tarifas y Funcionalidades
-- Fecha: 2025-01-20
-- ============================================================================
-- Esta migración corrige y completa:
-- 1. Vista public_profile_detailed_view para perfiles públicos
-- 2. Constraint UNIQUE en psychologist_rates para evitar duplicados
-- 3. Verificación de políticas RLS
-- ============================================================================

-- ============================================================================
-- 1. CREAR VISTA DETALLADA DE PERFILES PÚBLICOS
-- ============================================================================

CREATE OR REPLACE VIEW public.public_profile_detailed_view AS
SELECT 
  ppp.id,
  ppp.psychologist_id,
  ppp.custom_url,
  ppp.is_active,
  ppp.seo_title,
  ppp.seo_description,
  ppp.seo_keywords,
  ppp.about_description,
  ppp.therapeutic_approach,
  ppp.years_experience,
  ppp.profession_type,
  ppp.profile_data,
  ppp.view_count,
  ppp.last_viewed_at,
  ppp.created_at,
  ppp.updated_at,
  -- Datos del psicólogo
  ps.first_name,
  ps.last_name,
  ps.specialization,
  ps.professional_code,
  -- Datos de SEO config (si existe)
  seo.title as config_title,
  seo.description as config_description,
  seo.keywords as config_keywords,
  seo.custom_url as config_custom_url,
  -- Especialidades seleccionadas como JSON
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', spec.id,
        'name', spec.name,
        'category', spec.category,
        'icon', spec.icon
      )
    ) FILTER (WHERE spec.id IS NOT NULL),
    '[]'::json
  ) as selected_specialties
FROM public.public_psychologist_profiles ppp
LEFT JOIN public.psychologists ps ON ps.id = ppp.psychologist_id
LEFT JOIN public.psychologist_seo_config seo ON seo.psychologist_id = ps.id
LEFT JOIN public.profile_specialties pspec ON pspec.profile_id = ppp.id
LEFT JOIN public.professional_specialties spec ON spec.id = pspec.specialty_id
GROUP BY 
  ppp.id,
  ppp.psychologist_id,
  ppp.custom_url,
  ppp.is_active,
  ppp.seo_title,
  ppp.seo_description,
  ppp.seo_keywords,
  ppp.about_description,
  ppp.therapeutic_approach,
  ppp.years_experience,
  ppp.profession_type,
  ppp.profile_data,
  ppp.view_count,
  ppp.last_viewed_at,
  ppp.created_at,
  ppp.updated_at,
  ps.first_name,
  ps.last_name,
  ps.specialization,
  ps.professional_code,
  seo.title,
  seo.description,
  seo.keywords,
  seo.custom_url;

COMMENT ON VIEW public.public_profile_detailed_view IS 'Vista detallada de perfiles públicos con datos del psicólogo y especialidades';

-- ============================================================================
-- 2. AGREGAR CONSTRAINT UNIQUE A PSYCHOLOGIST_RATES
-- ============================================================================

-- Primero, eliminar duplicados si existen (mantener el más reciente)
WITH duplicates_to_keep AS (
  SELECT DISTINCT ON (psychologist_id, session_type) id
  FROM public.psychologist_rates
  WHERE is_active = true
  ORDER BY psychologist_id, session_type, updated_at DESC, created_at DESC
)
DELETE FROM public.psychologist_rates
WHERE is_active = true
  AND id NOT IN (SELECT id FROM duplicates_to_keep)
  AND (psychologist_id, session_type) IN (
    SELECT psychologist_id, session_type
    FROM public.psychologist_rates
    WHERE is_active = true
    GROUP BY psychologist_id, session_type
    HAVING COUNT(*) > 1
  );

-- Agregar constraint UNIQUE si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'psychologist_rates_psychologist_session_unique'
  ) THEN
    ALTER TABLE public.psychologist_rates
    ADD CONSTRAINT psychologist_rates_psychologist_session_unique
    UNIQUE (psychologist_id, session_type);
  END IF;
END $$;

COMMENT ON CONSTRAINT psychologist_rates_psychologist_session_unique ON public.psychologist_rates 
IS 'Evita que un psicólogo tenga múltiples tarifas activas para el mismo tipo de sesión';

-- ============================================================================
-- 3. VERIFICAR Y CREAR POLÍTICAS RLS FALTANTES
-- ============================================================================

-- Política para lectura pública de la vista (si es necesario)
-- Nota: Las vistas heredan las políticas de las tablas subyacentes

-- Verificar que psychologist_rates tenga políticas de lectura pública si es necesario
-- (Actualmente solo los psicólogos pueden ver sus propias tarifas, lo cual está bien)

-- ============================================================================
-- 4. VERIFICAR ÍNDICES
-- ============================================================================

-- Índice compuesto para búsquedas rápidas de tarifas
CREATE INDEX IF NOT EXISTS idx_psychologist_rates_psychologist_session 
ON public.psychologist_rates(psychologist_id, session_type) 
WHERE is_active = true;

-- Índice para búsquedas por custom_url (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_public_profiles_custom_url_lower 
ON public.public_psychologist_profiles(LOWER(custom_url));

-- Índice para búsquedas activas
CREATE INDEX IF NOT EXISTS idx_public_profiles_is_active 
ON public.public_psychologist_profiles(is_active) 
WHERE is_active = true;

-- ============================================================================
-- 5. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================================================

-- Trigger para actualizar updated_at en psychologist_rates
CREATE OR REPLACE FUNCTION update_psychologist_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_psychologist_rates_updated_at ON public.psychologist_rates;
CREATE TRIGGER trigger_update_psychologist_rates_updated_at
  BEFORE UPDATE ON public.psychologist_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_psychologist_rates_updated_at();

-- Trigger para actualizar updated_at en public_psychologist_profiles
DROP TRIGGER IF EXISTS trigger_update_public_profiles_updated_at ON public.public_psychologist_profiles;
CREATE TRIGGER trigger_update_public_profiles_updated_at
  BEFORE UPDATE ON public.public_psychologist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. VERIFICAR STATUS DE TABLAS CRÍTICAS
-- ============================================================================

-- Verificar que todas las tablas críticas existan
DO $$
BEGIN
  -- Verificar psychologist_rates
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'psychologist_rates') THEN
    RAISE EXCEPTION 'Tabla psychologist_rates no existe';
  END IF;
  
  -- Verificar public_psychologist_profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'public_psychologist_profiles') THEN
    RAISE EXCEPTION 'Tabla public_psychologist_profiles no existe';
  END IF;
  
  -- Verificar psychologist_seo_config
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'psychologist_seo_config') THEN
    RAISE EXCEPTION 'Tabla psychologist_seo_config no existe';
  END IF;
  
  -- Verificar visibility_module_scores
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visibility_module_scores') THEN
    RAISE EXCEPTION 'Tabla visibility_module_scores no existe';
  END IF;
  
  RAISE NOTICE 'Todas las tablas críticas existen correctamente';
END $$;

