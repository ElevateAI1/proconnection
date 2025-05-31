
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Globe, Star, Save, Eye } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { useProfile } from '@/hooks/useProfile';

export const SeoProfileManager = () => {
  const { psychologist } = useProfile();
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Generar URL automática basada en el nombre del psicólogo
  const generateAutoUrl = () => {
    if (psychologist?.first_name && psychologist?.last_name) {
      const firstName = psychologist.first_name.toLowerCase().replace(/\s+/g, '-');
      const lastName = psychologist.last_name.toLowerCase().replace(/\s+/g, '-');
      return `dr-${firstName}-${lastName}`;
    }
    return 'mi-perfil';
  };

  useEffect(() => {
    if (psychologist) {
      // Auto-completar campos si están vacíos
      if (!seoTitle) {
        setSeoTitle(`Dr. ${psychologist.first_name} ${psychologist.last_name} - Psicólogo Profesional`);
      }
      if (!seoDescription) {
        setSeoDescription(`Consulta psicológica profesional con Dr. ${psychologist.first_name} ${psychologist.last_name}. ${psychologist.specialization || 'Especialista en terapia psicológica'}.`);
      }
      if (!customUrl) {
        setCustomUrl(generateAutoUrl());
      }
    }
  }, [psychologist]);

  const handleSave = async () => {
    setSaving(true);
    // Aquí iría la lógica para guardar en la base de datos
    console.log('Guardando configuración SEO:', {
      seoTitle,
      seoDescription, 
      keywords,
      customUrl
    });
    
    // Simular guardado
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  const finalUrl = customUrl || generateAutoUrl();

  return (
    <PlanGate capability="seo_profile">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-500" />
            SEO de Perfil Profesional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="seo-title">Título SEO</Label>
              <Input 
                id="seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Ej: Psicólogo especialista en terapia cognitiva en Buenos Aires"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="seo-description">Descripción SEO</Label>
              <Textarea 
                id="seo-description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Describe tu especialidad y servicios para aparecer en búsquedas de Google..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Palabras Clave</Label>
              <Input 
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="psicólogo, terapia, ansiedad, depresión..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="custom-url">URL Personalizada</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">psiconnect.com/perfil/</span>
                <Input 
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="dr-juan-perez"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Globe className="w-4 h-4" />
              <span className="font-medium">URL de tu perfil público</span>
            </div>
            <p className="text-sm text-green-600 font-mono">
              psiconnect.com/perfil/{finalUrl}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios SEO'}
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>
        </CardContent>
      </Card>
    </PlanGate>
  );
};
