
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, TrendingUp, Settings, ChevronRight, CheckCircle, AlertCircle, Globe, Search, Users, Star } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { ProfileAuditModule } from './visibility/ProfileAuditModule';
import { SeoConfigModule } from './visibility/SeoConfigModule';
import { OnlinePresenceModule } from './visibility/OnlinePresenceModule';
import { SocialStrategyModule } from './visibility/SocialStrategyModule';
import { useVisibilityData } from '@/hooks/useVisibilityData';

type ModuleType = 'profile' | 'seo' | 'presence' | 'social' | null;

interface ModuleStatus {
  profile: { completed: boolean; score: number };
  seo: { completed: boolean; score: number };
  presence: { completed: boolean; score: number };
  social: { completed: boolean; score: number };
}

export const VisibilityConsulting = () => {
  const { getModuleScore } = useVisibilityData();
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleType>(null);

  // Cargar puntuaciones reales desde la base de datos
  const moduleStatus = {
    profile: getModuleScore('profile'),
    seo: getModuleScore('seo'),
    presence: getModuleScore('presence'),
    social: getModuleScore('social')
  };

  const handleStartAnalysis = () => {
    setAnalysisStarted(true);
    // Comenzar con auditoría de perfil
    setActiveModule('profile');
  };

  const handleModuleComplete = (module: keyof typeof moduleStatus, score: number) => {
    // Las puntuaciones ya se guardan en los módulos individuales
    setActiveModule(null);
  };

  const overallScore = Object.values(moduleStatus).reduce((acc, curr) => acc + curr.score, 0) / 4;
  const completedModules = Object.values(moduleStatus).filter(status => status.completed).length;

  const getStatusIcon = (status: { completed: boolean; score: number }) => {
    if (!status.completed) return <AlertCircle className="w-5 h-5 text-orange-500" />;
    if (status.score >= 80) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status.score >= 60) return <CheckCircle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (activeModule) {
    const ModuleComponent = {
      profile: ProfileAuditModule,
      seo: SeoConfigModule,
      presence: OnlinePresenceModule,
      social: SocialStrategyModule
    }[activeModule];

    return (
      <PlanGate capability="visibility_consulting">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setActiveModule(null)}
              className="p-2"
            >
              ← Volver
            </Button>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeModule === 'profile' && 'Auditoría de Perfil'}
              {activeModule === 'seo' && 'Configuración SEO'}
              {activeModule === 'presence' && 'Presencia Online'}
              {activeModule === 'social' && 'Estrategia Social'}
            </h2>
          </div>
          
          <ModuleComponent 
            onComplete={(score) => handleModuleComplete(activeModule, score)}
            currentScore={moduleStatus[activeModule].score}
          />
        </div>
      </PlanGate>
    );
  }

  return (
    <PlanGate capability="visibility_consulting">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Consultoría de Visibilidad</h2>
            <p className="text-slate-600">Análisis profesional para maximizar tu presencia online</p>
          </div>
          {analysisStarted && (
            <Badge className="ml-auto bg-blue-100 text-blue-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Puntuación: {Math.round(overallScore)}%
            </Badge>
          )}
        </div>

        {!analysisStarted ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Consultoría de Visibilidad Profesional</h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Análisis completo de tu presencia digital con herramientas específicas para cada área de mejora.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleStartAnalysis}
              >
                <Search className="w-4 h-4 mr-2" />
                Comenzar Análisis Completo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Dashboard de progreso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Dashboard de Visibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Progreso general</span>
                      <span className={`text-sm font-medium ${getScoreColor(overallScore)}`}>
                        {Math.round(overallScore)}% ({completedModules}/4 módulos)
                      </span>
                    </div>
                    <Progress value={overallScore} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Puntuación promedio</span>
                      <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
                        {Math.round(overallScore)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Módulos completados</span>
                      <span className="text-lg font-bold text-blue-600">
                        {completedModules}/4
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Módulos de análisis */}
            <Card>
              <CardHeader>
                <CardTitle>Módulos de Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setActiveModule('profile')}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(moduleStatus.profile)}
                      <div>
                        <h4 className="font-medium">Auditoría de Perfil</h4>
                        <p className="text-sm text-slate-600">Completitud y optimización de tu perfil profesional</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {moduleStatus.profile.completed && (
                        <span className={`text-sm font-medium ${getScoreColor(moduleStatus.profile.score)}`}>
                          {moduleStatus.profile.score}%
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setActiveModule('seo')}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(moduleStatus.seo)}
                      <div>
                        <h4 className="font-medium">Configuración SEO</h4>
                        <p className="text-sm text-slate-600">Optimización para motores de búsqueda locales</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {moduleStatus.seo.completed && (
                        <span className={`text-sm font-medium ${getScoreColor(moduleStatus.seo.score)}`}>
                          {moduleStatus.seo.score}%
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setActiveModule('presence')}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(moduleStatus.presence)}
                      <div>
                        <h4 className="font-medium">Presencia Online</h4>
                        <p className="text-sm text-slate-600">Directorios médicos y plataformas profesionales</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {moduleStatus.presence.completed && (
                        <span className={`text-sm font-medium ${getScoreColor(moduleStatus.presence.score)}`}>
                          {moduleStatus.presence.score}%
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setActiveModule('social')}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(moduleStatus.social)}
                      <div>
                        <h4 className="font-medium">Estrategia Social</h4>
                        <p className="text-sm text-slate-600">Planificación de contenido y redes sociales</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {moduleStatus.social.completed && (
                        <span className={`text-sm font-medium ${getScoreColor(moduleStatus.social.score)}`}>
                          {moduleStatus.social.score}%
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Herramientas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Herramientas Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setActiveModule('seo')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Optimizador SEO</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      Configura títulos, descripciones y palabras clave
                    </p>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setActiveModule('presence')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Gestor de Directorios</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      Registra tu consultorio en directorios médicos
                    </p>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setActiveModule('social')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Planificador de Contenido</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      Crea calendario de publicaciones profesionales
                    </p>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setActiveModule('profile')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Auditor de Perfil</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      Analiza y mejora tu perfil profesional
                    </p>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PlanGate>
  );
};
