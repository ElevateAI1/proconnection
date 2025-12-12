-- ============================================================================
-- Migración: Crear función get_plan_capabilities
-- ============================================================================
-- Esta función devuelve las capacidades del plan basadas en el plan_type
-- del psicólogo
-- Fecha: 2025-01-16
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_plan_capabilities(psychologist_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_type_value TEXT;
  capabilities JSON;
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
        'dedicated_support', false
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
        'dedicated_support', false
      );
    
    WHEN 'teams' THEN
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
        'dedicated_support', true
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
        'dedicated_support', true
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
        'dedicated_support', false
      );
  END CASE;
  
  RETURN capabilities;
END;
$$;

COMMENT ON FUNCTION public.get_plan_capabilities(UUID) IS 'Devuelve las capacidades del plan basadas en el plan_type del psicólogo';

