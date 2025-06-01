
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/80 to-blue-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative">
        {/* Floating elements for visual appeal */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
        
        <Card className="w-full max-w-6xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-purple-50 backdrop-blur-xl animate-fade-in-scale">
          <CardHeader className="text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <CardTitle className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  ¡Tu Período de Prueba ha Finalizado!
                </span>
              </CardTitle>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                <p className="text-lg text-slate-700 font-medium">
                  Continúa potenciando tu práctica profesional
                </p>
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            {/* Benefits section */}
            <div className="text-center mb-8 relative">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-gradient-to-b from-red-400 to-orange-400 rounded-lg p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-red-700">
                    ¿Qué estás perdiendo sin una suscripción activa?
                  </h3>
                  <Zap className="w-6 h-6 text-red-500" />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-red-600">
                    <Star className="w-4 h-4" />
                    Gestión de pacientes
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <Star className="w-4 h-4" />
                    Sistema de citas
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <Star className="w-4 h-4" />
                    Reportes profesionales
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="text-2xl font-bold text-emerald-700 mb-3">
                  🚀 ¡Reactiva tu cuenta ahora!
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Elige el plan perfecto para tu práctica profesional y continúa 
                  brindando el mejor servicio a tus pacientes con todas las herramientas 
                  que PsiConnect tiene para ofrecerte.
                </p>
              </div>
            </div>

            {/* Enhanced subscription plans */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-blue-100/50 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl">
                <SubscriptionPlans onPlanSelect={handlePlanSelect} />
              </div>
            </div>

            {/* Trust indicators */}
            <div className="text-center mt-8 space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Pago 100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Soporte 24/7</span>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                Más de 1,000 profesionales confían en PsiConnect para gestionar su práctica diaria.
                Únete a ellos y experimenta la diferencia.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
