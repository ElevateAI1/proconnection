import { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';

export const ComparisonEditorial = () => {
  const [hourlyRate, setHourlyRate] = useState(20000);
  const [monthlyHours, setMonthlyHours] = useState(10);
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

  const calculateSavings = () => {
    const timeValue = hourlyRate * monthlyHours;
    const proConnectionCost = 80000;
    const netSavings = timeValue - proConnectionCost;
    return { timeValue, proConnectionCost, netSavings };
  };

  const { timeValue, proConnectionCost, netSavings } = calculateSavings();

  return (
    <section 
      ref={sectionRef}
      id="comparison" 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gradient-to-b from-white-warm via-gray-light to-white-warm overflow-hidden"
    >
      {/* Chapter header */}
      <div className={`text-center mb-16 sm:mb-24 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-petrol mb-6">
          Excel + WhatsApp vs ProConnection
        </h2>
        <p className="font-sans-geometric text-xl sm:text-2xl text-blue-petrol/80 max-w-3xl mx-auto leading-relaxed">
          Veamos cuánto tiempo y dinero perdés usando herramientas manuales
        </p>
      </div>

      {/* Dual world comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Mundo viejo - Excel + WhatsApp */}
        <div 
          className={`relative bg-blue-petrol/95 text-white-warm rounded-2xl p-8 sm:p-12 border-4 border-blue-petrol shadow-2xl ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
        >
          {/* Chaos texture background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
            }}
          />
          
          <div className="relative z-10">
            <h3 className="font-serif-display text-3xl sm:text-4xl font-bold mb-6 text-white">
              Mundo viejo
            </h3>
            <p className="font-sans-geometric text-lg mb-6 text-slate-300">
              Excel + WhatsApp
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span className="font-sans-geometric">Confirmaciones manuales a toda hora</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span className="font-sans-geometric">Perseguir pagos por WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span className="font-sans-geometric">5+ horas/mes en Excel para AFIP</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span className="font-sans-geometric">Errores y olvidos constantes</span>
              </li>
            </ul>

            <div className="bg-peach-pale/20 border-2 border-peach-pale/50 rounded-lg p-4">
              <p className="font-sans-geometric font-bold text-lg text-white-warm">
                Costo oculto: ${timeValue.toLocaleString()} / mes
              </p>
              <p className="font-sans-geometric text-sm text-white-warm/80 mt-1">
                ({monthlyHours} horas × ${hourlyRate.toLocaleString()}/hora)
              </p>
            </div>
          </div>

          {/* Floating chaos elements */}
          <div className="absolute top-4 right-4 text-4xl opacity-20">📊</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-20">💬</div>
        </div>

        {/* Mundo ProConnection */}
        <div 
          className={`relative bg-white-warm rounded-2xl p-8 sm:p-12 border-4 border-blue-soft shadow-2xl ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          <div className="relative z-10">
            <div className="inline-block bg-blue-soft text-white-warm px-4 py-1 rounded-full border-2 border-blue-petrol shadow-lg font-sans-geometric font-bold text-sm mb-4">
              Más elegido
            </div>
            
            <h3 className="font-serif-display text-3xl sm:text-4xl font-bold mb-6 text-blue-petrol">
              Mundo ProConnection
            </h3>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-green-mint text-xl">✓</span>
                <span className="font-sans-geometric text-blue-petrol">Agenda automática sincronizada</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-mint text-xl">✓</span>
                <span className="font-sans-geometric text-blue-petrol">Pagos automáticos con MercadoPago</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-mint text-xl">✓</span>
                <span className="font-sans-geometric text-blue-petrol">Reportes AFIP en 1 click</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-mint text-xl">✓</span>
                <span className="font-sans-geometric text-blue-petrol">Todo ordenado y automatizado</span>
              </li>
            </ul>

            <div className="bg-green-mint/30 border-2 border-green-mint rounded-lg p-4">
              <p className="font-sans-geometric font-bold text-lg text-blue-petrol">
                Costo: $80.000 / mes
              </p>
              <p className="font-sans-geometric text-sm text-blue-petrol/80 mt-1">
                Ahorro neto: ${netSavings.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Floating UI elements */}
          <div className="absolute top-4 right-4 bg-white-warm border-2 border-blue-soft rounded-lg p-2 shadow-lg">
            <div className="text-xs font-sans-geometric font-bold text-blue-petrol">✓</div>
          </div>
          <div className="absolute bottom-4 left-4 bg-white-warm border-2 border-green-mint rounded-lg p-2 shadow-lg">
            <div className="text-xs font-sans-geometric font-bold text-blue-petrol">📅</div>
          </div>
        </div>
      </div>

      {/* Transition visual element */}
      <div className="relative h-24 mb-16 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-sand-light to-transparent" />
        </div>
        <div className="relative bg-white-warm border-4 border-blue-soft rounded-full p-4 shadow-xl">
          <TrendingDown className="w-8 h-8 text-blue-petrol" />
        </div>
      </div>

      {/* Calculator - Neo-brutalist */}
      <div 
        className={`bg-white-warm border-4 border-blue-petrol/30 shadow-[12px_12px_0px_0px_rgba(108,175,240,0.2)] rounded-2xl p-8 sm:p-12 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}
        style={{ animationDelay: '400ms' }}
      >
        <div className="text-center mb-8">
          <Calculator className="w-12 h-12 text-blue-petrol mx-auto mb-4" />
          <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-blue-petrol mb-4">
            Calculá tu ahorro
          </h3>
          <p className="font-sans-geometric text-lg text-blue-petrol/80">
            Ajustá estos valores según tu situación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-8">
          {/* Tarifa por hora */}
          <div>
            <label className="block font-sans-geometric font-bold text-blue-petrol mb-3 text-lg">
              ¿Cuánto cobrás por sesión?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-sans-geometric text-slate-500">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-4 border-4 border-blue-petrol/30 rounded-lg focus:ring-4 focus:ring-blue-soft/30 focus:border-blue-soft font-sans-geometric text-lg"
                placeholder="20000"
              />
            </div>
          </div>

          {/* Horas perdidas */}
          <div>
            <label className="block font-sans-geometric font-bold text-blue-petrol mb-3 text-lg">
              ¿Cuántas horas perdés por mes?
            </label>
            <div className="relative">
              <input
                type="number"
                value={monthlyHours}
                onChange={(e) => setMonthlyHours(Number(e.target.value))}
                className="w-full px-4 py-4 pr-16 border-4 border-blue-petrol/30 rounded-lg focus:ring-4 focus:ring-blue-soft/30 focus:border-blue-soft font-sans-geometric text-lg"
                placeholder="10"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-sans-geometric text-slate-500">horas</span>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-gradient-to-r from-green-mint/30 to-blue-soft/30 border-4 border-green-mint rounded-xl p-8 text-center">
          <div className="font-serif-display text-5xl sm:text-6xl font-bold text-blue-petrol mb-2">
            ${netSavings.toLocaleString()}
          </div>
          <div className="font-sans-geometric text-xl text-blue-petrol/80 mb-1">
            Ahorro neto por mes
          </div>
          <div className="font-sans-geometric text-sm text-blue-petrol/70">
            {monthlyHours} horas × ${hourlyRate.toLocaleString()}/hora - $80.000 ProConnection ={' '}
            <span className="font-bold text-blue-petrol">${netSavings.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

