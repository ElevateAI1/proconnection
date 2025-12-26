# Redirect URLs para Supabase - Configuración Completa

Este documento contiene todas las Redirect URLs que debes configurar en Supabase Dashboard.

## 📍 Ubicación

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. O directamente: **Settings** → **Authentication** → **URL Configuration**

## 🔗 Site URL

En el campo **Site URL**, ingresa:

```
https://www.proconnection.me
```

## 📋 Redirect URLs (Copiar y Pegar)

Copia y pega estas URLs en el campo **Redirect URLs** (una por línea):

```












http://localhost:8080
http://localhost:8080/
http://localhost:8080/app
http://localhost:8080/app?token=*&type=*
http://localhost:8080/dashboard
http://localhost:8080/dashboard?token=*&type=*
http://localhost:8080/auth
http://localhost:8080/auth/professional
http://localhost:8080/auth/patient
http://localhost:8080/register
http://localhost:8080/register/professional
http://localhost:8080/register/patient
```

## 📝 Explicación de las URLs

### URLs de Producción (www.proconnection.me)

- **URLs base**: Para redirecciones generales
- **`/app`**: Página principal donde se procesa la verificación de email
- **`/app?token=*&type=*`**: Para verificación de email con parámetros
- **`/dashboard`**: Dashboard después de login exitoso
- **`/auth`**: Páginas de autenticación
- **`/auth/professional`**: Login de profesionales
- **`/auth/patient`**: Login de pacientes
- **`/register`**: Páginas de registro
- **`/register/professional`**: Registro de profesionales
- **`/register/patient`**: Registro de pacientes

### URLs de Desarrollo (localhost:8080)

Las mismas URLs pero con `http://localhost:8080` para desarrollo local.

## ⚠️ Importante

- El símbolo `*` es un wildcard que permite cualquier valor en ese parámetro
- Asegúrate de incluir tanto `http://` como `https://` según corresponda
- No incluyas espacios al final de cada línea
- Cada URL debe estar en una línea separada

## ✅ Verificación

Después de configurar:

1. Guarda los cambios en Supabase
2. Prueba registrando un nuevo usuario
3. Verifica que el email llegue y el enlace funcione
4. Confirma que la redirección vaya a `/app` correctamente

## 🔄 Si algo no funciona

Si tienes problemas con las redirecciones:

1. Verifica que todas las URLs estén exactamente como se muestra
2. Asegúrate de que no haya espacios extra
3. Verifica que el Site URL sea `https://www.proconnection.me`
4. Revisa los logs de Supabase para ver errores de redirección

