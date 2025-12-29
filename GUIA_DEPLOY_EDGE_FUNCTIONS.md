# Guía: Cómo Desplegar Edge Functions en Supabase

## 📋 Cómo Funcionan las Edge Functions

**Cada carpeta en `supabase/functions/` = 1 Edge Function separada**

- ✅ **Ya están organizadas correctamente** - Cada carpeta es una función independiente
- ✅ **No necesitas hacer nada especial** - Solo desplegarlas
- ✅ **El archivo `index.ts` es el punto de entrada** - Supabase lo busca automáticamente

## 🚀 Pasos para Desplegar

### Opción 1: Usando Supabase CLI (Recomendado)

#### Instalación en Windows:

**Opción A: Con Scoop (Recomendado)**
```powershell
# 1. Instalar Scoop (si no lo tienes)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 3. Verificar instalación
supabase --version
```

**Opción B: Con Chocolatey**
```powershell
choco install supabase
```

**Opción C: Descargar binario directamente**
1. Ve a [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. Descarga `supabase_windows_amd64.zip`
3. Extrae y agrega a PATH

**Opción D: Usar npx (sin instalar)**
```powershell
# No necesitas instalar, solo usar npx
npx supabase login
npx supabase link --project-ref tu-project-ref
npx supabase functions deploy
```

#### Desplegar funciones:

```powershell
# 1. Login en Supabase
supabase login

# 2. Linkear tu proyecto (obtén el project-ref del Dashboard)
supabase link --project-ref tu-project-ref

# 3. Desplegar TODAS las funciones
supabase functions deploy

# 4. O desplegar funciones específicas
supabase functions deploy create-mercadopago-subscription
supabase functions deploy cancel-mercadopago-subscription
supabase functions deploy verify-email
supabase functions deploy mercadopago-webhook --no-verify-jwt  # Webhook debe ser público
```

### Opción 2: Desde Supabase Dashboard (Manual)

1. Ve a tu proyecto en **Supabase Dashboard**
2. **Edge Functions** → **Create a new function**
3. Para cada función nueva:
   - **Nombre:** `create-mercadopago-subscription`
   - **Código:** Copia el contenido de `supabase/functions/create-mercadopago-subscription/index.ts`
   - **Repite** para las otras 3 funciones nuevas

## 🔐 Configurar Variables de Entorno (Secrets)

**IMPORTANTE:** Estas variables se configuran en Supabase, NO en Vercel.

### Pasos:

1. Ve a **Supabase Dashboard** → Tu Proyecto
2. **Settings** → **Edge Functions** → **Secrets**
3. Agrega estas variables:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx-xxxxx  # Tu Access Token de MercadoPago
MERCADOPAGO_WEBHOOK_KEY=xxxxx                 # Tu Api Key de Webhook (opcional pero recomendado)
SUPABASE_URL=https://tu-proyecto.supabase.co    # Ya debería estar configurado
SUPABASE_SERVICE_ROLE_KEY=xxxxx                 # Ya debería estar configurado
```

### Cómo obtener el Access Token de MercadoPago:

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una aplicación o usa una existente
3. Ve a **Credenciales**
4. Copia el **Access Token** (producción o test según corresponda)

## 🔗 Configurar Webhook de MercadoPago

El webhook necesita estar configurado en MercadoPago para recibir notificaciones.

### Pasos:

1. Ve a **MercadoPago Dashboard** → Tu Aplicación
2. **Webhooks** → **Configurar Webhook**
3. **URL del Webhook:**
   ```
   https://tu-proyecto.supabase.co/functions/v1/mercadopago-webhook
   ```
4. **Eventos a escuchar:**
   - ✅ `preapproval` (suscripciones)
   - ✅ `payment` (pagos individuales, opcional)

### Nota sobre la URL:

La URL del webhook en el código está configurada así:
```typescript
notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`
```

Esto se genera automáticamente, pero asegúrate de que `SUPABASE_URL` esté configurado en los secrets.

## 📝 Funciones Nuevas que Necesitas Desplegar

### 1. `create-mercadopago-subscription`
- **Archivo:** `supabase/functions/create-mercadopago-subscription/index.ts`
- **Propósito:** Crea suscripciones recurrentes con Preapproval
- **Secrets necesarios:** `MERCADOPAGO_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### 2. `cancel-mercadopago-subscription`
- **Archivo:** `supabase/functions/cancel-mercadopago-subscription/index.ts`
- **Propósito:** Cancela suscripciones activas
- **Secrets necesarios:** `MERCADOPAGO_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### 3. `verify-email`
- **Archivo:** `supabase/functions/verify-email/index.ts`
- **Propósito:** Valida emails antes de suscribir
- **Secrets necesarios:** Ninguno (solo validación básica)

### 4. `mercadopago-webhook`
- **Archivo:** `supabase/functions/mercadopago-webhook/index.ts`
- **Propósito:** Recibe notificaciones de MercadoPago
- **Secrets necesarios:** `MERCADOPAGO_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **IMPORTANTE:** Esta función debe ser pública (sin autenticación) para que MercadoPago pueda llamarla

## ✅ Verificar que Funcionan

### 1. Verificar que las funciones están desplegadas:

```bash
supabase functions list
```

O en Supabase Dashboard → Edge Functions → Deberías ver todas las funciones listadas.

### 2. Probar una función:

```bash
# Probar verify-email
curl -X POST https://tu-proyecto.supabase.co/functions/v1/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Ver logs:

```bash
supabase functions logs create-mercadopago-subscription
```

O en Supabase Dashboard → Edge Functions → Selecciona la función → **Logs**

## 🐛 Troubleshooting

### Error: "MERCADOPAGO_ACCESS_TOKEN not configured"
- **Solución:** Agrega el secret en Supabase Dashboard → Settings → Edge Functions → Secrets

### Error: "Unauthorized" en webhook
- **Solución:** El webhook debe ser público. Verifica que no estés requiriendo autenticación en `mercadopago-webhook/index.ts`

### Error: "Function not found"
- **Solución:** Asegúrate de haber desplegado la función con `supabase functions deploy nombre-funcion`

### Las funciones no se actualizan
- **Solución:** Después de cambiar el código, redeploya con `supabase functions deploy nombre-funcion`

## 📚 Recursos

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [MercadoPago Preapproval API](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscriptions)
- [MercadoPago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)

