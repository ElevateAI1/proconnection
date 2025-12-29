
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { formatDateArgentina } from '@/utils/dateFormatting';

interface AppointmentStats {
  totalAppointments: number;
  thisMonthAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  monthlyGrowth: number;
}

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  averageSatisfaction: number;
}

interface RevenueStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  averageSessionValue: number;
  projectedMonthlyRevenue: number;
}

interface MonthlyData {
  month: string;
  appointments: number;
  patients: number;
  revenue: number;
}

interface TherapyTypeData {
  type: string;
  count: number;
  percentage: number;
}

export const useReportsData = () => {
  const { psychologist } = useProfile();
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [therapyTypeData, setTherapyTypeData] = useState<TherapyTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch appointments data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (appointmentsError) throw appointmentsError;

      // Fetch patients data
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologist.id);

      if (patientsError) throw patientsError;

      // Calculate appointment stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      const thisMonthAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear;
      }).length || 0;

      const lastMonthAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear;
      }).length || 0;

      const completedAppointments = appointments?.filter(apt => apt.status === 'completed').length || 0;
      const cancelledAppointments = appointments?.filter(apt => apt.status === 'cancelled').length || 0;

      const monthlyGrowth = lastMonthAppointments > 0 
        ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 
        : 0;

      setAppointmentStats({
        totalAppointments: appointments?.length || 0,
        thisMonthAppointments,
        completedAppointments,
        cancelledAppointments,
        monthlyGrowth
      });

      // Calculate patient stats
      const thisMonthPatients = patients?.filter(patient => {
        const patientDate = new Date(patient.created_at);
        return patientDate.getMonth() === thisMonth && patientDate.getFullYear() === thisYear;
      }).length || 0;

      // Active patients are those with appointments in the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const activePatientIds = appointments?.filter(apt => 
        new Date(apt.appointment_date) >= threeMonthsAgo
      ).map(apt => apt.patient_id) || [];
      
      const uniqueActivePatients = [...new Set(activePatientIds)].length;

      setPatientStats({
        totalPatients: patients?.length || 0,
        activePatients: uniqueActivePatients,
        newPatientsThisMonth: thisMonthPatients,
        averageSatisfaction: 4.2 // Placeholder - would come from actual ratings
      });

      // Calculate revenue stats (assuming $50 per session average)
      const avgSessionValue = 50;
      const thisMonthRevenue = thisMonthAppointments * avgSessionValue;
      const totalRevenue = completedAppointments * avgSessionValue;
      const projectedMonthlyRevenue = thisMonthAppointments * avgSessionValue * 1.2;

      setRevenueStats({
        totalRevenue,
        thisMonthRevenue,
        averageSessionValue: avgSessionValue,
        projectedMonthlyRevenue
      });

      // Generate monthly data for charts (last 6 months)
      const monthlyChartData: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = formatDateArgentina(date, { month: 'short' });
        
        const monthAppointments = appointments?.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate.getMonth() === date.getMonth() && 
                 aptDate.getFullYear() === date.getFullYear();
        }).length || 0;

        const monthPatients = patients?.filter(patient => {
          const patientDate = new Date(patient.created_at);
          return patientDate.getMonth() === date.getMonth() && 
                 patientDate.getFullYear() === date.getFullYear();
        }).length || 0;

        monthlyChartData.push({
          month,
          appointments: monthAppointments,
          patients: monthPatients,
          revenue: monthAppointments * avgSessionValue
        });
      }

      setMonthlyData(monthlyChartData);

      // Generate therapy type distribution
      const typeCounts: { [key: string]: number } = {};
      appointments?.forEach(apt => {
        typeCounts[apt.type] = (typeCounts[apt.type] || 0) + 1;
      });

      const total = appointments?.length || 1;
      const therapyTypes: TherapyTypeData[] = Object.entries(typeCounts).map(([type, count]) => ({
        type: type === 'individual' ? 'Individual' : 
              type === 'couple' ? 'Pareja' : 
              type === 'family' ? 'Familiar' : 
              type === 'evaluation' ? 'Evaluación' : 'Seguimiento',
        count,
        percentage: Math.round((count / total) * 100)
      }));

      setTherapyTypeData(therapyTypes);

    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [psychologist?.id]);

  return {
    appointmentStats,
    patientStats,
    revenueStats,
    monthlyData,
    therapyTypeData,
    loading,
    error,
    refetch: fetchReportsData
  };
};
