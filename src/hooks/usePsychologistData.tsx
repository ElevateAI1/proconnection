import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Psychologist {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  license_number?: string;
  specialization?: string;
  phone?: string;
  subscription_status?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_end_date?: string;
  plan_type?: string;
  profession_type?: string;
}

export const usePsychologistData = () => {
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPsychologist = async (userId: string): Promise<Psychologist | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: psychData, error: psychError } = await supabase
        .from('psychologists')
        .select('*')
        .eq('id', userId)
        .single();

      if (psychError) {
        console.error('Error fetching psychologist:', psychError);
        setError('Error cargando datos de psicólogo');
        setPsychologist(null);
        return null;
      }

      setPsychologist(psychData);
      return psychData;
    } catch (err) {
      console.error('Error fetching psychologist:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPsychologist(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearPsychologist = () => {
    setPsychologist(null);
    setError(null);
  };

  return {
    psychologist,
    loading,
    error,
    fetchPsychologist,
    clearPsychologist
  };
};

