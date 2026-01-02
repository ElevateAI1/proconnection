
import { useEffect, useState } from 'react';
import { generateSitemap } from '@/utils/sitemapGenerator';

export const SitemapPage = () => {
  const [sitemap, setSitemap] = useState<string>('');

  useEffect(() => {
    const loadSitemap = async () => {
      const sitemapXml = await generateSitemap();
      setSitemap(sitemapXml);
    };
    loadSitemap();
  }, []);

  useEffect(() => {
    if (sitemap) {
      // Set the response content type and return XML
      const response = new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
        },
      });
      
      // For better SEO, we should serve this as actual XML
      // In a real deployment, this should be handled server-side
      document.title = 'Sitemap';
    }
  }, [sitemap]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sitemap XML</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <pre className="whitespace-pre-wrap text-sm text-gray-600 overflow-x-auto">
            {sitemap}
          </pre>
        </div>
      </div>
    </div>
  );
};
