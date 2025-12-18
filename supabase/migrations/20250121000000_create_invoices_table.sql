-- ============================================================================
-- Migración: Sistema de Facturación Tipo C
-- Fecha: 2025-01-21
-- ============================================================================
-- Esta migración crea el sistema de facturación automática para facturas
-- tipo C (consumidor final) que no requieren certificado digital ni CAE.
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE FACTURAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  payment_receipt_id UUID REFERENCES public.payment_receipts(id) ON DELETE SET NULL,
  
  -- Datos de la factura
  invoice_type TEXT NOT NULL DEFAULT 'C' CHECK (invoice_type IN ('A', 'B', 'C')),
  point_of_sale INTEGER NOT NULL DEFAULT 1,
  invoice_number INTEGER NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Datos del cliente/consumidor final
  client_name TEXT NOT NULL,
  client_document_type TEXT CHECK (client_document_type IN ('DNI', 'CUIT', 'CUIL', 'LC', 'LE', 'PASSPORT')),
  client_document_number TEXT,
  client_address TEXT,
  client_email TEXT,
  
  -- Datos del servicio
  service_description TEXT NOT NULL,
  service_quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  
  -- Estado y archivos
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'cancelled', 'voided')),
  pdf_url TEXT,
  pdf_file_path TEXT, -- Ruta en storage
  external_invoice_id TEXT, -- ID en servicio externo si se usa integración
  
  -- Metadatos adicionales
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraint para numeración única por psicólogo y punto de venta
  CONSTRAINT invoices_unique_number UNIQUE(psychologist_id, point_of_sale, invoice_number)
);

COMMENT ON TABLE public.invoices IS 'Facturas generadas automáticamente (tipo C para consumidor final)';
COMMENT ON COLUMN public.invoices.invoice_type IS 'Tipo de factura: A (Responsable Inscripto), B (Consumidor Final con CUIT), C (Consumidor Final sin CUIT)';
COMMENT ON COLUMN public.invoices.point_of_sale IS 'Punto de venta (generalmente 1 para monotributistas)';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Número de factura (secuencial por punto de venta)';
COMMENT ON COLUMN public.invoices.status IS 'Estado: draft (borrador), generated (generada), sent (enviada), cancelled (cancelada), voided (anulada)';

-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_invoices_psychologist_id ON public.invoices(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON public.invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_receipt_id ON public.invoices(payment_receipt_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_number_lookup ON public.invoices(psychologist_id, point_of_sale, invoice_number);

-- ============================================================================
-- 3. RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Política: Los psicólogos pueden gestionar sus propias facturas
CREATE POLICY "Psychologists can manage their invoices" 
ON public.invoices FOR ALL 
USING (psychologist_id = auth.uid());

-- Política: Los pacientes pueden ver sus propias facturas (solo lectura)
CREATE POLICY "Patients can view their invoices" 
ON public.invoices FOR SELECT 
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE psychologist_id = auth.uid()
  )
  OR patient_id = auth.uid()
);

-- ============================================================================
-- 4. FUNCIÓN PARA OBTENER PRÓXIMO NÚMERO DE FACTURA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_next_invoice_number(
  p_psychologist_id UUID,
  p_point_of_sale INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  -- Obtener el último número de factura para este psicólogo y punto de venta
  SELECT COALESCE(MAX(invoice_number), 0) + 1
  INTO v_next_number
  FROM public.invoices
  WHERE psychologist_id = p_psychologist_id
    AND point_of_sale = p_point_of_sale
    AND status NOT IN ('cancelled', 'voided');
  
  RETURN v_next_number;
END;
$$;

COMMENT ON FUNCTION public.get_next_invoice_number IS 'Obtiene el próximo número de factura disponible para un psicólogo y punto de venta';

-- ============================================================================
-- 5. FUNCIÓN PARA VALIDAR NUMERACIÓN DE FACTURAS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_invoice_numbering()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_number INTEGER;
  v_gap_count INTEGER;
BEGIN
  -- Verificar que no haya saltos en la numeración (excepto facturas canceladas/anuladas)
  SELECT COUNT(*)
  INTO v_gap_count
  FROM (
    SELECT invoice_number
    FROM public.invoices
    WHERE psychologist_id = NEW.psychologist_id
      AND point_of_sale = NEW.point_of_sale
      AND status NOT IN ('cancelled', 'voided')
      AND invoice_number < NEW.invoice_number
  ) existing
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.invoices
    WHERE psychologist_id = NEW.psychologist_id
      AND point_of_sale = NEW.point_of_sale
      AND invoice_number = existing.invoice_number - 1
      AND status NOT IN ('cancelled', 'voided')
  );
  
  -- Permitir si es la primera factura o si no hay saltos
  IF v_gap_count = 0 OR NEW.invoice_number = 1 THEN
    RETURN NEW;
  END IF;
  
  -- Advertencia (no bloquea, solo registra)
  RAISE WARNING 'Posible salto en numeración de facturas para psicólogo % punto de venta %', 
    NEW.psychologist_id, NEW.point_of_sale;
  
  RETURN NEW;
