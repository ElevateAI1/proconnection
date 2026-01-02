
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DocumentTypeReportProps {
  data: Record<string, number>;
  loading: boolean;
}

const TYPE_LABELS = {
  'assessment': 'Evaluación',
  'consent': 'Consentimiento',
  'treatment_plan': 'Plan de Tratamiento',
  'progress_report': 'Reporte de Progreso'
};

export const DocumentTypeReport = ({ data, loading }: DocumentTypeReportProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([type, count]) => ({
    type: TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type,
    count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" width={100} />
              <Tooltip 
                formatter={(value) => [`${value} documentos`, 'Cantidad']}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
