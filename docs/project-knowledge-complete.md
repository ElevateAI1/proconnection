
# Conocimiento Completo del Proyecto - PsiConnect

## 🎯 VISIÓN GENERAL DEL PROYECTO

### Descripción del Proyecto
PsiConnect es un sistema integral de gestión para psicólogos que permite administrar consultorios de manera profesional. El sistema incluye portales diferenciados para psicólogos y pacientes, con funcionalidades completas de gestión, comunicación y administración contable.

### Objetivos Principales
- Centralizar la gestión de pacientes y citas
- Facilitar la comunicación psicólogo-paciente
- Automatizar procesos administrativos y contables
- Proporcionar herramientas de visibilidad profesional
- Ofrecer sistema de afiliados para crecimiento

### Modelo de Negocio
- **Planes de suscripción**: Plus ($2,900 ARS/mes) y Pro ($29,000 ARS/año)
- **Trial gratuito**: 7 días para nuevos usuarios
- **Sistema de afiliados**: Comisiones del 10% por referidos
- **Integraciones premium**: OCR automático, videollamadas, reportes avanzados

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico Principal
```typescript
// Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui para UI components
- TanStack Query para data fetching
- React Router DOM para navegación
- Lucide React para iconografía
- Recharts para gráficos

// Backend
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Row Level Security (RLS) para seguridad
- Real-time subscriptions para actualizaciones

// Integraciones Externas
- OpenAI GPT-4o para OCR de comprobantes
- MercadoPago para pagos
- Jitsi Meet para videollamadas
- Resend para emails
- N8N para workflows (opcional)
```

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Formularios específicos
│   └── visibility/     # Módulos de visibilidad
├── hooks/              # Hooks personalizados
├── pages/              # Páginas principales
├── integrations/       # Configuración Supabase
└── lib/               # Utilidades generales
```

## 👥 PERSONAS DE USUARIO

### Psicólogo (Usuario Principal)
**Necesidades:**
- Gestión completa de pacientes y expedientes
- Calendario integrado con sistema de citas
- Comunicación segura con pacientes
- Reportes contables automatizados
- Herramientas de visibilidad online
- Sistema de videollamadas integrado

**Flujos Principales:**
1. Registro → Setup perfil → Trial 7 días
2. Gestión de pacientes → Crear expedientes → Agendar citas
3. Comunicación → Mensajería → Videollamadas
4. Administración → Subir comprobantes → Generar reportes

### Paciente (Usuario Secundario)
**Necesidades:**
- Solicitar citas de manera simple
- Comunicación directa con su psicólogo
- Acceso a su historial de sesiones
- Subir comprobantes de pago

**Flujos Principales:**
1. Registro → Buscar psicólogo → Solicitar cita
2. Comunicación → Chat con psicólogo
3. Pagos → Subir comprobante → Confirmación

### Administrador (Usuario Interno)
**Necesidades:**
- Gestión de usuarios del sistema
- Control de suscripciones y pagos
- Administración del sistema de afiliados
- Métricas y analytics del negocio

## 🔧 ESPECIFICACIONES DE FUNCIONALIDADES

### Sistema de Autenticación
```typescript
// Tipos de usuario
type UserType = 'psychologist' | 'patient' | 'admin';

// Flujo de registro
1. Usuario se registra con email/password
2. Sistema crea profile en tabla 'profiles'
3. Según user_type, crea registro en tabla específica
4. Redirige al dashboard correspondiente
```

### Gestión de Citas
```typescript
// Estados de cita
type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

