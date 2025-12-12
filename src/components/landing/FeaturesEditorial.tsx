import { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  benefit: string;
  impact: string;
  illustration: 'payments' | 'calendar' | 'afip';
  index: number;
}

const FeatureCard = ({ title, subtitle, benefit, impact, illustration, index }: FeatureCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const getCardColors = () => {
    switch (illustration) {
      case 'payments':
        return {
          bg: 'bg-sand-light/30',
          border: 'border-sand-light',
          accent: 'text-blue-petrol',
          shadow: 'shadow-[8px_8px_0px_0px_rgba(230,220,197,0.3)]'
        };
      case 'calendar':
        return {
          bg: 'bg-celeste-gray/30',
          border: 'border-blue-soft',
          accent: 'text-blue-petrol',
          shadow: 'shadow-[8px_8px_0px_0px_rgba(108,175,240,0.3)]'
        };
      case 'afip':
        return {
          bg: 'bg-white-warm',
          border: 'border-lavender-soft',
          accent: 'text-blue-petrol',
          shadow: 'shadow-[8px_8px_0px_0px_rgba(201,194,230,0.3)]'
        };
    }
  };

  const colors = getCardColors();

  return (
    <div
      ref={cardRef}
      className={`${colors.bg} border-4 ${colors.border} ${colors.shadow} rounded-2xl p-8 sm:p-12 transition-all duration-500 hover:scale-[1.02] hover:rotate-1 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Layout asimétrico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Content */}
        <div className="space-y-6">
          {/* Renaissance illustration icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sand-light/30 to-lavender-soft/30 flex items-center justify-center border-4 border-sand-light/40 mb-4">
            <div className="text-4xl">
              {illustration === 'payments' && '💸'}
              {illustration === 'calendar' && '📅'}
              {illustration === 'afip' && '📊'}
            </div>
          </div>

          {/* Title - Serif */}
          <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-blue-petrol leading-tight">
            {title}
          </h3>

          {/* Subtitle */}
          <p className="font-sans-geometric text-lg text-blue-petrol/80 leading-relaxed">
            {subtitle}
          </p>

          {/* Benefit */}
          <div className="bg-white-warm/80 border-2 border-blue-petrol/10 rounded-lg p-4">
            <p className="font-sans-geometric font-semibold text-blue-petrol">
              {benefit}
            </p>
          </div>

          {/* Impact metric */}
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-6 h-6 ${colors.accent}`} />
            <span className="font-sans-geometric font-bold text-blue-petrol">
              {impact}
            </span>
          </div>
        </div>

        {/* Right: Floating UI Mockup */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div className="relative bg-white-warm rounded-xl shadow-xl border-4 border-blue-petrol/20 p-6 transform hover:rotate-y-2 transition-transform duration-300" style={{ transformStyle: 'preserve-3d' }}>
            {/* Mock UI content based on illustration type */}
            {illustration === 'payments' && (
              <div className="space-y-3">
                  <div className="h-4 bg-blue-soft/30 rounded w-3/4" />
                  <div className="h-20 bg-green-mint/30 rounded-lg border-2 border-green-mint/40" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-sand-light/30 rounded border-2 border-sand-light/40" />
                    <div className="h-12 bg-lavender-soft/30 rounded border-2 border-lavender-soft/40" />
                </div>
              </div>
            )}
            {illustration === 'calendar' && (
              <div className="space-y-3">
                  <div className="h-4 bg-blue-soft/30 rounded w-2/3" />
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(21)].map((_, i) => (
                      <div key={i} className={`h-8 rounded ${i % 7 === 0 ? 'bg-blue-soft/30' : 'bg-gray-light'}`} />
                    ))}
                  </div>
                  <div className="h-16 bg-blue-soft/20 rounded border-2 border-blue-soft/30" />
              </div>
            )}
            {illustration === 'afip' && (
              <div className="space-y-3">
                  <div className="h-4 bg-lavender-soft/30 rounded w-full" />
                  <div className="space-y-2">
                    <div className="h-3 bg-lavender-soft/25 rounded w-full" />
                    <div className="h-3 bg-lavender-soft/25 rounded w-5/6" />
                    <div className="h-3 bg-lavender-soft/25 rounded w-4/6" />
                  </div>
                  <div className="h-24 bg-gray-light rounded border-2 border-gray-warm/30" />
                  <div className="h-8 bg-lavender-soft/30 rounded w-1/3" />
              </div>
            )}

            {/* Floating chips */}
            <div className="absolute -top-3 -right-3 bg-green-mint text-blue-petrol px-2 py-1 rounded border-2 border-blue-petrol/30 shadow-lg font-sans-geometric text-xs font-bold animate-bounce">
              ✓ Automático
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeaturesEditorial = () => {
  const features = [
    {
      title: "Dejá de perseguir pagos y mandar CBU por WhatsApp",
      subtitle: "Con ProConnection, los pacientes pagan automáticamente por MercadoPago antes de la sesión. Vos recibís el dinero al instante y se registra todo en contabilidad.",
      benefit: "Pagos confirmados automáticamente",
      impact: "Ahorrá 3-5 horas / mes persiguiendo pagos",
      illustration: 'payments' as const
    },
    {
      title: "No más confirmaciones de turnos uno por uno",
      subtitle: "Tu agenda se sincroniza automáticamente. Los pacientes ven tu disponibilidad en tiempo real, eligen horario y reciben confirmación instantánea.",
      benefit: "Agenda llena sin esfuerzo",
      impact: "Evitá confirmaciones a las 11 PM",
      illustration: 'calendar' as const
    },
    {
      title: "Olvidate de pasar horas en Excel para AFIP",
      subtitle: "ProConnection genera automáticamente todos los reportes que necesitás para AFIP. Facturación, ingresos, gastos... todo listo para presentar con un click.",
      benefit: "Reportes AFIP en 1 click",
      impact: "Ahorrá 5+ horas / mes en contabilidad",
      illustration: 'afip' as const
    }
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-white-warm">
      {/* Chapter header */}
      <div className="text-center mb-16 sm:mb-24">
        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-petrol mb-6">
          Dejá atrás Excel y WhatsApp
        </h2>
        <p className="font-sans-geometric text-xl sm:text-2xl text-blue-petrol/80 max-w-3xl mx-auto leading-relaxed">
          Estas son las 3 cosas que más tiempo te roban como psicólogo.{' '}
          <span className="font-bold text-blue-petrol">
            ProConnection las automatiza completamente.
          </span>
        </p>
      </div>

      {/* Feature cards */}
      <div className="space-y-12 sm:space-y-16">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            {...feature}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

