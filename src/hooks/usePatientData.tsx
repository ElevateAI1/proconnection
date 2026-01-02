
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

export const usePatientData = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel queries for patient and documents
      const [patientResult, documentsResult] = await Promise.all([
        supabase
          .from("patients")
          .select("id, first_name, last_name, phone, age, notes, created_at, psychologist_id")
          .eq("id", patientId)
          .maybeSingle(),
        
        supabase
          .from('patient_documents')
          .select('id, title, type, status, created_at')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
      ]);

      if (patientResult.error) {
        throw patientResult.error;
      }

      if (documentsResult.error) {
        console.error('Error fetching documents:', documentsResult.error);
        // Don't throw here, just set empty documents
      }

      setPatient(patientResult.data);
      setDocuments(documentsResult.data || []);

    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError('Error loading patient data');
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_documents')
        .select('id, title, type, status, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error refetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to refresh documents",
        variant: "destructive",
      });
    }
  };

  return {
    patient,
    documents,
    loading,
    error,
    refetch: fetchPatientData,
    refetchDocuments
  };
};
