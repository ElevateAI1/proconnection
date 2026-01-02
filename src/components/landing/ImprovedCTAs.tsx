import { Button } from '@/components/ui/button';
import { CheckCircle, Play, Shield, CreditCard, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImprovedCTAs = () => {
  return (
    <div className="space-y-6">
      {/* CTAs principales */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {/* CTA Principal */}
        <Link to="/register">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 text-lg font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden min-w-[200px]"
          >
            <span className="relative z-10">Probá gratis 14 días</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Button>
        </Link>

        {/* CTA Secundario */}
        <Link to="/demo">
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-4 text-lg font-semibold hover:scale-105 hover:shadow-lg hover:bg-slate-50 transition-all duration-300 border-2 border-slate-300 hover:border-blue-400 min-w-[200px] group"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Ver demo (60 seg)
          </Button>
        </Link>
      </div>

      {/* Trust badges */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-3 h-3 text-green-600" />
          </div>
          <span className="font-medium">Sin tarjeta de crédito</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-green-600" />
          </div>
          <span className="font-medium">Cancelá cuando quieras</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="w-3 h-3 text-green-600" />
          </div>
          <span className="font-medium">Setup en 5 minutos</span>
        </div>
      </div>

      {/* Texto de garantía */}
      <div className="text-center">
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          <span className="font-semibold text-slate-700">Garantía de 30 días:</span> Si no ahorrás al menos 5 horas en tu primera semana, te devolvemos el dinero.
        </p>
      </div>
    </div>
  );
};

// Componente para mostrar estadísticas de confianza
export const TrustStats = () => {
  return (
    <div className="bg-slate-50 rounded-xl p-6 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-slate-800 mb-1">500+</div>
          <div className="text-sm text-slate-600">Psicólogos activos</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 mb-1">4.9/5</div>
          <div className="text-sm text-slate-600">Calificación promedio</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 mb-1">10h</div>
          <div className="text-sm text-slate-600">Ahorradas/semana</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 mb-1">98%</div>
          <div className="text-sm text-slate-600">Satisfacción</div>
        </div>
      </div>
    </div>
  );
};
