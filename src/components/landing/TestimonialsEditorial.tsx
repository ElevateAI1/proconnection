import { useState, useEffect, useRef } from 'react';
import { Star, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface Testimonial {
  name: string;
  city: string;
  monthsUsing: number;
  rating: number;
  metric: string;
  metricValue: string;
  before: string[];
  after: string[];
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "María González",
    city: "Buenos Aires",
    monthsUsing: 8,
    rating: 5,
    metric: "horas ahorradas",
    metricValue: "12h/semana",
    before: ["Desorden con Excel", "Confirmaciones manuales a las 11 PM", "Errores de cobro"],
    after: ["Agenda llena automática", "Pagos automatizados", "Más tiempo para pacientes"],
    quote: "Antes perdía 2 horas por día con Excel y WhatsApp. Ahora todo se hace solo. Ahorro 10 horas por semana y tengo más tiempo para mis pacientes."
  },
  {
    name: "Carlos Rodríguez",
    city: "Córdoba",
    monthsUsing: 12,
    rating: 5,
    metric: "pacientes/mes",
    metricValue: "+15",
    before: ["Confirmaba turnos manualmente", "Perdía tiempo persiguiendo pagos"],
    after: ["Los pacientes se agendan solos", "Pagos automáticos por MercadoPago"],
    quote: "Los pacientes se agendan solos y pagan por MercadoPago. Yo solo recibo la notificación. Configuré todo en 5 minutos y nunca más Excel."
  },
  {
    name: "Ana Martínez",
    city: "Rosario",
    monthsUsing: 6,
    rating: 5,
    metric: "facturación",
    metricValue: "+30%",
    before: ["Excel para AFIP", "Olvidos de cobros"],
    after: ["Reportes AFIP automáticos", "Pagos confirmados siempre"],
    quote: "Reportes AFIP en 1 click. Antes perdía horas armando todo manualmente. Ahora tengo más pacientes porque tengo más tiempo disponible."
  }
];

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
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

  return (
    <div
      ref={cardRef}
      className={`bg-white-warm border-4 border-blue-petrol/30 rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(62,95,120,0.15)] hover:shadow-[12px_12px_0px_0px_rgba(108,175,240,0.25)] hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar ilustrado + Info */}
        <div className="space-y-4">
          {/* Renaissance-futuristic avatar placeholder */}
          <div className="relative w-24 h-24 mx-auto md:mx-0">
            <div className="absolute inset-0 bg-gradient-to-br from-sand-light/40 via-lavender-soft/40 to-blue-soft/40 rounded-full border-4 border-sand-light/50" />
            <div className="absolute inset-4 bg-blue-petrol/80 rounded-full flex items-center justify-center">
              <span className="text-3xl font-serif-display font-bold text-white-warm">
                {testimonial.name[0]}
              </span>
            </div>
            {/* Soft glow */}
            <div className="absolute inset-0 bg-sand-light/25 rounded-full blur-xl -z-10" />
          </div>

          <div>
            <h4 className="font-serif-display text-2xl font-bold text-blue-petrol mb-1">
              {testimonial.name}
            </h4>
            <p className="font-sans-geometric text-blue-petrol/70 mb-2">{testimonial.city}</p>
            <p className="font-sans-geometric text-sm text-blue-petrol/60">
              {testimonial.monthsUsing} meses usando ProConnection
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-sand-light text-sand-light" />
            ))}
          </div>

          {/* Metric chip */}
          <div className="bg-green-mint/30 border-2 border-green-mint rounded-lg p-3">
            <p className="font-sans-geometric text-xs text-blue-petrol/70 mb-1 uppercase tracking-wide">
              {testimonial.metric}
            </p>
            <p className="font-serif-display text-2xl font-bold text-blue-petrol">
              {testimonial.metricValue}
            </p>
          </div>
        </div>

        {/* Center: Before / After */}
        <div className="space-y-6">
          {/* Before */}
          <div>
            <h5 className="font-sans-geometric font-bold text-peach-pale mb-3 uppercase text-sm tracking-wide">
              Antes
            </h5>
            <ul className="space-y-2">
              {testimonial.before.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div>
            <h5 className="font-sans-geometric font-bold text-green-mint mb-3 uppercase text-sm tracking-wide">
              Después
            </h5>
            <ul className="space-y-2">
              {testimonial.after.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-mint text-xl mt-1">✓</span>
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Quote */}
        <div className="flex flex-col justify-between">
          <blockquote className="font-serif-display text-lg text-blue-petrol leading-relaxed italic mb-4">
            "{testimonial.quote}"
          </blockquote>

          {/* Floating UI snippets */}
          <div className="space-y-2">
            <div className="bg-blue-soft/20 border-2 border-blue-soft/40 rounded-lg p-2 text-center">
              <div className="font-sans-geometric text-xs font-bold text-blue-petrol">✓ Pago confirmado</div>
            </div>
            <div className="bg-green-mint/20 border-2 border-green-mint/40 rounded-lg p-2 text-center">
              <div className="font-sans-geometric text-xs font-bold text-blue-petrol">📅 Cita confirmada</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsEditorial = () => {
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

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gray-light"
    >
      {/* Chapter header */}
      <div className={`text-center mb-16 sm:mb-24 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-petrol mb-6">
          Psicólogos que ya dejaron Excel y WhatsApp atrás
        </h2>
        <p className="font-sans-geometric text-xl sm:text-2xl text-blue-petrol/80 max-w-3xl mx-auto leading-relaxed">
          Más de 500 psicólogos ya automatizaron su práctica con ProConnection
        </p>
      </div>

      {/* Testimonial cards */}
      <div className="space-y-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} index={index} />
        ))}
      </div>
    </section>
  );
};

