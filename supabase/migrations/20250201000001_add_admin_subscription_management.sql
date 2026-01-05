-- ============================================================================
-- Migración: Agregar permisos de admin para gestión de suscripciones
-- ============================================================================
-- Esta migración permite a los superadmins asignar y gestionar suscripciones
-- para usuarios beta y cualquier profesional
-- Fecha: 2025-02-01
-- ============================================================================

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = user_id 
    AND profiles.user_type = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin_user IS 'Verifica si un usuario es administrador del sistema';

-- Agregar políticas RLS para que admins puedan ver todos los psicólogos
DROP POLICY IF EXISTS "Admins can view all psychologists" ON public.psychologists;
CREATE POLICY "Admins can view all psychologists" ON public.psychologists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Agregar políticas RLS para que admins puedan actualizar todos los psicólogos
DROP POLICY IF EXISTS "Admins can update all psychologists" ON public.psychologists;
CREATE POLICY "Admins can update all psychologists" ON public.psychologists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

COMMENT ON POLICY "Admins can view all psychologists" ON public.psychologists IS 'Permite a los admins ver todos los registros de psicólogos';
COMMENT ON POLICY "Admins can update all psychologists" ON public.psychologists IS 'Permite a los admins actualizar cualquier registro de psicólogos (incluyendo suscripciones)';

-- Verificar que la tabla admins existe y está correctamente configurada
DO $$
BEGIN
  -- Si no existe la tabla admins, crearla
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    CREATE TABLE IF NOT EXISTS public.admins (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    COMMENT ON TABLE public.admins IS 'Usuarios administradores del sistema';
    
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
    
    -- Policy para que los admins puedan ver la tabla admins
    CREATE POLICY "Admins can view admins table" ON public.admins
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.user_type = 'admin'
        )
      );
  END IF;
END $$;

-- Función helper para crear un admin (útil para setup inicial)
CREATE OR REPLACE FUNCTION public.create_admin(admin_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar profile a admin
  UPDATE public.profiles
  SET user_type = 'admin'
  WHERE id = admin_user_id;
  
  -- Insertar en tabla admins si no existe
  INSERT INTO public.admins (id)
  VALUES (admin_user_id)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.create_admin IS 'Convierte un usuario en administrador del sistema. Usar con cuidado.';

-- ============================================================================
-- INSTRUCCIONES DE USO
-- ============================================================================
-- Para crear un superadmin, ejecuta:
-- 
-- 1. Obtener el ID del usuario (desde auth.users o profiles)
-- 2. Ejecutar:
--    SELECT public.create_admin('uuid-del-usuario');
-- 
-- O manualmente:
--    UPDATE public.profiles SET user_type = 'admin' WHERE id = 'uuid-del-usuario';
--    INSERT INTO public.admins (id) VALUES ('uuid-del-usuario') ON CONFLICT DO NOTHING;
-- ============================================================================

