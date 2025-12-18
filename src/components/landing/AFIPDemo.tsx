import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, FileText, TrendingUp, Download } from 'lucide-react';

const mockReports = [
  { id: 1, period: 'Enero 2025', total: 165000, status: 'listo', type: 'Facturación' },
  { id: 2, period: 'Diciembre 2024', total: 150000, status: 'listo', type: 'Facturación' },
];

const mockMonthlyIncome = [
  { month: 'Oct', amount: 120000 },
  { month: 'Nov', amount: 135000 },
  { month: 'Dic', amount: 150000 },
  { month: 'Ene', amount: 165000 },
];

export const AFIPDemo = () => {
  const maxAmount = Math.max(...mockMonthlyIncome.map(m => m.amount));
  const totalRevenue = mockReports.reduce((sum, r) => sum + r.total, 0);

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
            <h4 className="text-xs font-bold text-blue-petrol">Reportes AFIP</h4>
            <p className="text-[10px] text-blue-petrol/70">Listos para exportar</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-blue-petrol/70">Total</p>
            <p className="text-sm font-bold text-blue-petrol">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Gráfico simple */}
        <div className="space-y-2 p-2 bg-slate-50 rounded-lg">
          <div className="text-[10px] font-semibold text-blue-petrol mb-2">Ingresos Mensuales</div>
          {mockMonthlyIncome.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-8 text-[10px] font-semibold text-blue-petrol/70">{item.month}</div>
              <div className="flex-1 relative">
                <div
                  className="h-4 bg-gradient-to-r from-blue-soft to-green-mint rounded-md flex items-center justify-end pr-1 transition-all duration-500"
                  style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                >
                  <span className="text-[10px] font-bold text-white">
                    ${(item.amount / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de reportes */}
        <div className="space-y-1.5">
          {mockReports.map(report => (
            <Card key={report.id} className="border border-slate-200 p-2 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-lavender-soft/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-petrol" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-petrol">{report.period}</p>
                    <p className="text-[10px] text-blue-petrol/60">{report.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-petrol">${report.total.toLocaleString()}</p>
                  <Badge className="bg-green-mint/20 text-green-700 text-[10px] px-1.5 py-0.5 mt-0.5">
                    <Check className="w-3 h-3 mr-0.5" />
                    {report.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Botón de exportar */}
        <div className="pt-2 border-t border-slate-200">
          <Button className="w-full h-8 text-xs bg-blue-petrol hover:bg-blue-petrol/90">
            <Download className="w-3 h-3 mr-1" />
            Exportar Reporte AFIP
          </Button>
        </div>
      </div>
    </div>
  );
};

