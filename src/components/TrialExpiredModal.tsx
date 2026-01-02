
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Sparkles, Zap, Star, X } from 'lucide-react';
import { SubscriptionPlans } from './SubscriptionPlans';

interface TrialExpiredModalProps {
  onUpgrade: () => void;
  onClose?: () => void;
}

export const TrialExpiredModal = ({ onUpgrade, onClose }: TrialExpiredModalProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/85 to-blue-900/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
      <div className="relative w-full">
        {/* Floating elements for visual appeal - hidden on mobile */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-float hidden sm:block"></div>
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-gradient-to-r from-blue-400/25 to-cyan-400/25 rounded-full blur-xl animate-float hidden sm:block" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 -left-12 w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-lg animate-float hidden sm:block" style={{animationDelay: '0.8s'}}></div>

        <Card className="w-full max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto border-0 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 via-slate-50/95 to-purple-50/90 backdrop-blur-xl animate-fade-in-scale">
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-lg hover:shadow-xl"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          )}

          <CardHeader className="text-center relative overflow-hidden pb-4 sm:pb-8">
            {/* Background decoration - simplified for mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl ring-4 ring-white/50">
                <Clock className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-white animate-pulse" />
              </div>
              
              <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  ¡Tu Período de Prueba ha Finalizado!
                </span>
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
                <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500 animate-pulse" />
                <p className="text-base sm:text-lg md:text-xl text-slate-700 font-semibold text-center">
                  Continúa potenciando tu práctica profesional
                </p>
                <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500 animate-pulse hidden sm:block" />
              </div>
              
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                No pierdas el momentum de tu crecimiento profesional. Elige tu plan y mantén 
                el control total de tu práctica.
              </p>
            </div>
          </CardHeader>

          <CardContent className="relative px-4 sm:px-6 md:px-8 pb-4 sm:pb-8">
            {/* Benefits section */}
            <div className="text-center mb-6 sm:mb-10 relative">
              <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-lg backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-700 text-center">
                    ¿Qué estás perdiendo sin una suscripción activa?
                  </h3>
                </div>
                
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-6 text-sm sm:text-base">
                  <div className="flex items-center gap-3 text-red-600 bg-white/50 rounded-lg p-3 sm:p-4">
                    <Star className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">Gestión de pacientes</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-600 bg-white/50 rounded-lg p-3 sm:p-4">
                    <Star className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">Sistema de citas</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-600 bg-white/50 rounded-lg p-3 sm:p-4">
                    <Star className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">Reportes profesionales</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 border border-emerald-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-10 shadow-lg backdrop-blur-sm">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl">🚀</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-700 mb-3 sm:mb-4">
                  ¡Reactiva tu cuenta ahora!
                </h3>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto px-2 sm:px-0">
                  Elige el plan perfecto para tu práctica profesional y continúa 
                  brindando el mejor servicio a tus pacientes con todas las herramientas 
                  que ProConnection tiene para ofrecerte.
                </p>
              </div>
            </div>

            {/* Enhanced subscription plans */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100/40 to-blue-100/40 rounded-2xl sm:rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/60 shadow-2xl">
                <SubscriptionPlans />
              </div>
            </div>

            {/* Trust indicators */}
            <div className="text-center mt-6 sm:mt-10 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base text-slate-600">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-sm">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Pago 100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-sm">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white/60 rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-sm">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Soporte 24/7</span>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                Más de 1,000 profesionales confían en ProConnection para gestionar su práctica diaria.
                Únete a ellos y experimenta la diferencia que marca tener las herramientas adecuadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
