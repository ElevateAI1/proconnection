
-- Crear bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true);

-- Crear políticas para el bucket de fotos de perfil
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Agregar campo para la URL de la foto de perfil
ALTER TABLE public.psychologists 
ADD COLUMN profile_image_url TEXT;

-- Agregar campo para personalización de PDFs
ALTER TABLE public.psychologists 
ADD COLUMN pdf_logo_url TEXT,
ADD COLUMN pdf_primary_color TEXT DEFAULT '#3B82F6',
ADD COLUMN pdf_contact_info JSONB DEFAULT '{}';
