
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Rocket, Star, Lightbulb, MessageSquare, Bell, Zap, Clock, Send, CheckCircle } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { useBetaProgram } from '@/hooks/useBetaProgram';

const recentUpdates = [
  {
    date: '2025-01-30',
    title: 'Reportes Avanzados Mejorados',
    description: 'Nuevos gráficos interactivos y métricas de satisfacción',
    type: 'feature'
  },
  {
    date: '2025-01-25',
    title: 'Consultoría de Visibilidad Completa',
    description: 'Herramientas funcionales para SEO y presencia online',
    type: 'feature'
  },
  {
    date: '2025-01-20',
    title: 'Sistema de Planes Mejorado',
    description: 'Nuevas características Pro y Plus disponibles',
    type: 'feature'
  }
];

export const EarlyAccess = () => {
  const {
    betaFeatures,
    userFeedback,
    loading,
    submitting,
    isEnrolled,
    enrollInBeta,
    submitFeedback,
    expressInterest
  } = useBetaProgram();

  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion' as const,
    title: '',
    description: ''
  });

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.title || !feedbackForm.description) return;

    const result = await submitFeedback(feedbackForm);
    if (result.data) {
      setFeedbackForm({
        type: 'suggestion',
        title: '',
        description: ''
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'development':
        return <Badge className="bg-blue-100 text-blue-700">En desarrollo</Badge>;
      case 'testing':
        return <Badge className="bg-green-100 text-green-700">En pruebas</Badge>;
      case 'planning':
        return <Badge variant="secondary">Planificación</Badge>;
      default:
        return <Badge variant="outline">En diseño</Badge>;
    }
  };

  const getFeedbackStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-100 text-green-700">Implementado</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-700">Revisado</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <PlanGate capability="early_access">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando programa beta...</p>
        </div>
      </PlanGate>
    );
  }

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

        {/* Estado de inscripción */}
        {!isEnrolled ? (
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
                  <li>• Acceso exclusivo a nuevas funcionalidades antes del lanzamiento</li>
                  <li>• Influencia directa en el desarrollo del producto</li>
                  <li>• Soporte técnico especializado para funciones beta</li>
                  <li>• Reconocimiento como usuario pionero</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={enrollInBeta}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Unirme al Beta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-green-700">¡Estás inscrito en el programa Beta!</h3>
                  <p className="text-sm text-green-600">Te notificaremos sobre nuevas funcionalidades exclusivas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                      {getStatusBadge(feature.status)}
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{feature.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {feature.availability}
                      </span>
                      {feature.interested_users && (
                        <span>{feature.interested_users.length} interesados</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    onClick={() => expressInterest(feature.id)}
                    disabled={!isEnrolled}
                  >
                    Me Interesa
                  </Button>
                </div>
              </div>
            ))}
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
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Feedback
                </label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="suggestion">Sugerencia de Funcionalidad</option>
                  <option value="bug">Reporte de Bug</option>
                  <option value="improvement">Mejora de Funcionalidad</option>
                  <option value="general">Feedback General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título
                </label>
                <Input 
                  placeholder="Título de tu sugerencia"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <Textarea 
                  placeholder="Describe tu sugerencia, bug o mejora en detalle..."
                  rows={4}
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={submitting || !feedbackForm.title || !feedbackForm.description}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tu feedback */}
        {userFeedback.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tu Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userFeedback.map((feedback) => (
                  <div key={feedback.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800">{feedback.title}</h4>
                        {getFeedbackStatusBadge(feedback.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{feedback.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(feedback.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
