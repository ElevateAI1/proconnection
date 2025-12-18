import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar as CalendarIcon, Clock } from 'lucide-react';

const mockAppointments = [
  { id: 1, patient: 'María González', time: '09:00', status: 'confirmada' },
  { id: 2, patient: 'Juan Pérez', time: '10:30', status: 'confirmada' },
  { id: 3, patient: 'Ana Martínez', time: '14:00', status: 'pendiente' },
  { id: 4, patient: 'Carlos Rodríguez', time: '16:00', status: 'confirmada' },
];

export const CalendarDemo = () => {
  const confirmedCount = mockAppointments.filter(a => a.status === 'confirmada').length;

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
            <h4 className="text-xs font-bold text-blue-petrol">Agenda Automática</h4>
            <p className="text-[10px] text-blue-petrol/70">Hoy - {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <Badge className="bg-blue-soft text-white text-[10px] px-2 py-0.5">
            {confirmedCount} confirmadas
          </Badge>
        </div>

        {/* Mini calendario */}
        <div className="grid grid-cols-7 gap-1 p-2 bg-slate-50 rounded-lg">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-center">
              <div className="text-[10px] text-blue-petrol/60 font-semibold mb-1">{day}</div>
              <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] ${
                i === 2 ? 'bg-blue-soft text-white font-bold' : 'text-blue-petrol/70'
              }`}>
                {i === 2 ? '15' : i < 2 ? '' : String(i - 1)}
              </div>
            </div>
          ))}
        </div>

        {/* Lista de citas */}
        <div className="space-y-1.5">
          {mockAppointments.map(apt => (
            <Card key={apt.id} className="border border-slate-200 p-2 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    apt.status === 'confirmada' ? 'bg-blue-soft/30' : 'bg-peach-pale/30'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      apt.status === 'confirmada' ? 'text-blue-700' : 'text-amber-700'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-petrol">{apt.patient}</p>
                    <p className="text-[10px] text-blue-petrol/60">{apt.time}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] px-1.5 py-0.5 ${
                  apt.status === 'confirmada'
                    ? 'bg-blue-soft/20 text-blue-700'
                    : 'bg-peach-pale/20 text-amber-700'
                }`}>
                  {apt.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between p-2 bg-blue-soft/10 rounded-lg">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-semibold text-blue-petrol">Agenda llena</span>
            </div>
            <span className="text-xs font-bold text-blue-700">{mockAppointments.length} citas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

