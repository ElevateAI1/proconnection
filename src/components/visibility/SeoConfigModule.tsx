import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Save, Globe } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useVisibilityData } from '@/hooks/useVisibilityData';

interface SeoConfigModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

export const SeoConfigModule = ({ onComplete, currentScore }: SeoConfigModuleProps) => {
  const { psychologist } = useProfile();
  const { seoConfig, saveSeoConfig, saveModuleScore, loading } = useVisibilityData();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    local_seo: '',
    custom_url: ''
  });

  useEffect(() => {
    if (seoConfig) {
      setFormData({
        title: seoConfig.title || '',
        description: seoConfig.description || '',
        keywords: seoConfig.keywords || '',
        local_seo: seoConfig.local_seo || '',
        custom_url: seoConfig.custom_url || ''
      });
    } else if (psychologist) {
      // Auto-completar con datos del psicólogo
      setFormData(prev => ({
        ...prev,
        title: prev.title || `Dr. ${psychologist.first_name} ${psychologist.last_name} - Psicólogo Profesional`,
        description: prev.description || `Consulta psicológica profesional con Dr. ${psychologist.first_name} ${psychologist.last_name}. ${psychologist.specialization || 'Especialista en terapia psicológica'}.`,
        custom_url: prev.custom_url || `dr-${psychologist.first_name?.toLowerCase()}-${psychologist.last_name?.toLowerCase()}`.replace(/\s+/g, '-')
      }));
    }
  }, [seoConfig, psychologist]);

  const calculateScore = () => {
    let score = 0;
    let maxScore = 100;

    // Título SEO (25 puntos)
    if (formData.title && formData.title.length >= 30 && formData.title.length <= 60) score += 25;
    else if (formData.title && formData.title.length >= 20) score += 15;

    // Descripción SEO (30 puntos)
    if (formData.description && formData.description.length >= 120 && formData.description.length <= 160) score += 30;
    else if (formData.description && formData.description.length >= 80) score += 20;

    // Palabras clave (20 puntos)
    if (formData.keywords && formData.keywords.split(',').length >= 5) score += 20;
    else if (formData.keywords && formData.keywords.split(',').length >= 3) score += 10;

    // SEO Local (15 puntos)
    if (formData.local_seo && formData.local_seo.length >= 20) score += 15;

    // URL personalizada (10 puntos)
    if (formData.custom_url && formData.custom_url.length >= 5) score += 10;

    return Math.round((score / maxScore) * 100);
  };

  const handleSave = async () => {
    const result = await saveSeoConfig(formData);
    
    if (!result.error) {
      const newScore = calculateScore();
      await saveModuleScore('seo', newScore, formData);
      onComplete(newScore);
    }
  };

  const score = calculateScore();
  const isComplete = score >= 80;

  const seoItems = [
    {
      label: 'Título SEO',
      completed: !!(formData.title && formData.title.length >= 30 && formData.title.length <= 60),
      value: formData.title ? `${formData.title.length} caracteres` : 'No configurado',
      optimal: '30-60 caracteres'
    },
    {
      label: 'Descripción SEO',
      completed: !!(formData.description && formData.description.length >= 120 && formData.description.length <= 160),
      value: formData.description ? `${formData.description.length} caracteres` : 'No configurada',
      optimal: '120-160 caracteres'
    },
    {
      label: 'Palabras Clave',
      completed: !!(formData.keywords && formData.keywords.split(',').length >= 5),
      value: formData.keywords ? `${formData.keywords.split(',').length} palabras` : 'No configuradas',
      optimal: '5+ palabras clave'
    },
    {
      label: 'SEO Local',
      completed: !!(formData.local_seo && formData.local_seo.length >= 20),
      value: formData.local_seo ? 'Configurado' : 'No configurado',
      optimal: 'Ubicación y área de servicio'
    },
    {
      label: 'URL Personalizada',
      completed: !!(formData.custom_url && formData.custom_url.length >= 5),
      value: formData.custom_url ? `proconnection.me/perfil/${formData.custom_url}` : 'No configurada',
      optimal: 'URL amigable'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                Configuración SEO
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Optimización para motores de búsqueda locales
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{score}%</div>
              <div className="text-xs text-slate-500">Optimización SEO</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Progress value={score} className="h-3" />
              <p className="text-sm text-slate-600 mt-2">
                {score >= 80 ? '¡Excelente! Tu SEO está bien optimizado.' :
                 score >= 60 ? 'Buen progreso en SEO, continúa optimizando.' :
                 'Tu SEO necesita mejoras para aumentar la visibilidad.'}
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="seo-title">Título SEO *</Label>
                <Input
                  id="seo-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Dr. Juan Pérez - Psicólogo Clínico en Buenos Aires"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.title.length}/60 caracteres (óptimo: 30-60)
                </p>
              </div>

              <div>
                <Label htmlFor="seo-description">Descripción SEO *</Label>
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
                <Label htmlFor="keywords">Palabras Clave *</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="psicólogo, terapia, ansiedad, depresión, Buenos Aires"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separa con comas. Actual: {formData.keywords ? formData.keywords.split(',').length : 0} palabras
                </p>
              </div>

              <div>
                <Label htmlFor="local-seo">SEO Local</Label>
                <Input
                  id="local-seo"
                  value={formData.local_seo}
                  onChange={(e) => setFormData(prev => ({ ...prev, local_seo: e.target.value }))}
                  placeholder="Ej: Palermo, CABA, Buenos Aires - Atención presencial y online"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="custom-url">URL Personalizada</Label>
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
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Estado de Optimización:</h4>
              {seoItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-slate-600">{item.value}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{item.optimal}</div>
                </div>
              ))}
            </div>

            {formData.custom_url && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">URL de tu perfil público</span>
                </div>
                <p className="text-sm text-green-600 font-mono">
                  proconnection.me/perfil/{formData.custom_url}
                </p>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Configuración SEO'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
