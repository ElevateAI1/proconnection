import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export const CTAFinal = () => {
  return (
    <section className="relative bg-gradient-to-b from-blue-petrol via-blue-petrol/95 to-blue-petrol py-20 sm:py-32 overflow-hidden">
      {/* Particle dust effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sand-light/50 rounded-full animate-particle-dust"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle blue glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-soft/20 via-transparent to-blue-soft/20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title - Serif */}
        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ordená tu práctica y dejá Excel y WhatsApp atrás para siempre
        </h2>

        {/* Subtitle */}
        <p className="font-sans-geometric text-xl sm:text-2xl text-white-warm/90 mb-12 leading-relaxed max-w-2xl mx-auto">
          Probá gratis 14 días, sin tarjeta, sin compromiso.
        </p>

        {/* CTA Buttons - Brutalist */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register">
            <Button
              size="lg"
              className="font-sans-geometric text-xl px-12 py-7 bg-white-warm text-blue-petrol border-4 border-sand-light shadow-[12px_12px_0px_0px_rgba(230,220,197,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(230,220,197,0.4)] hover:translate-x-2 hover:translate-y-2 transition-all duration-200"
            >
              Probá gratis 14 días
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              size="lg"
              variant="outline"
              className="font-sans-geometric text-xl px-12 py-7 border-4 border-white-warm text-white-warm bg-transparent hover:bg-white-warm/10 hover:border-sand-light transition-all duration-200"
            >
              <Play className="w-6 h-6 mr-2" />
              Ver demo en 60 segundos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

