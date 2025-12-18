import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRealtimeChannel } from './useRealtimeChannel';

interface AccountingReport {
  id: string;
  psychologist_id: string;
  report_month: number;
  report_year: number;
  total_amount: number;
  total_receipts: number;
  amount_by_payment_method: Record<string, number>;
  amount_by_receipt_type?: Record<string, number>;
  annual_accumulated: number;
  status: string;
  report_file_url?: string;
  generation_date?: string;
  sent_date?: string;
  auto_approved_receipts?: number;
  manually_reviewed_receipts?: number;
  monotax_alert?: {
    level: 'warning' | 'critical';
    message: string;
    percentage?: number;
  };
  created_at: string;
  updated_at: string;
}

interface MonotaxCategory {
  category_code: string;
  annual_limit: number;
  monthly_limit: number;
  description: string;
}

export const useAccountingReports = (psychologistId?: string) => {
  const [reports, setReports] = useState<AccountingReport[]>([]);
  const [categories, setCategories] = useState<MonotaxCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('=== FETCHING ACCOUNTING REPORTS ===');
      console.log('Psychologist ID:', psychologistId);
      
      // Fetch reports - ordenar por año y mes descendente
      const { data: reportsData, error: reportsError } = await supabase
        .from('accounting_reports')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('report_year', { ascending: false })
        .order('report_month', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        throw reportsError;
      }

      console.log(`Fetched ${reportsData?.length || 0} reports`);

      // Fetch psychologist's current monotax category
      const { data: psychData, error: psychError } = await supabase
        .from('psychologists')
        .select('monotax_category')
        .eq('id', psychologistId)
        .single();

      if (psychError && psychError.code !== 'PGRST116') { // Ignore not found
        console.error('Error fetching psychologist data:', psychError);
        throw psychError;
      }

      // Transform the data to match our interface
      const transformedReports = (reportsData || []).map(report => ({
        ...report,
        amount_by_payment_method: typeof report.amount_by_payment_method === 'object' 
          ? report.amount_by_payment_method as Record<string, number>
          : {},
        amount_by_receipt_type: typeof report.amount_by_receipt_type === 'object' 
          ? report.amount_by_receipt_type as Record<string, number>
          : {},
        monotax_alert: report.monotax_alert ? report.monotax_alert as any : undefined
      }));

      console.log('Transformed reports:', transformedReports.length);
      
      setReports(transformedReports);
      setCurrentCategory(psychData?.monotax_category || null);
      setError(null);
      
    } catch (err) {
      console.error('Error in fetchReports:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast({
        title: "Error",
        description: "Error al cargar los reportes contables",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Use the new realtime hook
  useRealtimeChannel({
    channelName: `accounting-receipts-${psychologistId}`,
    enabled: !!psychologistId,
    table: 'payment_receipts',
    filter: `psychologist_id=eq.${psychologistId}`,
    onUpdate: (payload) => {
      console.log('Payment receipt changed:', payload);
      
      const newRecord = payload.new as any;
      const oldRecord = payload.old as any;
      
      if (
        payload.eventType === 'INSERT' ||
        payload.eventType === 'DELETE' ||
        (payload.eventType === 'UPDATE' && (
          newRecord?.validation_status !== oldRecord?.validation_status ||
          newRecord?.amount !== oldRecord?.amount ||
          newRecord?.include_in_report !== oldRecord?.include_in_report
        ))
      ) {
        console.log('Refreshing reports due to receipt changes');
        fetchReports();
      }
    }
  });

  const fetchMonotaxCategories = async () => {
    try {
      console.log('=== FETCHING MONOTAX CATEGORIES ===');
      const { data, error } = await supabase
        .from('monotax_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_code');

      if (error) {
        console.error('Error fetching monotax categories:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} monotax categories:`, data);
      setCategories(data || []);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron categorías de monotributo. Ejecuta la migración 20250121000001_create_monotax_categories.sql');
        toast({
          title: "Categorías no disponibles",
          description: "No se encontraron categorías de monotributo. Contacta al administrador.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fetching monotax categories:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de monotributo",
        variant: "destructive"
      });
    }
  };

  const generateMonthlyReport = async (month: number, year: number) => {
    if (!psychologistId) {
      throw new Error('Psychologist ID is required');
    }

    try {
      console.log(`=== GENERATING MONTHLY REPORT ===`);
      console.log(`Period: ${month}/${year}, Psychologist: ${psychologistId}`);

      const { data, error } = await supabase.functions.invoke('generate-monthly-report', {
        body: { psychologist_id: psychologistId, month, year }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Report generation response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Error generating monthly report');
      }

      toast({
        title: "Reporte generado",
        description: `Reporte de ${month}/${year} generado exitosamente`
      });

      await fetchReports();
      return data;
      
    } catch (err) {
      console.error('Error generating monthly report:', err);
      toast({
        title: "Error",
        description: "Error al generar el reporte mensual. Intenta nuevamente más tarde.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateMonotaxCategory = async (categoryCode: string) => {
    try {
      if (!psychologistId) return;
      
      const { error } = await supabase
        .from('psychologists')
        .update({ monotax_category: categoryCode })
        .eq('id', psychologistId);

      if (error) throw error;

      setCurrentCategory(categoryCode);
      toast({
        title: "Categoría actualizada",
        description: `Categoría de monotributo actualizada a ${categoryCode}`
      });
      
      fetchReports();
    } catch (err) {
      console.error('Error updating monotax category:', err);
      toast({
        title: "Error",
        description: "Error al actualizar la categoría",
        variant: "destructive"
      });
    }
  };

  const checkLimitAlerts = (annualAccumulated: number) => {
    if (!currentCategory) return null;

    const category = categories.find(c => c.category_code === currentCategory);
    if (!category) return null;

    const percentage = (annualAccumulated / category.annual_limit) * 100;

    if (percentage >= 90) {
      return {
        level: 'critical' as const,
        message: `¡Atención! Has alcanzado el ${percentage.toFixed(1)}% del límite anual`,
        remaining: category.annual_limit - annualAccumulated,
        percentage: Math.round(percentage)
      };
    } else if (percentage >= 80) {
      return {
        level: 'warning' as const,
        message: `Advertencia: Has alcanzado el ${percentage.toFixed(1)}% del límite anual`,
        remaining: category.annual_limit - annualAccumulated,
        percentage: Math.round(percentage)
      };
    }

    return null;
  };

  useEffect(() => {
    if (psychologistId) {
      fetchReports();
      fetchMonotaxCategories();
    }
  }, [psychologistId]);

  return {
    reports,
    categories,
    currentCategory,
    loading,
    error,
    generateMonthlyReport,
    updateMonotaxCategory,
    checkLimitAlerts,
    refetch: fetchReports
  };
};
