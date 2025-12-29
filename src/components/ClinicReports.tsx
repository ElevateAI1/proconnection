import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Calendar, Users, TrendingUp, Filter, AlertCircle, DollarSign } from 'lucide-react';
import { useClinicTeam } from '@/hooks/useClinicTeam';
import { supabase } from '@/integrations/supabase/client';
import { PlanGate } from './PlanGate';

export const ClinicReports = () => {
  const { clinicTeam, teamMembers, loading: teamLoading } = useClinicTeam();
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const fetchConsolidatedData = async () => {
      if (!clinicTeam?.team_id || teamLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const psychologistIds = teamMembers
          .filter(m => m.status === 'active')
          .map(m => m.psychologist_id);

        if (psychologistIds.length === 0) {
          setConsolidatedData({
            totalPatients: 0,
            totalRevenue: 0,
            totalAppointments: 0,
            monthlyRevenue: [],
            appointmentsByProfessional: [],
            revenueByProfessional: []
          });
          setLoading(false);
          return;
        }

        // Obtener datos consolidados
        const currentDate = new Date();
        const startDate = new Date();
        
        if (selectedPeriod === 'month') {
          startDate.setMonth(currentDate.getMonth() - 1);
        } else if (selectedPeriod === 'quarter') {
          startDate.setMonth(currentDate.getMonth() - 3);
        } else {
          startDate.setFullYear(currentDate.getFullYear() - 1);
        }

        // Ingresos consolidados
        const { data: receipts } = await supabase
          .from('payment_receipts')
          .select('amount, receipt_date, psychologist_id')
          .in('psychologist_id', psychologistIds)
          .eq('validation_status', 'approved')
          .gte('receipt_date', startDate.toISOString().split('T')[0]);

        const totalRevenue = receipts?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

        // Citas consolidadas
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, appointment_date, psychologist_id, status')
          .in('psychologist_id', psychologistIds)
          .gte('appointment_date', startDate.toISOString().split('T')[0]);

        const totalAppointments = appointments?.length || 0;

        // Pacientes totales
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .in('psychologist_id', psychologistIds);

        // Ingresos por mes
        const monthlyRevenueMap = new Map<string, number>();
        receipts?.forEach(r => {
          if (r.receipt_date) {
            const month = r.receipt_date.substring(0, 7); // YYYY-MM
            monthlyRevenueMap.set(month, (monthlyRevenueMap.get(month) || 0) + (r.amount || 0));
          }
        });
        const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month));

        // Datos por profesional
        const revenueByProfessional = new Map<string, number>();
        const appointmentsByProfessional = new Map<string, number>();

        receipts?.forEach(r => {
          if (r.psychologist_id) {
            revenueByProfessional.set(
              r.psychologist_id,
              (revenueByProfessional.get(r.psychologist_id) || 0) + (r.amount || 0)
            );
          }
        });

        appointments?.forEach(a => {
          if (a.psychologist_id) {
            appointmentsByProfessional.set(
              a.psychologist_id,
              (appointmentsByProfessional.get(a.psychologist_id) || 0) + 1
            );
          }
        });

        // Obtener nombres de profesionales
        const { data: psychologists } = await supabase
          .from('psychologists')
          .select('id, first_name, last_name')
          .in('id', psychologistIds);

        const revenueByProfessionalData = Array.from(revenueByProfessional.entries())
          .map(([id, amount]) => {
            const psych = psychologists?.find(p => p.id === id);
            return {
              name: psych ? `${psych.first_name} ${psych.last_name}` : 'Desconocido',
              amount
            };
          });

        const appointmentsByProfessionalData = Array.from(appointmentsByProfessional.entries())
          .map(([id, count]) => {
            const psych = psychologists?.find(p => p.id === id);
            return {
              name: psych ? `${psych.first_name} ${psych.last_name}` : 'Desconocido',
              count
            };
          });

        setConsolidatedData({
          totalPatients: patientsCount || 0,
          totalRevenue,
          totalAppointments,
          monthlyRevenue,
          revenueByProfessional: revenueByProfessionalData,
          appointmentsByProfessional: appointmentsByProfessionalData
        });
      } catch (err) {
        console.error('Error fetching consolidated data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchConsolidatedData();
  }, [clinicTeam, teamMembers, teamLoading, selectedPeriod]);

  const exportToPDF = () => {
    console.log('Exporting clinic reports to PDF...');
    // Implementar exportación real a PDF
  };

  if (loading || teamLoading) {
    return (
      <PlanGate capability="team_features">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Generando reportes consolidados...</p>
        </div>
      </PlanGate>
    );
  }

  if (error) {
    return (
      <PlanGate capability="team_features">
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

  if (!clinicTeam) {
    return (
      <PlanGate capability="team_features">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-600">
              No tienes un equipo de clínica configurado.
            </p>
          </CardContent>
        </Card>
      </PlanGate>
    );
  }

  return (
    <PlanGate capability="team_features">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-petrol mb-2">
              Reportes Consolidados de Clínica
            </h1>
            <p className="text-slate-600">{clinicTeam.team_name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('month')}
              >
                Último mes
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('quarter')}
              >
                Último trimestre
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('year')}
              >
                Último año
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consolidatedData?.totalPatients || 0}</div>
              <p className="text-xs text-muted-foreground">Todos los profesionales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Consolidados</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(consolidatedData?.totalRevenue || 0).toLocaleString('es-AR')}
              </div>
              <p className="text-xs text-muted-foreground">Período seleccionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consolidatedData?.totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Período seleccionado</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        {consolidatedData?.monthlyRevenue && consolidatedData.monthlyRevenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Mensuales Consolidados</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consolidatedData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {consolidatedData?.revenueByProfessional && consolidatedData.revenueByProfessional.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consolidatedData.revenueByProfessional}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </PlanGate>
  );
};

