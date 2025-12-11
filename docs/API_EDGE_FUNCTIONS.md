# API de Edge Functions - PsiConnect

Documentación completa de todas las Edge Functions disponibles en el sistema.

## Tabla de Contenidos

- [process-receipt-ocr](#process-receipt-ocr)
- [create-jitsi-meeting](#create-jitsi-meeting)
- [create-mercadopago-preference](#create-mercadopago-preference)
- [generate-monthly-report](#generate-monthly-report)
- [send-verification-email](#send-verification-email)
- [whatsapp-manager](#whatsapp-manager)
- [process-whatsapp-notifications](#process-whatsapp-notifications)
- [notification-scheduler](#notification-scheduler)
- [generate-autocomplete-suggestions](#generate-autocomplete-suggestions)
- [API de Estadísticas](#api-de-estadísticas)
- [API de Pacientes](#api-de-pacientes)
- [API de Psicólogos](#api-de-psicólogos)
- [API de Suscripciones](#api-de-suscripciones)
- [API de Cuentas](#api-de-cuentas)

---

## process-receipt-ocr

Procesa comprobantes de pago usando OCR (Optical Character Recognition) a través de N8N y OpenAI.

### Endpoint
```
POST /functions/v1/process-receipt-ocr
```

### Parámetros de Entrada

```typescript
{
  fileUrl: string;      // URL del archivo del comprobante
  receiptId: string;     // ID del registro en payment_receipts
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  message: string;
  receiptId: string;
  extractedData?: {
    amount?: number;
    date?: string;
    receipt_type?: string;
    payment_method?: string;
    receipt_number?: string;
    patient_cuit?: string;
    confidence?: number;
  };
  extractedMonth?: number;
  extractedYear?: number;
  n8nResponse?: any;
}
```

### Códigos de Error

- `400` - Parámetros faltantes o inválidos
- `404` - Comprobante no encontrado
- `500` - Error en el procesamiento OCR

### Ejemplo de Uso

```typescript
const response = await supabase.functions.invoke('process-receipt-ocr', {
  body: {
    fileUrl: 'https://supabase.co/storage/v1/object/public/payment-proofs/user123/receipt.pdf',
    receiptId: 'receipt-uuid-123'
  }
});
```

### Variables de Entorno Requeridas

- `N8N_WEBHOOK_URL` - URL del webhook de N8N para procesamiento OCR
- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key de Supabase

---

## create-jitsi-meeting

Crea una reunión de Jitsi Meet para una cita programada.

### Endpoint
```
POST /functions/v1/create-jitsi-meeting
```

### Parámetros de Entrada

```typescript
{
  appointmentId: string;        // ID de la cita
  patientName: string;          // Nombre del paciente
  psychologistName: string;     // Nombre del psicólogo
  appointmentDate?: string;      // Fecha de la cita (ISO string)
  roomName?: string;             // Nombre de la sala (opcional)
  startTime?: number;            // Timestamp de inicio (opcional)
  duration?: number;             // Duración en minutos (opcional)
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  meetingUrl: string;           // URL de la reunión Jitsi
  roomName: string;              // Nombre de la sala generada
  appointmentId: string;
}
```

### Códigos de Error

- `400` - Parámetros faltantes
- `500` - Error al crear la reunión

### Ejemplo de Uso

```typescript
const response = await supabase.functions.invoke('create-jitsi-meeting', {
  body: {
    appointmentId: 'appointment-uuid-123',
    patientName: 'Juan Pérez',
    psychologistName: 'Dr. María González',
    appointmentDate: '2025-01-15T10:00:00Z'
  }
});
```

---

## create-mercadopago-preference

Crea una preferencia de pago en MercadoPago para suscripciones.

### Endpoint
```
POST /functions/v1/create-mercadopago-preference
```

### Parámetros de Entrada

```typescript
{
  planId: 'monthly' | 'yearly';  // Tipo de plan
  psychologistId: string;        // ID del psicólogo
  psychologistEmail: string;     // Email del psicólogo
  psychologistName: string;      // Nombre del psicólogo
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  preferenceId: string;          // ID de la preferencia de MercadoPago
  initPoint: string;              // URL de pago
  sandboxInitPoint?: string;      // URL de pago en sandbox
}
```

### Códigos de Error

- `400` - Plan inválido o parámetros faltantes
- `500` - Error al crear la preferencia

### Ejemplo de Uso

```typescript
const response = await supabase.functions.invoke('create-mercadopago-preference', {
  body: {
    planId: 'monthly',
    psychologistId: 'psychologist-uuid-123',
    psychologistEmail: 'psychologist@example.com',
    psychologistName: 'Dr. María González'
  }
});
```

### Variables de Entorno Requeridas

- `MERCADOPAGO_ACCESS_TOKEN` - Access token de MercadoPago

---

## generate-monthly-report

Genera un reporte mensual de ingresos para un psicólogo.

### Endpoint
```
POST /functions/v1/generate-monthly-report
```

### Parámetros de Entrada

```typescript
{
  psychologist_id: string;  // ID del psicólogo
  month: number;            // Mes (1-12)
  year: number;             // Año (ej: 2025)
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  report: {
    psychologist_id: string;
    report_month: number;
    report_year: number;
    total_amount: number;
    total_receipts: number;
    amount_by_payment_method: {
      [method: string]: number;
    };
    annual_accumulated: number;
    status: string;
  };
  reportId: string;
}
```

### Códigos de Error

- `400` - Parámetros inválidos
- `500` - Error al generar el reporte

### Ejemplo de Uso

```typescript
const response = await supabase.functions.invoke('generate-monthly-report', {
  body: {
    psychologist_id: 'psychologist-uuid-123',
    month: 1,
    year: 2025
  }
});
```

---

## send-verification-email

Envía un email de verificación personalizado a un usuario.

### Endpoint
```
POST /functions/v1/send-verification-email
```

### Parámetros de Entrada

```typescript
{
  email: string;           // Email del usuario
  token: string;           // Token de verificación (base64 encoded)
  action_type: string;     // Tipo de acción ('signup', 'reset', etc.)
  user_type: string;       // Tipo de usuario ('psychologist', 'patient')
  first_name: string;      // Nombre del usuario
  redirect_to?: string;    // URL de redirección (opcional)
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  messageId: string;        // ID del mensaje enviado
  email: string;
}
```

### Códigos de Error

- `400` - Parámetros faltantes
- `500` - Error al enviar el email

### Ejemplo de Uso

```typescript
const response = await supabase.functions.invoke('send-verification-email', {
  body: {
    email: 'user@example.com',
    token: 'base64-encoded-token',
    action_type: 'signup',
    user_type: 'psychologist',
    first_name: 'María'
  }
});
```

### Variables de Entorno Requeridas

- `RESEND_API_KEY` - API key de Resend para envío de emails

---

## whatsapp-manager

Gestiona el envío de mensajes de WhatsApp.

### Endpoint
```
POST /functions/v1/whatsapp-manager
```

### Parámetros de Entrada

```typescript
{
  action: 'send' | 'status' | 'health';
  phoneNumber?: string;     // Número de teléfono (con código de país)
  message?: string;         // Mensaje a enviar
  priority?: 'low' | 'normal' | 'high';
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  messageId?: string;
  status?: string;
  // ... otros campos según la acción
}
```

### Códigos de Error

- `400` - Parámetros inválidos
- `500` - Error en el servidor de WhatsApp

---

## process-whatsapp-notifications

Procesa notificaciones de WhatsApp desde el sistema de recordatorios.

### Endpoint
```
POST /functions/v1/process-whatsapp-notifications
```

### Parámetros de Entrada

```typescript
{
  psychologist_id?: string;  // ID del psicólogo (opcional, para filtrar)
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  processed: number;         // Cantidad de notificaciones procesadas
  sent: number;              // Cantidad enviadas exitosamente
  failed: number;            // Cantidad fallidas
}
```

---

## notification-scheduler

Programa y gestiona notificaciones automáticas.

### Endpoint
```
POST /functions/v1/notification-scheduler
```

### Parámetros de Entrada

```typescript
{
  action: 'schedule' | 'cancel' | 'list';
  notificationData?: {
    psychologist_id: string;
    patient_id?: string;
    type: string;
    scheduled_time: string;
    delivery_methods: string[];
    message?: string;
  };
  notificationId?: string;
}
```

---

## generate-autocomplete-suggestions

Genera sugerencias de autocompletado para búsquedas.

### Endpoint
```
POST /functions/v1/generate-autocomplete-suggestions
```

### Parámetros de Entrada

```typescript
{
  query: string;           // Texto de búsqueda
  type?: string;          // Tipo de sugerencias ('psychologist', 'specialty', etc.)
  limit?: number;         // Límite de resultados (default: 10)
}
```

### Respuesta Exitosa

```typescript
{
  success: true;
  suggestions: Array<{
    id: string;
    text: string;
    type: string;
    relevance: number;
  }>;
}
```

---

## API de Estadísticas

### Endpoint
```
GET /functions/v1/api-stats
```

### Respuesta Exitosa

```typescript
{
  total_psychologists: number;
  total_patients: number;
  total_appointments: number;
  active_subscriptions: number;
  // ... más estadísticas
}
```

---

## API de Pacientes

### Endpoint
```
GET /functions/v1/api-patients
POST /functions/v1/api-patients
PUT /functions/v1/api-patients/:id
DELETE /functions/v1/api-patients/:id
```

### Parámetros

- `psychologist_id` - Filtrar por psicólogo
- `patient_id` - ID del paciente (para operaciones específicas)

---

## API de Psicólogos

### Endpoint
```
GET /functions/v1/api-psychologists
POST /functions/v1/api-psychologists
PUT /functions/v1/api-psychologists/:id
```

---

## API de Suscripciones

### Endpoint
```
GET /functions/v1/api-subscriptions
POST /functions/v1/api-subscriptions
PUT /functions/v1/api-subscriptions/:id
```

---

## API de Cuentas

### Endpoint
```
GET /functions/v1/api-accounts
POST /functions/v1/api-accounts
PUT /functions/v1/api-accounts/:id
```

---

## Autenticación

Todas las Edge Functions requieren autenticación mediante:

1. **Header de autorización**: `Authorization: Bearer <token>`
2. **API Key de Supabase**: `apikey: <supabase-anon-key>`

## Manejo de Errores

Todas las funciones siguen un formato consistente de error:

```typescript
{
  error: string;           // Mensaje de error
  success: false;
  timestamp?: string;      // Timestamp del error
  details?: string;        // Detalles adicionales
}
```

## CORS

Todas las funciones incluyen headers CORS para permitir requests desde el frontend:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

## Rate Limiting

Algunas funciones críticas implementan rate limiting:
- `process-receipt-ocr`: Máximo 10 requests por minuto por usuario
- `create-mercadopago-preference`: Máximo 5 requests por minuto por usuario
- `whatsapp-manager`: Máximo 20 requests por minuto por usuario

## Logging

Todas las funciones incluyen logging extensivo. Los logs están disponibles en:
- Supabase Dashboard → Edge Functions → Logs
- Console logs con formato: `=== FUNCTION_NAME ===`

---

**Última actualización:** Enero 2025

