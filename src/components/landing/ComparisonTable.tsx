import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, X, Calculator } from 'lucide-react';
import { useState } from 'react';

export const ComparisonTable = () => {
  const [hourlyRate, setHourlyRate] = useState(20000);
  const [monthlyHours, setMonthlyHours] = useState(10);

  const calculateSavings = () => {
    const timeValue = hourlyRate * monthlyHours;
    const proConnectionCost = 80000;
    const netSavings = timeValue - proConnectionCost;
    return { timeValue, proConnectionCost, netSavings };
  };

  const { timeValue, proConnectionCost, netSavings } = calculateSavings();

  const comparisonData = [
    {
      feature: "Gestión de pacientes",
      excel: { text: "Manual en Excel", status: "bad" },
      proconnection: { text: "Automática con historiales", status: "good" }
    },
    {
      feature: "Confirmación de turnos",
      excel: { text: "Por WhatsApp a toda hora", status: "bad" },
      proconnection: { text: "Automática con recordatorios", status: "good" }
    },
    {
      feature: "Cobros y pagos",
      excel: { text: "Perseguir por WhatsApp", status: "bad" },
      proconnection: { text: "MercadoPago automático", status: "good" }
    },
    {
      feature: "Contabilidad AFIP",
      excel: { text: "5 horas/mes en Excel", status: "bad" },
      proconnection: { text: "1 click para reportes", status: "good" }
    },
    {
      feature: "Costo mensual",
      excel: { text: "Gratis*", status: "neutral" },
      proconnection: { text: "$80.000/mes", status: "good" }
    }
  ];

  return (
    <section id="comparison" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
          Excel + WhatsApp vs ProConnection
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4">
          Veamos cuánto tiempo y dinero perdés usando herramientas manuales
        </p>
      </div>

      {/* Tabla comparativa - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
        {/* Columna 1: Excel + WhatsApp */}
        <Card className="border-2 border-slate-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-slate-700">Excel + WhatsApp</CardTitle>
            <div className="text-3xl font-bold text-slate-600">"Gratis"*</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparisonData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {item.excel.status === 'good' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : item.excel.status === 'bad' ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                  )}
                </div>
                <span className="text-slate-600 text-sm">{item.excel.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Columna 2: ProConnection (destacada) */}
        <Card className="border-2 border-blue-500 bg-blue-50 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Más elegido
            </span>
          </div>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-blue-700">ProConnection</CardTitle>
            <div className="text-3xl font-bold text-blue-600">$80.000/mes</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparisonData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {item.proconnection.status === 'good' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : item.proconnection.status === 'bad' ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                  )}
                </div>
                <span className="text-slate-700 text-sm font-medium">{item.proconnection.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Columna 3: Ahorro calculado */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-green-700">Tu ahorro mensual</CardTitle>
            <div className="text-3xl font-bold text-green-600">${timeValue.toLocaleString()}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {monthlyHours}h ahorradas
              </div>
              <div className="text-sm text-slate-600">
                Valor de tu tiempo: ${hourlyRate}/hora
              </div>
            </div>
            <div className="border-t border-green-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Valor de tu tiempo:</span>
                <span className="font-semibold">${timeValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Costo ProConnection:</span>
                <span className="font-semibold">-${proConnectionCost}</span>
              </div>
              <div className="flex justify-between items-center border-t border-green-200 pt-2">
                <span className="font-semibold text-green-700">Ahorro neto:</span>
                <span className="font-bold text-green-600 text-lg">${netSavings.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculadora interactiva */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Calculá cuánto tiempo y dinero perdés
            </h3>
            <p className="text-slate-600">
              Ajustá estos valores según tu situación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Input 1: Tarifa por hora */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                ¿Cuánto cobrás por sesión?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20000"
                />
              </div>
            </div>

            {/* Input 2: Horas perdidas por mes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                ¿Cuántas horas perdés por mes en tareas administrativas?
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyHours}
                  onChange={(e) => setMonthlyHours(Number(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">horas</span>
              </div>
            </div>
          </div>

          {/* Resultado destacado */}
          <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${netSavings.toLocaleString()}
            </div>
            <div className="text-lg text-slate-700 mb-1">
              Ahorro neto por mes
            </div>
            <div className="text-sm text-slate-500">
              {monthlyHours} horas × ${hourlyRate.toLocaleString()}/hora - $80.000 ProConnection = <span className="font-semibold text-green-600">${netSavings.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
              Empezar a ahorrar tiempo ahora
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Nota al pie */}
      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          *Excel + WhatsApp es "gratis" pero perdés {monthlyHours} horas por mes = ${timeValue.toLocaleString()} de tu tiempo 
          (si cobrás ${hourlyRate.toLocaleString()}/hora). ProConnection te cuesta $80.000/mes pero te ahorra ${netSavings.toLocaleString()}.
        </p>
      </div>
    </section>
  );
};
