import { Type } from "@google/genai";

export interface AnalysisResult {
  importe_total: number;
  moneda: string;
  fecha: string;
  emisor: string;
  receptor: string;
  es_valido: boolean;
  nivel_riesgo: number; 
  confidence_score: number; 
  razonamiento_fraude: string;
  detected_profile?: string; 
  applied_rules?: string[]; 
  
  usage_metadata?: {
    prompt_tokens: number;
    candidates_tokens: number;
    total_tokens: number;
  };
  estimated_cost_usd?: number;

  debug_texto_crudo?: string;
  debug_candidatos?: Array<{ original: string; val: number; confidence: number; reason: string }>;
}

// OPTIMIZED SCHEMA: Short descriptions save tokens (Input Context)
export const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    importe_total: {
      type: Type.NUMBER,
      description: "Exact total amount. No rounding.",
    },
    moneda: {
      type: Type.STRING,
      description: "ISO Code (ARS,USD,EUR).",
    },
    fecha: {
      type: Type.STRING,
      description: "YYYY-MM-DD.",
    },
    emisor: {
      type: Type.STRING,
      description: "Sender Name (NOT Bank/App).",
    },
    receptor: {
      type: Type.STRING,
      description: "Receiver Name.",
    },
    es_valido: {
      type: Type.BOOLEAN,
      description: "Is valid receipt?",
    },
    nivel_riesgo: {
      type: Type.NUMBER,
      description: "Score 0-100 (100=Fraud).",
    },
    confidence_score: {
      type: Type.NUMBER,
      description: "0.0-1.0 readability.",
    },
    razonamiento_fraude: {
      type: Type.STRING,
      description: "Concise forensic logic.",
    },
  },
  required: ["importe_total", "moneda", "es_valido", "nivel_riesgo", "confidence_score", "razonamiento_fraude"],
};