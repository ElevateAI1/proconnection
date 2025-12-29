-- ============================================================================
-- Migración: Actualizar función get_plan_capabilities para Plan Clínicas
-- ============================================================================
-- Este script actualiza la función para usar 'clinicas' y verificar membresía en clínica
-- Fecha: 2025-01-25
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_plan_capabilities(psychologist_id UUID)
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
  
  -- Verificar si es miembro o admin de una clínica
  SELECT 
    EXISTS (
      SELECT 1 FROM public.team_members tm
      INNER JOIN public.clinic_teams ct ON tm.clinic_team_id = ct.id
      WHERE tm.psychologist_id = psychologist_id
      AND tm.status = 'active'
    ),
    EXISTS (
      SELECT 1 FROM public.clinic_teams
      WHERE admin_psychologist_id = psychologist_id
    )
  INTO is_clinic_member, is_clinic_admin;
  
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
        'is_clinic_member', is_clinic_member
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
        'is_clinic_admin', false,
        'is_clinic_member', false
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
  
  -- Si es miembro de clínica (aunque no tenga plan clinicas), habilitar team_features
  IF is_clinic_member OR is_clinic_admin THEN
    capabilities := jsonb_set(
      capabilities::jsonb,
      '{team_features}',
      'true'::jsonb
    )::json;
  END IF;
  
  RETURN capabilities;
END;
$$;

COMMENT ON FUNCTION public.get_plan_capabilities(UUID) IS 'Devuelve las capacidades del plan basadas en el plan_type del psicólogo y membresía en clínica';

