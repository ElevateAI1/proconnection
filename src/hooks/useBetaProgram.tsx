
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

interface BetaFeature {
  id: string;
  title: string;
  description: string;
  status: 'development' | 'planning' | 'design' | 'testing';
  availability: string;
  interested_users?: string[];
}

interface BetaFeedback {
  id: string;
  psychologist_id: string;
  type: 'suggestion' | 'bug' | 'improvement' | 'general';
  title: string;
  description: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'implemented';
}

export const useBetaProgram = () => {
  const { psychologist } = useProfile();
  const [betaFeatures, setBetaFeatures] = useState<BetaFeature[]>([]);
  const [userFeedback, setUserFeedback] = useState<BetaFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchBetaData = async () => {
    try {
      setLoading(true);
      
      // Simular datos de beta features
      const mockFeatures: BetaFeature[] = [
        {
          id: 'ai-assistant',
          title: 'Asistente IA para Terapias',
          description: 'IA que sugiere técnicas terapéuticas basadas en el progreso del paciente',
          status: 'development',
          availability: 'Q2 2024',
          interested_users: []
        },
        {
          id: 'voice-notes',
          title: 'Notas de Voz Automáticas',
          description: 'Transcripción automática de sesiones con análisis de sentimientos',
          status: 'planning',
          availability: 'Q3 2024'
        },
        {
          id: 'patient-app',
          title: 'App Móvil para Pacientes',
          description: 'Aplicación dedicada para que pacientes hagan seguimiento entre sesiones',
          status: 'design',
          availability: 'Q4 2024'
        },
        {
          id: 'ai-insights',
          title: 'Insights Predictivos con IA',
          description: 'Análisis predictivo de riesgo de cancelación y recomendaciones de tratamiento',
          status: 'testing',
          availability: 'Próximamente'
        }
      ];

      setBetaFeatures(mockFeatures);
      
      // Simular feedback del usuario
      if (psychologist?.id) {
        const mockFeedback: BetaFeedback[] = [
          {
            id: '1',
            psychologist_id: psychologist.id,
            type: 'suggestion',
            title: 'Integración con Google Calendar',
            description: 'Sería útil poder sincronizar automáticamente las citas con Google Calendar',
            created_at: '2024-01-15T10:00:00Z',
            status: 'reviewed'
          }
        ];
        setUserFeedback(mockFeedback);
      }
      
      // Simular estado de inscripción
      setIsEnrolled(true);
      
    } catch (err) {
      console.error('Error fetching beta data:', err);
    } finally {
      setLoading(false);
    }
  };

  const enrollInBeta = async () => {
    if (!psychologist?.id) return;

    try {
      setSubmitting(true);
      
      // Simular inscripción
      setIsEnrolled(true);
      
      toast({
        title: "¡Bienvenido al programa Beta!",
        description: "Te notificaremos sobre nuevas funcionalidades exclusivas.",
      });
    } catch (err) {
      console.error('Error enrolling in beta:', err);
      toast({
        title: "Error",
        description: "No se pudo completar la inscripción. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async (feedbackData: {
    type: BetaFeedback['type'];
    title: string;
    description: string;
  }) => {
    if (!psychologist?.id) return { data: null, error: 'Usuario no autenticado' };

    try {
      setSubmitting(true);
      
      const newFeedback: BetaFeedback = {
        id: Date.now().toString(),
        psychologist_id: psychologist.id,
        type: feedbackData.type,
        title: feedbackData.title,
        description: feedbackData.description,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      setUserFeedback(prev => [newFeedback, ...prev]);
      
      toast({
        title: "Feedback enviado",
        description: "Gracias por tu sugerencia. La revisaremos pronto.",
      });

      return { data: newFeedback, error: null };
    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar feedback';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  const expressInterest = async (featureId: string) => {
    if (!psychologist?.id || !isEnrolled) return;

    try {
      setBetaFeatures(prev => prev.map(feature => 
        feature.id === featureId 
          ? { 
              ...feature, 
              interested_users: [...(feature.interested_users || []), psychologist.id]
            }
          : feature
      ));

      toast({
        title: "Interés registrado",
        description: "Te notificaremos cuando esta funcionalidad esté disponible para pruebas.",
      });
    } catch (err) {
      console.error('Error expressing interest:', err);
    }
  };

  useEffect(() => {
    fetchBetaData();
  }, [psychologist?.id]);

  return {
    betaFeatures,
    userFeedback,
    loading,
    submitting,
    isEnrolled,
    enrollInBeta,
    submitFeedback,
    expressInterest,
    refetch: fetchBetaData
  };
};
