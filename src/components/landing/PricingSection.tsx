import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Star, MessageCircle } from 'lucide-react';

export const PricingSection = () => {
  const openWhatsApp = (plan: string) => {
    const phoneNumber = "5491144133576";
    const message = encodeURIComponent(`Hola! Me interesa el ${plan} de ProConnection. ¿Podrían darme más información?`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 px-4">
          Planes diseñados para psicólogos
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4">
          Dejá atrás Excel y WhatsApp para siempre. 
          <span className="font-semibold text-slate-800">Todo automatizado desde el primer día.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {/* Plan Starter */}
        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl mb-2 group-hover:text-blue-600 transition-colors duration-300 flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-blue-500" />
              Plan Starter
            </CardTitle>
            <div className="text-4xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">$60.000</div>
            <div className="text-slate-600">/mes</div>
            <div className="text-sm text-slate-500 mt-2">Pacientes ilimitados</div>
          </CardHeader>
          <CardContent className="pb-8">
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Funcionalidades esenciales</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.1s'}}>
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Agenda de citas</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.2s'}}>
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Gestión de pacientes</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.3s'}}>
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Recordatorios básicos</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.4s'}}>
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Pagos básicos</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.5s'}}>
                <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Acceso completo a la plataforma</span>
              </li>
            </ul>
            <Button 
              onClick={() => openWhatsApp('Plan Starter')}
              className="w-full hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Suscribirse a Starter
            </Button>
          </CardContent>
        </Card>

        {/* Plan Plus */}
        <Card className="border-2 border-amber-400 shadow-lg hover:shadow-2xl transition-all duration-500 relative group hover:scale-[1.02] bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold group-hover:from-amber-600 group-hover:via-yellow-600 group-hover:to-orange-600 transition-all duration-300 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Más elegido
            </span>
          </div>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl mb-2 group-hover:text-amber-700 transition-colors duration-300 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              Plan Plus
            </CardTitle>
            <div className="text-4xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">$80.000</div>
            <div className="text-slate-600">/mes</div>
            <div className="text-sm text-slate-500 mt-2">Pacientes ilimitados</div>
          </CardHeader>
          <CardContent className="pb-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                  <span className="font-medium">Todo lo del Plan Starter</span>
                </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.1s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Pacientes ilimitados</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.2s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Automatización de agenda</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.3s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Automatización de pagos</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.4s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Reportes AFIP completos</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.5s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Soporte preferencial</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.6s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>Consultoría inicial</span>
              </li>
              <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.7s'}}>
                <CheckCircle className="w-5 h-5 text-amber-600 group-hover:scale-125 transition-transform duration-200 flex-shrink-0" />
                <span>SEO Psicólogo incluido</span>
              </li>
            </ul>
            <Button 
              onClick={() => openWhatsApp('Plan Plus')}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 hover:scale-105 transition-all duration-300 group-hover:shadow-xl"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Suscribirse a Plus
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabla comparativa detallada */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-slate-800 text-center mb-8">
          Comparación detallada de planes
        </h3>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Característica</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">STARTER</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-amber-700 bg-amber-50">PLUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { feature: "Pacientes", starter: "Ilimitados", plus: "Ilimitados" },
                  { feature: "Agenda de citas", starter: "✅", plus: "✅" },
                  { feature: "Gestión de pacientes", starter: "✅", plus: "✅" },
                  { feature: "Recordatorios básicos", starter: "✅", plus: "✅" },
                  { feature: "Pagos básicos", starter: "✅", plus: "✅" },
                  { feature: "Acceso completo", starter: "✅", plus: "✅" },
                  { feature: "Automatización de agenda", starter: "❌", plus: "✅" },
                  { feature: "Automatización de pagos", starter: "❌", plus: "✅" },
                  { feature: "Reportes AFIP completos", starter: "❌", plus: "✅" },
                  { feature: "Soporte preferencial", starter: "❌", plus: "✅" },
                  { feature: "Consultoría inicial", starter: "❌", plus: "✅" },
                  { feature: "SEO Psicólogo incluido", starter: "❌", plus: "✅" },
                  { feature: "Precio mensual", starter: "$60.000", plus: "$80.000" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600">{row.starter}</td>
                    <td className="px-6 py-4 text-sm text-center text-amber-700 bg-amber-50 font-medium">{row.plus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Garantía y términos */}
      <div className="text-center mt-12">
        <div className="bg-slate-50 rounded-xl p-6 max-w-2xl mx-auto">
          <h4 className="font-semibold text-slate-800 mb-2">Garantía de satisfacción</h4>
          <p className="text-sm text-slate-600 mb-4">
            Si no ahorrás al menos 5 horas en tu primera semana, te devolvemos el dinero.
          </p>
          <p className="text-xs text-slate-500">
            Cancelá cuando quieras. Sin letra chica. Sin compromisos.
          </p>
        </div>
      </div>

      {/* CTA final */}
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            ¿Listo para empezar a ahorrar tiempo?
          </h3>
          <p className="text-slate-600 mb-6">
            Empezá con el plan Starter y upgradé al Plus cuando necesites más automatización
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
              Suscribirse Ahora
            </button>
            <button className="border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200">
              Ver demo completo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
