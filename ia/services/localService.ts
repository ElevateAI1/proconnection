import { AnalysisResult } from "../types";
import { preprocessImageForOCR, cropImage } from "../utils/pdfUtils";

// --- CONFIGURATION & TYPES ---

interface WalletProfile {
  id: string;
  name: string;
  signatures: RegExp[]; // Palabras clave para identificar qué billetera es
  senderPatterns: RegExp[]; // Regex para encontrar Emisor
  receiverPatterns: RegExp[]; // Regex para encontrar Receptor
  amountAnchors: RegExp; // Regex para la línea DEBAJO del monto (para el recorte ROI)
  dateFormats?: 'standard' | 'short_month'; // Ayuda para parsear fechas
}

const WALLET_PROFILES: WalletProfile[] = [
  // --- FINTECHS ---
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    signatures: [/Mercado\s?Pago/i, /MPago/i, /CVU: 00000031/],
    senderPatterns: [/De\s+([A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+)(?=\s+(?:CUIT|CVU|Mercado|$))/i],
    receiverPatterns: [/Para\s+([A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+)(?=\s+(?:CUIT|CBU|CVU|Mercado|$))/i],
    amountAnchors: /Motivo|Moti|Concepto|Ref|Varios|Operación/i
  },
  {
    id: 'naranjax',
    name: 'Naranja X',
    signatures: [/Naranja\s?X/i, /Hacé como.*Naranja X/i],
    senderPatterns: [/Hacé como\s+([A-ZÁÉÍÓÚÑ][a-z]+)\s+y/i], 
    receiverPatterns: [/Pago en\s*\n\s*([A-ZÁÉÍÓÚÑ0-9\s\.]+)/i, /Para\s+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i],
    amountAnchors: /Total|Categoría|Salud|Pago en/i,
    dateFormats: 'short_month'
  },
  {
    id: 'uala',
    name: 'Ualá',
    signatures: [/Ualá/i, /Bancar.*Tecnología/i, /ABC\s?Fintech/i],
    senderPatterns: [/De\s*\n\s*([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i, /Recibiste de\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Transferiste a\s*\n\s*([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i, /Para\s*\n\s*([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i],
    amountAnchors: /Total|Concepto|Motivo|Fecha/i 
  },
  {
    id: 'personalpay',
    name: 'Personal Pay',
    signatures: [/Personal\s?Pay/i, /Micro\s?Sistemas/i],
    senderPatterns: [/Titular\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Destinatario\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i, /Para\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Total|Importe|Motivo/i
  },
  {
    id: 'lemon',
    name: 'Lemon Cash',
    signatures: [/Lemon/i],
    senderPatterns: [/De\s+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i],
    receiverPatterns: [/Para\s+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i],
    amountAnchors: /Total|Enviaste/i
  },
  {
    id: 'prex',
    name: 'Prex',
    signatures: [/Prex/i],
    senderPatterns: [/De\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Para\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Monto|Concepto/i
  },

  // --- BANCOS & MODO ---
  {
    id: 'modo',
    name: 'MODO',
    signatures: [/MODO/i, /Play Digital/i],
    senderPatterns: [/Desde la cuenta de\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/A la cuenta de\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i, /Destinatario\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Concepto|Motivo|Número de/i
  },
  {
    id: 'brubank',
    name: 'Brubank',
    signatures: [/brubank/i],
    senderPatterns: [/Ordenante\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Destinatario\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Motivo|Concepto/i
  },
  {
    id: 'cuentadni',
    name: 'Cuenta DNI',
    signatures: [/Cuenta\s?DNI/i, /Banco\s+de\s+la\s+Provincia/i],
    senderPatterns: [/Ordenante\s*[:\n]\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Beneficiario\s*[:\n]\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Importe|Concepto/i
  },
  {
    id: 'santander',
    name: 'Santander',
    signatures: [/Santander/i],
    senderPatterns: [/Origen\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Destinatario\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i, /Destino\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Importe|Concepto/i
  },
  {
    id: 'galicia',
    name: 'Galicia',
    signatures: [/Galicia/i],
    senderPatterns: [/Origen\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Destinatario\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i, /Para\s*\n\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Importe|Concepto/i
  },
  {
    id: 'bbva',
    name: 'BBVA',
    signatures: [/BBVA/i, /Francés/i],
    senderPatterns: [/Titular\s*[:\n]\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    receiverPatterns: [/Destinatario\s*[:\n]\s*([A-ZÁÉÍÓÚÑ\s]+)/i],
    amountAnchors: /Importe|Concepto/i
  },

  // --- FALLBACK ---
  {
    id: 'generic',
    name: 'Billetera Genérica',
    signatures: [], // Fallback
    senderPatterns: [/De\s+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i, /Origen[:\s]+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i],
    receiverPatterns: [/Para\s+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i, /Destino[:\s]+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i, /Destinatario[:\s]+([A-ZÁÉÍÓÚÑ][a-zA-Z\s]+)/i],
    amountAnchors: /Motivo|Concepto|Referencia|Total|Importe/i
  }
];

// --- HELPER FUNCTIONS ---

const MONTHS_MAP: { [key: string]: number } = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11
};

const parseDate = (text: string): Date | null => {
  // 29/12/2025
  const numericMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (numericMatch) return new Date(parseInt(numericMatch[3]), parseInt(numericMatch[2]) - 1, parseInt(numericMatch[1]));

  // 25 de Diciembre
  const textMatch = text.match(/(\d{1,2})\s+de\s+([a-zA-Z]+)\s+de\s+(20\d{2})/i);
  if (textMatch && MONTHS_MAP.hasOwnProperty(textMatch[2].toLowerCase())) {
    return new Date(parseInt(textMatch[3]), MONTHS_MAP[textMatch[2].toLowerCase()], parseInt(textMatch[1]));
  }

  // 29/DIC/2025
  const shortTextMatch = text.match(/(\d{1,2})[\/\-]([a-zA-Z]{3})[\/\-](\d{4})/i);
  if (shortTextMatch && MONTHS_MAP.hasOwnProperty(shortTextMatch[2].toLowerCase())) {
    return new Date(parseInt(shortTextMatch[3]), MONTHS_MAP[shortTextMatch[2].toLowerCase()], parseInt(shortTextMatch[1]));
  }
  return null;
};

const parseAmountString = (raw: string): number => {
    let clean = raw.replace(/[^\d.,]/g, '');
    if (!clean) return 0;
    const matchSuffix = clean.match(/([.,])(\d{3})$/);
    if (matchSuffix) {
        const integerStr = clean.replace(/[.,]/g, '');
        return parseFloat(integerStr);
    }
    if (clean.includes('.') && clean.includes(',')) {
        if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) clean = clean.replace(/\./g, '').replace(',', '.');
        else clean = clean.replace(/,/g, '');
    } else if (clean.includes(',')) clean = clean.replace(',', '.');
    
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
};

// --- MAIN SERVICE ---

export const analyzeReceiptLocal = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      // @ts-ignore
      if (!window.Tesseract) return reject(new Error("Tesseract.js no cargado."));

      // 1. PRE-PROCESAMIENTO
      const processedBase64 = await preprocessImageForOCR(base64Image);
      const imageSrc = `data:${mimeType};base64,${processedBase64}`;

      // 2. OCR INICIAL (Scan General)
      // @ts-ignore
      const result1 = await window.Tesseract.recognize(imageSrc, 'spa', { tessedit_pageseg_mode: '3' });
      
      const lines = result1.data.lines;
      let fullText = result1.data.text;
      
      // 3. DETECCIÓN DE BILLETERA
      let detectedProfile = WALLET_PROFILES.find(p => p.id === 'generic')!;
      for (const profile of WALLET_PROFILES) {
          if (profile.signatures.some(sig => sig.test(fullText))) {
              detectedProfile = profile;
              break;
          }
      }

      // 3.5. VALIDACIÓN DE INTEGRIDAD PARA PERFIL GENÉRICO (Anti-Facturas de Servicios)
      // Si cae en genérico, debemos ser estrictos para no confundir una factura de luz/gas con un comprobante.
      let invalidReason = null;
      if (detectedProfile.id === 'generic') {
          // Palabras prohibidas que sugieren Factura de Servicios y no Comprobante de Transferencia
          const invalidKeywords = [
              /Liquidación\s+de\s+Servicios/i, 
              /Suministro\s+N/i, 
              /Medidor/i, 
              /Lectura\s+(?:Anterior|Actual)/i, 
              /Factura\s+[A-C]\s/i, // Factura A, B, C
              /Vencimiento\s+\d/i, // Las facturas tienen vencimiento, los comprobantes tienen Fecha de Operación
              /Periodo\s+Facturado/i,
              /Total\s+a\s+Pagar/i // En comprobantes suele ser "Total Pagado" o "Importe"
          ];
          
          // Palabras requeridas para ser considerado comprobante si es genérico
          const validReceiptKeywords = [
              /Comprobante/i, 
              /Transferencia/i, 
              /Pago\s+.*Realizado/i, 
              /Dinero\s+.*Enviado/i, 
              /Operación\s+.*Exitosa/i, 
              /Detalle\s+.*Transacción/i,
              /Envío\s+.*Dinero/i,
              /Ticket\s+de\s+Op/i
          ];
          
          const isBill = invalidKeywords.some(regex => regex.test(fullText));
          const isReceipt = validReceiptKeywords.some(regex => regex.test(fullText));

          if (isBill) {
              invalidReason = "Detectado documento de Facturación/Servicios (Luz, Agua, Gas), NO es un comprobante de pago.";
          } else if (!isReceipt) {
              // Si no tiene palabras de factura pero tampoco de comprobante, es dudoso
              invalidReason = "El documento no presenta indicadores claros de ser un comprobante de transferencia válido.";
          }
      }

      // Si falló la validación genérica, retornamos temprano error
      if (invalidReason) {
         return resolve({
            importe_total: 0,
            moneda: "ARS",
            fecha: "No detectada",
            emisor: "Desconocido",
            receptor: "Desconocido",
            es_valido: false,
            nivel_riesgo: 100,
            confidence_score: 0.0,
            razonamiento_fraude: `ALERTA CRÍTICA: ${invalidReason} Perfil Genérico rechazado.`,
            debug_texto_crudo: fullText,
            detected_profile: "Documento Inválido (No Comprobante)"
         });
      }

      // 4. ESTRATEGIA DE RECORTE (ROI) DINÁMICA
      const dateRegex = /(\d{1,2}[\/\-\s](?:de\s)?[a-z]{3,}[\/\-\s](?:de\s)?\d{4})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i;

      const dateLine = lines.find((l: any) => dateRegex.test(l.text) && !/Para|De|CUIT/.test(l.text));
      const anchorLine = lines.find((l: any) => detectedProfile.amountAnchors.test(l.text));

      let roiDebugInfo = `ROI: No aplicado.`;

      if (dateLine && anchorLine) {
          const yStart = dateLine.bbox.y1; // Abajo de la fecha
          const yEnd = anchorLine.bbox.y0; // Arriba del motivo/total
          const height = yEnd - yStart;

          if (height > 20 && height < 700) {
              roiDebugInfo = `ROI aplicado (${height}px).`;
              const croppedBase64 = await cropImage(processedBase64, yStart, height);
              // @ts-ignore
              const result2 = await window.Tesseract.recognize(`data:${mimeType};base64,${croppedBase64}`, 'spa', { tessedit_pageseg_mode: '7' });
              
              const foundAmountText = result2.data.text.trim();
              if (foundAmountText) {
                   fullText = `$$$ROI_AMOUNT_START$$$ ${foundAmountText} $$$ROI_AMOUNT_END$$$\n` + fullText;
              }
          }
      }

      // 5. PARSEO DE DATOS SEGÚN PERFIL
      const textLines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const flatText = fullText.replace(/\n+/g, ' ');

      // -- Emisor / Receptor --
      let emisor = "No detectado";
      let receptor = "No detectado";

      // Intentar regex específicos del perfil
      for (const pattern of detectedProfile.senderPatterns) {
          const match = fullText.match(pattern) || flatText.match(pattern);
          if (match && match[1]) { emisor = match[1].trim(); break; }
      }
      for (const pattern of detectedProfile.receiverPatterns) {
          const match = fullText.match(pattern) || flatText.match(pattern);
          if (match && match[1]) { receptor = match[1].trim(); break; }
      }

      // Fallback genérico si falló el específico
      if (emisor === "No detectado") {
          const generic = fullText.match(/De\s+([A-Z][a-zA-Z\s]+)/);
          if (generic) emisor = generic[1];
      }
      
      if (emisor.length > 30) emisor = emisor.substring(0, 30) + "...";
      if (receptor.length > 30) receptor = receptor.substring(0, 30) + "...";

      // -- Monto --
      let maxAmount = 0;
      let bestCandidateStr = "";
      
      const numberRegex = /[\$sS]?\s*(\d+(?:[.,\s]\d+)*)/g;
      const isRoiLine = (l: string) => l.includes("$$$ROI_AMOUNT_START$$$");

      textLines.forEach((line) => {
          if (/CUIT|CUIL|CBU|CVU|Alias|ID:|Código|Operación/i.test(line) && !isRoiLine(line)) return;

          const matches = line.matchAll(numberRegex);
          for (const match of matches) {
              const rawStr = match[1];
              const val = parseAmountString(rawStr);
              
              if (val <= 0 || (val >= 2020 && val <= 2030 && Number.isInteger(val))) continue;
              if (val > 50000000) continue; // Sanity cap

              let score = 0;
              if (isRoiLine(line)) score += 100; // Prioridad absoluta al ROI
              if (detectedProfile.amountAnchors.test(line)) score += 20; // Si está en la misma línea que el anchor
              if (/\d{1,3}\.\d{3}\b/.test(rawStr)) score += 20; // Puntos de miles
              if (line.includes('$') || /USD|ARS/.test(line)) score += 10;

              if (score > 20 && val > maxAmount) {
                  maxAmount = val;
                  bestCandidateStr = rawStr;
              }
          }
      });

      // -- Fecha --
      const detectedDateObj = parseDate(fullText);
      const fecha = detectedDateObj ? detectedDateObj.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : "No detectada";

      // -- Resultado --
      let nivel_riesgo = 0;
      let razonamientos = [`${roiDebugInfo}`];

      if (maxAmount === 0) {
          nivel_riesgo += 30;
          razonamientos.push("No se encontró monto válido.");
      } else {
          razonamientos.push(`Monto extraído: ${bestCandidateStr}.`);
      }

      if (fecha === "No detectada") {
          nivel_riesgo += 10;
          razonamientos.push("Fecha no legible.");
      } else if (detectedDateObj && detectedDateObj > new Date()) {
          nivel_riesgo = 100;
          razonamientos.push(`ALERTA: Fecha futura ${fecha}.`);
      } else {
          razonamientos.push("Fecha válida.");
      }

      resolve({
        importe_total: maxAmount,
        moneda: /USD|u\$s/i.test(fullText) ? "USD" : "ARS",
        fecha,
        emisor,
        receptor,
        es_valido: nivel_riesgo < 50,
        nivel_riesgo,
        confidence_score: maxAmount > 0 ? 0.8 : 0.0, // Default simple para local
        razonamiento_fraude: razonamientos.join(" "),
        debug_texto_crudo: fullText,
        detected_profile: detectedProfile.name // Asignar el nombre del perfil detectado
      });

    } catch (e) {
      console.error(e);
      reject(new Error("Falló el análisis local."));
    }
  });
};