// Flujo completo
1. Paciente solicita cita → appointment_requests (status: 'pending')
2. Psicólogo aprueba → appointment created (status: 'confirmed')
3. Sistema crea meeting_url automáticamente
4. Notificaciones automáticas a ambas partes
```

### Sistema OCR Automático
```typescript
// Procesamiento de comprobantes
1. Usuario sube archivo → Supabase Storage
2. Edge Function procesa con OpenAI Vision API
3. Extrae: fecha, monto, tipo, método de pago, CUIT
4. Almacena en payment_receipts con status 'extracted'
5. Psicólogo valida → status 'approved' → incluye en reportes
```

### Mensajería en Tiempo Real
```typescript
// Sistema de conversaciones
- Tabla conversations (psychologist_id, patient_id)
- Tabla messages con real-time subscriptions
- Actualizaciones automáticas de last_message_at
- Notificaciones push (futuro)
```

## 🗄️ ESQUEMA DE BASE DE DATOS

### Tablas Principales

#### Usuarios y Perfiles
```sql
-- Perfil base (todos los usuarios)
profiles (id, email, user_type, created_at, updated_at)

-- Psicólogos
psychologists (
  id, professional_code, first_name, last_name,
  phone, specialization, license_number,
  subscription_status, trial_start_date, trial_end_date,
  plan_type, affiliate_earnings, total_referrals
)

-- Pacientes
patients (
  id, psychologist_id, first_name, last_name,
  phone, age, notes
)
```

#### Sistema de Citas
```sql
-- Solicitudes de citas
appointment_requests (
  id, patient_id, psychologist_id,
  preferred_date, preferred_time, type, notes,
  status, payment_proof_url, payment_amount
)

-- Citas confirmadas
appointments (
  id, patient_id, psychologist_id,
  appointment_date, type, status, duration_minutes,
  meeting_url, notes, cancelled_by, cancellation_reason
)
```

#### Sistema Contable
```sql
-- Comprobantes de pago
payment_receipts (
  id, psychologist_id, patient_id,
  original_file_url, receipt_date, amount,
  receipt_type, payment_method, extraction_status,
  validation_status, extracted_data, include_in_report
)

-- Reportes mensuales
accounting_reports (
  id, psychologist_id, report_month, report_year,
  total_amount, total_receipts, amount_by_payment_method,
  annual_accumulated, status
)
```

#### Sistema de Afiliados
```sql
-- Códigos de afiliado
affiliate_codes (
  id, psychologist_id, code,
  commission_rate, discount_rate, is_active
)

-- Referidos
affiliate_referrals (
  id, affiliate_code_id, referrer_psychologist_id,
  referred_psychologist_id, status, commission_earned
)
```

### Políticas RLS Críticas
```sql
-- Los psicólogos solo ven sus pacientes
CREATE POLICY "Psychologists see own patients" ON patients
  FOR SELECT USING (psychologist_id = auth.uid());

-- Los pacientes solo ven sus propias citas
CREATE POLICY "Patients see own appointments" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

-- Mensajes solo visibles para participantes
CREATE POLICY "Users see own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE patient_id = auth.uid() OR psychologist_id = auth.uid()
    )
  );
```

## 🔌 INTEGRACIONES Y APIs

### OpenAI Integration
```typescript
// Edge Function: process-receipt-ocr
- Modelo: gpt-4o (vision)
- Input: URL de imagen/PDF del comprobante
- Output: JSON con datos extraídos
- Timeout: 30 segundos
- Fallback: Datos por defecto si falla
```

### MercadoPago Integration
```typescript
// Edge Function: create-mercadopago-preference
- Planes: monthly ($2,900 ARS), yearly ($29,000 ARS)
- Webhooks: /api/mercadopago-webhook
- Metadata: psychologist_id, plan_type
- Redirect URLs: /payment-success, /payment-failure
```

### Jitsi Meet Integration
```typescript
// Edge Function: create-jitsi-meeting
- Room naming: therapy-session-{appointmentId}-{timestamp}
- URL: https://meet.jit.si/{roomName}
- Automatic integration con appointments table
```

## 🎨 ASSETS DE DISEÑO

### Paleta de Colores
```css
/* Colores principales */
--primary: Blue-500 to Emerald-500 (gradientes)
--secondary: Slate colors
--success: Emerald/Green
--destructive: Red
--warning: Yellow/Orange

