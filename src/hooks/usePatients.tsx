
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
}

export const usePatients = () => {
  const { psychologist } = useProfile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (psychologist?.id) {
      fetchPatients();
    }
  }, [psychologist]);

  const fetchPatients = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, age')
        .eq('psychologist_id', psychologist.id)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        throw new Error('Error al cargar los pacientes');
      }

      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, error, refetch: fetchPatients };
};
