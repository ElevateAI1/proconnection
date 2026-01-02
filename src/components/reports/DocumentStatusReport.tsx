
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DocumentStatusReportProps {
  data: Record<string, number>;
  loading: boolean;
}

const COLORS = {
  'draft': '#94a3b8',
  'pending': '#f59e0b',
  'in_progress': '#3b82f6',
  'completed': '#10b981',
  'under_review': '#8b5cf6',
  'approved': '#059669',
  'rejected': '#ef4444',
  'expired': '#dc2626'
};

const STATUS_LABELS = {
  'draft': 'Borrador',
  'pending': 'Pendiente',
  'in_progress': 'En Progreso',
  'completed': 'Completado',
  'under_review': 'En Revisión',
  'approved': 'Aprobado',
  'rejected': 'Rechazado',
  'expired': 'Vencido'
};

export const DocumentStatusReport = ({ data, loading }: DocumentStatusReportProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    status
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS] || '#64748b'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} documentos`, 'Cantidad']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
