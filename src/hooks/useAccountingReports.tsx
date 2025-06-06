
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AccountingReport {
  id: string;
  psychologist_id: string;
  report_month: number;
  report_year: number;
  total_amount: number;
  total_receipts: number;
  amount_by_payment_method: Record<string, number>;
  annual_accumulated: number;
  status: string;
  report_file_url?: string;
  generation_date?: string;
  sent_date?: string;
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
      
      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('accounting_reports')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('report_year', { ascending: false })
        .order('report_month', { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch psychologist's current monotax category
      const { data: psychData, error: psychError } = await supabase
        .from('psychologists')
        .select('monotax_category')
        .eq('id', psychologistId)
        .single();

      if (psychError) throw psychError;

      // Transform the data to match our interface
      const transformedReports = (reportsData || []).map(report => ({
        ...report,
        amount_by_payment_method: typeof report.amount_by_payment_method === 'object' 
          ? report.amount_by_payment_method as Record<string, number>
          : {}
      }));

      setReports(transformedReports);
      setCurrentCategory(psychData?.monotax_category || null);
    } catch (err) {
      console.error('Error fetching accounting reports:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonotaxCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('monotax_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_code');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching monotax categories:', err);
    }
  };

  const generateMonthlyReport = async (month: number, year: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-monthly-report', {
        body: { psychologist_id: psychologistId, month, year }
      });

      if (error) throw error;

      toast({
        title: "Reporte generado",
        description: `Reporte de ${month}/${year} generado exitosamente`
      });

      fetchReports();
      return data;
    } catch (err) {
      console.error('Error generating monthly report:', err);
      toast({
        title: "Error",
        description: "Error al generar el reporte mensual",
        variant: "destructive"
      });
    }
  };

  const updateMonotaxCategory = async (categoryCode: string) => {
    try {
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
        level: 'critical',
        message: `¡Atención! Has alcanzado el ${percentage.toFixed(1)}% del límite anual (${category.annual_limit.toLocaleString()})`,
        remaining: category.annual_limit - annualAccumulated
      };
    } else if (percentage >= 80) {
      return {
        level: 'warning',
        message: `Advertencia: Has alcanzado el ${percentage.toFixed(1)}% del límite anual`,
        remaining: category.annual_limit - annualAccumulated
      };
    }

    return null;
  };

  useEffect(() => {
    fetchReports();
    fetchMonotaxCategories();
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
