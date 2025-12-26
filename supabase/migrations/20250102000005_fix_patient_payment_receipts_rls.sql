-- Agregar políticas RLS para que los pacientes puedan crear y ver sus propios comprobantes de pago
-- y crear solicitudes de citas

-- Políticas RLS para payment_receipts
-- Los pacientes pueden ver sus propios comprobantes de pago
CREATE POLICY "Patients can view their own payment receipts" ON public.payment_receipts
  FOR SELECT USING (patient_id = auth.uid());

-- Los pacientes pueden insertar sus propios comprobantes de pago
CREATE POLICY "Patients can insert their own payment receipts" ON public.payment_receipts
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Políticas RLS para appointment_requests
-- Los pacientes pueden crear solicitudes de citas
CREATE POLICY "Patients can create appointment requests" ON public.appointment_requests
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Los pacientes pueden ver sus propias solicitudes de citas
CREATE POLICY "Patients can view their own appointment requests" ON public.appointment_requests
  FOR SELECT USING (patient_id = auth.uid());

-- Los pacientes pueden actualizar sus propias solicitudes de citas (solo si están pendientes)
CREATE POLICY "Patients can update their own pending appointment requests" ON public.appointment_requests
  FOR UPDATE USING (patient_id = auth.uid() AND status = 'pending');

COMMENT ON POLICY "Patients can view their own payment receipts" ON public.payment_receipts IS 'Permite que los pacientes vean sus propios comprobantes de pago';
COMMENT ON POLICY "Patients can insert their own payment receipts" ON public.payment_receipts IS 'Permite que los pacientes creen comprobantes de pago para sus propias citas';
COMMENT ON POLICY "Patients can create appointment requests" ON public.appointment_requests IS 'Permite que los pacientes creen solicitudes de citas';
COMMENT ON POLICY "Patients can view their own appointment requests" ON public.appointment_requests IS 'Permite que los pacientes vean sus propias solicitudes de citas';
COMMENT ON POLICY "Patients can update their own pending appointment requests" ON public.appointment_requests IS 'Permite que los pacientes actualicen sus solicitudes de citas pendientes';

