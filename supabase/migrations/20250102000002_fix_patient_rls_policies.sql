-- Agregar políticas RLS para que los pacientes puedan gestionar sus propios datos

-- Primero eliminar las políticas existentes que bloquean a los pacientes (si existen)
DROP POLICY IF EXISTS "Patients can view their own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can insert their own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can update their own record" ON public.patients;

-- Política para que los pacientes puedan ver su propio registro
CREATE POLICY "Patients can view their own record" ON public.patients
  FOR SELECT USING (id = auth.uid());

-- Política para que los pacientes puedan insertar su propio registro
CREATE POLICY "Patients can insert their own record" ON public.patients
  FOR INSERT WITH CHECK (id = auth.uid());

-- Política para que los pacientes puedan actualizar su propio registro
CREATE POLICY "Patients can update their own record" ON public.patients
  FOR UPDATE USING (id = auth.uid());

-- Habilitar RLS en patient_psychologists
ALTER TABLE public.patient_psychologists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para patient_psychologists
-- Los pacientes pueden ver sus propias relaciones
CREATE POLICY "Patients can view their psychologist relations" ON public.patient_psychologists
  FOR SELECT USING (patient_id = auth.uid());

-- Los pacientes pueden insertar sus propias relaciones
CREATE POLICY "Patients can add their psychologist relations" ON public.patient_psychologists
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Los pacientes pueden actualizar sus propias relaciones
CREATE POLICY "Patients can update their psychologist relations" ON public.patient_psychologists
  FOR UPDATE USING (patient_id = auth.uid());

-- Los pacientes pueden eliminar sus propias relaciones
CREATE POLICY "Patients can delete their psychologist relations" ON public.patient_psychologists
  FOR DELETE USING (patient_id = auth.uid());

-- Los psicólogos pueden ver relaciones donde son el psicólogo
CREATE POLICY "Psychologists can view relations where they are the psychologist" ON public.patient_psychologists
  FOR SELECT USING (psychologist_id = auth.uid());

-- Política para que los pacientes puedan ver información básica de sus psicólogos vinculados
CREATE POLICY "Patients can view their linked psychologists" ON public.psychologists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_psychologists
      WHERE patient_psychologists.psychologist_id = psychologists.id
      AND patient_psychologists.patient_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.psychologist_id = psychologists.id
      AND patients.id = auth.uid()
    )
  );

COMMENT ON POLICY "Patients can view their own record" ON public.patients IS 'Permite que los pacientes vean su propio registro';
COMMENT ON POLICY "Patients can insert their own record" ON public.patients IS 'Permite que los pacientes creen su propio registro';
COMMENT ON POLICY "Patients can update their own record" ON public.patients IS 'Permite que los pacientes actualicen su propio registro';
COMMENT ON POLICY "Patients can view their linked psychologists" ON public.psychologists IS 'Permite que los pacientes vean información básica de sus psicólogos vinculados';

