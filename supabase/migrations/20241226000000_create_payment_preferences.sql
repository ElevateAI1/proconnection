
-- Crear tabla para guardar las preferencias de pago de MercadoPago
CREATE TABLE IF NOT EXISTS payment_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  preference_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar las consultas
CREATE INDEX idx_payment_preferences_psychologist_id ON payment_preferences(psychologist_id);
CREATE INDEX idx_payment_preferences_preference_id ON payment_preferences(preference_id);
CREATE INDEX idx_payment_preferences_status ON payment_preferences(status);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_preferences_updated_at
  BEFORE UPDATE ON payment_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_preferences_updated_at();

-- Añadir RLS (Row Level Security)
ALTER TABLE payment_preferences ENABLE ROW LEVEL SECURITY;

-- Política para que los psicólogos solo puedan ver sus propias preferencias
CREATE POLICY "Psychologists can view their own payment preferences" ON payment_preferences
  FOR SELECT USING (psychologist_id = auth.uid());

-- Política para que el servicio pueda insertar y actualizar preferencias
CREATE POLICY "Service role can manage payment preferences" ON payment_preferences
  FOR ALL USING (auth.role() = 'service_role');
