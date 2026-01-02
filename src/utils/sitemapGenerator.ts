
import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Static pages with their priorities and change frequencies
  const staticPages: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/demo`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/auth`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      loc: `${baseUrl}/register`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7
    }
  ];

  // Get active public profiles
  const { data: publicProfiles } = await supabase
    .from('public_psychologist_profiles')
    .select('custom_url, updated_at')
    .eq('is_active', true);

  const dynamicPages: SitemapUrl[] = publicProfiles?.map(profile => ({
    loc: `${baseUrl}/perfil/${profile.custom_url}`,
    lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.9
  })) || [];

  const allPages = [...staticPages, ...dynamicPages];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const downloadSitemap = async () => {
  const sitemap = await generateSitemap();
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
