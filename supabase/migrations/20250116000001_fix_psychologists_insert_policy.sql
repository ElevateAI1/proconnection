-- ============================================================================
-- Migración: Agregar política RLS para INSERT en psychologists
-- ============================================================================
-- Este script agrega la política faltante que permite a los usuarios
-- insertar su propio registro de psicólogo
-- Fecha: 2025-01-16
-- ============================================================================

-- Agregar política para INSERT
CREATE POLICY "Psychologists can insert their own data" ON public.psychologists
  FOR INSERT WITH CHECK (auth.uid() = id);

