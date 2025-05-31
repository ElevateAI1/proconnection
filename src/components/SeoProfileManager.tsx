
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Globe, Save, Eye, ExternalLink, Settings } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { PublicProfileManager } from './PublicProfileManager';
import { useProfile } from '@/hooks/useProfile';
import { useVisibilityData } from '@/hooks/useVisibilityData';

export const SeoProfileManager = () => {
  const { psychologist } = useProfile();
  const { seoConfig, saveSeoConfig, loading } = useVisibilityData();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    custom_url: ''
  });

  useEffect(() => {
    if (seoConfig) {
      setFormData({
        title: seoConfig.title || '',
        description: seoConfig.description || '',
        keywords: seoConfig.keywords || '',
        custom_url: seoConfig.custom_url || ''
      });
    } else if (psychologist) {
      // Auto-completar con datos del psicólogo si no hay configuración previa
      setFormData(prev => ({
        ...prev,
        title: prev.title || `Dr. ${psychologist.first_name} ${psychologist.last_name} - Psicólogo Profesional`,
        description: prev.description || `Consulta psicológica profesional con Dr. ${psychologist.first_name} ${psychologist.last_name}. ${psychologist.specialization || 'Especialista en terapia psicológica'}.`,
        custom_url: prev.custom_url || `dr-${psychologist.first_name?.toLowerCase()}-${psychologist.last_name?.toLowerCase()}`.replace(/\s+/g, '-')
      }));
    }
  }, [seoConfig, psychologist]);

  const handleSave = async () => {
    await saveSeoConfig(formData);
  };

  const finalUrl = formData.custom_url || 'mi-perfil';

  return (
    <PlanGate capability="seo_profile">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración SEO
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Perfil Público
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-500" />
                Configuración SEO
              </CardTitle>
              <p className="text-slate-600 text-sm">
                Optimiza tu perfil para aparecer en búsquedas de Google
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="seo-title">Título SEO</Label>
                  <Input 
                    id="seo-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Psicólogo especialista en terapia cognitiva en Buenos Aires"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.title.length}/60 caracteres (óptimo: 30-60)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="seo-description">Descripción SEO</Label>
                  <Textarea 
                    id="seo-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe tu especialidad y servicios para aparecer en búsquedas de Google..."
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.description.length}/160 caracteres (óptimo: 120-160)
                  </p>
                </div>

                <div>
                  <Label htmlFor="keywords">Palabras Clave</Label>
                  <Input 
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="psicólogo, terapia, ansiedad, depresión..."
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Separa con comas. Actual: {formData.keywords ? formData.keywords.split(',').length : 0} palabras
                  </p>
                </div>

                <div>
                  <Label htmlFor="custom-url">URL Base</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500">proconnection.me/perfil/</span>
                    <Input 
                      id="custom-url"
                      value={formData.custom_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_url: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                      placeholder="dr-juan-perez"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Esta URL base se usará para tu perfil público
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">URL base configurada</span>
                </div>
                <p className="text-sm text-green-600 font-mono">
                  proconnection.me/perfil/{finalUrl}
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración SEO'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public">
          <PublicProfileManager />
        </TabsContent>
      </Tabs>
    </PlanGate>
  );
};
