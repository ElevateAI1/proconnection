import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, CreditCard, Calendar, FileText, Play } from 'lucide-react';

interface FeatureCardProps {
  emoji: string;
  headline: string;
  painPoint: string;
  solution: string;
  benefits: string[];
  demoPlaceholder?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FeatureCard = ({ 
  emoji, 
  headline, 
  painPoint, 
  solution, 
  benefits, 
  demoPlaceholder,
  icon: Icon 
}: FeatureCardProps) => {
  return (
    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02] overflow-hidden">
      <CardContent className="p-8">
        {/* Header con emoji y headline */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{emoji}</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
            {headline}
          </h3>
        </div>

        {/* Pain point destacado */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <p className="text-slate-700 font-medium italic">
            "{painPoint}"
          </p>
        </div>

        {/* Solución */}
        <div className="mb-6">
          <p className="text-slate-600 leading-relaxed">
            {solution}
          </p>
        </div>

        {/* Beneficios con checkmarks */}
        <div className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-slate-700 text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Demo placeholder */}
        {demoPlaceholder && (
          <div className="bg-slate-100 rounded-lg p-6 text-center group-hover:bg-slate-200 transition-colors duration-300">
            <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-400 transition-colors duration-300">
              <Play className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-600 text-sm font-medium">{demoPlaceholder}</p>
          </div>
        )}

        {/* Icono decorativo */}
        <div className="flex justify-center mt-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal con las 3 features
export const FeaturesSection = () => {
  const features = [
    {
      emoji: "💸",
      headline: "Dejá de perseguir pagos por WhatsApp",
      painPoint: "¿Cuántas veces te escribieron 'te transfiero mañana' y nunca llegó el pago?",
      solution: "Con ProConnection, los pacientes pagan automáticamente por MercadoPago antes de la sesión. Vos recibís el dinero al instante y se registra todo en contabilidad.",
      benefits: [
        "Pagos automáticos antes de cada sesión",
        "Integración completa con MercadoPago",
        "Registro automático en contabilidad AFIP",
        "Recordatorios automáticos de pagos pendientes"
      ],
      demoPlaceholder: "Ver demo: Cómo funciona el pago automático",
      icon: CreditCard
    },
    {
      emoji: "📅",
      headline: "No más confirmaciones de turnos a las 11 PM",
      painPoint: "¿Te despertaste a las 11 PM porque un paciente te escribió '¿mañana a las 9 está bien?'",
      solution: "Tu agenda se sincroniza automáticamente. Los pacientes ven tu disponibilidad en tiempo real, eligen horario y reciben confirmación instantánea. Vos solo recibís la notificación.",
      benefits: [
        "Agenda sincronizada en tiempo real",
        "Los pacientes se agendan solos",
        "Recordatorios automáticos por WhatsApp",
        "Sincronización con Google Calendar"
      ],
      demoPlaceholder: "Ver demo: Cómo funciona la agenda automática",
      icon: Calendar
    },
    {
      emoji: "📊",
      headline: "Olvidate de pasar horas en Excel para AFIP",
      painPoint: "¿Cuántas horas perdiste este mes armando reportes para monotributo y temiendo cometer errores?",
      solution: "ProConnection genera automáticamente todos los reportes que necesitás para AFIP. Facturación, ingresos, gastos... todo listo para presentar con un click.",
      benefits: [
        "Reportes automáticos para monotributo",
        "Facturación automática por cada sesión",
        "Cálculo automático de impuestos",
        "Exportación directa para AFIP"
      ],
      demoPlaceholder: "Ver demo: Cómo funciona la contabilidad automática",
      icon: FileText
    }
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 px-4">
          Dejá atrás Excel y WhatsApp para siempre
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4">
          Estas son las 3 cosas que más tiempo te roban como psicólogo. 
          <span className="font-semibold text-slate-800">ProConnection las automatiza completamente.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            emoji={feature.emoji}
            headline={feature.headline}
            painPoint={feature.painPoint}
            solution={feature.solution}
            benefits={feature.benefits}
            demoPlaceholder={feature.demoPlaceholder}
            icon={feature.icon}
          />
        ))}
      </div>

      {/* CTA después de features */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            ¿Listo para automatizar tu práctica?
          </h3>
          <p className="text-slate-600 mb-6">
            Únete a 500+ psicólogos que ya ahorran 10 horas por semana
          </p>
          <div className="flex justify-center">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
              Probá gratis 14 días
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
