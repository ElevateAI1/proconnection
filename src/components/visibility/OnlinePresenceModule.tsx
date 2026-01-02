
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, ExternalLink, Plus, Save } from 'lucide-react';
import { useVisibilityData } from '@/hooks/useVisibilityData';

interface OnlinePresenceModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

const DEFAULT_DIRECTORIES = [
  { id: 'google_business', name: 'Google My Business', url: 'https://business.google.com' },
  { id: 'doctoralia', name: 'Doctoralia', url: 'https://www.doctoralia.com.ar' },
  { id: 'psicologos_online', name: 'Psicólogos Online', url: 'https://psicologosonline.net' },
  { id: 'mundopsicologos', name: 'MundoPsicólogos', url: 'https://www.mundopsicologos.com' },
  { id: 'psychology_today', name: 'Psychology Today', url: 'https://www.psychologytoday.com' },
  { id: 'tuenti_salud', name: 'Tuenti Salud', url: 'https://www.tuenti.com.ar/salud' },
  { id: 'medicpro', name: 'MedicPro', url: 'https://medicpro.com.ar' },
  { id: 'zocdoc', name: 'ZocDoc', url: 'https://www.zocdoc.com' }
];

export const OnlinePresenceModule = ({ onComplete, currentScore }: OnlinePresenceModuleProps) => {
  const { directories, updateDirectory, saveModuleScore, loading } = useVisibilityData();
  const [editingDirectory, setEditingDirectory] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState('');

  const calculateScore = () => {
    const registeredCount = directories.filter(d => d.status === 'registered').length;
    const totalDirectories = DEFAULT_DIRECTORIES.length;
    
    return Math.round((registeredCount / totalDirectories) * 100);
  };

  const handleStatusChange = async (directoryId: string, status: 'not_registered' | 'pending' | 'registered') => {
    const directory = DEFAULT_DIRECTORIES.find(d => d.id === directoryId);
    if (!directory) return;

    const result = await updateDirectory({
      directory_id: directoryId,
      directory_name: directory.name,
      status: status,
      profile_url: status === 'registered' ? profileUrl : undefined
    });

    if (!result.error) {
      const newScore = calculateScore();
      await saveModuleScore('presence', newScore, { directories: directories });
      onComplete(newScore);
      setEditingDirectory(null);
      setProfileUrl('');
    }
  };

  const getDirectoryStatus = (directoryId: string) => {
    const directory = directories.find(d => d.directory_id === directoryId);
    return directory ? directory.status : 'not_registered';
  };

  const getDirectoryUrl = (directoryId: string) => {
    const directory = directories.find(d => d.directory_id === directoryId);
    return directory ? directory.profile_url : '';
  };

  const score = calculateScore();
  const isComplete = score >= 60; // 60% significa estar en al menos 5 directorios

  const registeredCount = directories.filter(d => d.status === 'registered').length;

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
                Presencia en Directorios Online
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Registro en directorios médicos y plataformas profesionales
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{score}%</div>
              <div className="text-xs text-slate-500">{registeredCount}/{DEFAULT_DIRECTORIES.length} registrado</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Progress value={score} className="h-3" />
              <p className="text-sm text-slate-600 mt-2">
                {score >= 60 ? '¡Excelente! Tienes buena presencia online.' :
                 score >= 30 ? 'Buen progreso, registra en más directorios.' :
                 'Necesitas registrarte en más directorios para mejorar tu visibilidad.'}
              </p>
            </div>

            <div className="grid gap-4">
              {DEFAULT_DIRECTORIES.map((directory) => {
                const status = getDirectoryStatus(directory.id);
                const profileUrl = getDirectoryUrl(directory.id);
                const isEditing = editingDirectory === directory.id;

                return (
                  <Card key={directory.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {status === 'registered' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : status === 'pending' ? (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{directory.name}</div>
                            <div className="text-sm text-slate-600">
                              {status === 'registered' && profileUrl ? (
                                <a
                                  href={profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  Ver perfil <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : status === 'pending' ? (
                                'Registro pendiente'
                              ) : status === 'registered' ? (
                                'Registrado'
                              ) : (
                                'No registrado'
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEditing && (
                            <>
                              {status === 'not_registered' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.open(directory.url, '_blank');
                                    handleStatusChange(directory.id, 'pending');
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Registrar
                                </Button>
                              )}
                              {status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setEditingDirectory(directory.id);
                                    setProfileUrl(profileUrl || '');
                                  }}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  Confirmar
                                </Button>
                              )}
                              {status === 'registered' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingDirectory(directory.id);
                                    setProfileUrl(profileUrl || '');
                                  }}
                                >
                                  Editar
                                </Button>
                              )}
                            </>
                          )}

                          {isEditing && (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="URL de tu perfil"
                                value={profileUrl}
                                onChange={(e) => setProfileUrl(e.target.value)}
                                className="w-64"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(directory.id, 'registered')}
                                disabled={loading || !profileUrl}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingDirectory(null);
                                  setProfileUrl('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-700 mb-2">💡 Consejos para optimizar tu presencia:</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Usa las mismas palabras clave en todos los directorios</li>
                  <li>• Mantén la información consistente (nombre, teléfono, dirección)</li>
                  <li>• Agrega fotos profesionales cuando sea posible</li>
                  <li>• Solicita reseñas a tus pacientes satisfechos</li>
                  <li>• Actualiza regularmente tu información de contacto</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
