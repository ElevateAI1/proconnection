# Templates de Email para Supabase

Estos templates están diseñados con los colores y estilos de ProConnection.

## Colores de la Paleta

- **blue-petrol**: `#3E5F78` (Azul petróleo suave)
- **lavender-soft**: `#C9C2E6` (Lavanda suave)
- **green-mint**: `#B9E4C9` (Verde menta tenue)
- **blue-soft**: `#6CAFF0` (Azul suave)
- **white-warm**: `#FDFDFB` (Blanco cálido)
- **peach-pale**: `#F7D2C4` (Durazno pálido)

## Cómo Usar

1. Ve a **Authentication** → **Email Templates** en Supabase Dashboard
2. Selecciona el template que quieres editar
3. Copia y pega el HTML correspondiente
4. Ajusta las variables de Supabase según sea necesario

---

## 1. Confirm Signup (Confirmación de Registro)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta - ProConnection</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FDFDFB;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FDFDFB;">
    <!-- Header con gradiente -->
    <div style="background: linear-gradient(135deg, #3E5F78 0%, #6CAFF0 50%, #B9E4C9 100%); padding: 50px 30px; text-align: center; border-bottom: 4px solid #C9C2E6;">
      <h1 style="color: #FDFDFB; margin: 0; font-size: 36px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
        ProConnection
      </h1>
      <p style="color: #FDFDFB; margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">
        Plataforma Profesional de Psicología
      </p>
    </div>
    
    <!-- Contenido principal -->
    <div style="padding: 50px 40px; background-color: #FDFDFB;">
      <div style="background-color: #FDFDFB; border: 4px solid #C9C2E6; border-radius: 16px; padding: 40px; box-shadow: 12px 12px 0px 0px rgba(201, 194, 230, 0.15);">
        
        <!-- Icono de bienvenida -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #B9E4C9 0%, #6CAFF0 100%); border-radius: 50%; border: 4px solid #C9C2E6; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(62, 95, 120, 0.2);">
            <span style="font-size: 40px;">🎉</span>
          </div>
        </div>
        
        <h2 style="color: #3E5F78; margin: 0 0 20px 0; font-size: 28px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; text-align: center;">
          ¡Bienvenido a ProConnection!
        </h2>
        
        <p style="color: #3E5F78; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px; text-align: center;">
          Estamos emocionados de tenerte con nosotros. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.
        </p>
        
        <!-- Botón de verificación -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{ .ConfirmationURL }}" 
             style="display: inline-block; background: linear-gradient(135deg, #3E5F78 0%, #6CAFF0 100%); 
                    color: #FDFDFB; text-decoration: none; padding: 18px 40px; border-radius: 12px; 
                    font-weight: 700; font-size: 16px; border: 4px solid #3E5F78;
                    box-shadow: 6px 6px 0px 0px rgba(62, 95, 120, 0.4);
                    transition: all 0.2s;">
            ✓ Confirmar mi cuenta
          </a>
        </div>
        
        <!-- Enlace alternativo -->
        <div style="background-color: #FDFDFB; border: 2px solid #C9C2E6; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <p style="color: #3E5F78; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
            ¿No puedes hacer clic en el botón?
          </p>
          <p style="color: #3E5F78; margin: 0; font-size: 14px; line-height: 1.6; opacity: 0.8;">
            Copia y pega este enlace en tu navegador:<br>
            <span style="word-break: break-all; color: #6CAFF0; font-weight: 500;">{{ .ConfirmationURL }}</span>
          </p>
        </div>
        
        <!-- Información de seguridad -->
        <div style="border-top: 2px solid #C9C2E6; padding-top: 25px; margin-top: 30px;">
          <p style="color: #3E5F78; font-size: 13px; line-height: 1.6; margin: 0; opacity: 0.7; text-align: center;">
            <strong>🔒 Seguridad:</strong> Este enlace expira en 24 horas por tu seguridad. Si no solicitaste esta cuenta, puedes ignorar este mensaje de forma segura.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #FDFDFB 0%, #F7D2C4 100%); padding: 40px 30px; text-align: center; border-top: 4px solid #C9C2E6;">
      <p style="color: #3E5F78; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
        ProConnection
      </p>
      <p style="color: #3E5F78; margin: 0; font-size: 12px; opacity: 0.7;">
        © 2024 ProConnection. Todos los derechos reservados.<br>
        Plataforma profesional para psicólogos y pacientes.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Reset Password (Recuperación de Contraseña)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupera tu contraseña - ProConnection</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FDFDFB;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FDFDFB;">
    <!-- Header con gradiente -->
    <div style="background: linear-gradient(135deg, #3E5F78 0%, #6CAFF0 50%, #B9E4C9 100%); padding: 50px 30px; text-align: center; border-bottom: 4px solid #C9C2E6;">
      <h1 style="color: #FDFDFB; margin: 0; font-size: 36px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
        ProConnection
      </h1>
      <p style="color: #FDFDFB; margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">
        Plataforma Profesional de Psicología
      </p>
    </div>
    
    <!-- Contenido principal -->
    <div style="padding: 50px 40px; background-color: #FDFDFB;">
      <div style="background-color: #FDFDFB; border: 4px solid #C9C2E6; border-radius: 16px; padding: 40px; box-shadow: 12px 12px 0px 0px rgba(201, 194, 230, 0.15);">
        
        <!-- Icono de seguridad -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #6CAFF0 0%, #B9E4C9 100%); border-radius: 50%; border: 4px solid #C9C2E6; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(62, 95, 120, 0.2);">
            <span style="font-size: 40px;">🔐</span>
          </div>
        </div>
        
        <h2 style="color: #3E5F78; margin: 0 0 20px 0; font-size: 28px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; text-align: center;">
          Recupera tu Contraseña
        </h2>
        
        <p style="color: #3E5F78; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px; text-align: center;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en ProConnection. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
        </p>
        
        <!-- Botón de recuperación -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{ .ConfirmationURL }}" 
             style="display: inline-block; background: linear-gradient(135deg, #3E5F78 0%, #6CAFF0 100%); 
                    color: #FDFDFB; text-decoration: none; padding: 18px 40px; border-radius: 12px; 
                    font-weight: 700; font-size: 16px; border: 4px solid #3E5F78;
                    box-shadow: 6px 6px 0px 0px rgba(62, 95, 120, 0.4);
                    transition: all 0.2s;">
            🔑 Restablecer Contraseña
          </a>
        </div>
        
        <!-- Enlace alternativo -->
        <div style="background-color: #FDFDFB; border: 2px solid #C9C2E6; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <p style="color: #3E5F78; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
            ¿No puedes hacer clic en el botón?
          </p>
          <p style="color: #3E5F78; margin: 0; font-size: 14px; line-height: 1.6; opacity: 0.8;">
            Copia y pega este enlace en tu navegador:<br>
            <span style="word-break: break-all; color: #6CAFF0; font-weight: 500;">{{ .ConfirmationURL }}</span>
          </p>
        </div>
        
        <!-- Advertencia de seguridad -->
        <div style="background-color: #F7D2C4; border: 2px solid #C9C2E6; border-radius: 12px; padding: 20px; margin: 30px 0;">
          <p style="color: #3E5F78; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
            ⚠️ Importante:
          </p>
          <p style="color: #3E5F78; font-size: 13px; line-height: 1.6; margin: 10px 0 0 0;">
            Si NO solicitaste restablecer tu contraseña, ignora este email de forma segura. Tu cuenta permanecerá protegida y no se realizarán cambios.
          </p>
        </div>
        
        <!-- Información de seguridad -->
        <div style="border-top: 2px solid #C9C2E6; padding-top: 25px; margin-top: 30px;">
          <p style="color: #3E5F78; font-size: 13px; line-height: 1.6; margin: 0; opacity: 0.7; text-align: center;">
            <strong>🔒 Seguridad:</strong> Este enlace expira en 1 hora por tu seguridad. Si necesitas un nuevo enlace, puedes solicitar otro desde la página de inicio de sesión.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #FDFDFB 0%, #F7D2C4 100%); padding: 40px 30px; text-align: center; border-top: 4px solid #C9C2E6;">
      <p style="color: #3E5F78; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
        ProConnection
      </p>
      <p style="color: #3E5F78; margin: 0; font-size: 12px; opacity: 0.7;">
        © 2024 ProConnection. Todos los derechos reservados.<br>
        Plataforma profesional para psicólogos y pacientes.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Variables de Supabase

Los templates usan las siguientes variables de Supabase:

- `{{ .ConfirmationURL }}` - URL de confirmación/recuperación
- `{{ .Token }}` - Token de verificación (si necesitas usarlo directamente)
- `{{ .Email }}` - Email del usuario (si está disponible)
- `{{ .SiteURL }}` - URL del sitio

## Personalización

Puedes personalizar estos templates:

1. **Colores**: Ajusta los valores hexadecimales según necesites
2. **Texto**: Modifica los mensajes para que coincidan con tu tono de voz
3. **Imágenes**: Agrega logos o imágenes si lo deseas
4. **Estilos**: Ajusta bordes, sombras y espaciados

## Notas Importantes

- Los templates son responsive y funcionan en la mayoría de clientes de email
- Usan estilos inline para máxima compatibilidad
- Los colores están optimizados para legibilidad
- Los bordes gruesos y sombras reflejan el estilo visual de la página

