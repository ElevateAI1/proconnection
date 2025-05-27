
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createVerificationEmailTemplate } from "./_utils/email-template.ts";

const resend = new Resend("re_g26a5uQv_KzejdPm2pxQXYRZxGfzrW9ey");

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
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${action_type}&redirect_to=${redirect_to || 'https://scikpgzpgzevkgwwobrf.supabase.co/'}`;

    // Use the professional email template
    const emailHtml = createVerificationEmailTemplate(verificationUrl);

    const emailResponse = await resend.emails.send({
      from: "PsiConnect <lord@mattyeh.com>",
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
