
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Globe, Eye, EyeOff, Copy, ExternalLink, BarChart3 } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { useProfile } from '@/hooks/useProfile';
import { useVisibilityData } from '@/hooks/useVisibilityData';
import { usePublicProfiles } from '@/hooks/usePublicProfiles';
import { toast } from '@/hooks/use-toast';

export const PublicProfileManager = () => {
  const { psychologist } = useProfile();
  const { seoConfig } = useVisibilityData();
  const { 
    publicProfile, 
    loading, 
    createOrUpdatePublicProfile, 
    getMyPublicProfile,
    toggleProfileStatus 
  } = usePublicProfiles();

  const [formData, setFormData] = useState({
    custom_url: '',
    is_active: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    profile_data: {}
  });

  useEffect(() => {
    getMyPublicProfile();
  }, []);

  useEffect(() => {
    if (publicProfile) {
      setFormData({
        custom_url: publicProfile.custom_url || '',
        is_active: publicProfile.is_active || false,
        seo_title: publicProfile.seo_title || '',
        seo_description: publicProfile.seo_description || '',
        seo_keywords: publicProfile.seo_keywords || '',
        profile_data: publicProfile.profile_data || {}
      });
    } else if (psychologist && seoConfig) {
      // Auto-completar con datos existentes
      setFormData(prev => ({
        ...prev,
        custom_url: prev.custom_url || seoConfig.custom_url || `dr-${psychologist.first_name?.toLowerCase()}-${psychologist.last_name?.toLowerCase()}`.replace(/\s+/g, '-'),
        seo_title: prev.seo_title || seoConfig.title || `Dr. ${psychologist.first_name} ${psychologist.last_name} - Psicólogo Profesional`,
        seo_description: prev.seo_description || seoConfig.description || `Consulta psicológica profesional con Dr. ${psychologist.first_name} ${psychologist.last_name}. ${psychologist.specialization || 'Especialista en terapia psicológica'}.`,
        seo_keywords: prev.seo_keywords || seoConfig.keywords || ''
      }));
    }
  }, [publicProfile, psychologist, seoConfig]);

  const handleSave = async () => {
    if (!formData.custom_url.trim()) {
      toast({
        title: "URL requerida",
        description: "Debes especificar una URL personalizada",
        variant: "destructive"
      });
      return;
    }

    await createOrUpdatePublicProfile(formData);
  };

  const handleUrlChange = (value: string) => {
    const cleanUrl = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, custom_url: cleanUrl }));
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/perfil/${formData.custom_url}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: "La URL de tu perfil público ha sido copiada al portapapeles",
    });
  };

  const openPublicProfile = () => {
    const url = `${window.location.origin}/perfil/${formData.custom_url}`;
    window.open(url, '_blank');
  };

  return (
    <PlanGate capability="seo_profile">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Perfil Público
          </CardTitle>
          <p className="text-slate-600 text-sm">
            Crea tu página profesional pública con SEO optimizado para que los pacientes te encuentren
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Estado del perfil */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {formData.is_active ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="font-medium text-slate-800">
                  {formData.is_active ? 'Perfil público activo' : 'Perfil público inactivo'}
                </p>
                <p className="text-sm text-slate-600">
                  {formData.is_active 
                    ? 'Tu perfil es visible públicamente'
                    : 'Tu perfil no es visible para el público'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => {
                if (publicProfile) {
                  toggleProfileStatus(checked);
                } else {
                  setFormData(prev => ({ ...prev, is_active: checked }));
                }
              }}
            />
          </div>

          {/* Estadísticas si existe el perfil */}
          {publicProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Vistas del perfil</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">{publicProfile.view_count}</p>
              </div>
              
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Estado</span>
                </div>
                <p className="text-lg font-semibold text-emerald-800">
                  {publicProfile.is_active ? 'Público' : 'Privado'}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {/* URL personalizada */}
            <div>
              <Label htmlFor="custom-url">URL Personalizada *</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  {window.location.origin}/perfil/
                </span>
                <Input 
                  id="custom-url"
                  value={formData.custom_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="dr-juan-perez"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Solo letras, números y guiones. Se convertirá automáticamente.
              </p>
            </div>
            
            {/* Título SEO */}
            <div>
              <Label htmlFor="seo-title">Título SEO</Label>
              <Input 
                id="seo-title"
                value={formData.seo_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder="Dr. Juan Pérez - Psicólogo especialista en terapia cognitiva"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.seo_title.length}/60 caracteres (óptimo: 30-60)
              </p>
            </div>
            
            {/* Descripción SEO */}
            <div>
              <Label htmlFor="seo-description">Descripción SEO</Label>
              <Textarea 
                id="seo-description"
                value={formData.seo_description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                placeholder="Consulta psicológica profesional especializada en ansiedad, depresión y terapia de pareja..."
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.seo_description.length}/160 caracteres (óptimo: 120-160)
              </p>
            </div>

            {/* Palabras clave */}
            <div>
              <Label htmlFor="keywords">Palabras Clave</Label>
              <Input 
                id="keywords"
                value={formData.seo_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                placeholder="psicólogo, terapia, ansiedad, depresión..."
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Separa con comas. Actual: {formData.seo_keywords ? formData.seo_keywords.split(',').length : 0} palabras
              </p>
            </div>
          </div>

          {/* Vista previa de la URL */}
          {formData.custom_url && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Globe className="w-4 h-4" />
                <span className="font-medium">Tu perfil público estará disponible en:</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-green-600 font-mono flex-1">
                  {window.location.origin}/perfil/{formData.custom_url}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPublicUrl}
                  className="text-green-600 border-green-300 hover:bg-green-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                {publicProfile && formData.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPublicProfile}
                    className="text-green-600 border-green-300 hover:bg-green-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={loading || !formData.custom_url.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? 'Guardando...' : publicProfile ? 'Actualizar Perfil' : 'Crear Perfil Público'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PlanGate>
  );
};
