import { useState, useEffect } from 'react';
import { X, Clock, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UrgencyBannerProps {
  variant?: 'A' | 'B' | 'C';
  onClose?: () => void;
}

export const UrgencyBanner = ({ variant = 'A', onClose }: UrgencyBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const getVariantContent = () => {
    switch (variant) {
      case 'A': // Escasez de cupos
        return {
          icon: <Users className="w-4 h-4" />,
          text: "Solo quedan 12 cupos para la prueba gratuita de 14 días",
          cta: "Reservar mi cupo",
          bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
          textColor: "text-white"
        };
      case 'B': // Descuento temporal
        return {
          icon: <Gift className="w-4 h-4" />,
          text: "50% OFF en el primer mes - Solo por tiempo limitado",
          cta: "Aprovechar descuento",
          bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
          textColor: "text-white"
        };
      case 'C': // Prueba extendida
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Prueba gratuita extendida de 30 días - Solo esta semana",
          cta: "Probar gratis 30 días",
          bgColor: "bg-gradient-to-r from-blue-500 to-purple-500",
          textColor: "text-white"
        };
    }
  };

  const content = getVariantContent();

  return (
    <div className={`${content.bgColor} ${content.textColor} py-3 px-4 sticky top-[73px] z-30 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left side - Icon + Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 animate-pulse">
            {content.icon}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm sm:text-base text-center">
              {content.text}
            </span>
            {variant === 'A' && (
              <div className="hidden sm:flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{timeLeft.hours}h {timeLeft.minutes}m</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side - CTA + Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs sm:text-sm px-3 py-1 h-auto"
            onClick={() => {
              if (variant === 'A') {
                // Para el botón "Reservar mi cupo" ir a la sección de pricing
                window.location.href = '/#pricing';
              } else {
                // Para otros casos, ir al registro
                window.location.href = '/register';
              }
            }}
          >
            {content.cta}
          </Button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para A/B testing con múltiples variantes
export const UrgencyBannerABTest = () => {
  const [currentVariant, setCurrentVariant] = useState<'A' | 'B' | 'C'>('A');

  // En producción, esto vendría de un servicio de A/B testing
  useEffect(() => {
    const variants: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    setCurrentVariant(randomVariant);
  }, []);

  return <UrgencyBanner variant={currentVariant} />;
};