/* Uso semántico */
.bg-gradient-to-r.from-blue-500.to-emerald-500 /* Headers principales */
.text-slate-600 /* Texto secundario */
.border-slate-200 /* Bordes sutiles */
```

### Tipografía
```css
/* Sistema de fonts responsive */
text-sm: 14px
text-base: 16px
text-lg: 18px
text-xl: 20px
text-2xl: 24px
text-3xl: 30px
```

### Espaciado Consistente
```css
/* Espaciado entre componentes */
space-y-4: 16px vertical
space-y-6: 24px vertical
space-y-8: 32px vertical

/* Padding interno */
p-4: 16px all sides
p-6: 24px all sides
p-8: 32px all sides
```

## 🔐 PRÁCTICAS DE SEGURIDAD

### Row Level Security (RLS)
```sql
-- Todas las tablas sensibles tienen RLS habilitado
-- Políticas específicas por tipo de usuario
-- Filtrado automático por auth.uid()
-- Prevención de acceso cruzado entre psicólogos
```

### Validación de Datos
```typescript
// Frontend: Validación con Zod schemas
// Backend: Validación en Edge Functions
// Database: Constraints y triggers
// File uploads: Validación de tipo y tamaño
```

### Manejo de Archivos
```typescript
// Supabase Storage con políticas restrictivas
// Validación de tipos: PDF, JPG, PNG
// Límite de tamaño: 5MB por archivo
// URLs firmadas para acceso temporal
```

## 📱 CONFIGURACIÓN DEL ENTORNO

### Dependencias Principales
```json
{
  "@supabase/supabase-js": "^2.50.0",
  "@tanstack/react-query": "^5.56.2",
  "react": "^18.3.1",
  "tailwindcss": "latest",
  "typescript": "latest"
}
```

### Variables de Entorno (Supabase Secrets)
```env
SUPABASE_URL=https://scikpgzpgzevkgwwobrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-... (para OCR)
MERCADOPAGO_ACCESS_TOKEN=... (para pagos)
RESEND_API_KEY=... (para emails)
```

### Configuración de Desarrollo
```typescript
// Supabase client configuration
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 30000 }
  }
});
```

## 🧪 TESTING Y DEBUGGING

### Estrategia de Testing
```typescript
// Manual testing en preview
// Console.log extensivo para debugging
// Error boundaries para manejo de errores
// Toast notifications para feedback de usuario
```

### Debugging Guidelines
```typescript
// Siempre incluir logs estructurados
console.log('=== FUNCTION_NAME ===');
console.log('Input:', input);
console.log('Result:', result);

