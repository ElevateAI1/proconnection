-- Agregar campo nickname a conversations (apodo personalizado del paciente)
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS patient_nickname TEXT;

COMMENT ON COLUMN public.conversations.patient_nickname IS 'Apodo personalizado que el psicólogo asigna al paciente en esta conversación';

