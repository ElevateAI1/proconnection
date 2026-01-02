// import { GoogleGenAI, Type } from "npm:@google/genai@1.34.0"; // Removed incompatible lib

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const MODEL_ID = "gemini-2.0-flash-exp"; // Changed to stable model available via REST
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

const PRICE_PER_1M_INPUT = 0.075;
const PRICE_PER_1M_OUTPUT = 0.30;

const calculateCost = (inputTokens: number, outputTokens: number) => {
  const inputCost = (inputTokens / 1_000_000) * PRICE_PER_1M_INPUT;
  const outputCost = (outputTokens / 1_000_000) * PRICE_PER_1M_OUTPUT;
  return inputCost + outputCost;
};

const COMPLIANCE_RULES: Record<string, string[]> = {
  "Mercado Pago": [
    "ID:Logo(Handshake) OR 'Mercado Pago'.",
    "CVU:Start '00000031'.",
    "FROM:'De'/'Origen'. NOT 'Mercado Pago'.",
    "CHECK:Numeric Op_Code."
  ],
  "Ualá": [
    "ID:Logo(Uala/ABC).",
    "FROM:'Recibiste de'.",
    "AMT:Small '$' top-left."
  ],
  "Naranja X": [
    "ID:Orange OR 'NX'.",
    "FROM:'Naranja X'=Bank.",
    "DATE:ShortMonth."
  ],
  "Personal Pay": [
    "ID:Personal Pay.",
    "FROM:'Titular'.",
    "STYLE:Colorful."
  ],
  "Lemon Cash": [
    "ID:Lemon.",
    "FROM:'De'.",
    "AMT:Bold Sans-serif."
  ],
  "Prex": [
    "ID:Logo 'PREX'.",
    "FROM:'De'."
  ],
  "MODO": [
    "ID:MODO.",
    "CTX:Aggregator.",
    "FROM:'Desde la cuenta'."
  ],
  "Brubank": [
    "ID:Violet.",
    "FROM:'Ordenante'.",
    "TO:'Destinatario'."
  ],
  "Cuenta DNI": [
    "ID:Green/Provincia.",
    "FROM:'Ordenante'.",
    "TO:'Beneficiario'."
  ],
  "Banco Galicia": [
    "ID:Orange/Gray.",
    "FROM:'Origen'.",
    "CHECK:Align ':'."
  ],
  "Santander": [
    "ID:Red Header.",
    "FMT:Vertical.",
    "FROM:'Origen'."
  ],
  "BBVA": [
    "ID:Navy Blue.",
    "FROM:'Titular'."
  ],
  "FACTURA_SERVICIO": [
    "CRITICAL:IS_BILL.",
    "KW:'Total a Pagar'|'Vencimiento'.",
    "ACTION:REJECT."
  ],
  "Generico": [
    "GATEKEEPER:NOT Bill(Gas/Light).",
    "KW_REQ:'Transferencia'|'Pago Exitoso'.",
    "KW_BAN:'A Pagar'|'Vencimiento'."
  ]
};

// Simplified schema for REST API
const analysisSchema = {
  type: "OBJECT",
  properties: {
    importe_total: {
      type: "NUMBER",
      description: "Exact total amount. No rounding.",
    },
    moneda: {
      type: "STRING",
      description: "ISO Code (ARS,USD,EUR).",
    },
    fecha: {
      type: "STRING",
      description: "YYYY-MM-DD.",
    },
    emisor: {
      type: "STRING",
      description: "Sender Name (NOT Bank/App).",
    },
    receptor: {
      type: "STRING",
      description: "Receiver Name.",
    },
    tipo_comprobante: {
      type: "STRING",
      description: "Type: factura_a, factura_b, factura_c, transferencia, ticket, recibo.",
    },
    metodo_pago: {
      type: "STRING",
      description: "Payment method: efectivo, transferencia, tarjeta_debito, tarjeta_credito, mercadopago.",
    },
    cuit_paciente: {
      type: "STRING",
      description: "CUIT/CUIL of the patient (sender). Format: XX-XXXXXXXX-X.",
    },
    numero_comprobante: {
      type: "STRING",
      description: "Receipt number if visible.",
    },
    es_valido: {
      type: "BOOLEAN",
      description: "Is valid receipt?",
    },
    nivel_riesgo: {
      type: "NUMBER",
      description: "Score 0-100 (100=Fraud).",
    },
    confidence_score: {
      type: "NUMBER",
      description: "0.0-1.0 readability.",
    },
    razonamiento_fraude: {
      type: "STRING",
      description: "Concise forensic logic.",
    },
  },
  required: ["importe_total", "moneda", "fecha", "emisor", "receptor", "es_valido", "nivel_riesgo", "confidence_score", "razonamiento_fraude"],
};

