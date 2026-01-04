-- ============================================================================
-- PsiConnect - Migración Completa de Base de Datos
-- ============================================================================
-- Este script crea toda la estructura de la base de datos incluyendo:
-- - Todas las tablas
-- - Funciones de base de datos
-- - Triggers
-- - Políticas RLS (Row Level Security)
-- - Índices
-- - Buckets de Storage
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECCIÓN 1: TABLAS BASE (sin dependencias)
-- ============================================================================

-- Tabla de perfiles base (todos los usuarios)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('psychologist', 'patient', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfiles base de todos los usuarios del sistema';

-- Tabla de especialidades profesionales
CREATE TABLE IF NOT EXISTS public.professional_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profession_type TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.professional_specialties IS 'Catálogo de especialidades profesionales';

-- Tabla de categorías de monotributo
CREATE TABLE IF NOT EXISTS public.monotax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_limit DECIMAL(10,2) NOT NULL,
  annual_limit DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.monotax_categories IS 'Categorías de monotributo para control contable';

-- Tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  price_cents INTEGER NOT NULL,
  price_display TEXT NOT NULL,
  original_price_display TEXT,
  savings_text TEXT,
  features TEXT[] NOT NULL,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscription_plans IS 'Planes de suscripción disponibles';

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.admins IS 'Usuarios administradores del sistema';

-- Tabla de configuración del bot
CREATE TABLE IF NOT EXISTS public.bot_configuration (
  id SERIAL PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de IA
CREATE TABLE IF NOT EXISTS public.ai_configurations (
  id SERIAL PRIMARY KEY,
  ai_enabled BOOLEAN,
  response_type TEXT,
  custom_prompt TEXT,
  excluded_chats JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de errores
CREATE TABLE IF NOT EXISTS public.error_logs (
  id SERIAL PRIMARY KEY,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  context JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en tablas base
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monotax_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view professional specialties" ON public.professional_specialties
  FOR SELECT USING (true);

CREATE POLICY "Public can view monotax categories" ON public.monotax_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- Índices para tablas base
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_professional_specialties_profession_type ON public.professional_specialties(profession_type);
CREATE INDEX IF NOT EXISTS idx_monotax_categories_code ON public.monotax_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_key ON public.subscription_plans(plan_key);

-- ============================================================================
-- SECCIÓN 2: TABLAS DE PSICÓLOGOS Y PACIENTES
-- ============================================================================

-- Tabla de psicólogos
CREATE TABLE IF NOT EXISTS public.psychologists (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  license_number TEXT,
  profession_type TEXT NOT NULL DEFAULT 'psychologist',
  subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  plan_type TEXT CHECK (plan_type IN ('starter', 'proconnection', 'teams')),
  affiliate_code_id UUID,
  affiliate_earnings DECIMAL(10,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  monotax_category TEXT REFERENCES public.monotax_categories(category_code),
  profile_image_url TEXT,
  pdf_logo_url TEXT,
  pdf_primary_color TEXT DEFAULT '#3B82F6',
  pdf_contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.psychologists IS 'Información detallada de psicólogos';

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.patients IS 'Información de pacientes vinculados a psicólogos';

-- Tabla de tarifas de psicólogos
CREATE TABLE IF NOT EXISTS public.psychologist_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de directorios de psicólogos
CREATE TABLE IF NOT EXISTS public.psychologist_directories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  directory_id TEXT NOT NULL,
  directory_name TEXT NOT NULL,
  profile_url TEXT,
  registration_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'active', 'suspended')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de configuración SEO de psicólogos
CREATE TABLE IF NOT EXISTS public.psychologist_seo_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL UNIQUE REFERENCES public.psychologists(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  keywords TEXT,
  custom_url TEXT,
  local_seo TEXT,
  structured_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de estrategia social de psicólogos
CREATE TABLE IF NOT EXISTS public.psychologist_social_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  platform_id TEXT NOT NULL,
  profile_url TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')),
  target_audience TEXT,
  posting_frequency TEXT,
  content_strategy JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de puntuaciones de módulos de visibilidad
CREATE TABLE IF NOT EXISTS public.visibility_module_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  module_data JSONB,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_directories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_seo_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_social_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_module_scores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para psicólogos
CREATE POLICY "Psychologists can view their own data" ON public.psychologists
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Psychologists can update their own data" ON public.psychologists
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para pacientes
CREATE POLICY "Psychologists can view their patients" ON public.patients
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their patients" ON public.patients
  FOR ALL USING (psychologist_id = auth.uid());

-- Políticas RLS para tarifas
CREATE POLICY "Psychologists can manage their rates" ON public.psychologist_rates
  FOR ALL USING (psychologist_id = auth.uid());

-- Políticas RLS para otras tablas de psicólogos
CREATE POLICY "Psychologists can manage their directories" ON public.psychologist_directories
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their SEO config" ON public.psychologist_seo_config
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their social strategy" ON public.psychologist_social_strategy
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their visibility scores" ON public.visibility_module_scores
  FOR ALL USING (psychologist_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_psychologists_professional_code ON public.psychologists(professional_code);
CREATE INDEX IF NOT EXISTS idx_psychologists_subscription_status ON public.psychologists(subscription_status);
CREATE INDEX IF NOT EXISTS idx_psychologists_plan_type ON public.psychologists(plan_type);
CREATE INDEX IF NOT EXISTS idx_patients_psychologist_id ON public.patients(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_psychologist_rates_psychologist_id ON public.psychologist_rates(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_psychologist_directories_psychologist_id ON public.psychologist_directories(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_psychologist_seo_config_psychologist_id ON public.psychologist_seo_config(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_psychologist_social_strategy_psychologist_id ON public.psychologist_social_strategy(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_visibility_module_scores_psychologist_id ON public.visibility_module_scores(psychologist_id);

-- ============================================================================
-- SECCIÓN 3: TABLAS DE AFILIADOS
-- ============================================================================

-- Tabla de códigos de afiliado
CREATE TABLE IF NOT EXISTS public.affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  secondary_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.affiliate_codes IS 'Códigos de afiliado de psicólogos';

-- Tabla de referidos
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code_id UUID NOT NULL REFERENCES public.affiliate_codes(id) ON DELETE CASCADE,
  referrer_psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  referred_psychologist_id UUID NOT NULL UNIQUE REFERENCES public.psychologists(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  commission_earned DECIMAL(10,2) DEFAULT 0,
  discount_applied DECIMAL(10,2),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de pagos de afiliados
CREATE TABLE IF NOT EXISTS public.affiliate_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Psychologists can view their affiliate codes" ON public.affiliate_codes
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their affiliate codes" ON public.affiliate_codes
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can view their referrals" ON public.affiliate_referrals
  FOR SELECT USING (referrer_psychologist_id = auth.uid() OR referred_psychologist_id = auth.uid());

CREATE POLICY "Psychologists can view their affiliate payments" ON public.affiliate_payments
  FOR SELECT USING (psychologist_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_psychologist_id ON public.affiliate_codes(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON public.affiliate_codes(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referrer_id ON public.affiliate_referrals(referrer_psychologist_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_id ON public.affiliate_referrals(referred_psychologist_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_code_id ON public.affiliate_referrals(affiliate_code_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_psychologist_id ON public.affiliate_payments(psychologist_id);

-- ============================================================================
-- SECCIÓN 4: TABLAS DE CITAS
-- ============================================================================

-- Tabla de solicitudes de citas
CREATE TABLE IF NOT EXISTS public.appointment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'couple', 'group', 'online', 'in-person')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_proof_url TEXT,
  payment_amount DECIMAL(10,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de citas confirmadas
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'couple', 'group', 'online', 'in-person')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  notes TEXT,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de confirmaciones de citas
CREATE TABLE IF NOT EXISTS public.appointment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  confirmation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_confirmations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Psychologists can view their appointment requests" ON public.appointment_requests
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their appointment requests" ON public.appointment_requests
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can view their appointments" ON public.appointments
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their appointments" ON public.appointments
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Users can view appointment confirmations" ON public.appointment_confirmations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id 
      AND (patient_id = auth.uid() OR psychologist_id = auth.uid())
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointment_requests_psychologist_id ON public.appointment_requests(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_patient_id ON public.appointment_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON public.appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointments_psychologist_id ON public.appointments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointment_confirmations_appointment_id ON public.appointment_confirmations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_confirmations_token ON public.appointment_confirmations(confirmation_token);

-- ============================================================================
-- SECCIÓN 5: TABLAS DE CONVERSACIONES Y MENSAJES
-- ============================================================================

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(psychologist_id, patient_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'audio')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (psychologist_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (psychologist_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE psychologist_id = auth.uid() OR patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE psychologist_id = auth.uid() OR patient_id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_psychologist_id ON public.conversations(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_conversations_patient_id ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ============================================================================
-- SECCIÓN 6: TABLAS DE PAGOS Y CONTABILIDAD
-- ============================================================================

-- Tabla de preferencias de pago (MercadoPago)
CREATE TABLE IF NOT EXISTS public.payment_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  preference_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_id TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comprobantes de pago
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  original_file_url TEXT NOT NULL,
  receipt_date DATE,
  amount DECIMAL(10,2),
  receipt_type TEXT CHECK (receipt_type IN ('invoice', 'receipt', 'ticket')),
  receipt_number TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'card', 'mercadopago', 'other')),
  patient_cuit TEXT,
  extraction_status TEXT NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'extracted', 'failed')),
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  extracted_data JSONB,
  auto_approved BOOLEAN DEFAULT false,
  include_in_report BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de reportes contables
CREATE TABLE IF NOT EXISTS public.accounting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  report_month INTEGER NOT NULL CHECK (report_month BETWEEN 1 AND 12),
  report_year INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_receipts INTEGER NOT NULL DEFAULT 0,
  amount_by_payment_method JSONB NOT NULL DEFAULT '{}',
  amount_by_receipt_type JSONB,
  annual_accumulated DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_growth_percentage DECIMAL(5,2),
  auto_approved_receipts INTEGER,
  manually_reviewed_receipts INTEGER,
  monotax_alert JSONB,
  ai_analysis TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent')),
  generation_date TIMESTAMP WITH TIME ZONE,
  sent_date TIMESTAMP WITH TIME ZONE,
  report_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(psychologist_id, report_month, report_year)
);

-- Habilitar RLS
ALTER TABLE public.payment_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Psychologists can view their payment preferences" ON public.payment_preferences
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "Service role can manage payment preferences" ON public.payment_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Psychologists can manage their payment receipts" ON public.payment_receipts
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can manage their accounting reports" ON public.accounting_reports
  FOR ALL USING (psychologist_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_preferences_psychologist_id ON public.payment_preferences(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payment_preferences_preference_id ON public.payment_preferences(preference_id);
CREATE INDEX IF NOT EXISTS idx_payment_preferences_status ON public.payment_preferences(status);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_psychologist_id ON public.payment_receipts(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_patient_id ON public.payment_receipts(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_receipt_date ON public.payment_receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_validation_status ON public.payment_receipts(validation_status);
CREATE INDEX IF NOT EXISTS idx_accounting_reports_psychologist_id ON public.accounting_reports(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_accounting_reports_month_year ON public.accounting_reports(report_month, report_year);

-- ============================================================================
-- SECCIÓN 7: TABLAS DE DOCUMENTOS Y REGISTROS CLÍNICOS
-- ============================================================================

-- Tabla de documentos de pacientes
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assessment', 'consent', 'treatment_plan', 'progress_report', 'other')),
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  workflow_step INTEGER DEFAULT 1,
  patient_can_edit BOOLEAN DEFAULT false,
  patient_edited_at TIMESTAMP WITH TIME ZONE,
  patient_edit_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de plantillas de documentos
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('assessment', 'consent', 'treatment_plan', 'progress_report')),
  template_content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de notificaciones de documentos
CREATE TABLE IF NOT EXISTS public.document_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.patient_documents(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('psychologist', 'patient')),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de registros clínicos
CREATE TABLE IF NOT EXISTS public.clinical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'consulta',
  main_symptoms TEXT,
  observations TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Psychologists can manage their patient documents" ON public.patient_documents
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Patients can view their own documents" ON public.patient_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = patient_documents.patient_id 
      AND patients.id = auth.uid()
    )
  );

CREATE POLICY "Patients can update their own editable documents" ON public.patient_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = patient_documents.patient_id 
      AND patients.id = auth.uid()
    )
    AND patient_can_edit = true 
    AND patient_edited_at IS NULL
  );

CREATE POLICY "Psychologists can manage their document templates" ON public.document_templates
  FOR ALL USING (psychologist_id = auth.uid());

CREATE POLICY "Users can view notifications sent to them" ON public.document_notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "System can create document notifications" ON public.document_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.document_notifications
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "Psychologists can manage their clinical records" ON public.clinical_records
  FOR ALL USING (psychologist_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_documents_psychologist_id ON public.patient_documents(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON public.patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_status ON public.patient_documents(status);
CREATE INDEX IF NOT EXISTS idx_patient_documents_priority ON public.patient_documents(priority);
CREATE INDEX IF NOT EXISTS idx_patient_documents_due_date ON public.patient_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_document_templates_psychologist_id ON public.document_templates(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_recipient_id ON public.document_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_document_id ON public.document_notifications(document_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_patient_id ON public.clinical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_psychologist_id ON public.clinical_records(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_session_date ON public.clinical_records(session_date);

-- ============================================================================
-- SECCIÓN 8: TABLAS DE PERFILES PÚBLICOS
-- ============================================================================

-- Tabla de perfiles públicos de psicólogos
CREATE TABLE IF NOT EXISTS public.public_psychologist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_url TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  about_description TEXT,
  therapeutic_approach TEXT,
  years_experience INTEGER,
  profession_type TEXT NOT NULL DEFAULT 'psychologist',
  profile_data JSONB DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.public_psychologist_profiles IS 'Perfiles públicos expandidos de profesionales';

-- Tabla de especialidades de perfil (join table)
CREATE TABLE IF NOT EXISTS public.profile_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.public_psychologist_profiles(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.professional_specialties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.public_psychologist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perfiles públicos
CREATE POLICY "Enable read access for all users on active profiles" ON public.public_psychologist_profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Enable read access for profile owners" ON public.public_psychologist_profiles
  FOR SELECT USING (auth.uid() = psychologist_id);

CREATE POLICY "Enable insert for authenticated users for their own profile" ON public.public_psychologist_profiles
  FOR INSERT WITH CHECK (auth.uid() = psychologist_id);

CREATE POLICY "Enable update for users for their own profiles" ON public.public_psychologist_profiles
  FOR UPDATE USING (auth.uid() = psychologist_id) WITH CHECK (auth.uid() = psychologist_id);

-- Políticas RLS para especialidades de perfil
CREATE POLICY "Enable read access for all users on profile specialties" ON public.profile_specialties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.public_psychologist_profiles p
      WHERE p.id = profile_id AND p.is_active = true
    )
  );

CREATE POLICY "Enable insert for profile owners" ON public.profile_specialties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.public_psychologist_profiles p
      WHERE p.id = profile_id AND p.psychologist_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for profile owners" ON public.profile_specialties
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.public_psychologist_profiles p
      WHERE p.id = profile_id AND p.psychologist_id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_public_psychologist_profiles_psychologist_id ON public.public_psychologist_profiles(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_public_psychologist_profiles_custom_url ON public.public_psychologist_profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_profile_specialties_profile_id ON public.profile_specialties(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_specialties_specialty_id ON public.profile_specialties(specialty_id);

-- ============================================================================
-- SECCIÓN 9: TABLAS DE NOTIFICACIONES
-- ============================================================================

-- Tabla de notificaciones del sistema
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'psychologist')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('appointment_reminder', 'payment_due', 'document_ready', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'whatsapp', 'push')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de configuración de recordatorios
CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('appointment', 'payment', 'document')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  hours_before INTEGER NOT NULL DEFAULT 24,
  delivery_methods TEXT[] NOT NULL DEFAULT '{"email"}',
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(psychologist_id, reminder_type)
);

-- Habilitar RLS
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own notifications" ON public.system_notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.system_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update notifications" ON public.system_notifications
  FOR UPDATE USING (true);

CREATE POLICY "Psychologists can manage their reminder settings" ON public.reminder_settings
  FOR ALL USING (psychologist_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_notifications_recipient_id ON public.system_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_status ON public.system_notifications(status);
CREATE INDEX IF NOT EXISTS idx_system_notifications_scheduled_for ON public.system_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminder_settings_psychologist_id ON public.reminder_settings(psychologist_id);

-- ============================================================================
-- SECCIÓN 10: TABLAS DE WHATSAPP
-- ============================================================================

-- Tabla de sesiones de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'qr_pending', 'connected', 'error')),
  qr_code TEXT,
  phone_number TEXT,
  device_info JSONB DEFAULT '{}',
  session_data JSONB,
  session_key TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_body TEXT,
  body TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id TEXT,
  message_id TEXT,
  notification_id UUID REFERENCES public.system_notifications(id) ON DELETE SET NULL,
  contact_name TEXT,
  contact_phone TEXT,
  message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_media BOOLEAN DEFAULT false,
  media_type TEXT,
  media_url TEXT,
  delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'read', 'failed')),
  ack_status INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contactos de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  contact_name TEXT,
  is_business BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  profile_pic_url TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estadísticas del bot de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  unique_contacts INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  uptime_minutes INTEGER DEFAULT 0,
  uptime_seconds INTEGER,
  success_rate DECIMAL(5,2),
  avg_response_time DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de almacenamiento de sesiones de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_session_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_bot_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (solo administradores para WhatsApp)
CREATE POLICY "Admin only access whatsapp_sessions" ON public.whatsapp_sessions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Admin only access whatsapp_messages" ON public.whatsapp_messages
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Admin only access whatsapp_config" ON public.whatsapp_config
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Admin access whatsapp_contacts" ON public.whatsapp_contacts
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Admin access whatsapp_bot_stats" ON public.whatsapp_bot_stats
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_session_id ON public.whatsapp_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_id ON public.whatsapp_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON public.whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_to_number ON public.whatsapp_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction ON public.whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON public.whatsapp_contacts(phone_number);

-- ============================================================================
-- SECCIÓN 11: TABLAS DE SOPORTE
-- ============================================================================

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  psychologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('technical', 'feature', 'billing', 'general')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response_time INTEGER,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de respuestas a tickets de soporte
CREATE TABLE IF NOT EXISTS public.support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Psychologists can view own tickets" ON public.support_tickets
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can create own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can update own tickets" ON public.support_tickets
  FOR UPDATE USING (psychologist_id = auth.uid()) WITH CHECK (
    psychologist_id = auth.uid() AND (status = 'open' OR status = 'in_progress')
  );

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
  );

CREATE POLICY "Admins can update all tickets" ON public.support_tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
  );

CREATE POLICY "Users can view ticket responses" ON public.support_ticket_responses
  FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE psychologist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
  );

CREATE POLICY "Psychologists can create responses to own tickets" ON public.support_ticket_responses
  FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE psychologist_id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins can create responses to any ticket" ON public.support_ticket_responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
    AND is_staff = true
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_support_tickets_psychologist_id ON public.support_tickets(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON public.support_ticket_responses(ticket_id);

-- ============================================================================
-- SECCIÓN 12: FUNCIONES DE BASE DE DATOS
-- ============================================================================

-- Función para generar ID de ticket de soporte
CREATE OR REPLACE FUNCTION public.generate_support_ticket_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_num INTEGER;
  ticket_id TEXT;
BEGIN
  -- Obtener el siguiente número de ticket
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.support_tickets
  WHERE id LIKE 'SP-%';
  
  -- Generar ID con formato SP-000001
  ticket_id := 'SP-' || LPAD(next_num::TEXT, 6, '0');
  
  RETURN ticket_id;
END;
$$;

-- Función para generar código de afiliado
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    generated_code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generar código como AF-ABC123
        generated_code := 'AF-' || upper(substring(md5(random()::text) from 1 for 6));
        
        -- Verificar si el código ya existe
        SELECT EXISTS(
            SELECT 1 FROM public.affiliate_codes 
            WHERE affiliate_codes.code = generated_code
        ) INTO exists_check;
        
        -- Si no existe, retornarlo
        IF NOT exists_check THEN
            RETURN generated_code;
        END IF;
    END LOOP;
END;
$function$;

-- Función para generar código profesional
CREATE OR REPLACE FUNCTION public.generate_professional_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    generated_code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generar código como PS-ABC123
        generated_code := 'PS-' || upper(substring(md5(random()::text) from 1 for 6));
        
        -- Verificar si el código ya existe
        SELECT EXISTS(
            SELECT 1 FROM public.psychologists 
            WHERE psychologists.professional_code = generated_code
        ) INTO exists_check;
        
        -- Si no existe, retornarlo
        IF NOT exists_check THEN
            RETURN generated_code;
        END IF;
    END LOOP;
END;
$function$;

-- Función para generar token de confirmación
CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$function$;

-- Función para crear confirmación de cita
CREATE OR REPLACE FUNCTION public.create_appointment_confirmation(appointment_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  confirmation_id UUID;
  token TEXT;
BEGIN
  -- Generar token único
  token := public.generate_confirmation_token();
  
  -- Insertar confirmación
  INSERT INTO public.appointment_confirmations (
    appointment_id,
    confirmation_token,
    expires_at
  ) VALUES (
    appointment_id,
    token,
    now() + INTERVAL '24 hours'
  ) RETURNING id INTO confirmation_id;
  
  RETURN confirmation_id;
END;
$function$;

-- Función para programar recordatorios de citas
CREATE OR REPLACE FUNCTION public.schedule_appointment_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  reminder_record RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
  patient_record RECORD;
  delivery_method TEXT;
BEGIN
  -- Solo procesar citas programadas o confirmadas
  IF NEW.status NOT IN ('scheduled', 'confirmed') THEN
    RETURN NEW;
  END IF;

  -- Obtener información del paciente
  SELECT * INTO patient_record FROM public.patients WHERE id = NEW.patient_id;
  
  -- Buscar configuración de recordatorios para el psicólogo
  FOR reminder_record IN 
    SELECT * FROM public.reminder_settings 
    WHERE psychologist_id = NEW.psychologist_id 
    AND reminder_type = 'appointment' 
    AND enabled = true
  LOOP
    -- Calcular tiempo del recordatorio
    reminder_time := NEW.appointment_date - (reminder_record.hours_before || ' hours')::INTERVAL;
    
    -- Solo programar si el recordatorio es en el futuro
    IF reminder_time > now() THEN
      -- Procesar cada método de entrega configurado
      FOREACH delivery_method IN ARRAY reminder_record.delivery_methods
      LOOP
        -- Validar que si es WhatsApp, el paciente tenga teléfono
        IF delivery_method = 'whatsapp' AND (patient_record.phone IS NULL OR patient_record.phone = '') THEN
          CONTINUE; -- Skip WhatsApp if no phone
        END IF;
        
        -- Insertar notificación para el paciente
        INSERT INTO public.system_notifications (
          recipient_id,
          recipient_type,
          notification_type,
          title,
          message,
          scheduled_for,
          delivery_method,
          metadata
        ) VALUES (
          NEW.patient_id,
          'patient',
          'appointment_reminder',
          'Recordatorio de Cita',
          COALESCE(
            reminder_record.custom_message,
            'Estimado/a ' || patient_record.first_name || ', le recordamos su cita programada para el ' || 
            to_char(NEW.appointment_date, 'DD/MM/YYYY') || ' a las ' || to_char(NEW.appointment_date, 'HH24:MI')
          ),
          reminder_time,
          delivery_method,
          jsonb_build_object(
            'appointment_id', NEW.id,
            'appointment_date', NEW.appointment_date,
            'psychologist_id', NEW.psychologist_id,
            'patient_name', patient_record.first_name || ' ' || patient_record.last_name,
            'phone_number', CASE WHEN delivery_method = 'whatsapp' THEN patient_record.phone ELSE NULL END,
            'hours_before', reminder_record.hours_before
          )
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Función para crear recordatorios faltantes de citas
CREATE OR REPLACE FUNCTION public.create_missing_appointment_reminders()
RETURNS TABLE(
  appointment_id UUID,
  patient_name TEXT,
  reminders_created INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  apt_record RECORD;
  reminder_record RECORD;
  patient_record RECORD;
  reminder_time TIMESTAMP WITH TIME ZONE;
  delivery_method TEXT;
  reminders_count INTEGER;
BEGIN
  -- Buscar citas futuras sin recordatorios programados
  FOR apt_record IN 
    SELECT DISTINCT a.id, a.appointment_date, a.patient_id, a.psychologist_id, a.status
    FROM public.appointments a
    WHERE a.appointment_date > now()
    AND a.status IN ('scheduled', 'confirmed')
    AND NOT EXISTS (
      SELECT 1 FROM public.system_notifications sn 
      WHERE sn.metadata->>'appointment_id' = a.id::text
      AND sn.notification_type = 'appointment_reminder'
    )
  LOOP
    reminders_count := 0;
    
    -- Obtener información del paciente
    SELECT * INTO patient_record FROM public.patients WHERE id = apt_record.patient_id;
    
    -- Buscar configuración de recordatorios para el psicólogo
    FOR reminder_record IN 
      SELECT * FROM public.reminder_settings 
      WHERE psychologist_id = apt_record.psychologist_id 
      AND reminder_type = 'appointment' 
      AND enabled = true
    LOOP
      -- Calcular tiempo del recordatorio
      reminder_time := apt_record.appointment_date - (reminder_record.hours_before || ' hours')::INTERVAL;
      
      -- Solo programar si el recordatorio es en el futuro
      IF reminder_time > now() THEN
        -- Procesar cada método de entrega configurado
        FOREACH delivery_method IN ARRAY reminder_record.delivery_methods
        LOOP
          -- Validar que si es WhatsApp, el paciente tenga teléfono
          IF delivery_method = 'whatsapp' AND (patient_record.phone IS NULL OR patient_record.phone = '') THEN
            CONTINUE;
          END IF;
          
          -- Insertar notificación
          INSERT INTO public.system_notifications (
            recipient_id, recipient_type, notification_type, title, message,
            scheduled_for, delivery_method, metadata
          ) VALUES (
            apt_record.patient_id, 'patient', 'appointment_reminder', 'Recordatorio de Cita',
            COALESCE(reminder_record.custom_message,
              'Estimado/a ' || patient_record.first_name || ', le recordamos su cita programada para el ' || 
              to_char(apt_record.appointment_date, 'DD/MM/YYYY') || ' a las ' || to_char(apt_record.appointment_date, 'HH24:MI')
            ),
            reminder_time, delivery_method,
            jsonb_build_object('appointment_id', apt_record.id, 'appointment_date', apt_record.appointment_date,
              'psychologist_id', apt_record.psychologist_id, 'patient_name', 
              patient_record.first_name || ' ' || patient_record.last_name,
              'phone_number', CASE WHEN delivery_method = 'whatsapp' THEN patient_record.phone ELSE NULL END,
              'hours_before', reminder_record.hours_before)
          );
          
          reminders_count := reminders_count + 1;
        END LOOP;
      END IF;
    END LOOP;
    
    -- Devolver resultado
    appointment_id := apt_record.id;
    patient_name := patient_record.first_name || ' ' || patient_record.last_name;
    reminders_created := reminders_count;
    status := CASE WHEN reminders_count > 0 THEN 'success' ELSE 'no_reminders_needed' END;
    
    RETURN NEXT;
  END LOOP;
END;
$function$;

-- Función para incrementar vistas de perfil
CREATE OR REPLACE FUNCTION public.increment_profile_view(profile_url TEXT)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.public_psychologist_profiles
  SET
    view_count = view_count + 1,
    last_viewed_at = now()
  WHERE custom_url = profile_url;
END;
$function$;

-- Función para actualizar estado de sesión WhatsApp
CREATE OR REPLACE FUNCTION public.update_whatsapp_session_status(
  session_id_param TEXT,
  new_status TEXT,
  qr_code_param TEXT DEFAULT NULL,
  phone_number_param TEXT DEFAULT NULL,
  device_info_param JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.whatsapp_sessions (session_id, status, qr_code, phone_number, device_info)
  VALUES (session_id_param, new_status, qr_code_param, phone_number_param, device_info_param)
  ON CONFLICT (session_id)
  DO UPDATE SET
    status = new_status,
    qr_code = COALESCE(qr_code_param, whatsapp_sessions.qr_code),
    phone_number = COALESCE(phone_number_param, whatsapp_sessions.phone_number),
    device_info = COALESCE(device_info_param, whatsapp_sessions.device_info),
    last_activity = NOW(),
    updated_at = NOW();
END;
$function$;

-- Función para registrar mensaje WhatsApp
CREATE OR REPLACE FUNCTION public.log_whatsapp_message(
  session_id_param UUID,
  from_number_param TEXT,
  to_number_param TEXT,
  message_body_param TEXT,
  direction_param TEXT,
  whatsapp_message_id_param TEXT DEFAULT NULL,
  notification_id_param UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO public.whatsapp_messages (
    session_id, from_number, to_number, message_body, direction, 
    whatsapp_message_id, notification_id
  )
  VALUES (
    session_id_param, from_number_param, to_number_param, message_body_param, 
    direction_param, whatsapp_message_id_param, notification_id_param
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$function$;

-- Función para actualizar timestamp de ticket
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular tiempo de respuesta de ticket
CREATE OR REPLACE FUNCTION calculate_ticket_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
    NEW.response_time = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar timestamp de sesión WhatsApp
CREATE OR REPLACE FUNCTION update_whatsapp_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estadísticas diarias de WhatsApp
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.whatsapp_bot_stats (stat_date, messages_sent, messages_received)
  VALUES (CURRENT_DATE, 
    CASE WHEN NEW.direction = 'outgoing' THEN 1 ELSE 0 END,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END
  )
  ON CONFLICT (stat_date) 
  DO UPDATE SET
    messages_sent = whatsapp_bot_stats.messages_sent + 
      CASE WHEN NEW.direction = 'outgoing' THEN 1 ELSE 0 END,
    messages_received = whatsapp_bot_stats.messages_received + 
      CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar información de contactos
CREATE OR REPLACE FUNCTION update_contact_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contacto para el remitente (solo en mensajes entrantes)
  IF NEW.direction = 'incoming' THEN
    INSERT INTO public.whatsapp_contacts (phone_number, name, contact_name, last_message_at, message_count)
    VALUES (NEW.from_number, NEW.contact_name, NEW.contact_name, NEW.created_at, 1)
    ON CONFLICT (phone_number) 
    DO UPDATE SET
      name = COALESCE(NEW.contact_name, whatsapp_contacts.name),
      contact_name = COALESCE(NEW.contact_name, whatsapp_contacts.contact_name),
      last_message_at = NEW.created_at,
      message_count = whatsapp_contacts.message_count + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SECCIÓN 13: TRIGGERS
-- ============================================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_psychologists_updated_at ON public.psychologists;
CREATE TRIGGER update_psychologists_updated_at BEFORE UPDATE ON public.psychologists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_preferences_updated_at ON public.payment_preferences;
CREATE TRIGGER update_payment_preferences_updated_at BEFORE UPDATE ON public.payment_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_receipts_updated_at ON public.payment_receipts;
CREATE TRIGGER update_payment_receipts_updated_at BEFORE UPDATE ON public.payment_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounting_reports_updated_at ON public.accounting_reports;
CREATE TRIGGER update_accounting_reports_updated_at BEFORE UPDATE ON public.accounting_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_documents_updated_at ON public.patient_documents;
CREATE TRIGGER update_patient_documents_updated_at BEFORE UPDATE ON public.patient_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinical_records_updated_at ON public.clinical_records;
CREATE TRIGGER update_clinical_records_updated_at BEFORE UPDATE ON public.clinical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_notifications_updated_at ON public.system_notifications;
CREATE TRIGGER update_system_notifications_updated_at BEFORE UPDATE ON public.system_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminder_settings_updated_at ON public.reminder_settings;
CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para programar recordatorios de citas
DROP TRIGGER IF EXISTS schedule_appointment_reminders_trigger ON public.appointments;
CREATE TRIGGER schedule_appointment_reminders_trigger AFTER INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.schedule_appointment_reminders();

-- Trigger para actualizar last_message_at en conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Triggers para WhatsApp
DROP TRIGGER IF EXISTS update_stats_on_message ON public.whatsapp_messages;
CREATE TRIGGER update_stats_on_message AFTER INSERT ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION update_daily_stats();

DROP TRIGGER IF EXISTS update_contact_on_message ON public.whatsapp_messages;
CREATE TRIGGER update_contact_on_message AFTER INSERT ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION update_contact_info();

-- Función para establecer ID de ticket antes de insertar
CREATE OR REPLACE FUNCTION public.set_support_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := public.generate_support_ticket_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para tickets
DROP TRIGGER IF EXISTS set_support_ticket_id_trigger ON public.support_tickets;
CREATE TRIGGER set_support_ticket_id_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_support_ticket_id();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_support_ticket_updated_at();

DROP TRIGGER IF EXISTS calculate_support_ticket_response_time ON public.support_tickets;
CREATE TRIGGER calculate_support_ticket_response_time BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION calculate_ticket_response_time();

-- ============================================================================
-- SECCIÓN 14: STORAGE BUCKETS Y POLÍTICAS
-- ============================================================================

-- Bucket para comprobantes de pago
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para payment-proofs
DROP POLICY IF EXISTS "Anyone can view payment proofs" ON storage.objects;
CREATE POLICY "Anyone can view payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own payment proofs" ON storage.objects;
CREATE POLICY "Users can update their own payment proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own payment proofs" ON storage.objects;
CREATE POLICY "Users can delete their own payment proofs" ON storage.objects FOR DELETE USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para profile-images
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
CREATE POLICY "Users can upload their own profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view all profile images" ON storage.objects;
CREATE POLICY "Users can view all profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
CREATE POLICY "Users can delete their own profile images" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
