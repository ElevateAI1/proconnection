
# Configuración Completa: n8n + OpenAI OCR para Comprobantes

## 1. Configuración de Supabase

### Agregar API Key de OpenAI en Secrets
1. Ve a tu proyecto de Supabase
2. Navega a Settings > Edge Functions > Secrets
3. Agrega el siguiente secret:
   ```
   OPENAI_API_KEY = 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
   ```

### Opcional: Configurar Webhook n8n
Si quieres usar n8n además de la Edge Function:
```
N8N_WEBHOOK_URL = https://tu-instancia-n8n.com/webhook/receipt-ocr
```

## 2. Configuración de n8n

### Importar Workflow
1. Copia el contenido del archivo `n8n-receipt-ocr-workflow.json`
2. En n8n, ve a Workflows > Import from JSON
3. Pega el JSON y guarda

### Configurar Credenciales

#### OpenAI API Key
1. Ve a Settings > Credentials
2. Crea nueva credencial: "OpenAI API Key"
3. Nombre: `openai-credentials`
4. API Key: `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`

#### Supabase API
1. Crea nueva credencial: "Supabase API"
2. Nombre: `supabase-credentials`
3. Host: `https://your-supabase-url.supabase.co`
4. Service Role Key: Tu service role key de Supabase

### Actualizar URLs en el Workflow
1. Abre el workflow importado
2. En los nodos "Update Receipt - Success" y "Update Receipt - Error":
   - Cambia `https://your-supabase-url.supabase.co` por tu URL real de Supabase

### Activar el Workflow
1. Activa el workflow en n8n
2. Copia la URL del webhook (aparece en el nodo "Webhook Trigger")

## 3. Configuración en el Sistema

### Actualizar URL del Webhook
En `PatientAppointmentRequestForm.tsx`, línea ~100, cambia:
```typescript
const webhookUrl = 'https://tu-instancia-n8n.com/webhook/receipt-ocr';
```
Por tu URL real del webhook de n8n.

## 4. Flujo Completo del Sistema

### Cuando un paciente sube un comprobante:

1. **Frontend**: Paciente sube archivo en `PatientAppointmentRequestForm`
2. **Supabase Storage**: Archivo se guarda en bucket `payment-proofs`
3. **Database**: Se crea registro en `payment_receipts` con status `pending`
4. **Doble Procesamiento**:
   - **Edge Function**: `process-receipt-ocr` procesa con OpenAI
   - **n8n Webhook**: Workflow paralelo procesa con OpenAI
5. **OpenAI Vision**: Extrae datos del comprobante automáticamente
6. **Database Update**: Se actualiza registro con datos extraídos
7. **Real-time**: Frontend recibe notificación de procesamiento completo
8. **Profesional**: Ve comprobante procesado para validación

### Estados del Comprobante:
- `pending`: Recién subido, esperando procesamiento
- `processing`: Siendo procesado por IA
- `extracted`: Datos extraídos exitosamente, necesita validación
- `error`: Error en procesamiento automático
- `approved`: Validado y aprobado por profesional
- `rejected`: Rechazado por profesional

## 5. Datos Extraídos Automáticamente

El sistema extrae:
- **Fecha**: Del comprobante
- **Monto**: Valor total a pagar
- **Tipo**: factura_a, factura_b, factura_c, recibo, etc.
- **Número**: Número del comprobante
- **CUIT**: Del emisor (si está presente)
- **Método de Pago**: transferencia, efectivo, tarjeta
- **Descripción**: Del servicio prestado
- **Confianza**: Nivel de precisión de la extracción (0-1)

## 6. Beneficios del Sistema

- ✅ **Procesamiento Automático**: Sin intervención manual
- ✅ **Doble Redundancia**: Edge Function + n8n
- ✅ **Tiempo Real**: Notificaciones instantáneas
- ✅ **Alta Precisión**: OpenAI Vision API
- ✅ **Validación Humana**: Profesional revisa antes de aprobar
- ✅ **Integración Contable**: Automáticamente en reportes mensuales

## 7. Resolución de Problemas

### Si OCR falla:
1. Check logs en Supabase Functions
2. Verificar que OpenAI API key esté configurada
3. Verificar formato del archivo (JPG, PNG, PDF)
4. Usar botón "Reintentar OCR" en el panel del profesional

### Si n8n no funciona:
1. Verificar que el workflow esté activo
2. Check credenciales de OpenAI y Supabase
3. Verificar URL del webhook en el código
4. El sistema funcionará solo con Edge Function como respaldo

## 8. Testing

Para probar el sistema:
1. Sube un comprobante como paciente
2. Verifica que aparece con status "processing"
3. Espera 30-60 segundos
4. Debe cambiar a "extracted" con datos extraídos
5. Como profesional, valida y aprueba
6. Verifica que aparece en reportes contables
```
