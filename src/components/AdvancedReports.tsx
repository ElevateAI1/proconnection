
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Users, TrendingUp, FileText, Filter, AlertCircle, DollarSign, Activity } from 'lucide-react';
import { PlanGate } from './PlanGate';
import { useReportsData } from '@/hooks/useReportsData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedReports = () => {
  const {
    appointmentStats,
    patientStats,
    revenueStats,
    monthlyData,
    therapyTypeData,
    loading,
    error
  } = useReportsData();

  const exportToPDF = () => {
    console.log('Exporting reports to PDF...');
    // Implementar exportación real a PDF
  };

  if (loading) {
    return (
      <PlanGate capability="advanced_reports">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Generando reportes...</p>
        </div>
      </PlanGate>
    );
  }

  if (error) {
    return (
      <PlanGate capability="advanced_reports">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar reportes</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </PlanGate>
    );
  }

  const hasData = appointmentStats && appointmentStats.totalAppointments > 0;

  return (
    <PlanGate capability="advanced_reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Reportes Avanzados</h2>
            <p className="text-slate-600">Análisis detallado de tu práctica profesional</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600" onClick={exportToPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {!hasData ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BarChart className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin datos suficientes</h3>
              <p className="text-slate-500 text-center max-w-md mb-4">
                Los reportes avanzados se generarán automáticamente cuando tengas más citas y actividad en tu práctica.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AlertCircle className="w-4 h-4" />
                <span>Comienza agendando citas para ver tus métricas</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Citas este mes</p>
                      <p className="text-2xl font-bold text-blue-600">{appointmentStats?.thisMonthAppointments || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      {appointmentStats?.monthlyGrowth ? `${appointmentStats.monthlyGrowth.toFixed(1)}%` : '0%'} vs mes anterior
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Pacientes activos</p>
                      <p className="text-2xl font-bold text-green-600">{patientStats?.activePatients || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-slate-500">
                      {patientStats?.newPatientsThisMonth || 0} nuevos este mes
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Satisfacción</p>
                      <p className="text-2xl font-bold text-purple-600">{patientStats?.averageSatisfaction?.toFixed(1) || '-'}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Excelente</Badge>
                  </div>
                  <div className="flex items-center mt-2">
                    <Activity className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-slate-500">Promedio de reseñas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Ingresos</p>
                      <p className="text-2xl font-bold text-orange-600">${revenueStats?.thisMonthRevenue || 0}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-slate-500">
                      Proyección: ${revenueStats?.projectedMonthlyRevenue || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-500" />
                    Tendencias Mensuales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="appointments" stroke="#3B82F6" name="Citas" />
                      <Line type="monotone" dataKey="patients" stroke="#10B981" name="Pacientes" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-500" />
                    Tipos de Terapia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={therapyTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ type, percentage }) => `${type} (${percentage}%)`}
                      >
                        {therapyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Análisis detallado */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800">Eficiencia de Citas</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {appointmentStats ? Math.round((appointmentStats.completedAppointments / appointmentStats.totalAppointments) * 100) : 0}%
                    </div>
                    <p className="text-sm text-slate-600">
                      {appointmentStats?.completedAppointments || 0} de {appointmentStats?.totalAppointments || 0} completadas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800">Tasa de Cancelación</h4>
                    <div className="text-2xl font-bold text-red-600">
                      {appointmentStats ? Math.round((appointmentStats.cancelledAppointments / appointmentStats.totalAppointments) * 100) : 0}%
                    </div>
                    <p className="text-sm text-slate-600">
                      {appointmentStats?.cancelledAppointments || 0} citas canceladas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800">Valor Promedio</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${revenueStats?.averageSessionValue || 0}
                    </div>
                    <p className="text-sm text-slate-600">Por sesión completada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!hasData ? (
                <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-700">
                    <strong>Primeros pasos:</strong> Comienza agendando y completando citas para generar 
                    insights valiosos sobre tu práctica profesional.
                  </p>
                </div>
              ) : (
                <>
                  {appointmentStats && appointmentStats.monthlyGrowth > 20 && (
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                      <p className="text-sm text-green-700">
                        <strong>¡Excelente crecimiento!</strong> Tu práctica está creciendo {appointmentStats.monthlyGrowth.toFixed(1)}% 
                        este mes. Considera expandir tu disponibilidad.
                      </p>
                    </div>
                  )}
                  {appointmentStats && (appointmentStats.cancelledAppointments / appointmentStats.totalAppointments) > 0.15 && (
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <p className="text-sm text-yellow-700">
                        <strong>Alta tasa de cancelación:</strong> Considera implementar políticas de cancelación 
                        o recordatorios automáticos para reducir las cancelaciones.
                      </p>
                    </div>
                  )}
                  {patientStats && patientStats.newPatientsThisMonth === 0 && (
                    <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <p className="text-sm text-orange-700">
                        <strong>Oportunidad de crecimiento:</strong> No has tenido pacientes nuevos este mes. 
                        Considera mejorar tu presencia online o estrategias de marketing.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
};
