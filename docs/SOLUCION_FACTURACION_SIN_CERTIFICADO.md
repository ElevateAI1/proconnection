# Solución de Facturación Automática sin Certificado Digital

## 📋 Contexto

**Problema:** Necesitamos implementar facturación automática sin:
- Certificado digital para ARCA
- Ser SRL todavía (probablemente monotributista o persona física)

## ✅ Soluciones Disponibles

### Opción 1: Facturas Tipo C (Consumidor Final) - RECOMENDADA

**Ventajas:**
- ✅ No requiere certificado digital
- ✅ No requiere CAE (Código de Autorización Electrónico)
- ✅ Válidas para monotributistas
- ✅ Se pueden generar automáticamente desde la plataforma
- ✅ Cumplen con requisitos básicos de AFIP

**Implementación:**
- Generar PDFs de facturas tipo C con formato AFIP
- Numeración automática secuencial
- Incluir datos del profesional (nombre, CUIT, condición fiscal)
- Datos del paciente/consumidor final
- Descripción del servicio, monto, fecha

**Limitaciones:**
- Solo para consumidores finales (no facturan a empresas)
- No tienen CAE (no son facturas electrónicas oficiales)
- Para algunos pacientes puede no ser suficiente

### Opción 2: Integración con Servicios de Facturación Online

**Servicios disponibles sin certificado:**

#### A. FacturadorOnline / FacturacionSimple
- ✅ API simple con usuario/contraseña
- ✅ Generan facturas electrónicas válidas
- ✅ No requieren certificado digital propio
- ✅ Costo: ~$500-1000 ARS por factura o suscripción mensual

#### B. Nubefact / FacturacionCloud
- ✅ Similar a FacturadorOnline
- ✅ API REST disponible
- ✅ Integración relativamente simple

**Implementación:**
```typescript
// Ejemplo de integración con servicio externo
const generateInvoice = async (invoiceData) => {
  const response = await fetch('https://api.facturadoronline.com/invoices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo: 'C',
      punto_venta: 1,
      numero: getNextInvoiceNumber(),
      fecha: new Date().toISOString().split('T')[0],
      cliente: {
        nombre: invoiceData.patientName,
        tipo_documento: 'DNI',
        numero_documento: invoiceData.patientDni
      },
      items: [{
        descripcion: invoiceData.serviceDescription,
        cantidad: 1,
        precio_unitario: invoiceData.amount
      }]
    })
  });
  
  return await response.json();
};
```

### Opción 3: Generación de Comprobantes Informales (Temporal)

**Para uso interno mientras se implementa solución definitiva:**
- Generar PDFs con formato de "Recibo" o "Comprobante de Pago"
- No son facturas oficiales pero sirven como comprobante
- Útiles para registro interno y presentación a pacientes
- Se pueden convertir a facturas oficiales después

## 🚀 Recomendación: Implementación Híbrida

### Fase 1: Facturas Tipo C Automáticas (Inmediato)
1. Crear componente de generación de facturas tipo C
2. Numeración automática por psicólogo
3. Generación de PDF con formato AFIP
4. Almacenamiento en base de datos

### Fase 2: Integración con Servicio Externo (Mediano Plazo)
1. Evaluar servicios disponibles (FacturadorOnline, Nubefact)
2. Implementar integración opcional
3. Permitir que psicólogos elijan: factura propia o servicio externo

### Fase 3: Migración a ARCA (Futuro)
1. Cuando obtengan certificado digital
2. Cuando sean SRL o tengan estructura adecuada
3. Migrar a facturación electrónica oficial

## 📝 Estructura de Datos Necesaria

```sql
-- Tabla de facturas generadas
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  -- Datos de la factura
  invoice_type TEXT NOT NULL DEFAULT 'C', -- C, A, B
  point_of_sale INTEGER NOT NULL DEFAULT 1,
  invoice_number INTEGER NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Datos del cliente
  client_name TEXT NOT NULL,
  client_document_type TEXT, -- DNI, CUIT, etc.
  client_document_number TEXT,
  client_address TEXT,
  
  -- Datos del servicio
  service_description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  
  -- Estado y archivos
  status TEXT NOT NULL DEFAULT 'draft', -- draft, generated, sent, cancelled
  pdf_url TEXT,
  external_invoice_id TEXT, -- ID en servicio externo si se usa
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraint para numeración única por psicólogo
  UNIQUE(psychologist_id, point_of_sale, invoice_number)
);

-- Índices
CREATE INDEX idx_invoices_psychologist_id ON public.invoices(psychologist_id);
CREATE INDEX idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologists can manage their invoices" 
ON public.invoices FOR ALL 
USING (psychologist_id = auth.uid());
```

## 🔧 Componentes a Crear

### 1. InvoiceGenerator Component
```typescript
// src/components/InvoiceGenerator.tsx
- Formulario para generar factura
- Selección de paciente/cita
- Generación de PDF
- Numeración automática
```

### 2. InvoiceList Component
```typescript
// src/components/InvoiceList.tsx
- Lista de facturas generadas
- Filtros por fecha, paciente, estado
- Descarga de PDFs
- Reenvío de facturas
```

### 3. InvoicePDF Generator
```typescript
// src/utils/invoicePDFGenerator.ts
- Generación de PDF con jsPDF
- Formato AFIP para facturas tipo C
- Incluir datos del profesional
- Incluir datos del cliente
- Numeración y fecha
```

### 4. Edge Function para Servicios Externos (Opcional)
```typescript
// supabase/functions/generate-invoice-external/index.ts
- Integración con API de facturación externa
- Manejo de errores
- Almacenamiento de respuesta
```

## 📊 Flujo de Facturación Propuesto

```
1. Psicólogo completa sesión con paciente
   ↓
2. Sistema sugiere generar factura
   ↓
3. Psicólogo confirma y completa datos (si faltan)
   ↓
4. Sistema genera factura tipo C automáticamente
   - Numeración automática
   - PDF con formato AFIP
   - Almacenamiento en DB
   ↓
5. Factura disponible para:
   - Descarga por psicólogo
   - Envío por email al paciente (futuro)
   - Inclusión en reportes contables
```

## ⚠️ Consideraciones Legales

1. **Facturas Tipo C:**
   - Válidas para monotributistas
   - No requieren CAE para consumidor final
   - Deben cumplir formato AFIP básico

2. **Almacenamiento:**
   - Guardar PDFs en Supabase Storage
   - Mantener registro en base de datos
   - Cumplir con tiempos de retención (5 años)

3. **Numeración:**
   - Debe ser secuencial sin saltos
   - Por punto de venta
   - No se pueden eliminar, solo anular

## 🎯 Próximos Pasos

1. ✅ Crear tabla `invoices` en base de datos
2. ✅ Crear componente `InvoiceGenerator`
3. ✅ Implementar generador de PDF tipo C
4. ✅ Agregar numeración automática
5. ⏳ (Opcional) Integrar con servicio externo
6. ⏳ (Futuro) Migrar a ARCA cuando sea posible

## 💡 Alternativa Rápida: Comprobantes de Pago

Mientras se implementa facturación completa, se puede:
- Mejorar el sistema actual de comprobantes
- Generar PDFs más formales de "Recibo de Pago"
- Incluir datos necesarios para presentación a AFIP
- Estos comprobantes pueden servir como respaldo hasta tener facturas oficiales