END;
$$;

-- Trigger para validar numeración (solo advertencia, no bloquea)
DROP TRIGGER IF EXISTS trigger_validate_invoice_numbering ON public.invoices;
CREATE TRIGGER trigger_validate_invoice_numbering
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_invoice_numbering();

-- ============================================================================
-- 6. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. FUNCIÓN PARA CANCELAR/ANULAR FACTURA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cancel_invoice(
  p_invoice_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_psychologist_id UUID;
  v_current_status TEXT;
BEGIN
  -- Obtener datos de la factura
  SELECT psychologist_id, status
  INTO v_psychologist_id, v_current_status
  FROM public.invoices
  WHERE id = p_invoice_id;
  
  IF v_psychologist_id IS NULL THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;
  
  -- Verificar que el usuario sea el dueño
  IF v_psychologist_id != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permiso para cancelar esta factura';
  END IF;
  
  -- Verificar que no esté ya cancelada
  IF v_current_status IN ('cancelled', 'voided') THEN
    RAISE EXCEPTION 'La factura ya está cancelada o anulada';
  END IF;
  
  -- Actualizar estado
  UPDATE public.invoices
  SET 
    status = 'cancelled',
    cancellation_reason = p_reason,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_invoice_id;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.cancel_invoice IS 'Cancela una factura (solo el dueño puede cancelar)';

-- ============================================================================
-- 8. VISTA PARA ESTADÍSTICAS DE FACTURACIÓN
-- ============================================================================

CREATE OR REPLACE VIEW public.invoice_statistics AS
SELECT 
  psychologist_id,
  DATE_TRUNC('month', invoice_date) as month,
  invoice_type,
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE status = 'generated') as generated_count,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  SUM(total_amount) FILTER (WHERE status NOT IN ('cancelled', 'voided')) as total_amount,
  AVG(total_amount) FILTER (WHERE status NOT IN ('cancelled', 'voided')) as avg_amount,
  MIN(invoice_number) as min_number,
  MAX(invoice_number) as max_number
FROM public.invoices
GROUP BY psychologist_id, DATE_TRUNC('month', invoice_date), invoice_type;

COMMENT ON VIEW public.invoice_statistics IS 'Estadísticas de facturación por psicólogo, mes y tipo';

-- ============================================================================
-- 9. VERIFICACIÓN FINAL
-- ============================================================================

DO $$
BEGIN
  -- Verificar que la tabla se creó correctamente
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    RAISE EXCEPTION 'Error: La tabla invoices no se creó correctamente';
  END IF;
  
  -- Verificar que las funciones existen
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_next_invoice_number') THEN
    RAISE EXCEPTION 'Error: La función get_next_invoice_number no se creó correctamente';
  END IF;
  
  RAISE NOTICE '✅ Migración de facturación completada exitosamente';
  RAISE NOTICE '   - Tabla invoices creada';
  RAISE NOTICE '   - Funciones de numeración creadas';
  RAISE NOTICE '   - Políticas RLS configuradas';
  RAISE NOTICE '   - Índices creados';
END $$;

