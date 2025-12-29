-- ============================================================================
-- Migración: Sistema Multiusuario para Plan Clínicas
-- ============================================================================
-- Este script crea las tablas y funciones para el sistema multiusuario
-- Fecha: 2025-01-25
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE EQUIPOS DE CLÍNICA
-- ============================================================================

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

-- ============================================================================
-- 2. TABLA DE MIEMBROS DEL EQUIPO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_team_id UUID NOT NULL REFERENCES public.clinic_teams(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'psychologist', 'assistant', 'admin_staff')),
  permissions JSONB NOT NULL DEFAULT '{}',
  invited_by UUID REFERENCES public.psychologists(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_team_id, psychologist_id)
);

COMMENT ON TABLE public.team_members IS 'Miembros de equipos de clínica con roles y permisos';

-- ============================================================================
-- 3. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clinic_teams_admin ON public.clinic_teams(admin_psychologist_id);
CREATE INDEX IF NOT EXISTS idx_team_members_clinic ON public.team_members(clinic_team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_psychologist ON public.team_members(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);

-- ============================================================================
-- 4. HABILITAR RLS
-- ============================================================================

ALTER TABLE public.clinic_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. POLÍTICAS RLS PARA CLINIC_TEAMS
-- ============================================================================

-- Los administradores pueden ver y gestionar su equipo
CREATE POLICY "Admins can view their clinic team" ON public.clinic_teams
  FOR SELECT USING (admin_psychologist_id = auth.uid());

-- Los administradores pueden crear su equipo
CREATE POLICY "Admins can create clinic team" ON public.clinic_teams
  FOR INSERT WITH CHECK (admin_psychologist_id = auth.uid());

-- Los administradores pueden actualizar su equipo
CREATE POLICY "Admins can update their clinic team" ON public.clinic_teams
  FOR UPDATE USING (admin_psychologist_id = auth.uid());

-- Los miembros del equipo pueden ver su equipo
CREATE POLICY "Team members can view their clinic team" ON public.clinic_teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.clinic_team_id = clinic_teams.id
      AND team_members.psychologist_id = auth.uid()
      AND team_members.status = 'active'
    )
  );

-- ============================================================================
-- 6. POLÍTICAS RLS PARA TEAM_MEMBERS
-- ============================================================================

-- Los administradores pueden ver todos los miembros de su equipo
CREATE POLICY "Admins can view team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clinic_teams
      WHERE clinic_teams.id = team_members.clinic_team_id
      AND clinic_teams.admin_psychologist_id = auth.uid()
    )
  );

-- Los miembros pueden verse a sí mismos
CREATE POLICY "Members can view themselves" ON public.team_members
  FOR SELECT USING (psychologist_id = auth.uid());

-- Los administradores pueden gestionar miembros
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinic_teams
      WHERE clinic_teams.id = team_members.clinic_team_id
      AND clinic_teams.admin_psychologist_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. FUNCIONES AUXILIARES
-- ============================================================================

-- Función para verificar si un psicólogo es admin de una clínica
CREATE OR REPLACE FUNCTION public.is_clinic_admin(psychologist_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clinic_teams
    WHERE admin_psychologist_id = psychologist_id
  );
END;
$$;

COMMENT ON FUNCTION public.is_clinic_admin(UUID) IS 'Verifica si un psicólogo es administrador de una clínica';

-- Función para obtener el equipo de un psicólogo
CREATE OR REPLACE FUNCTION public.get_clinic_team(psychologist_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  admin_psychologist_id UUID,
  max_professionals INTEGER,
  current_professionals_count INTEGER,
  subscription_status TEXT,
  is_admin BOOLEAN,
  member_role TEXT,
  member_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id AS team_id,
    ct.name AS team_name,
    ct.admin_psychologist_id,
    ct.max_professionals,
    ct.current_professionals_count,
    ct.subscription_status,
    (ct.admin_psychologist_id = psychologist_id) AS is_admin,
    tm.role AS member_role,
    tm.status AS member_status
  FROM public.clinic_teams ct
  LEFT JOIN public.team_members tm ON ct.id = tm.clinic_team_id AND tm.psychologist_id = psychologist_id
  WHERE ct.admin_psychologist_id = psychologist_id
     OR (tm.psychologist_id = psychologist_id AND tm.status = 'active')
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.get_clinic_team(UUID) IS 'Obtiene el equipo de clínica de un psicólogo';

-- Función para verificar límite de profesionales
CREATE OR REPLACE FUNCTION public.check_professional_limit(clinic_team_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_prof INTEGER;
  current_count INTEGER;
BEGIN
  SELECT max_professionals, current_professionals_count
  INTO max_prof, current_count
  FROM public.clinic_teams
  WHERE id = clinic_team_id_param;
  
  RETURN current_count < max_prof;
END;
$$;

COMMENT ON FUNCTION public.check_professional_limit(UUID) IS 'Verifica si se puede agregar más profesionales al equipo';

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinic_teams_updated_at
  BEFORE UPDATE ON public.clinic_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar contador de profesionales
CREATE OR REPLACE FUNCTION public.update_professional_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.clinic_teams
    SET current_professionals_count = current_professionals_count + 1
    WHERE id = NEW.clinic_team_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE public.clinic_teams
      SET current_professionals_count = current_professionals_count + 1
      WHERE id = NEW.clinic_team_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE public.clinic_teams
      SET current_professionals_count = GREATEST(1, current_professionals_count - 1)
      WHERE id = NEW.clinic_team_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.clinic_teams
    SET current_professionals_count = GREATEST(1, current_professionals_count - 1)
    WHERE id = OLD.clinic_team_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professional_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_count();

