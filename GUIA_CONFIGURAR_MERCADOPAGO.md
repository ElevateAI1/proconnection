# Guía: Configurar MercadoPago - Token y Webhook

Esta guía te ayudará a configurar el Access Token de MercadoPago y el Webhook para recibir notificaciones de suscripciones.

---

## 🔑 Paso 1: Obtener Access Token de MercadoPago

### 1.1. Acceder a MercadoPago Developers

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Inicia sesión con tu cuenta de MercadoPago

### 1.2. Crear o Seleccionar una Aplicación

1. En el Dashboard, ve a **"Tus integraciones"** o **"Aplicaciones"**
2. Si ya tienes una aplicación, selecciónala
3. Si no, crea una nueva:
   - Click en **"Crear aplicación"**
   - Completa el formulario:
     - **Nombre:** PsiConnect (o el nombre que prefieras)
     - **Descripción:** Plataforma de gestión para psicólogos
     - **Categoría:** Servicios profesionales
   - Click en **"Crear"**

### 1.3. Obtener el Access Token

1. Una vez en tu aplicación, ve a la sección **"Credenciales"**
2. Verás dos tipos de credenciales:
   - **Credenciales de prueba** (para desarrollo/testing)
   - **Credenciales de producción** (para usuarios reales)

3. **Para desarrollo/testing:**
   - Usa las **Credenciales de prueba**
   - Copia el **Access Token** (empieza con `TEST-`)

4. **Para producción:**
   - Usa las **Credenciales de producción**
   - Copia el **Access Token** (empieza con `APP_USR-`)
   - ⚠️ **IMPORTANTE:** Este token es secreto, no lo compartas

### 1.4. Formato del Token

```
TEST-1234567890-abcdef-123456-abcdef123456-12345678  (Prueba)
APP_USR-1234567890-abcdef-123456-abcdef123456-12345678  (Producción)
```

---

## 🔐 Paso 2: Configurar Access Token en Supabase

### 2.1. Acceder a Supabase Dashboard

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **ehkbqmiasdyuxreqrijw**

### 2.2. Agregar el Secret

1. En el menú lateral, ve a **Settings** (⚙️)
2. Click en **Edge Functions**
3. En la sección **Secrets**, verás una lista de variables de entorno
4. Click en **"Add new secret"** o el botón **"+"**

5. Completa el formulario:
   - **Name:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** Pega el Access Token que copiaste de MercadoPago
   - **Description:** (Opcional) "Token de acceso de MercadoPago para suscripciones"

6. Click en **"Save"** o **"Add secret"**

### 2.3. Verificar que se Guardó

- Deberías ver `MERCADOPAGO_ACCESS_TOKEN` en la lista de secrets
- El valor estará oculto (mostrará `••••••••`)

### 2.4. Notas Importantes

- ✅ El secret se aplica a **todas las Edge Functions**
- ✅ Si cambias el token, las funciones lo usarán automáticamente
- ✅ No necesitas redeployar las funciones después de agregar el secret
- ⚠️ Si borras el secret, las funciones fallarán

---

## 🔗 Paso 3: Configurar Webhook en MercadoPago

### 3.1. URL del Webhook

Tu webhook estará disponible en:
```
https://ehkbqmiasdyuxreqrijw.supabase.co/functions/v1/mercadopago-webhook
```

**Nota:** Esta URL ya está configurada en el código. Solo necesitas registrarla en MercadoPago.

### 3.2. Acceder a Configuración de Webhooks

1. En MercadoPago Developers, ve a tu aplicación
2. En el menú lateral, busca **"Webhooks"** o **"Notificaciones"**
3. Si no lo ves, puede estar en **"Configuración"** → **"Webhooks"**

### 3.3. Crear/Configurar el Webhook

1. Click en **"Crear webhook"** o **"Configurar webhook"**

2. Completa el formulario:
   - **URL:** 
     ```
     https://ehkbqmiasdyuxreqrijw.supabase.co/functions/v1/mercadopago-webhook
     ```
   - **Eventos a escuchar:**
     - ✅ `preapproval` (Suscripciones recurrentes - **OBLIGATORIO**)
     - ✅ `payment` (Pagos individuales - Opcional, pero recomendado)
   
   - **Versión de la API:** Deja la versión por defecto (v1)

3. Click en **"Guardar"** o **"Crear webhook"**

### 3.4. Verificar el Webhook

