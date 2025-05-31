
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, Star, Lightbulb, MessageSquare, Bell, Zap, Clock } from 'lucide-react';
import { PlanGate } from './PlanGate';

const betaFeatures = [
  {
    id: 'ai-assistant',
    title: 'Asistente IA para Terapias',
    description: 'IA que sugiere técnicas terapéuticas basadas en el progreso del paciente',
    status: 'development',
    availability: 'En desarrollo'
  },
  {
    id: 'voice-notes',
    title: 'Notas de Voz Automáticas',
    description: 'Transcripción automática de sesiones con análisis de sentimientos',
    status: 'planning',
    availability: 'Planificación'
  },
  {
    id: 'patient-app',
    title: 'App Móvil para Pacientes',
    description: 'Aplicación dedicada para que pacientes hagan seguimiento entre sesiones',
    status: 'design',
    availability: 'En diseño'
  }
];

const recentUpdates = [
  {
    date: '2025-01-20',
    title: 'Sistema de Planes Mejorado',
    description: 'Nuevas características Pro y Plus disponibles',
    type: 'feature'
  },
  {
    date: '2025-01-15',
    title: 'Panel de Administración',
    description: 'Herramientas avanzadas para gestión de usuarios',
    type: 'feature'
  },
  {
    date: '2025-01-10',
    title: 'Optimizaciones de Rendimiento',
    description: 'Mejoras en velocidad de carga y estabilidad',
    type: 'improvement'
  }
];

export const EarlyAccess = () => {
  return (
    <PlanGate capability="early_access">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Acceso Anticipado</h2>
            <p className="text-slate-600">Sé el primero en probar nuevas funcionalidades</p>
          </div>
          <Badge className="ml-auto bg-orange-100 text-orange-700">
            <Star className="w-3 h-3 mr-1" />
            Exclusivo Pro
          </Badge>
        </div>

        {/* Funcionalidades en desarrollo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-500" />
              Funcionalidades en Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {betaFeatures.map((feature) => (
              <div key={feature.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                      <Badge variant={
                        feature.status === 'development' ? 'default' : 
                        feature.status === 'planning' ? 'secondary' : 'outline'
                      }>
                        {feature.status === 'development' ? 'En desarrollo' : 
                         feature.status === 'planning' ? 'Planificación' : 'En diseño'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{feature.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {feature.availability}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    Me Interesa
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Programa Beta */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Únete al Programa Beta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-700">Beneficios del Programa Beta</span>
              </div>
              <ul className="text-sm text-orange-600 space-y-1">
                <li>• Acceso exclusivo a nuevas funcionalidades</li>
                <li>• Influencia directa en el desarrollo del producto</li>
                <li>• Soporte técnico especializado para betas</li>
                <li>• Reconocimiento como usuario pionero</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Rocket className="w-4 h-4 mr-2" />
                Unirme al Beta
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-600">
                <Bell className="w-4 h-4 mr-2" />
                Notificarme Novedades
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback y sugerencias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Comparte tu Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              Tu opinión es valiosa para nosotros. Comparte ideas, reporta bugs o sugiere mejoras.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Feedback
              </label>
              <select className="w-full p-2 border border-slate-300 rounded-md">
                <option value="suggestion">Sugerencia de Funcionalidad</option>
                <option value="bug">Reporte de Bug</option>
                <option value="improvement">Mejora de Funcionalidad</option>
                <option value="general">Feedback General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <Textarea 
                placeholder="Describe tu sugerencia, bug o mejora en detalle..."
                rows={4}
              />
            </div>

            <Button className="w-full bg-blue-500 hover:bg-blue-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Feedback
            </Button>
          </CardContent>
        </Card>

        {/* Actualizaciones recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-500" />
              Actualizaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    update.type === 'feature' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {update.type === 'feature' ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800">{update.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {update.type === 'feature' ? 'Nueva' : 'Mejora'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{update.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{update.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
