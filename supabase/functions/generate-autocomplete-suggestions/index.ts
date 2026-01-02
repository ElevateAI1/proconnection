
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      currentText, 
      cursorPosition, 
      professionType, 
      specialties, 
      yearsExperience, 
      firstName, 
      lastName 
    } = await req.json();

    console.log('Generating suggestions for:', { professionType, specialties, yearsExperience });

    const textBefore = currentText.substring(0, cursorPosition);
    const textAfter = currentText.substring(cursorPosition);
    
    const systemPrompt = `Eres un asistente especializado en crear descripciones profesionales para profesionales de la salud. 
    Genera sugerencias de continuación para descripción profesional que sean:
    - Profesionales y confiables
    - Específicas al área de ${professionType}
    - Relevantes a las especialidades: ${specialties.join(', ')}
    - Apropiadas para alguien con ${yearsExperience} años de experiencia
    - En español
    
    Las sugerencias deben completar naturalmente el texto existente y ser útiles para pacientes potenciales.`;

    const userPrompt = `Texto actual: "${currentText}"
    Posición del cursor: después de "${textBefore}"
    
    Genera 3 sugerencias cortas (máximo 50 palabras cada una) que continúen naturalmente desde donde está el cursor. 
    Las sugerencias deben ser diferentes entre sí y complementar el texto existente.
    
    Responde SOLO con un array JSON de strings, ejemplo: ["sugerencia 1", "sugerencia 2", "sugerencia 3"]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let suggestions;
    try {
      suggestions = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse suggestions:', data.choices[0].message.content);
      suggestions = [
        "Mi enfoque se centra en brindar un espacio seguro y de confianza.",
        "Utilizo técnicas basadas en evidencia científica.",
        "Mi objetivo es acompañarte en tu proceso de bienestar."
      ];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [
        "Mi enfoque profesional se basa en la escucha activa y el respeto.",
        "Trabajo con metodologías actualizadas y basadas en evidencia.",
        "Mi compromiso es acompañarte en tu proceso de crecimiento."
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
