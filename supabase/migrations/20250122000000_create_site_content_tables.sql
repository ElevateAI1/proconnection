-- ============================================================================
-- Migración: Tablas de Contenido del Sitio
-- Fecha: 2025-01-22
-- ============================================================================
-- Esta migración crea las tablas para gestionar blogs, fundadores, socios
-- y miembros del equipo desde el admin dashboard.
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE BLOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_name TEXT,
  author_image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_site_blogs_slug ON public.site_blogs(slug);
CREATE INDEX IF NOT EXISTS idx_site_blogs_published ON public.site_blogs(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_site_blogs_featured ON public.site_blogs(is_featured);

COMMENT ON TABLE public.site_blogs IS 'Blog posts del sitio web';
COMMENT ON COLUMN public.site_blogs.slug IS 'URL amigable única para el blog post';
COMMENT ON COLUMN public.site_blogs.featured_image_url IS 'URL de la imagen destacada (puede ser upload o URL externa)';

-- ============================================================================
-- 2. TABLA DE FUNDADORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  email TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_site_founders_display_order ON public.site_founders(display_order);
CREATE INDEX IF NOT EXISTS idx_site_founders_active ON public.site_founders(is_active);

COMMENT ON TABLE public.site_founders IS 'Fundadores de la empresa';
COMMENT ON COLUMN public.site_founders.image_url IS 'URL de la foto del fundador (puede ser upload o URL externa)';

-- ============================================================================
-- 3. TABLA DE SOCIOS/PARTNERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category TEXT, -- 'technology', 'healthcare', 'education', etc.
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_site_partners_display_order ON public.site_partners(display_order);
CREATE INDEX IF NOT EXISTS idx_site_partners_active ON public.site_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_site_partners_category ON public.site_partners(category);

COMMENT ON TABLE public.site_partners IS 'Socios y partners de la empresa';
COMMENT ON COLUMN public.site_partners.logo_url IS 'URL del logo del partner (puede ser upload o URL externa)';

-- ============================================================================
-- 4. TABLA DE MIEMBROS DEL EQUIPO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  email TEXT,
  department TEXT, -- 'engineering', 'design', 'marketing', 'support', etc.
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_site_team_members_display_order ON public.site_team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_site_team_members_active ON public.site_team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_site_team_members_department ON public.site_team_members(department);

COMMENT ON TABLE public.site_team_members IS 'Miembros del equipo';
COMMENT ON COLUMN public.site_team_members.image_url IS 'URL de la foto del miembro (puede ser upload o URL externa)';

-- ============================================================================
-- 5. TRIGGERS PARA updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_blogs_updated_at
  BEFORE UPDATE ON public.site_blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_updated_at();

CREATE TRIGGER update_site_founders_updated_at
  BEFORE UPDATE ON public.site_founders
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_updated_at();

CREATE TRIGGER update_site_partners_updated_at
  BEFORE UPDATE ON public.site_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_updated_at();

CREATE TRIGGER update_site_team_members_updated_at
  BEFORE UPDATE ON public.site_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_updated_at();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.site_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_team_members ENABLE ROW LEVEL SECURITY;

-- Políticas para admins: pueden hacer todo
CREATE POLICY "Admins can manage blogs"
  ON public.site_blogs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage founders"
  ON public.site_founders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage partners"
  ON public.site_partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team members"
  ON public.site_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

-- Políticas públicas: cualquiera puede leer contenido publicado
CREATE POLICY "Public can view published blogs"
  ON public.site_blogs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view active founders"
  ON public.site_founders FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active partners"
  ON public.site_partners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active team members"
  ON public.site_team_members FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- 7. STORAGE BUCKET PARA IMÁGENES DEL SITIO
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-content-images', 'site-content-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para site-content-images
DROP POLICY IF EXISTS "Anyone can view site content images" ON storage.objects;
CREATE POLICY "Anyone can view site content images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'site-content-images');

DROP POLICY IF EXISTS "Admins can upload site content images" ON storage.objects;
CREATE POLICY "Admins can upload site content images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'site-content-images' AND
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update site content images" ON storage.objects;
CREATE POLICY "Admins can update site content images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'site-content-images' AND
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can delete site content images" ON storage.objects;
CREATE POLICY "Admins can delete site content images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'site-content-images' AND
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

