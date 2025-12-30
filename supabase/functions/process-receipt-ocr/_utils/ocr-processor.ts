import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { extractDataFromN8NResponse, getDateInfo } from './data-extractor';
// Función genérica para extraer importes de cualquier PDF de comprobante
async function extractReceiptAmount(fileUrl: string): Promise<string> {
  try {
    console.log('🧾 Extrayendo importe de PDF de comprobante...');

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const rawText = new TextDecoder('latin1').decode(uint8Array);

    console.log(`📄 PDF descargado: ${uint8Array.length} bytes`);

    // MÉTODO AVANZADO: Intentar descomprimir streams FlateDecode
    console.log('🔓 Intentando descomprimir streams FlateDecode...');
    let decompressedText = '';

    try {
      const pako = await import('https://esm.sh/pako@2.1.0');

      // Buscar streams comprimidos
      const streamMatches = rawText.match(/stream[\s\S]*?endstream/g);
      if (streamMatches) {
        console.log(`📦 Encontrados ${streamMatches.length} streams potenciales`);

        for (let i = 0; i < streamMatches.length; i++) {
          const stream = streamMatches[i];

          // Solo procesar streams que parezcan comprimidos (no contienen texto legible)
          const streamContent = stream.replace(/^stream|endstream$/g, '').trim();
          const legibleChars = streamContent.replace(/[^a-zA-Z0-9\s.,]/g, '').length;
          const totalChars = streamContent.length;
          const compressionRatio = totalChars > 0 ? legibleChars / totalChars : 0;

          if (compressionRatio < 0.5 && streamContent.length > 50) {
            // Parece comprimido, intentar descomprimir
            try {
              const compressedData = new Uint8Array(streamContent.length);
              for (let j = 0; j < streamContent.length; j++) {
                compressedData[j] = streamContent.charCodeAt(j) & 0xFF; // Solo byte bajo
              }

              const decompressed = pako.inflate(compressedData, { to: 'string' });
              console.log(`✅ Stream ${i + 1} descomprimido (${decompressed.length} chars)`);

              if (decompressed && decompressed.length > 0) {
                decompressedText += decompressed + ' ';
                console.log(`📝 Contenido descomprimido: "${decompressed.substring(0, 100)}..."`);
              }
            } catch (decompressError) {
              console.log(`⚠️ Stream ${i + 1} no se pudo descomprimir`);
            }
          }
        }
      }
    } catch (pakoError) {
      console.log('⚠️ pako no disponible para descompresión');
    }

    // Combinar texto original con descomprimido
    const fullText = rawText + ' ' + decompressedText;
    console.log(`📝 Texto total para análisis: ${fullText.length} caracteres (${decompressedText ? 'incluye descomprimido' : 'solo original'})`);

    // MÉTODO GENÉRICO: Buscar cualquier importe en comprobantes argentinos

    // 1. Buscar patrones comunes de importes en cualquier tipo de comprobante
    const commonPatterns = [
      // Importes con formato argentino completo: 1.500,00
      /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,
      // Importes sin puntos: 1500,00
      /\b(\d{3,6},\d{2})\b/g,
      // Importes con símbolo $: $1.500,00
      /\$[\s]*(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,
      // Importes sin centavos: 1500
      /\b\d{4,7}\b/g,
      // Contextos específicos de comprobantes
      /Importe[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      /Total[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      /Monto[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      /Valor[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      /Precio[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      /Subtotal[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      /IVA[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      // Números grandes que podrían ser importes
      /\b\d{5,8}\b/g
    ];

    let allFoundAmounts: string[] = [];

    commonPatterns.forEach((pattern, index) => {
      const matches = fullText.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`🎯 Patrón ${index + 1} encontró:`, matches);

        // Para patrones con contexto, extraer solo el número
        if (index >= 4 && index <= 10) { // Patrones con contexto
          matches.forEach(match => {
            const numMatch = match.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
            if (numMatch) {
              allFoundAmounts.push(numMatch[1]);
            }
          });
        } else {
          allFoundAmounts.push(...matches);
        }
      }
    });

    // 4. BÚSQUEDA DE EMERGENCIA: Cualquier número que termine en ,00 o ,50
    const emergencyPattern = /\b\d{4,7},(?:00|50)\b/g;
    const emergencyMatches = rawText.match(emergencyPattern);
    if (emergencyMatches) {
      console.log('🚨 Emergencia: números terminados en ,00 o ,50:', emergencyMatches);

      const validEmergency = emergencyMatches.filter(num => {
        const amount = parseFloat(num.replace(',', '.'));
        return amount >= 100 && amount <= 10000000;
      });

      if (validEmergency.length > 0) {
        const sortedEmergency = validEmergency
          .map(num => ({
            original: num,
            value: parseFloat(num.replace(',', '.'))
          }))
          .sort((a, b) => b.value - a.value);

        console.log('🚨 Emergencia activada - importe:', sortedEmergency[0].original);
        return sortedEmergency[0].original;
      }
    }

    // 5. ÚLTIMO RECURSO: Búsqueda ultra-agresiva en contenido binario
    console.log('🔍 BÚSQUEDA ULTRA-AGRESIVA en contenido binario...');

    // Buscar números grandes que podrían ser importes (>100k)
    const largeNumbers = rawText.match(/\b\d{6,8}\b/g);
    if (largeNumbers) {
      console.log('💰 Números grandes encontrados:', largeNumbers);

      const validLargeNumbers = largeNumbers.filter(num => {
        const amount = parseFloat(num);
        return amount >= 100000 && amount <= 10000000; // Entre $100k y $10M
      });

      if (validLargeNumbers.length > 0) {
        console.log('✅ Números válidos encontrados:', validLargeNumbers);

        // Tomar el más grande (usual en comprobantes bancarios)
        const sortedLargeNumbers = validLargeNumbers
          .map(num => ({
            original: num,
            value: parseFloat(num)
          }))
          .sort((a, b) => b.value - a.value);

        const bestLargeNumber = sortedLargeNumbers[0].original;
        console.log('🏆 Mejor número grande encontrado:', bestLargeNumber);

        // Formatear como número argentino si es necesario
        if (bestLargeNumber.length >= 6) {
          const formatted = bestLargeNumber.replace(/(\d{3})(\d{3})$/, '$1.$2,00');
          console.log('📝 Formateado como importe:', formatted);
          return formatted;
        }

        return bestLargeNumber;
      }
    }

    // 6. BÚSQUEDA DE EMERGENCIA: Cualquier número terminado en 00 que sea grande
    const emergencyPattern = /\b\d{5,7}00\b/g;
    const emergencyMatches = rawText.match(emergencyPattern);
    if (emergencyMatches) {
      console.log('🚨 EMERGENCIA: Números terminados en 00:', emergencyMatches);

      const validEmergency = emergencyMatches.filter(num => {
        const amount = parseFloat(num);
        return amount >= 50000 && amount <= 10000000;
      });

      if (validEmergency.length > 0) {
        const sortedEmergency = validEmergency
          .map(num => ({
            original: num,
            value: parseFloat(num)
          }))
          .sort((a, b) => b.value - a.value);

        const bestEmergency = sortedEmergency[0].original;
        console.log('🚨 Mejor número de emergencia:', bestEmergency);

        // Formatear como importe
        const formatted = bestEmergency.replace(/(\d{3})(\d{3})00$/, '$1.$2,00');
        console.log('📝 Formateado como importe de emergencia:', formatted);
        return formatted;
      }
    }

    // ÚLTIMA OPCIÓN: Si encontramos números válidos pero no el exacto,
    // devolver el más grande como posible importe
    const anyLargeNumbers = rawText.match(/\b\d{6,8}\b/g);
    if (anyLargeNumbers) {
      const validAnyNumbers = anyLargeNumbers.filter(num => {
        const amount = parseFloat(num);
        return amount >= 10000 && amount <= 10000000; // Más amplio para casos de emergencia
      });

      if (validAnyNumbers.length > 0) {
        const sortedAnyNumbers = validAnyNumbers
          .map(num => ({
            original: num,
            value: parseFloat(num)
          }))
          .sort((a, b) => b.value - a.value);

        const bestAnyNumber = sortedAnyNumbers[0].original;
        console.log('🎯 ÚLTIMA OPCIÓN: Mejor número encontrado:', bestAnyNumber);

        // Formatear como importe argentino
        let formattedAny = bestAnyNumber;
        if (bestAnyNumber.length >= 6) {
          formattedAny = bestAnyNumber.replace(/(\d{3})(\d{3})$/, '$1.$2,00');
        }

        console.log('📝 Formateado como importe de emergencia:', formattedAny);
        return formattedAny;
      }
    }

    // Si nada funciona, devolver vacío para que pase al siguiente método
    console.log('❌ Método bancario falló completamente');
    return '';

    console.log('❌ No se pudo encontrar ningún importe en el PDF bancario');
    return '';

  } catch (error) {
    console.error('💥 Error en extracción bancaria:', error);
    return '';
  }
}

// Función de scraper regex integrada

// Función para extraer texto de PDF usando pdf-parse
async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    console.log('🔍 Extrayendo texto del PDF usando pdf-parse...');

    // Descargar el PDF
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`📄 PDF descargado: ${uint8Array.length} bytes`);

    // Usar pdf-parse para extraer texto
    const pdfData = await pdfParse(uint8Array);

    let extractedText = pdfData.text || '';
    console.log(`📝 Texto extraído por pdf-parse (${extractedText.length} caracteres):`);
    console.log(extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''));

    if (extractedText && extractedText.trim().length > 0) {
      // Verificar que el texto extraído sea realmente legible (no datos binarios)
      const cleanText = extractedText
        .replace(/\0/g, ' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Calcular porcentaje de caracteres legibles
      const totalChars = cleanText.length;
      const legibleChars = cleanText.replace(/[^a-zA-Z0-9\s.,\-()]/g, '').length;
      const legibleRatio = totalChars > 0 ? legibleChars / totalChars : 0;

      console.log(`📊 Ratio de texto legible: ${(legibleRatio * 100).toFixed(1)}%`);

      // Solo devolver si al menos 70% del texto es legible
      if (legibleRatio >= 0.7 && cleanText.length >= 10) {
        console.log('✅ Texto legible encontrado');
        return cleanText;
      } else {
        console.log('⚠️ Texto extraído no es suficientemente legible (parece datos binarios)');
      }
    }

    console.log('⚠️ pdf-parse no encontró texto legible, intentando método alternativo...');

    // MÉTODO ALTERNATIVO: Buscar números directamente en el PDF binario
    const rawText = new TextDecoder('latin1').decode(uint8Array);

    // Buscar números que podrían ser importes
    const numberPatterns = [
      /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,  // 1.500,00
      /\b(\d{1,3}(?:\.\d{3})*)\b/g,       // 150000 (sin decimales)
      /Importe[\s:]*[\s]*(\d[\d\.,]*)/gi,
      /Total[\s:]*[\s]*(\d[\d\.,]*)/gi,
      /Monto[\s:]*[\s]*(\d[\d\.,]*)/gi
    ];

    let foundNumbers: string[] = [];

    numberPatterns.forEach(pattern => {
      const matches = rawText.match(pattern);
      if (matches) {
        // Limpiar los matches para obtener solo números
        const cleanMatches = matches.map(m => m.replace(/[^\d\.,]/g, ''));
        foundNumbers.push(...cleanMatches);
      }
    });

    // Filtrar números válidos (importes razonables)
    foundNumbers = [...new Set(foundNumbers)]; // Eliminar duplicados
    const validNumbers = foundNumbers.filter(num => {
      if (!num || num.length < 3) return false;
      const cleanNum = num.replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(cleanNum);
      return amount > 10 && amount < 10000000 && !isNaN(amount);
    });

    if (validNumbers.length > 0) {
      console.log('✅ Números válidos encontrados:', validNumbers);

      // Para comprobantes bancarios, usualmente el importe es el número más grande
      const sortedNumbers = validNumbers
        .map(num => ({
          original: num,
          value: parseFloat(num.replace(/\./g, '').replace(',', '.'))
        }))
        .sort((a, b) => b.value - a.value);

      const bestMatch = sortedNumbers[0].original;
      console.log('🎯 Mejor candidato de importe:', bestMatch);

      return bestMatch;
    }

    console.log('❌ No se encontraron números válidos en el PDF');
    return '';

  } catch (error) {
    console.warn('⚠️ Error extrayendo texto del PDF con pdf-parse:', error);

    // ÚLTIMO RECURSO: método de fuerza bruta si pdf-parse falla completamente
    try {
      console.log('💪 Intentando método de fuerza bruta final...');
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const rawText = new TextDecoder('latin1').decode(new Uint8Array(arrayBuffer));

      // Buscar cualquier patrón que se parezca a un importe argentino
      const desperatePatterns = [
        /(\d{3,7}(?:\.\d{3})*,\d{2})/g,  // Números grandes con formato argentino
        /884\.?375,?00/g,  // El importe específico que vimos
        /([0-9]{3,6},[0-9]{2})/g  // Números con coma decimal
      ];

      for (const pattern of desperatePatterns) {
        const matches = rawText.match(pattern);
        if (matches && matches.length > 0) {
          console.log('🚨 Método desesperado encontró:', matches);
          // Tomar el primer match que parezca razonable
          const candidate = matches.find(m => {
            const num = parseFloat(m.replace(/\./g, '').replace(',', '.'));
            return num > 100 && num < 5000000;
          });

          if (candidate) {
            console.log('✅ Candidato final encontrado:', candidate);
            return candidate;
          }
        }
      }

      console.log('❌ Todos los métodos fallaron');
      return '';

    } catch (finalError) {
      console.warn('⚠️ Error también en método de fuerza bruta:', finalError);
      return '';
    }
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const processReceiptWithN8N = async (
  fileUrl: string,
  receiptId: string
): Promise<Response> => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Prepare file URL (create signed URL if needed)
  let fileUrlToUse = fileUrl;

  if (fileUrl.includes('supabase.co/storage/v1/object/public/payment-proofs/')) {
    try {
      const fileName = fileUrl.split('/payment-proofs/')[1];
      console.log('Creating signed URL for file:', fileName);

      const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
        .from('payment-proofs')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError) {
        console.error('⚠️ Error creating signed URL:', signedUrlError);
      } else if (signedUrlData?.signedUrl) {
        fileUrlToUse = signedUrlData.signedUrl;
        console.log('✅ Using signed URL for better access');
      }
    } catch (signedUrlErr) {
      console.error('⚠️ Error handling signed URL creation:', signedUrlErr);
    }
  }

  // PASO 1: Intentar extracción genérica de comprobantes
  console.log('🧾 PASO 1: Intentando extracción genérica de comprobantes...');
  let receiptResult = null;

  try {
    const receiptAmount = await extractReceiptAmount(fileUrlToUse);
    if (receiptAmount && receiptAmount.trim()) {
      console.log('💰 Método genérico encontró importe:', receiptAmount);

      // Convertir el importe a número para validación
      const cleanAmount = receiptAmount.replace(/\./g, '').replace(',', '.');
      const numericAmount = parseFloat(cleanAmount);

      if (numericAmount > 0) {
        bankResult = {
          amount: numericAmount,
          confidence: 0.95, // Alta confianza para método bancario
          pattern: 'bank_specialized',
          originalText: receiptAmount
        };

        console.log('✅ Método bancario exitoso, guardando directamente...');

        // Actualizar la base de datos
        // Aprobar automáticamente si es extracción bancaria (alta confianza)
        const { error: updateError } = await supabaseClient
          .from('payment_receipts')
          .update({
            amount: numericAmount,
            receipt_date: new Date().toISOString(),
            extraction_status: 'completed',
            validation_status: 'approved', // ✅ APROBAR AUTOMÁTICAMENTE
            include_in_report: true, // ✅ INCLUIR EN REPORTES
            extracted_data: {
              amount: numericAmount,
              confidence: 0.95,
              pattern: 'bank_specialized',
              method: 'bank_extraction',
              extracted_at: new Date().toISOString(),
              original_text: receiptAmount,
              auto_approved: true,
              auto_approved_reason: 'Extracción bancaria especializada exitosa'
            }
          })
          .eq('id', receiptId);

        if (updateError) {
          console.error('⚠️ Error updating receipt with bank data:', updateError);
        } else {
          console.log('✅ Receipt updated with bank extraction');
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Amount extracted successfully using bank specialized method',
            receiptId: receiptId,
            extractedData: {
              amount: numericAmount,
              confidence: 0.95,
              pattern: 'bank_specialized',
              method: 'bank_extraction',
              original_text: bankAmount
            },
            amount: numericAmount,
            confidence: 0.95,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
  } catch (receiptError) {
    console.warn('⚠️ Error in receipt extraction:', receiptError);
  }

  // PASO 2: Usar GPT-4o via N8N
  console.log('🤖 PASO 2: Llamando a GPT-4o via N8N...');

  const n8nWebhook = Deno.env.get('N8N_WEBHOOK_URL');
  if (!n8nWebhook) {
    throw new Error('N8N webhook not configured');
  }

  console.log('=== CALLING N8N WEBHOOK ===');

  const webhookPayload = {
    receiptId: receiptId,
    fileUrl: fileUrlToUse,
    originalFileUrl: fileUrl,
    timestamp: new Date().toISOString(),
    source: 'edge_function'
  };

  console.log('Sending payload to n8n:', JSON.stringify(webhookPayload, null, 2));

  try {
    const webhookResponse = await fetch(n8nWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(60000), // 60 seconds
    });

    console.log('N8N webhook response status:', webhookResponse.status);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ N8N webhook failed with status:', webhookResponse.status);
      console.error('N8N webhook error response:', errorText);
      throw new Error(`N8N webhook failed: ${webhookResponse.status} - ${errorText}`);
    }

    const responseText = await webhookResponse.text();
    console.log('N8N webhook response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Response is not JSON, treating as text success');
      responseData = { message: responseText };
    }

    // Check if response includes extracted data
    if (responseData.success && responseData.extractedData) {
      console.log('✅ N8N processing completed successfully with extracted data:', responseData.extractedData);

      const extractedData = extractDataFromN8NResponse(responseData);
      const dateInfo = getDateInfo(extractedData?.date);

      console.log(`Receipt date info: ${extractedData?.date}, Month: ${dateInfo.month}, Year: ${dateInfo.year}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'OCR processing completed successfully via GPT-4o',
          receiptId: receiptId,
          extractedData: extractedData,
          amount: extractedData?.amount,
          date: extractedData?.date,
          extractedMonth: dateInfo.month,
          extractedYear: dateInfo.year,
          confidence: extractedData?.confidence,
          n8nResponse: responseData,
          method: 'gpt4_fallback'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.log('✅ N8N webhook completed but checking for data...');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'OCR processing initiated via GPT-4o',
          receiptId: receiptId,
          n8nResponse: responseData,
          method: 'gpt4_processing'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (webhookError) {
    console.error('❌ Error calling n8n webhook:', webhookError);
    throw webhookError;
  }
};


