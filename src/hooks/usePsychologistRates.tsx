
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PsychologistRate {
  id: string;
  psychologist_id: string;
  session_type: string;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePsychologistRates = (psychologistId?: string) => {
  const [rates, setRates] = useState<PsychologistRate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    if (!psychologistId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('psychologist_rates')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('is_active', true);

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tarifas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateRate = async (sessionType: string, price: number, currency: string = 'USD') => {
    if (!psychologistId) return;

    try {
      const { data, error } = await supabase
        .from('psychologist_rates')
        .upsert({
          psychologist_id: psychologistId,
          session_type: sessionType,
          price,
          currency,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'psychologist_id,session_type'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tarifa actualizada",
        description: `Tarifa para ${sessionType} actualizada exitosamente`
      });

      fetchRates();
      return data;
    } catch (error) {
      console.error('Error updating rate:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarifa",
        variant: "destructive"
      });
    }
  };

  const deleteRate = async (rateId: string) => {
    try {
      const { error } = await supabase
        .from('psychologist_rates')
        .update({ is_active: false })
        .eq('id', rateId);

      if (error) throw error;

      toast({
        title: "Tarifa eliminada",
        description: "La tarifa ha sido desactivada"
      });

      fetchRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarifa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRates();
  }, [psychologistId]);

  return {
    rates,
    loading,
    createOrUpdateRate,
    deleteRate,
    refetch: fetchRates
  };
};
