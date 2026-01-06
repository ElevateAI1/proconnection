# Redirect URLs para Supabase - Configuración Actualizada

## 📋 URLs que DEBES tener en Supabase Dashboard

Copia y pega estas URLs en **Authentication** → **URL Configuration** → **Redirect URLs**:

```
https://www.proconnection.me
https://www.proconnection.me/
https://www.proconnection.me/app?token=*&type=*
https://www.proconnection.me/app
https://www.proconnection.me/app?verify=*
https://www.proconnection.me/dashboard
https://www.proconnection.me/dashboard?token=*&type=*
https://www.proconnection.me/auth
https://www.proconnection.me/auth/professional
https://www.proconnection.me/auth/professional?type=recovery
https://www.proconnection.me/auth/patient
https://www.proconnection.me/auth/patient?type=recovery
https://www.proconnection.me/register
https://www.proconnection.me/register/professional
https://www.proconnection.me/register/patient
```

## 🔴 URLs que FALTAN (agregar estas):

```
https://www.proconnection.me/app?verify=*
https://www.proconnection.me/auth/professional?type=recovery
https://www.proconnection.me/auth/patient?type=recovery
```

## 📝 Explicación

- **`/app?verify=*`**: Para verificación de email al registrarse
- **`/auth/professional?type=recovery`**: Para reset de contraseña de profesionales
- **`/auth/patient?type=recovery`**: Para reset de contraseña de pacientes

## 🚀 Pasos para agregar

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. En **Redirect URLs**, agrega las 3 URLs faltantes
5. Guarda los cambios

