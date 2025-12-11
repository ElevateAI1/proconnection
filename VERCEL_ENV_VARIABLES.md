# Variables de Entorno para Vercel

## Variables OBLIGATORIAS

Estas variables **DEBES** configurarlas en Vercel:

```
VITE_SUPABASE_URL=https://ehkbqmiasdyuxreqrijw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoa2JxbWlhc2R5dXhyZXFyaWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODcyMDAsImV4cCI6MjA4MTA2MzIwMH0.Q0V-sBPJQ8Hr5CBuK98xbnOkQhaO8B2p3y2hdHMHj1A
```

## Variables OPCIONALES

Solo si estás usando estas funcionalidades:

```
VITE_OPENAI_API_KEY=sk-...                    # Solo si usas OCR de comprobantes
VITE_MERCADOPAGO_PUBLIC_KEY=...               # Solo si usas MercadoPago
VITE_RESEND_API_KEY=...                       # Solo si usas Resend para emails
VITE_N8N_WEBHOOK_URL=...                      # Solo si usas N8N workflows
```

## Cómo Configurarlas en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega cada variable con su valor
4. Selecciona los ambientes (Production, Preview, Development)
5. Guarda y redeploya

## Variables de Edge Functions (NO en Vercel)

Las Edge Functions de Supabase usan sus propias variables de entorno que se configuran en:
- **Supabase Dashboard** → Project Settings → Edge Functions → Secrets

Estas NO van en Vercel:
- `SUPABASE_SERVICE_ROLE_KEY` (se configura en Supabase)
- `OPENAI_API_KEY` (para edge functions, en Supabase)
- `MERCADOPAGO_ACCESS_TOKEN` (para edge functions, en Supabase)
- `RESEND_API_KEY` (para edge functions, en Supabase)

## Notas Importantes

- Solo las variables con prefijo `VITE_` se exponen al cliente en Vite
- Las variables sin `VITE_` NO estarán disponibles en el frontend
- Las variables de Supabase Edge Functions se configuran separadamente en Supabase Dashboard

