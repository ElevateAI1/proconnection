/**
 * Script para probar la extracción de texto de PDFs
 * Simula el contenido binario del PDF de BBVA que vimos
 */

// Simular el contenido del PDF de BBVA (versión simplificada)
const mockPDFContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R /MediaBox [0 0 595 842] >>
endobj
4 0 obj
<< /Length 185 >>
stream
BT
/F1 12 Tf
50 800 Td
(Transferencia BBVA) Tj
0 -20 Td
(Importe:) Tj
100 0 Td
(884.375,00) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
429
%%EOF`;

// Función de extracción mejorada (basada en la que implementamos)
function extractTextFromPDF(rawText) {
  let text = '';
  let hasTextContent = false;

  console.log('📊 Análisis del PDF:');
  console.log('¿Streams comprimidos?', rawText.includes('/FlateDecode') || rawText.includes('/Filter/FlateDecode'));
  console.log('¿Contiene imágenes?', rawText.includes('/Subtype/Image'));

  // ESTRATEGIA 1: Buscar patrones específicos de comprobantes bancarios
  const bankPatterns = [
    /Importe[\s:]*[\s]*([\d\.,]+)/gi,
    /Total[\s:]*[\s]*([\d\.,]+)/gi,
    /Monto[\s:]*[\s]*([\d\.,]+)/gi,
    /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,
    /\$[\s]*([\d\.,]+)/g,
    /Importe[^0-9]*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    /(\d{3,6}(?:\.\d{3})*,\d{2})/g
  ];

  console.log('🔍 Probando patrones específicos de comprobantes...');
  bankPatterns.forEach(pattern => {
    const matches = rawText.match(pattern);
    if (matches && matches.length > 0) {
      console.log(`✅ Patrón ${pattern} encontró:`, matches);
      matches.forEach(match => {
        const numberMatch = match.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
        if (numberMatch) {
          text += numberMatch[1] + ' ';
          hasTextContent = true;
        }
      });
    }
  });

  // ESTRATEGIA 2: Buscar streams TJ
  if (!hasTextContent) {
    console.log('📝 Buscando streams TJ...');
    const tjMatches = rawText.match(/\(Tj[\s\S]*?\)Tj/g);
    if (tjMatches && tjMatches.length > 0) {
      console.log(`Encontrados ${tjMatches.length} streams TJ`);
      tjMatches.forEach(match => {
        const content = match.replace(/^\(Tj|\)Tj$/g, '');
        if (content && content.trim().length > 0) {
          const cleanContent = content
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')');

          const numberMatches = cleanContent.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/g);
          if (numberMatches) {
            numberMatches.forEach(num => {
              text += num + ' ';
              hasTextContent = true;
            });
          }
        }
      });
    }
  }

  // ESTRATEGIA 3: Búsqueda bancaria especializada
  if (!hasTextContent && (rawText.includes('BBVA') || rawText.includes('Banco'))) {
    console.log('🏦 Detectado PDF bancario, búsqueda especializada...');

    const allNumbers = rawText.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/g);
    if (allNumbers && allNumbers.length > 0) {
      console.log('Números encontrados en PDF bancario:', allNumbers);

      const bankAmounts = allNumbers.filter(num => {
        const amount = parseFloat(num.replace(/\./g, '').replace(',', '.'));
        return amount >= 100 && amount <= 5000000;
      });

      if (bankAmounts.length > 0) {
        const sortedAmounts = bankAmounts
          .map(num => ({
            original: num,
            value: parseFloat(num.replace(/\./g, '').replace(',', '.'))
          }))
          .sort((a, b) => b.value - a.value);

        console.log('✅ Importe bancario detectado:', sortedAmounts[0].original);
        text += sortedAmounts[0].original + ' ';
        hasTextContent = true;
      }
    }
  }

  text = text.trim();
  console.log('📄 Texto final extraído:', text);
  console.log('¿Se encontró contenido?', hasTextContent);

  return hasTextContent ? text : '';
}

// Probar con el PDF simulado
console.log('🚀 Probando extracción de PDF de BBVA...\n');
const extractedText = extractTextFromPDF(mockPDFContent);

if (extractedText) {
  console.log('\n✅ ¡ÉXITO! Texto extraído:', extractedText);

  // Probar el scraper con el texto extraído
  console.log('\n🔍 Probando scraper con texto extraído...');

  // Función scraper simplificada para testing
  const normalizedText = extractedText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const patterns = [
    { name: 'numero_con_comas', pattern: /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g }
  ];

  for (const pattern of patterns) {
    const matches = [...normalizedText.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))];
    for (const match of matches) {
      const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      if (amount > 0) {
        console.log('💰 IMPORTE DETECTADO:', amount);
        console.log('📊 Patrón usado:', pattern.name);
      }
    }
  }
} else {
  console.log('\n❌ No se pudo extraer texto del PDF');
}
