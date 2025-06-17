
-- Crear tabla para registros clínicos
CREATE TABLE public.clinical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  psychologist_id UUID NOT NULL,
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'consulta',
  main_symptoms TEXT,
  observations TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

-- Política para que los psicólogos solo vean sus propios registros
CREATE POLICY "Psychologists can view their own clinical records" 
  ON public.clinical_records 
  FOR SELECT 
  USING (psychologist_id = auth.uid());

-- Política para crear registros
CREATE POLICY "Psychologists can create clinical records" 
  ON public.clinical_records 
  FOR INSERT 
  WITH CHECK (psychologist_id = auth.uid());

-- Política para actualizar registros
CREATE POLICY "Psychologists can update their own clinical records" 
  ON public.clinical_records 
  FOR UPDATE 
  USING (psychologist_id = auth.uid());

-- Política para eliminar registros
CREATE POLICY "Psychologists can delete their own clinical records" 
  ON public.clinical_records 
  FOR DELETE 
  USING (psychologist_id = auth.uid());

-- Agregar índices para mejor rendimiento
CREATE INDEX idx_clinical_records_patient_id ON public.clinical_records(patient_id);
CREATE INDEX idx_clinical_records_psychologist_id ON public.clinical_records(psychologist_id);
CREATE INDEX idx_clinical_records_session_date ON public.clinical_records(session_date);
