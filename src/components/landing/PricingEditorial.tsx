import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingEditorial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const openWhatsApp = (plan: string) => {
    const phoneNumber = "5491144133576";
    const message = encodeURIComponent(`Hola! Me interesa el ${plan} de ProConnection. ¿Podrían darme más información?`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const features = [
    { icon: '📅', text: 'Agenda automática' },
    { icon: '💸', text: 'Pagos automatizados' },
    { icon: '📊', text: 'Reportes AFIP' },
    { icon: '👥', text: 'Gestión de pacientes' },
    { icon: '💬', text: 'Recordatorios automáticos' },
    { icon: '📈', text: 'Métricas de negocio' }
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-white-warm"
    >
      {/* Chapter header */}
      <div className={`text-center mb-16 sm:mb-24 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-petrol mb-6">
          Planes diseñados para psicólogos
        </h2>
        <p className="font-sans-geometric text-xl sm:text-2xl text-blue-petrol/80 max-w-3xl mx-auto leading-relaxed">
          Dejá atrás Excel y WhatsApp para siempre.{' '}
          <span className="font-bold text-blue-petrol">
            Todo automatizado desde el primer día.
          </span>
        </p>
      </div>

      {/* Three brutalist blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-7xl mx-auto">
        {/* Plan Starter */}
        <div
          className={`flex flex-col bg-white-warm border-4 border-blue-petrol/30 rounded-2xl p-8 sm:p-12 shadow-[12px_12px_0px_0px_rgba(26,26,26,0.1)] hover:shadow-[16px_16px_0px_0px_rgba(26,26,26,0.15)] hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
        >
          <div className="flex-1">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-blue-petrol" />
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-blue-petrol">
                Plan Starter
              </h3>
            </div>
            <div className="font-serif-display text-4xl sm:text-5xl font-bold text-blue-petrol mb-2">
              $15
            </div>
            <div className="font-sans-geometric text-blue-petrol/70 text-lg">USD /mes</div>
            <div className="font-sans-geometric text-sm text-blue-petrol/60 mt-2">
              Funcionalidades esenciales
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-mint flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol/80 text-sm">Dashboard básico</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-mint flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol/80 text-sm">Gestión de Pacientes (CRM simple)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-mint flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol/80 text-sm">Calendario & Programación de Citas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-mint flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol/80 text-sm">Solicitudes de Citas (recibir y aprobar)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-mint flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol/80 text-sm">Gestión de Tarifas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-mint flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol/80 text-sm">Centro de Notificaciones básicas</span>
            </li>
          </ul>
          </div>

          <Link to="/register">
            <Button
              className="w-full font-sans-geometric text-base px-6 py-4 bg-white-warm border-4 border-blue-petrol/30 text-blue-petrol shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
            >
              Empezar ahora
            </Button>
          </Link>
        </div>

        {/* Plan ProConnection - Featured */}
        <div
          className={`flex flex-col relative bg-blue-soft/10 border-4 border-blue-soft rounded-2xl p-8 sm:p-12 shadow-[12px_12px_0px_0px_rgba(108,175,240,0.25)] hover:shadow-[16px_16px_0px_0px_rgba(108,175,240,0.3)] hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-soft text-white px-6 py-2 rounded-full border-4 border-blue-petrol/30 shadow-lg font-sans-geometric font-bold text-sm">
              Más elegido
            </div>
          </div>

          <div className="flex-1">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-sand-light" />
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-blue-petrol">
                Plan ProConnection
              </h3>
            </div>
            <div className="font-serif-display text-4xl sm:text-5xl font-bold text-blue-petrol mb-2">
              $39
            </div>
            <div className="font-sans-geometric text-blue-petrol/80 text-lg">USD /mes</div>
            <div className="font-sans-geometric text-sm text-blue-petrol/70 mt-2">
              Todo del Plan Starter +
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Finanzas (Sistema Contable Mensual completo)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Validación de Comprobantes</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Documentos (historial clínico, notas)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Reportes Avanzados</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Perfil SEO (para aparecer en búsquedas)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Notificaciones avanzadas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-petrol flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-blue-petrol font-semibold text-sm">Soporte prioritario</span>
            </li>
          </ul>
          </div>

          <Button
            onClick={() => openWhatsApp('Plan ProConnection')}
            className="w-full font-sans-geometric text-base px-6 py-4 bg-blue-soft text-white border-4 border-blue-petrol/30 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
          >
            Contactar para activar
          </Button>
        </div>

        {/* Plan Teams */}
        <div
          className={`flex flex-col bg-white-warm border-4 border-purple-500/30 rounded-2xl p-8 sm:p-12 shadow-[12px_12px_0px_0px_rgba(26,26,26,0.1)] hover:shadow-[16px_16px_0px_0px_rgba(26,26,26,0.15)] hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex-1">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-purple-700">
                Plan Teams
              </h3>
            </div>
            <div className="font-serif-display text-4xl sm:text-5xl font-bold text-purple-700 mb-2">
              $99
            </div>
            <div className="font-sans-geometric text-purple-600/80 text-lg">USD /mes</div>
            <div className="font-sans-geometric text-sm text-purple-600/70 mt-2">
              Todo del Plan ProConnection +
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Multiusuario (agregar otros psicólogos/asistentes)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Gestión de equipo (permisos, roles)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Reportes de Clínica (consolidados)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Early Access (nuevas features antes)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Consultoría de Visibilidad PRO</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Integraciones (APIs para sistemas externos)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Soporte dedicado</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="font-sans-geometric text-purple-700 font-semibold text-sm">Dashboard de administración</span>
            </li>
          </ul>
          </div>

          <Button
            onClick={() => openWhatsApp('Plan Teams')}
            className="w-full font-sans-geometric text-base px-6 py-4 bg-white-warm border-4 border-purple-500/30 text-blue-petrol shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
          >
            Contactar para activar
          </Button>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`text-center p-6 bg-gray-light border-2 border-blue-petrol/30/10 rounded-xl hover:border-blue-soft hover:shadow-lg transition-all duration-300 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
            style={{ animationDelay: `${400 + index * 50}ms` }}
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <div className="font-sans-geometric text-sm font-semibold text-blue-petrol">
              {feature.text}
            </div>
          </div>
        ))}
      </div>

      {/* Guarantee */}
      <div
        className={`text-center bg-sand-light/50 border-4 border-sand-light rounded-2xl p-8 max-w-3xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: '700ms' }}
      >
        <p className="font-serif-display text-2xl sm:text-3xl font-bold text-blue-petrol mb-2">
          Garantía de satisfacción 30 días
        </p>
        <p className="font-sans-geometric text-lg text-blue-petrol/80">
          Si no te sirve, no pagás. Sin preguntas.
        </p>
      </div>
    </section>
  );
};

