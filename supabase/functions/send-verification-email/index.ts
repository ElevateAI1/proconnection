
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  email: string;
  token: string;
  action_type: string;
  redirect_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Verification email function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, action_type, redirect_to }: EmailData = await req.json();
    
    console.log('Processing verification email for:', email);

    // Create verification URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${action_type}&redirect_to=${redirect_to || 'https://your-app-url.vercel.app/app'}`;

    // Professional email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta - PsiConnect</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">PsiConnect</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Plataforma Profesional de Psicología</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                ¡Bienvenido a PsiConnect! 🎉
              </h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                Nos complace que te hayas unido a nuestra plataforma. Para completar tu registro y activar tu cuenta, 
                necesitamos verificar tu dirección de email.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); 
                          color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                          font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  ✓ Verificar mi cuenta
                </a>
              </div>
              
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #475569; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                  ¿No puedes hacer clic en el botón?
                </p>
                <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                  Copia y pega este enlace en tu navegador:<br>
                  <span style="word-break: break-all; color: #3b82f6;">${verificationUrl}</span>
                </p>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
                <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
                  <strong>¿Por qué recibes este email?</strong><br>
                  Te enviamos este mensaje porque alguien se registró en PsiConnect con esta dirección de email. 
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
                © 2024 PsiConnect. Todos los derechos reservados.<br>
                Plataforma profesional para psicólogos y pacientes.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "PsiConnect <noreply@your-domain.com>", // Cambiar por tu dominio
      to: [email],
      subject: "🔐 Verifica tu cuenta en PsiConnect",
      html: emailHtml,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
