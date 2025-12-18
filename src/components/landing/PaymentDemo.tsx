import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, DollarSign, CreditCard } from 'lucide-react';

const mockPayments = [
  { id: 1, patient: 'María González', amount: 15000, date: 'Hoy', time: '09:00', status: 'completado' },
  { id: 2, patient: 'Juan Pérez', amount: 15000, date: 'Hoy', time: '10:30', status: 'completado' },
  { id: 3, patient: 'Ana Martínez', amount: 18000, date: 'Hoy', time: '14:00', status: 'pendiente' },
];

export const PaymentDemo = () => {
  const totalToday = mockPayments
    .filter(p => p.status === 'completado')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="relative w-full">
      {/* Badge flotante */}
      <div className="absolute -top-3 -right-3 bg-green-mint text-blue-petrol px-2 py-1 rounded-lg border-2 border-blue-petrol/30 shadow-lg font-sans-geometric font-bold text-[10px] flex items-center gap-1 z-10">
        <Check className="w-3 h-3" />
        Automático
      </div>

      <div className="bg-white-warm rounded-xl shadow-xl border-4 border-blue-petrol/20 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-blue-petrol">Pagos Automáticos</h4>
            <p className="text-[10px] text-blue-petrol/70">MercadoPago integrado</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-blue-petrol/70">Hoy</p>
            <p className="text-sm font-bold text-green-600">${totalToday.toLocaleString()}</p>
          </div>
        </div>

        {/* Lista de pagos */}
        <div className="space-y-2">
          {mockPayments.map(payment => (
            <Card key={payment.id} className="border border-slate-200 p-2 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    payment.status === 'completado' ? 'bg-green-mint/30' : 'bg-peach-pale/30'
                  }`}>
                    {payment.status === 'completado' ? (
                      <Check className="w-4 h-4 text-green-700" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-700" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-petrol">{payment.patient}</p>
                    <p className="text-[10px] text-blue-petrol/60">{payment.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-petrol">${payment.amount.toLocaleString()}</p>
                  <Badge className={`text-[10px] px-1.5 py-0.5 mt-0.5 ${
                    payment.status === 'completado' 
                      ? 'bg-green-mint/20 text-green-700' 
                      : 'bg-peach-pale/20 text-amber-700'
                  }`}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between p-2 bg-green-mint/10 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-700" />
              <span className="text-xs font-semibold text-blue-petrol">Total recibido hoy</span>
            </div>
            <span className="text-sm font-bold text-green-700">${totalToday.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

