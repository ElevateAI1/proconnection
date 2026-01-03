import { useNavigate, useParams } from "react-router-dom";
import { PatientChat } from "@/components/patient/PatientChat";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PatientChatPage = () => {
  const navigate = useNavigate();
  const { psychologistId } = useParams<{ psychologistId?: string }>();
  const { profile, patient } = useProfile();
  const { user } = useAuth();
  const [psychologistInfo, setPsychologistInfo] = useState<{
    name: string;
    image: string | null;
  } | null>(null);

  // Si no hay psychologistId en la URL, intentar obtenerlo del paciente
  const finalPsychologistId = psychologistId || patient?.psychologist_id;

  // Obtener información del psicólogo
  useEffect(() => {
    if (!finalPsychologistId || !user?.id) return;

    const fetchPsychologistInfo = async () => {
      // Primero intentar desde patient_psychologists
      const { data: relation } = await supabase
        .from('patient_psychologists')
        .select(`
          psychologist:psychologists!inner(
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('patient_id', user.id)
        .eq('psychologist_id', finalPsychologistId)
        .maybeSingle();

      if (relation?.psychologist) {
        setPsychologistInfo({
          name: `${relation.psychologist.first_name} ${relation.psychologist.last_name}`,
          image: relation.psychologist.profile_image_url || null
        });
        return;
      }

      // Fallback: obtener directamente desde psychologists
      const { data: psych } = await supabase
        .from('psychologists')
        .select('first_name, last_name, profile_image_url')
        .eq('id', finalPsychologistId)
        .maybeSingle();

      if (psych) {
        setPsychologistInfo({
          name: `${psych.first_name} ${psych.last_name}`,
          image: psych.profile_image_url || null
        });
      } else {
        setPsychologistInfo({
          name: "Tu Psicólogo",
          image: null
        });
      }
    };

    fetchPsychologistInfo();
  }, [finalPsychologistId, user?.id]);

  // Si no hay psicólogo vinculado, redirigir al dashboard
  if (!finalPsychologistId && patient) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-white-warm">
        <div className="border-b border-celeste-gray/30 bg-white-warm/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-blue-petrol hover:text-blue-petrol/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-lg font-semibold text-blue-petrol">Mensajes</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto h-[calc(100vh-73px)]">
          {finalPsychologistId ? (
            <PatientChat
              psychologistId={finalPsychologistId}
              psychologistName={psychologistInfo?.name || "Tu Psicólogo"}
              psychologistImage={psychologistInfo?.image || null}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-6">
                <p className="text-blue-petrol/70">No hay psicólogo vinculado</p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="mt-4"
                >
                  Volver al dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RealtimeProvider>
  );
};

