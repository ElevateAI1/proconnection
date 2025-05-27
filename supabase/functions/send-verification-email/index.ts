
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createVerificationEmailTemplate } from "./_utils/email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  email: string;
  token: string;
  action_type: string;
  user_type: string;
  first_name: string;
  redirect_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Verification email function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, action_type, user_type, first_name, redirect_to }: EmailData = await req.json();
    
    console.log('Processing verification email for:', email);
    console.log('User type:', user_type);
    console.log('First name:', first_name);

    // Decode the verification token to get user data
    let verificationData;
    try {
      verificationData = JSON.parse(atob(token));
    } catch (e) {
      console.log('Could not decode token, using simple verification');
      verificationData = { email, userType: user_type, firstName: first_name };
    }

    // Create verification URL with detailed information
    const verificationUrl = redirect_to || `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token}&type=${action_type}`;

    console.log('Verification URL:', verificationUrl);

    // Use the professional email template with user-specific data
    const emailHtml = createVerificationEmailTemplate(verificationUrl, {
      firstName: first_name,
      userType: user_type,
      email: email
    });

    const emailResponse = await resend.emails.send({
      from: "PsiConnect <lord@mattyeh.com>",
      to: [email],
      subject: `🔐 Verifica tu cuenta en PsiConnect - ${first_name}`,
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