async function generateContentWithRetry(payload: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      const isRetryable = error.message?.includes('500') || 
                          error.message?.includes('429') || 
                          error.status === 500 || 
                          error.status === 503;
      
      if (isRetryable && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("API call failed after retries");
}

export const analyzeBillingPipeline = async (
  imageBase64: string,
  mimeType: string = "image/jpeg",
  onStepUpdate?: (step: string) => void
): Promise<any> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada");
  }

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    const stepUpdate = onStepUpdate || ((s: string) => console.log(s));

    stepUpdate("🔍 Paso 1: Clasificando...");
    
    // STEP 1: CLASSIFICATION
    const classificationPayload = {
      contents: [{
        parts: [
          { text: `TASK:Classify.
            RULES:
            1.IF(Bill/Service)->'FACTURA'.
            2.ELSE->BestMatch(Mercado Pago,Uala,NX,Personal Pay,Lemon,Prex,MODO,Brubank,Cuenta DNI,Galicia,Santander,BBVA).
            3.DEFAULT->'Generico'.
            OUTPUT:String.` 
          },
          {
            inline_data: {
              mime_type: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.0
      }
    };

    const classificationResponse = await generateContentWithRetry(classificationPayload);

    if (classificationResponse.usageMetadata) {
      totalInputTokens += classificationResponse.usageMetadata.promptTokenCount || 0;
      totalOutputTokens += classificationResponse.usageMetadata.candidatesTokenCount || 0;
    }

    let detectedIssuer = "Generico";
    if (classificationResponse.candidates && classificationResponse.candidates[0]?.content?.parts[0]?.text) {
      detectedIssuer = classificationResponse.candidates[0].content.parts[0].text.trim();
    }
    
    const upperIssuer = detectedIssuer.toUpperCase();
    if (upperIssuer.includes("FACTURA") || upperIssuer.includes("SERVICIO")) detectedIssuer = "FACTURA_SERVICIO";
    else {
      if (upperIssuer.includes("MERCADO")) detectedIssuer = "Mercado Pago";
      else if (upperIssuer.includes("UALA") || upperIssuer.includes("UALÁ")) detectedIssuer = "Ualá";
      else if (upperIssuer.includes("NARANJA") || upperIssuer.includes("NX")) detectedIssuer = "Naranja X";
      else if (upperIssuer.includes("PERSONAL")) detectedIssuer = "Personal Pay";
      else if (upperIssuer.includes("LEMON")) detectedIssuer = "Lemon Cash";
      else if (upperIssuer.includes("PREX")) detectedIssuer = "Prex";
      else if (upperIssuer.includes("MODO")) detectedIssuer = "MODO";
      else if (upperIssuer.includes("BRU")) detectedIssuer = "Brubank";
      else if (upperIssuer.includes("DNI")) detectedIssuer = "Cuenta DNI";
      else if (upperIssuer.includes("GALICIA")) detectedIssuer = "Banco Galicia";
      else if (upperIssuer.includes("SANTANDER")) detectedIssuer = "Santander";
      else if (upperIssuer.includes("BBVA")) detectedIssuer = "BBVA";
      
      if (!COMPLIANCE_RULES[detectedIssuer]) detectedIssuer = "Generico";
    }

    stepUpdate(`📚 Paso 2: Reglas (${detectedIssuer})...`);
    const specificRules = COMPLIANCE_RULES[detectedIssuer] || COMPLIANCE_RULES["Generico"];
    const rulesContext = specificRules.join("\n");

    stepUpdate("⚡ Paso 3: Análisis...");

    const now = new Date();
    const fechaActual = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(now);

    const prompt = `TASK:Forensic_Audit. DATE:${fechaActual}. ISSUER:${detectedIssuer}.
    RULES:
    ${rulesContext}
    CHECKS:
    1.GATEKEEPER:Bill/Debt=INVALID.
    2.FORENSICS:Fonts,Align,Blur,Artifacts.
    3.EXTRACT:Sender,Receiver,Amt,ReceiptType,PaymentMethod,CUIT,ReceiptNumber.
    OUTPUT:JSON.`;

    // STEP 2: EXTRACTION
    const analysisPayload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.0,
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    };

    const response = await generateContentWithRetry(analysisPayload);

    if (response.usageMetadata) {
      totalInputTokens += response.usageMetadata.promptTokenCount || 0;
      totalOutputTokens += response.usageMetadata.candidatesTokenCount || 0;
    }

    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const parsed = JSON.parse(response.candidates[0].content.parts[0].text);
      const finalCost = calculateCost(totalInputTokens, totalOutputTokens);

      return { 
        ...parsed, 
        detected_profile: `Pipeline RAG (${detectedIssuer})`,
        applied_rules: specificRules,
        usage_metadata: {
          prompt_tokens: totalInputTokens,
          candidates_tokens: totalOutputTokens,
          total_tokens: totalInputTokens + totalOutputTokens
        },
        estimated_cost_usd: finalCost
      };
    } else {
      throw new Error("Empty Pipeline Response");
    }

  } catch (error) {
    console.error("Pipeline Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", { errorMessage, errorDetails });
    
    if (errorMessage.includes('API') || errorMessage.includes('fetch')) {
      throw new Error(`Error de conexión con Gemini API: ${errorMessage}.`);
    } else if (errorMessage.includes('schema') || errorMessage.includes('JSON')) {
      throw new Error(`Error al procesar respuesta de Gemini: ${errorMessage}`);
    } else {
      throw new Error(`Error en pipeline de IA: ${errorMessage}`);
    }
  }
};
