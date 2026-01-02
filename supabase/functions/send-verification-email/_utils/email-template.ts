
interface UserData {
  firstName: string;
  userType: string;
  email: string;
}

export const createVerificationEmailTemplate = (verificationUrl: string, userData?: UserData) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu cuenta - ProConnection</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header with gradient -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">ProConnection</h1>
        <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Plataforma Profesional de Psicología</p>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          ${userData?.firstName ? `¡Hola ${userData.firstName}!` : '¡Bienvenido!'} 🎉
        </h2>
        
        ${userData?.userType === 'psychologist' ? `
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="color: #1e40af; margin: 0; font-weight: 600;">
            👨‍⚕️ Registro como Psicólogo Profesional
          </p>
          <p style="color: #3730a3; margin: 5px 0 0 0; font-size: 14px;">
            Te has registrado como profesional en nuestra plataforma.
          </p>
        </div>
        ` : userData?.userType === 'patient' ? `
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="color: #059669; margin: 0; font-weight: 600;">
            🧑‍🤝‍🧑 Registro como Paciente
          </p>
          <p style="color: #047857; margin: 5px 0 0 0; font-size: 14px;">
            Te has registrado como paciente en nuestra plataforma.
          </p>
        </div>
        ` : ''}
        
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
          ${userData?.email ? `Para completar tu registro con la cuenta <strong>${userData.email}</strong>` : 'Para completar tu registro'}, 
          necesitamos verificar tu dirección de email.
        </p>
        
        <!-- Call to action button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); 
                    color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            ✓ Verificar mi cuenta${userData?.firstName ? ` (${userData.firstName})` : ''}
          </a>
        </div>
        
        <!-- Alternative link section -->
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="color: #475569; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
            ¿No puedes hacer clic en el botón?
          </p>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
            Copia y pega este enlace en tu navegador:<br>
            <span style="word-break: break-all; color: #3b82f6;">${verificationUrl}</span>
          </p>
        </div>
        
        <!-- Security info -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
            <strong>¿Por qué recibes este email?</strong><br>
            ${userData?.email ? `Alguien se registró en ProConnection con la dirección ${userData.email}` : 'Alguien se registró en ProConnection con esta dirección de email'}${userData?.userType ? ` como ${userData.userType === 'psychologist' ? 'psicólogo profesional' : 'paciente'}` : ''}. 
            Si no fuiste tú, puedes ignorar este mensaje de forma segura.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
          Este enlace de verificación expira en 24 horas por seguridad.
        </p>
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          © 2024 ProConnection. Todos los derechos reservados.<br>
          Plataforma profesional para psicólogos y pacientes.
        </p>
      </div>
    </div>
  </body>
</html>
`;
