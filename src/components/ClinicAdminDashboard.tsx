import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinicTeam } from '@/hooks/useClinicTeam';
import { ClinicTeamManagement } from './ClinicTeamManagement';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ClinicAdminDashboard = () => {
  const { clinicTeam, teamMembers, loading } = useClinicTeam();
  const [clinicStats, setClinicStats] = useState({
    totalPatients: 0,
    totalIncome: 0,
    totalAppointments: 0,
    activeProfessionals: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchClinicStats = async () => {
      if (!clinicTeam?.team_id) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        // Obtener IDs de todos los psicólogos del equipo
        const psychologistIds = teamMembers
          .filter(m => m.status === 'active')
          .map(m => m.psychologist_id);

        if (psychologistIds.length === 0) {
          setClinicStats({
            totalPatients: 0,
            totalIncome: 0,
            totalAppointments: 0,
            activeProfessionals: 0
          });
          setLoadingStats(false);
          return;
        }

        // Obtener pacientes totales
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .in('psychologist_id', psychologistIds);

        // Obtener ingresos del mes actual
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const { data: receipts } = await supabase
          .from('payment_receipts')
          .select('amount')
          .in('psychologist_id', psychologistIds)
          .eq('validation_status', 'approved')
          .gte('receipt_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
          .lt('receipt_date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

        const totalIncome = receipts?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

        // Obtener citas del mes actual
        const { count: appointmentsCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .in('psychologist_id', psychologistIds)
          .gte('appointment_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
          .lt('appointment_date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

        setClinicStats({
          totalPatients: patientsCount || 0,
          totalIncome,
          totalAppointments: appointmentsCount || 0,
          activeProfessionals: psychologistIds.length
        });
      } catch (error) {
        console.error('Error fetching clinic stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (clinicTeam && teamMembers.length > 0) {
      fetchClinicStats();
    }
  }, [clinicTeam, teamMembers]);

  if (loading || loadingStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-600">Cargando dashboard de clínica...</p>
        </CardContent>
      </Card>
    );
  }

  if (!clinicTeam) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-600">
            No tienes un equipo de clínica configurado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-petrol mb-2">
          Administración de Clínica
        </h1>
        <p className="text-slate-600">
          {clinicTeam.team_name}
        </p>
      </div>

      {/* Métricas consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Todos los profesionales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${clinicStats.totalIncome.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Consolidado del equipo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Total programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesionales Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicStats.activeProfessionals}</div>
            <p className="text-xs text-muted-foreground">
              De {clinicTeam.max_professionals} incluidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para gestión */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">Gestión de Equipo</TabsTrigger>
          <TabsTrigger value="reports">Reportes Consolidados</TabsTrigger>
        </TabsList>
        <TabsContent value="team" className="space-y-4">
          <ClinicTeamManagement />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Consolidados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Los reportes consolidados estarán disponibles próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

