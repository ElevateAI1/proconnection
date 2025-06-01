
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Sparkles, Zap, Star } from 'lucide-react';
import { SubscriptionPlans } from './SubscriptionPlans';
import { useMercadoPago } from '@/hooks/useMercadoPago';

interface TrialExpiredModalProps {
  onUpgrade: () => void;
}

export const TrialExpiredModal = ({ onUpgrade }: TrialExpiredModalProps) => {
  const { createSubscription } = useMercadoPago();

  const handlePlanSelect = async (planId: string) => {
    try {
      await createSubscription(planId);
      onUpgrade();
    } catch (error) {
      console.error('Error selecting plan:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/85 to-blue-900/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative">
        {/* Floating elements for visual appeal */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-gradient-to-r from-blue-400/25 to-cyan-400/25 rounded-full blur-xl animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 -left-12 w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-lg animate-float" style={{animationDelay: '0.8s'}}></div>
        
        <Card className="w-full max-w-5xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 via-slate-50/95 to-purple-50/90 backdrop-blur-xl animate-fade-in-scale">
          <CardHeader className="text-center relative overflow-hidden pb-8">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/50">
                <Clock className="w-12 h-12 text-white animate-pulse" />
              </div>
              
              <CardTitle className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  ¡Tu Período de Prueba ha Finalizado!
                </span>
              </CardTitle>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                <p className="text-xl text-slate-700 font-semibold">
                  Continúa potenciando tu práctica profesional
                </p>
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </div>
              
              <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                No pierdas el momentum de tu crecimiento profesional. Elige tu plan y mantén 
                el control total de tu práctica.
              </p>
            </div>
          </CardHeader>

          <CardContent className="relative px-8 pb-8">
            {/* Benefits section */}
            <div className="text-center mb-10 relative">
              <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/60 rounded-2xl p-8 mb-8 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-700">
                    ¿Qué estás perdiendo sin una suscripción activa?
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 text-base">
                  <div className="flex items-center gap-3 text-red-600 bg-white/50 rounded-lg p-4">
                    <Star className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Gestión de pacientes</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-600 bg-white/50 rounded-lg p-4">
                    <Star className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Sistema de citas</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-600 bg-white/50 rounded-lg p-4">
                    <Star className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Reportes profesionales</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 border border-emerald-200/60 rounded-2xl p-8 mb-10 shadow-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-3xl font-bold text-emerald-700 mb-4">
                  ¡Reactiva tu cuenta ahora!
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto">
                  Elige el plan perfecto para tu práctica profesional y continúa 
                  brindando el mejor servicio a tus pacientes con todas las herramientas 
                  que PsiConnect tiene para ofrecerte.
                </p>
              </div>
            </div>

            {/* Enhanced subscription plans */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100/40 to-blue-100/40 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/60 shadow-2xl">
                <SubscriptionPlans onPlanSelect={handlePlanSelect} />
              </div>
            </div>

            {/* Trust indicators */}
            <div className="text-center mt-10 space-y-6">
              <div className="flex items-center justify-center gap-8 text-base text-slate-600">
                <div className="flex items-center gap-3 bg-white/60 rounded-full px-6 py-3 shadow-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Pago 100% Seguro</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-full px-6 py-3 shadow-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-full px-6 py-3 shadow-sm">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Soporte 24/7</span>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Más de 1,000 profesionales confían en PsiConnect para gestionar su práctica diaria.
                Únete a ellos y experimenta la diferencia que marca tener las herramientas adecuadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