// Verificar estados de loading
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// Validar auth state
if (!user) return <LoginRequired />;
```

## 🚀 DEPLOYMENT Y VERSIONING

### Estrategia de Deployment
```typescript
// Lovable staging: automatic deployments
// Production: manual via Lovable publish
// Custom domains: available with paid plans
// CDN: automatic via Lovable infrastructure
```

### Database Migrations
```sql
-- Migrations en supabase/migrations/
-- Naming: YYYYMMDD_description.sql
-- Always test in development first
-- Include rollback plans
```

## 📊 MÉTRICAS Y COMPLIANCE

### KPIs del Negocio
- Usuarios activos (psicólogos con trial/suscripción activa)
- Conversión trial → paid (objetivo: >15%)
- Retención mensual (objetivo: >85%)
- Revenue monthly recurring (MRR)
- Referidos por sistema de afiliados

### Compliance y Legal
- GDPR: Derecho al olvido implementado
- CCPA: Exportación de datos de usuario
- HIPAA-aware: Encriptación de datos sensibles
- Argentina: Cumplimiento ley de datos personales

## 🔄 FLUJOS CRÍTICOS DE NEGOCIO

### Flujo de Onboarding de Psicólogo
```typescript
1. Registro con email → Verificación
2. Selección user_type: 'psychologist'
3. Setup perfil → Datos profesionales
4. Generación professional_code automático
5. Trial de 7 días → Acceso completo
6. Al finalizar trial → Prompt para suscripción
```

### Flujo de Procesamiento de Comprobantes
```typescript
1. Psicólogo/Paciente sube archivo
2. Storage en Supabase → URL pública
3. Edge Function OCR → OpenAI processing
4. Extracción automática de datos
5. Status: extracted → Review manual
6. Validación → approved → Inclusión en reportes
```

### Flujo de Comunicación Paciente-Psicólogo
```typescript
1. Paciente busca psicólogo por código profesional
2. Solicita cita → appointment_request
3. Sistema crea conversation automáticamente
4. Psicólogo aprueba → Notification al paciente
5. Chat habilitado → Real-time messaging
6. Videollamada → Jitsi integration
```

## ⚠️ LIMITACIONES Y CONSIDERACIONES

### Limitaciones Técnicas
- **Zona horaria**: Sistema asume zona local, no multi-timezone
- **Escalabilidad**: Diseñado para psicólogos individuales
- **Offline**: No hay soporte offline, requiere conexión
- **Mobile**: Responsive pero no app nativa

### Limitaciones de Negocio
- **Trial**: Limitado a 7 días automáticos
- **Pagos**: Solo MercadoPago (Argentina)
- **Idioma**: Solo español, no internacionalización
- **Regulaciones**: Solo compliance Argentina

### Technical Debt Conocido
```typescript
// Archivos grandes que necesitan refactoring:
- useProfile.tsx (520 líneas)
- AppointmentRequests.tsx (407 líneas) 
- usePaymentReceipts.tsx (222 líneas)
- process-receipt-ocr Edge Function (293 líneas)

// TODO: Separar en componentes más pequeños
```

## 🔮 ROADMAP Y FEATURES FUTURAS

### Próximas Funcionalidades
- [ ] App móvil nativa (React Native)
- [ ] Integraciones con calendarios externos
- [ ] Sistema de recordatorios automáticos
- [ ] Facturación electrónica AFIP
- [ ] Inteligencia artificial para insights
- [ ] Sistema de review y ratings

### Mejoras Técnicas Pendientes
- [ ] Implementación de PWA
- [ ] Caching avanzado con React Query
- [ ] Optimización de imágenes automática
- [ ] Monitoring y alertas
- [ ] Backup automático de datos

## 📚 REFERENCIAS Y DOCUMENTACIÓN

### Enlaces Importantes
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [MercadoPago Developers](https://www.mercadopago.com.ar/developers)

### Repositorios de Referencia
- [React Query Examples](https://tanstack.com/query/latest/docs/react/examples/simple)
- [Supabase Auth Examples](https://github.com/supabase/supabase/tree/master/examples/auth)
- [Tailwind Components](https://tailwindui.com/components)

---

## 🎯 NOTAS PARA DESARROLLO CON IA

### Patrones de Código Preferidos
```typescript
// Siempre usar formato objeto en useQuery
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
});

// Manejo de fechas SIEMPRE en zona local
const [year, month, day] = dateString.split('-');
const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

// Componentes pequeños y enfocados
export const ComponentName = ({ prop }: Props) => {
  // Máximo 50 líneas de código
  // Una responsabilidad por componente
};
```

### Convenciones de Naming
```typescript
// Componentes: PascalCase
// Hooks: camelCase con 'use' prefix
// Archivos: kebab-case o PascalCase según tipo
// Variables: camelCase
// Constantes: SCREAMING_SNAKE_CASE
// Database: snake_case
```

### Error Handling Patterns
```typescript
// NO usar try/catch excesivo
// Dejar que errores bublen para debugging
// Usar toast para feedback de usuario
// Console.log extensivo para seguimiento
```

Este archivo de conocimiento debe ser usado como referencia completa para entender el proyecto PsiConnect, sus objetivos, arquitectura, funcionalidades y mejores prácticas de desarrollo.