1. MercadoPago intentará hacer un **ping de prueba** a tu webhook
2. Deberías ver el estado del webhook:
   - ✅ **Activo** / **Conectado** = Todo bien
   - ❌ **Error** / **Desconectado** = Revisa la URL o los logs

3. Si hay error, verifica:
   - ✅ Que la URL sea correcta (sin espacios, sin trailing slash)
   - ✅ Que el webhook esté desplegado en Supabase
   - ✅ Que el webhook tenga `--no-verify-jwt` (ya lo configuramos)

### 3.5. Probar el Webhook (Opcional)

MercadoPago tiene una opción para **"Probar webhook"** o **"Enviar notificación de prueba"**:
1. Click en el botón de prueba
2. Revisa los logs en Supabase Dashboard → Edge Functions → `mercadopago-webhook` → Logs
3. Deberías ver una notificación recibida

---

## 🧪 Paso 4: Probar la Configuración

### 4.1. Probar el Access Token

Puedes probar que el token funciona desde Supabase Dashboard:

1. Ve a **Edge Functions** → `create-mercadopago-subscription`
2. Click en **"Invoke"** o **"Test"**
3. Usa este JSON de prueba:
   ```json
   {
     "planKey": "proconnection",
     "psychologistId": "tu-user-id-de-prueba",
     "payerEmail": "test@example.com",
     "backUrl": "https://tu-dominio.com/plans"
   }
   ```
4. Si funciona, deberías recibir un `init_point` de MercadoPago

### 4.2. Verificar Logs

1. En Supabase Dashboard → **Edge Functions** → Selecciona cualquier función
2. Click en la pestaña **"Logs"**
3. Deberías ver:
   - ✅ Llamadas exitosas
   - ❌ Errores (si los hay)

### 4.3. Errores Comunes

**Error: "MERCADOPAGO_ACCESS_TOKEN not configured"**
- **Solución:** Verifica que agregaste el secret en Supabase Dashboard

**Error: "Invalid credentials"**
- **Solución:** El token está mal copiado o expiró. Obtén uno nuevo

**Error: "Webhook not receiving notifications"**
- **Solución:** 
  - Verifica que la URL del webhook sea correcta
  - Verifica que el webhook esté activo en MercadoPago
  - Revisa los logs de `mercadopago-webhook` en Supabase

---

## 📋 Checklist Final

Antes de usar las suscripciones en producción, verifica:

- [ ] Access Token configurado en Supabase Secrets
- [ ] Webhook creado en MercadoPago
- [ ] Webhook marcado como "Activo" en MercadoPago
- [ ] Eventos `preapproval` y `payment` seleccionados
- [ ] URL del webhook correcta
- [ ] Migración SQL ejecutada (`20250125000003_add_subscription_fields.sql`)
- [ ] Edge Functions desplegadas (ya lo hicimos ✅)

---

## 🔄 Actualizar el Token (Si es Necesario)

Si necesitas cambiar el Access Token:

1. **En MercadoPago:**
   - Genera un nuevo Access Token
   - Copia el nuevo token

2. **En Supabase:**
   - Settings → Edge Functions → Secrets
   - Encuentra `MERCADOPAGO_ACCESS_TOKEN`
   - Click en **"Edit"** o el ícono de editar
   - Reemplaza el valor con el nuevo token
   - Click en **"Save"**

3. **No necesitas:**
   - ❌ Redeployar las funciones
   - ❌ Reiniciar nada
   - Las funciones usarán el nuevo token automáticamente

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs:**
   - Supabase Dashboard → Edge Functions → Logs
   - MercadoPago Dashboard → Webhooks → Logs de notificaciones

2. **Verifica la documentación:**
   - [MercadoPago Preapproval API](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscriptions)
   - [MercadoPago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)

3. **Contacta soporte:**
   - MercadoPago: [Centro de Ayuda](https://www.mercadopago.com.ar/developers/es/support)
   - Supabase: [Discord Community](https://discord.supabase.com/)

---

## 🎯 URLs Importantes

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ehkbqmiasdyuxreqrijw
- **MercadoPago Developers:** https://www.mercadopago.com.ar/developers
- **Webhook URL:** https://ehkbqmiasdyuxreqrijw.supabase.co/functions/v1/mercadopago-webhook

---

**¡Listo!** Con estos pasos, tu integración con MercadoPago estará completamente configurada. 🚀

