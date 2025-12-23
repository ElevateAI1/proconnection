# Configuración de Redirecciones de Email en Supabase

Esta guía explica cómo configurar las URLs de redirección para los emails de autenticación en Supabase.

## 📍 Ubicación en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **URL Configuration**
3. O directamente: **Settings** → **Authentication** → **URL Configuration**

## 🔗 URLs que Debes Configurar

### Site URL (URL Principal)
Esta es la URL base de tu aplicación:

**Para Producción:**
```
https://tu-dominio.com
```

**Para Desarrollo Local:**
```
http://localhost:8080
```

### Redirect URLs (URLs Permitidas)

Agrega todas las URLs a las que Supabase puede redirigir después de acciones de autenticación:

#### URLs Básicas (Obligatorias)
```
https://tu-dominio.com/auth
https://tu-dominio.com/register
https://tu-dominio.com/dashboard
https://tu-dominio.com/app
http://localhost:8080/auth
http://localhost:8080/register
http://localhost:8080/dashboard
http://localhost:8080/app
```

#### URLs con Parámetros (Para Verificación de Email)
```
https://tu-dominio.com/app?verify=*
https://tu-dominio.com/dashboard?verify=*
http://localhost:8080/app?verify=*
http://localhost:8080/dashboard?verify=*
```

#### URLs para Recuperación de Contraseña
```
https://tu-dominio.com/auth?type=recovery&token=*
https://tu-dominio.com/auth/reset-password?token=*
http://localhost:8080/auth?type=recovery&token=*
http://localhost:8080/auth/reset-password?token=*
```

## 📝 Configuración Paso a Paso

### 1. Site URL
En el campo **Site URL**, ingresa tu URL de producción:
```
https://tu-dominio.com
```

### 2. Redirect URLs
En el campo **Redirect URLs**, agrega cada URL en una línea separada:

```
https://tu-dominio.com/auth
https://tu-dominio.com/register
https://tu-dominio.com/dashboard
https://tu-dominio.com/app
https://tu-dominio.com/app?verify=*
https://tu-dominio.com/dashboard?verify=*
https://tu-dominio.com/auth?type=recovery&token=*
http://localhost:8080/auth
http://localhost:8080/register
http://localhost:8080/dashboard
http://localhost:8080/app
http://localhost:8080/app?verify=*
http://localhost:8080/dashboard?verify=*
http://localhost:8080/auth?type=recovery&token=*
```

### 3. Email Templates (Opcional)
Si quieres personalizar los templates de email, ve a:
**Authentication** → **Email Templates**

Aquí puedes editar:
- **Confirm signup** - Email de confirmación de registro
- **Reset password** - Email de recuperación de contraseña
- **Magic Link** - Email de magic link (si lo usas)
- **Change email address** - Email de cambio de email

## ⚙️ Configuración Específica por Tipo de Email

### Email de Verificación de Registro
- **Redirect URL**: `https://tu-dominio.com/app?verify=*`
- **Template**: Confirm signup

### Email de Recuperación de Contraseña
- **Redirect URL**: `https://tu-dominio.com/auth?type=recovery&token=*`
- **Template**: Reset password

### Email de Magic Link (si lo usas)
- **Redirect URL**: `https://tu-dominio.com/auth?type=magiclink&token=*`
- **Template**: Magic Link

## 🔒 Seguridad

### Wildcards (*)
Puedes usar `*` como wildcard para permitir cualquier valor en ese parámetro:
- `https://tu-dominio.com/app?verify=*` permite cualquier token de verificación
- `https://tu-dominio.com/auth?type=recovery&token=*` permite cualquier token de recuperación

### Buenas Prácticas
1. **Solo agrega URLs que realmente uses** - No agregues URLs innecesarias
2. **Usa HTTPS en producción** - Nunca uses HTTP en producción
3. **Revisa regularmente** - Elimina URLs que ya no uses
4. **Separa desarrollo y producción** - Usa diferentes proyectos de Supabase si es posible

## 🧪 Testing

### Probar en Desarrollo Local
1. Asegúrate de tener `http://localhost:8080` en las Redirect URLs
2. Inicia tu servidor local: `npm run dev`
3. Intenta registrarte o recuperar contraseña
4. Verifica que el email llegue y el enlace funcione

### Probar en Producción
1. Asegúrate de tener tu URL de producción en las Redirect URLs
2. Intenta registrarte desde producción
3. Verifica que el email llegue y el enlace funcione

## 🐛 Troubleshooting

### El enlace del email no funciona
- Verifica que la URL esté en la lista de Redirect URLs permitidas
- Verifica que la URL coincida exactamente (incluyendo protocolo http/https)
- Revisa la consola del navegador para ver errores

### Error "Invalid redirect URL"
- La URL no está en la lista de Redirect URLs permitidas
- La URL tiene un formato incorrecto
- Hay un problema con el protocolo (http vs https)

### El email no llega
- Revisa la configuración de SMTP en Supabase
- Verifica que el email no esté en spam
- Revisa los logs de Supabase para ver errores

## 📚 Referencias

- [Documentación de Supabase - URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)
- [Documentación de Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

