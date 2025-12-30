import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, analysisSchema } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PRICE_PER_1M_INPUT = 0.075;
const PRICE_PER_1M_OUTPUT = 0.30;

const calculateCost = (inputTokens: number, outputTokens: number) => {
    const inputCost = (inputTokens / 1_000_000) * PRICE_PER_1M_INPUT;
    const outputCost = (outputTokens / 1_000_000) * PRICE_PER_1M_OUTPUT;
    return inputCost + outputCost;
};

async function generateContentWithRetry(params: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            const isRetryable = error.message?.includes('500') || 
                                error.message?.includes('xhr') || 
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

export const analyzeReceipt = async (base64Image: string, mimeType: string = "image/jpeg"): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-3-flash-preview"; 

    const now = new Date();
    const fechaActual = new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short', 
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(now);

    // HYPER-OPTIMIZED PROMPT: Zero prose.
    const efficientPrompt = `TASK:Audit_Receipt. DATE:${fechaActual}.
    CHECKS:
    1.VISUAL:Fonts,Blur,Artifacts.
    2.LOGIC:Bill/Debt/Due_Date=INVALID.
    3.DATA:Sender!=Bank,Receiver,Amt.
    OUTPUT:JSON.`;

    const response = await generateContentWithRetry({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: efficientPrompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.0, 
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as AnalysisResult;
      
      let usage = { prompt_tokens: 0, candidates_tokens: 0, total_tokens: 0 };
      let cost = 0;

      if (response.usageMetadata) {
          usage.prompt_tokens = response.usageMetadata.promptTokenCount || 0;
          usage.candidates_tokens = response.usageMetadata.candidatesTokenCount || 0;
          usage.total_tokens = usage.prompt_tokens + usage.candidates_tokens;
          cost = calculateCost(usage.prompt_tokens, usage.candidates_tokens);
      }

      return { 
          ...parsed, 
          detected_profile: "Gemini 3 Flash (Optimized)",
          usage_metadata: usage,
          estimated_cost_usd: cost
      };
    } else {
      throw new Error("Empty AI response.");
    }

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};