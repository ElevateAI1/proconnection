/**
 * Script para probar pdf-parse con PDFs reales
 */

import fs from 'fs';
import pdfParse from 'https://esm.sh/pdf-parse@1.1.1';

async function testPDFParse(filePath) {
  try {
    console.log(`🔍 Probando pdf-parse con: ${filePath}`);

    // Leer el archivo PDF
    const pdfBuffer = fs.readFileSync(filePath);
    console.log(`📄 Archivo leído: ${pdfBuffer.length} bytes`);

    // Procesar con pdf-parse
    const pdfData = await pdfParse(pdfBuffer);

    console.log('📊 Información del PDF:');
    console.log(`- Páginas: ${pdfData.numpages}`);
    console.log(`- Texto extraído (${pdfData.text.length} caracteres):`);

    if (pdfData.text && pdfData.text.trim()) {
      console.log('--- TEXTO EXTRAÍDO ---');
      console.log(pdfData.text.substring(0, 1000));
      if (pdfData.text.length > 1000) {
        console.log('... (texto continúa)');
      }
      console.log('--- FIN TEXTO ---');

      // Buscar importes en el texto
      const amountPatterns = [
        /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,  // 1.500,00
        /\b(\d{1,3}(?:\.\d{3})*)\b/g,       // 150000
      ];

      console.log('\n🔍 Buscando importes en el texto:');
      amountPatterns.forEach(pattern => {
        const matches = pdfData.text.match(pattern);
        if (matches) {
          console.log(`✅ Patrón ${pattern} encontró:`, matches);
        }
      });

    } else {
      console.log('❌ No se extrajo texto legible del PDF');
    }

  } catch (error) {
    console.error('❌ Error procesando PDF:', error);
  }
}

// Función para buscar PDFs en el directorio
function findPDFs() {
  try {
    const files = fs.readdirSync('.');
    const pdfs = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    return pdfs;
  } catch (error) {
    console.error('Error buscando PDFs:', error);
    return [];
  }
}

// Ejecutar pruebas
async function main() {
  console.log('🚀 Probador de pdf-parse para PDFs reales\n');

  const pdfs = findPDFs();

  if (pdfs.length === 0) {
    console.log('❌ No se encontraron archivos PDF en el directorio actual');
    console.log('Coloca un archivo PDF aquí para probarlo');
    return;
  }

  console.log(`📁 PDFs encontrados: ${pdfs.join(', ')}\n`);

  // Probar cada PDF
  for (const pdf of pdfs) {
    await testPDFParse(pdf);
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

main().catch(console.error);
