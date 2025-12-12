
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, MessageCircle, Star, Crown, Zap, Sparkles, Users } from 'lucide-react';

interface Plan {
  id: string;
  plan_key: string;
  title: string;
  price_display: string;
  features: string[];
  is_recommended: boolean;
  is_premium?: boolean;
  savings_text?: string;
}

interface SubscriptionPlansProps {
  hideHeader?: boolean;
}

export const SubscriptionPlans = ({ hideHeader = false }: SubscriptionPlansProps = {}) => {
  const plans: Plan[] = [
    {
      id: 'starter',
      plan_key: 'starter',
      title: 'Plan Starter',
      price_display: '$15',
      is_recommended: false,
      features: [
        'Dashboard básico',
        'Gestión de Pacientes (CRM simple)',
        'Calendario & Programación de Citas',
        'Solicitudes de Citas (recibir y aprobar)',
        'Gestión de Tarifas (fijar precios para pacientes)',
        'Centro de Notificaciones básicas'
      ]
    },
    {
      id: 'proconnection',
      plan_key: 'proconnection',
      title: 'Plan ProConnection',
      price_display: '$39',
      is_recommended: true,
      savings_text: '⭐ Más elegido',
      features: [
        'Todo del Plan Starter',
        'Finanzas (Sistema Contable Mensual completo)',
        'Validación de Comprobantes (manejo de pagos/facturas)',
        'Documentos (historial clínico, notas, adjuntos)',
        'Reportes Avanzados (análisis y estadísticas mensuales)',
        'Perfil SEO (para aparecer en búsquedas)',
        'Notificaciones avanzadas (recordatorios automáticos a pacientes)',
        'Soporte prioritario'
      ]
    },
    {
      id: 'teams',
      plan_key: 'teams',
      title: 'Plan Teams',
      price_display: '$99',
      is_recommended: false,
      is_premium: true,
      features: [
        'Todo del Plan ProConnection',
        'Multiusuario (agregar otros psicólogos/asistentes)',
        'Gestión de equipo (permisos, roles, asignación de pacientes)',
        'Reportes de Clínica (consolidados, visibilidad global)',
        'Early Access (nuevas features antes que otros)',
        'Consultoría de Visibilidad PRO (SEO avanzado, marketing)',
        'Integraciones (APIs para sistemas externos, facturación)',
        'Soporte dedicado (llamadas, onboarding)',
        'Dashboard de administración (métricas de equipo, ingresos consolidados)'
      ]
    }
  ];

  const openWhatsApp = (planTitle: string) => {
    const phoneNumber = "5491144133576";
    const message = `Hola! Quiero contratar el ${planTitle} de ProConnection`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={hideHeader ? "py-0" : "py-4 sm:py-8"}>
      {!hideHeader && (
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
            Elige tu Plan de Suscripción
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4 sm:px-0">
            Selecciona el plan que mejor se adapte a tus necesidades profesionales. 
            Todos los planes incluyen acceso completo a la plataforma.
          </p>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 ${hideHeader ? 'max-w-full px-0' : 'max-w-7xl mx-auto px-4'}`}>
        {plans.map((plan) => {
          const isProConnection = plan.plan_key === 'proconnection';
          const isTeams = plan.plan_key === 'teams';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative border-2 transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
                isProConnection 
                  ? 'border-amber-400 shadow-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' 
                  : isTeams
                  ? 'border-blue-petrol/30 shadow-md hover:scale-[1.02]'
                  : 'border-slate-200 shadow-md hover:scale-[1.02]'
              }`}
            >
              {isProConnection && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white px-2 sm:px-3 py-1 text-xs font-bold shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {plan.savings_text || '⭐ Más Popular'}
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center pb-2 p-3 sm:p-4 ${isProConnection ? 'pt-6 sm:pt-7' : 'pt-3 sm:pt-4'}`}>
                <CardTitle className={`text-base sm:text-lg font-bold flex items-center justify-center gap-1.5 ${
                  isProConnection ? 'text-amber-700' : isTeams ? 'text-blue-petrol' : 'text-slate-800'
                }`}>
                  {isTeams ? (
                    <Users className="w-4 h-4 text-blue-petrol" />
                  ) : isProConnection ? (
                    <Zap className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Star className="w-4 h-4 text-blue-500" />
                  )}
                  {plan.title}
                </CardTitle>
                <div className="mt-2">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    isProConnection 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent' 
                      : isTeams 
                      ? 'text-blue-petrol' 
                      : 'text-blue-600'
                  }`}>
                    {plan.price_display}
                  </span>
                  <span className="text-slate-500 ml-1 text-xs sm:text-sm">USD / mes</span>
                </div>
                {isProConnection && (
                  <div className="mt-1.5">
                    <p className="text-xs text-amber-700 font-semibold bg-amber-100/50 rounded-full px-2 py-0.5 inline-block">
                      💎 Mejor relación precio/valor
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-2 p-3 sm:p-4 flex flex-col flex-1">
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                        isProConnection ? 'text-amber-600' : isTeams ? 'text-green-500' : 'text-green-500'
                      }`} />
                      <span className={`text-xs sm:text-sm leading-tight ${
                        isProConnection || isTeams ? 'text-slate-700 font-medium' : 'text-slate-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => openWhatsApp(plan.title)}
                  className={`w-full py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-300 mt-auto !text-white ${
                    isProConnection
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : isTeams
                      ? 'bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1'
                      : 'bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1'
                  }`}
                  size="sm"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Contactar por WhatsApp
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!hideHeader && (
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto px-4 sm:px-0">
            Contacta con nosotros por WhatsApp para coordinar el pago y activación de tu plan.
          </p>
        </div>
      )}
    </div>
  );
};
