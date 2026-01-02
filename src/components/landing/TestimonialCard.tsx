import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, TrendingUp, Users } from 'lucide-react';

interface TestimonialCardProps {
  avatar: string;
  name: string;
  specialty: string;
  location: string;
  monthsUsing: number;
  beforeText: string;
  afterText: string;
  metrics: {
    timeSaved: string;
    patientsIncrease?: string;
    revenueIncrease?: string;
  };
  rating: number;
  quote: string;
}

export const TestimonialCard = ({
  avatar,
  name,
  specialty,
  location,
  monthsUsing,
  beforeText,
  afterText,
  metrics,
  rating,
  quote
}: TestimonialCardProps) => {
  return (
    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
      <CardContent className="p-6">
        {/* Header con avatar e info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img 
              src={avatar} 
              alt={`Avatar de ${name}, ${specialty}`}
              loading="lazy"
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-colors duration-300" 
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 text-lg">{name}</h4>
            <p className="text-slate-600 text-sm">{specialty}</p>
            <p className="text-slate-500 text-xs">{location}</p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">Usa ProConnection hace {monthsUsing} meses</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
            />
          ))}
          <span className="text-sm text-slate-600 ml-2 font-semibold">{rating}/5</span>
        </div>

        {/* Quote principal */}
        <blockquote className="text-slate-700 mb-6 italic leading-relaxed">
          "{quote}"
        </blockquote>

        {/* Antes vs Después */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg min-h-[120px] flex flex-col">
            <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <span className="text-lg">😰</span>
              Antes
            </h5>
            <p className="text-red-600 text-sm flex-1">{beforeText}</p>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg min-h-[120px] flex flex-col">
            <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <span className="text-lg">😊</span>
              Ahora
            </h5>
            <p className="text-green-600 text-sm flex-1">{afterText}</p>
          </div>
        </div>

        {/* Métricas específicas */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h6 className="font-semibold text-slate-800 mb-4 text-center">Resultados específicos:</h6>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Clock className="w-6 h-6 text-blue-500 mb-2" />
              <div className="text-lg font-bold text-slate-800">{metrics.timeSaved}</div>
              <div className="text-xs text-slate-600 mt-1">Tiempo ahorrado</div>
            </div>
            {metrics.patientsIncrease && (
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 text-green-500 mb-2" />
                <div className="text-lg font-bold text-slate-800">{metrics.patientsIncrease}</div>
                <div className="text-xs text-slate-600 mt-1">Más pacientes</div>
              </div>
            )}
            {metrics.revenueIncrease && (
              <div className="flex flex-col items-center">
                <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
                <div className="text-lg font-bold text-slate-800">{metrics.revenueIncrease}</div>
                <div className="text-xs text-slate-600 mt-1">Más facturado</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal con testimonios específicos
export const TestimonialsSection = () => {
  const testimonials = [
    {
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      name: "Dra. Alejandra García",
      specialty: "Psicóloga Clínica",
      location: "Buenos Aires, Argentina",
      monthsUsing: 8,
      beforeText: "Perdía 2 horas por día confirmando turnos por WhatsApp y persiguiendo pagos",
      afterText: "Los pacientes se agendan solos y pagan automáticamente. Solo recibo notificaciones",
      metrics: {
        timeSaved: "10h/semana",
        patientsIncrease: "+5 pacientes/mes",
        revenueIncrease: "$400k más"
      },
      rating: 5,
      quote: "Antes perdía 2 horas por día con Excel y WhatsApp. Ahora todo se hace solo. Ahorro 10 horas por semana y tengo más tiempo para mis pacientes."
    },
    {
      avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      name: "Dr. Fernando Mendoza",
      specialty: "Psicoterapeuta",
      location: "Córdoba, Argentina",
      monthsUsing: 12,
      beforeText: "Pasaba 5 horas por mes armando reportes para AFIP y siempre tenía miedo de cometer errores",
      afterText: "ProConnection genera todo automáticamente. Nunca más errores en monotributo",
      metrics: {
        timeSaved: "5h/mes",
        patientsIncrease: "+3 pacientes/mes",
        revenueIncrease: "$250k más"
      },
      rating: 5,
      quote: "La contabilidad AFIP era un dolor de cabeza. Ahora ProConnection genera todo automáticamente. Nunca más errores en monotributo."
    },
    {
      avatar: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      name: "Dr. Matías Schmidt",
      specialty: "Psicólogo Infantil",
      location: "Rosario, Argentina",
      monthsUsing: 6,
      beforeText: "Confirmaba turnos a las 11 PM y perdía tiempo persiguiendo pagos por WhatsApp",
      afterText: "Configuré todo en 5 minutos. Los pacientes se agendan solos y pagan por MercadoPago",
      metrics: {
        timeSaved: "8h/semana",
        patientsIncrease: "+4 pacientes/mes",
        revenueIncrease: "$300k más"
      },
      rating: 5,
      quote: "Los pacientes se agendan solos y pagan por MercadoPago. Yo solo recibo la notificación. Configuré todo en 5 minutos y nunca más Excel."
    }
  ];

  return (
    <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 px-4">
          Psicólogos que ya dejaron Excel y WhatsApp atrás
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4">
          Más tiempo para sus pacientes. 
          <span className="font-semibold text-slate-800">Resultados reales en números.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            avatar={testimonial.avatar}
            name={testimonial.name}
            specialty={testimonial.specialty}
            location={testimonial.location}
            monthsUsing={testimonial.monthsUsing}
            beforeText={testimonial.beforeText}
            afterText={testimonial.afterText}
            metrics={testimonial.metrics}
            rating={testimonial.rating}
            quote={testimonial.quote}
          />
        ))}
      </div>

      {/* CTA después de testimonios */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            ¿Querés los mismos resultados?
          </h3>
          <p className="text-slate-600 mb-6">
            Únete a 500+ psicólogos que ya ahorran tiempo y facturan más
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
              Probá gratis 14 días
            </button>
            <button className="border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200">
              Ver más testimonios
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
