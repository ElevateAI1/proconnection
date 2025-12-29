-- Agregar campo profile_image_url a la tabla patients
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

COMMENT ON COLUMN public.patients.profile_image_url IS 'URL de la imagen de perfil del paciente';

