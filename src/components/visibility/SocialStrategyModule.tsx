
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Save, Edit, X } from 'lucide-react';
import { useVisibilityData } from '@/hooks/useVisibilityData';

interface SocialStrategyModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'youtube', name: 'YouTube', icon: '🎥' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' }
];

const POSTING_FREQUENCIES = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'occasional', label: 'Ocasional' }
];

export const SocialStrategyModule = ({ onComplete, currentScore }: SocialStrategyModuleProps) => {
  const { socialPlatforms, updateSocialPlatform, saveModuleScore, loading } = useVisibilityData();
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    profile_url: '',
    posting_frequency: '',
    target_audience: '',
    content_strategy: ''
  });

  const calculateScore = () => {
    const activePlatforms = socialPlatforms.filter(p => p.status === 'active').length;
    const plannedPlatforms = socialPlatforms.filter(p => p.status === 'planned').length;
    
    // Puntuación basada en plataformas activas y planificadas
    const activeScore = activePlatforms * 15; // 15 puntos por plataforma activa
    const plannedScore = plannedPlatforms * 5; // 5 puntos por plataforma planificada
    
    const totalScore = Math.min(activeScore + plannedScore, 100);
    return totalScore;
  };

  const handleEdit = (platformId: string) => {
    const platform = socialPlatforms.find(p => p.platform_id === platformId);
    if (platform) {
      setFormData({
        profile_url: platform.profile_url || '',
        posting_frequency: platform.posting_frequency || '',
        target_audience: platform.target_audience || '',
        content_strategy: platform.content_strategy ? JSON.stringify(platform.content_strategy) : ''
      });
    } else {
      setFormData({
        profile_url: '',
        posting_frequency: '',
        target_audience: '',
        content_strategy: ''
      });
    }
    setEditingPlatform(platformId);
  };

  const handleSave = async (platformId: string, status: 'inactive' | 'planned' | 'active') => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    let contentStrategy = {};
    try {
      if (formData.content_strategy) {
        contentStrategy = JSON.parse(formData.content_strategy);
      }
    } catch (e) {
      contentStrategy = { strategy: formData.content_strategy };
    }

    const result = await updateSocialPlatform({
      platform_id: platformId,
      platform_name: platform.name,
      status: status,
      profile_url: formData.profile_url,
      posting_frequency: formData.posting_frequency,
      target_audience: formData.target_audience,
      content_strategy: contentStrategy
    });

    if (!result.error) {
      const newScore = calculateScore();
      await saveModuleScore('social', newScore, { platforms: socialPlatforms });
      onComplete(newScore);
      setEditingPlatform(null);
      setFormData({
        profile_url: '',
        posting_frequency: '',
        target_audience: '',
        content_strategy: ''
      });
    }
  };

  const handleCancel = () => {
    setEditingPlatform(null);
    setFormData({
      profile_url: '',
      posting_frequency: '',
      target_audience: '',
      content_strategy: ''
    });
  };

  const getPlatformStatus = (platformId: string) => {
    const platform = socialPlatforms.find(p => p.platform_id === platformId);
    return platform ? platform.status : 'inactive';
  };

  const getPlatformData = (platformId: string) => {
    return socialPlatforms.find(p => p.platform_id === platformId);
  };

  const score = calculateScore();
  const isComplete = score >= 60;

  const activePlatforms = socialPlatforms.filter(p => p.status === 'active').length;
  const plannedPlatforms = socialPlatforms.filter(p => p.status === 'planned').length;

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
                Estrategia de Redes Sociales
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Planificación de contenido y presencia en redes sociales
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{score}%</div>
              <div className="text-xs text-slate-500">{activePlatforms} activas, {plannedPlatforms} planificadas</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Progress value={score} className="h-3" />
              <p className="text-sm text-slate-600 mt-2">
                {score >= 60 ? '¡Excelente! Tienes una buena estrategia social.' :
                 score >= 30 ? 'Buen progreso, considera activar más plataformas.' :
                 'Necesitas desarrollar tu presencia en redes sociales.'}
              </p>
            </div>

            <div className="grid gap-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const status = getPlatformStatus(platform.id);
                const platformData = getPlatformData(platform.id);
                const isEditing = editingPlatform === platform.id;

                return (
                  <Card key={platform.id} className="border">
                    <CardContent className="p-4">
                      {!isEditing ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{platform.icon}</span>
                            <div>
                              <div className="font-medium">{platform.name}</div>
                              <div className="text-sm text-slate-600">
                                {status === 'active' ? (
                                  <span className="text-green-600">Activa</span>
                                ) : status === 'planned' ? (
                                  <span className="text-yellow-600">Planificada</span>
                                ) : (
                                  <span className="text-gray-500">Inactiva</span>
                                )}
                                {platformData?.posting_frequency && (
                                  <span> • {POSTING_FREQUENCIES.find(f => f.value === platformData.posting_frequency)?.label}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {status === 'inactive' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSave(platform.id, 'planned')}
                                  disabled={loading}
                                >
                                  Planificar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEdit(platform.id)}
                                  className="bg-purple-500 hover:bg-purple-600"
                                >
                                  Activar
                                </Button>
                              </>
                            )}
                            {(status === 'planned' || status === 'active') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(platform.id)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSave(platform.id, 'inactive')}
                                  disabled={loading}
                                >
                                  Desactivar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{platform.icon}</span>
                            <h4 className="font-medium">Configurar {platform.name}</h4>
                          </div>

                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor="profile_url">URL del Perfil</Label>
                              <Input
                                id="profile_url"
                                value={formData.profile_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, profile_url: e.target.value }))}
                                placeholder={`https://${platform.id}.com/tu-perfil`}
                              />
                            </div>

                            <div>
                              <Label htmlFor="posting_frequency">Frecuencia de Publicación</Label>
                              <Select value={formData.posting_frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, posting_frequency: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona frecuencia" />
                                </SelectTrigger>
                                <SelectContent>
                                  {POSTING_FREQUENCIES.map((freq) => (
                                    <SelectItem key={freq.value} value={freq.value}>
                                      {freq.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="target_audience">Audiencia Objetivo</Label>
                              <Input
                                id="target_audience"
                                value={formData.target_audience}
                                onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                                placeholder="Ej: Adultos jóvenes con ansiedad, padres de familia, etc."
                              />
                            </div>

                            <div>
                              <Label htmlFor="content_strategy">Estrategia de Contenido</Label>
                              <Textarea
                                id="content_strategy"
                                value={formData.content_strategy}
                                onChange={(e) => setFormData(prev => ({ ...prev, content_strategy: e.target.value }))}
                                placeholder="Describe qué tipo de contenido vas a compartir, temas principales, etc."
                                rows={3}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={() => handleSave(platform.id, 'planned')}
                              disabled={loading}
                              variant="outline"
                            >
                              Guardar como Planificada
                            </Button>
                            <Button
                              onClick={() => handleSave(platform.id, 'active')}
                              disabled={loading}
                              className="bg-purple-500 hover:bg-purple-600"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Activar Plataforma
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancel}
                              disabled={loading}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-purple-700 mb-2">💡 Tips para una estrategia social efectiva:</h4>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• Publica contenido educativo sobre salud mental</li>
                  <li>• Comparte tips de bienestar y autocuidado</li>
                  <li>• Mantén un tono profesional pero cercano</li>
                  <li>• Responde a comentarios y mensajes prontamente</li>
                  <li>• Usa hashtags relevantes para alcanzar más audiencia</li>
                  <li>• Programa contenido con anticipación</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
