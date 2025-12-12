
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
  notes?: string;
  created_at: string;
  psychologist_id: string;
}

type PatientInsert = Omit<Patient, 'id' | 'created_at'>;

export const useOptimizedPatients = (psychologistId?: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (psychologistId) {
      fetchPatients();
    } else {
      setPatients([]);
      setLoading(false);
    }
  }, [psychologistId]);

  const fetchPatients = async () => {
    if (!psychologistId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching patients for psychologist:', psychologistId);

      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, age, notes, created_at, psychologist_id')
        .eq('psychologist_id', psychologistId)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        throw new Error('Error loading patients');
      }

      console.log('Patients loaded:', data?.length || 0);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'psychologist_id'>) => {
    if (!psychologistId) return false;

    try {
      setLoading(true);
      setError(null);

      // Use the edge function API to create patient (which handles auth user and profile creation)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      // Get API key from environment or use a default (you should set this in your .env)
      const apiKey = import.meta.env.VITE_API_KEY || 'tu-api-key-secreta-123';
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edge-function-proconnection/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          first_name: patientData.first_name,
          last_name: patientData.last_name,
          phone: patientData.phone || null,
          age: patientData.age || null,
          notes: patientData.notes || null,
          psychologist_id: psychologistId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al agregar paciente');
      }

      // Refetch patients to get the complete list with proper IDs
      await fetchPatients();
      
      toast({
        title: "Paciente agregado",
        description: "El paciente ha sido agregado exitosamente",
      });

      return true;
    } catch (error) {
      console.error('Error adding patient:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, error, refetch: fetchPatients, addPatient };
};
