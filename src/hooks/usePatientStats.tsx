
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PatientStats {
  totalAppointments: number;
  totalDocuments: number;
  lastAppointment?: string;
}

export const usePatientStats = (patientId: string, psychologistId?: string) => {
  const [stats, setStats] = useState<PatientStats>({
    totalAppointments: 0,
    totalDocuments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId || !psychologistId) {
      setLoading(false);
      return;
    }

    fetchPatientStats();
  }, [patientId, psychologistId]);

  const fetchPatientStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel queries for better performance
      const [appointmentsResult, documentsResult, conversationResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, appointment_date')
          .eq('patient_id', patientId)
          .eq('psychologist_id', psychologistId),
        
        supabase
          .from('patient_documents')
          .select('id')
          .eq('patient_id', patientId)
          .eq('psychologist_id', psychologistId),
        
        supabase
          .from('conversations')
          .select('id')
          .eq('patient_id', patientId)
          .eq('psychologist_id', psychologistId)
          .maybeSingle()
      ]);

      const appointments = appointmentsResult.data || [];
      const documents = documentsResult.data || [];
      
      const lastAppointment = appointments.length > 0 
        ? appointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0]
        : null;

      setStats({
        totalAppointments: appointments.length,
        totalDocuments: documents.length,
        lastAppointment: lastAppointment?.appointment_date
      });

    } catch (error) {
      console.error('Error fetching patient stats:', error);
      setError('Error loading patient statistics');
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas del paciente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchPatientStats };
};
