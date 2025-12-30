/**
 * Script para probar el scraper con el contenido REAL del PDF de BBVA
 * Usando el contenido exacto que vemos en el PDF real
 */

// Contenido real del PDF de BBVA (extraído de los search results)
const contenidoRealPDF = `%PDF-1.4%3 0 obj <</ColorSpace[/Indexed/DeviceRGB 255(7Ax7Bx7Cz8Cz8Dz9E|9F|:F};G};H~<H~=H~=I~>J?J@KAKALBLCLCMDNEOFOGPGQHQIQJSKTLTLTMUNVNVOWPWPXQXRZSZT[U\\V]W]W]W^X_Y\`Z\`[\\[\`[a]b^c^d_e\`eafcgchdiejfkgkhljnkololpmpnqnrpsrutwuwuxwyxzx{y{{}|~})]/Subtype/Image/Height 40/Filter/FlateDecode/Type/XObject/Width 248/Length 1346/BitsPerComponent 8>>streamxY[U>.Pi&B7.fYeU]4L-+KYf]HJ$hU2T}y9{9s$e=p\`>uv\\"Q"M=:$oD#|*&cRQP.29Bb&$r29mW;jV({0#pK:f]|3/!~8#DxZ34EoOE5=Q/ZYH>-c!$s4tby>(c0hsGd&,|3uwv^n{zH9",R|-d+@a;' \\;x/iDJ|;9%|g6P'Za\`a=8[NS{9eyNq=_jaXucdeIyEzgH,W%plt>.[W.Nj=gkQ>^"9b.&neg%-^U8/R'q5Db(%Y)[kY5\\k$=kpgs59NbmFl^=v8jrJ,ov]G-=k5)wu%s|*wHS=\\>lQ|g+Dt[;.yY?;SCP1:5QQa~Pj kz(\`tvuECjtq)Qo:ko4[{LX0gq0Jw_$lxv-@[z9D"AdH>5^OH{+iPqK[ay zx"]^wk-5MkCA<i]1/&I)pwR*>ch{zu@x>:bT/jQ0yObQH"\\ cFvKSkBDQa>fi@^h*A9ZP2?(K?(2sVJ#zA\\7R|'F8|:\`Z%il 2_G|endstreamendobj4 0 obj <</ColorSpace[/Indexed/DeviceRGB 3(<)]/Subtype/Image/Height 1/Filter/FlateDecode/Type/XObject/Width 11/Length 11/BitsPerComponent 2>>streamxcb7endstreamendobj5 0 obj <</ColorSpace[/Indexed/DeviceRGB 15(<)]/Subtype/Image/Height 1/Filter/FlateDecode/Type/XObject/Width 12/Length 14/BitsPerComponent 4>>streamxc\`H1endstreamendobj6 0 obj <</ColorSpace[/Indexed/DeviceRGB 15(<)]/Subtype/Image/Height 15/Filter/FlateDecode/Type/XObject/Width 545/Length 94/BitsPerComponent 4>>streamx EQt:!$|3AsO[E2[/;Ajz/JBs#HE_4!H$Lendstreamendobj7 0 obj <</ColorSpace[/Indexed/DeviceRGB 255(OOO<__???333??ffffffoo)]/Subtype/Image/Height 32/Filter/FlateDecode/Type/XObject/Width 590/Length 184/BitsPerComponent 8>>streamx1j0EQ\`7Bu3IsNpykihu=j"GM5&rDQ9j"GM5&rDQ9j"GM5j"hZ;Z\`QiztS{i(izSL4]9='o>[V[endstreamendobj8 0 obj <</Filter/FlateDecode/Length 841>>streamxVMoFWVo%*RhE!mPLWo?!eI#M\\fv pE<b4<^F~r@:sh|&:{=mJB1\`azjs0k'v)zKN?A\\{\`O3\`M4e@{dqY+F>C.{adA)0K]MQG_p$OV*c0*aKRa:9b_H.P\`cbi=mQoo\\uUlaQo\\Y(6DFAuZKaJK7HaIb[Xqtc.EP(LJ0Fy(~i fi?]kuowlo>kpg0LtxMg+NeEhfE]E/WTHy4]Mi_.^f-M?JG(fl<48M^umxbQGLVYfse2Z'iW@eI<>A%qd$1RQ0NVw}KWfnUuX%Wq"b>s}sIl|}8RJ~aF24YjoZa;d{X1ia<cakCAd}XwMv]t6p=Y.Ux+WS{4endstreamendobj1 0 obj<</Contents 8 0 R/Type/Page/Resources<</ProcSet [/PDF/Text/ImageB/ImageC/ImageI]/Font<</F1 2 0 R>>/XObject<</img4 7 0 R/img3 6 0 R/img2 5 0 R/img1 4 0 R/img0 3 0 R>>>>/Parent 9 0 R/MediaBox[0 0 595 842]>>endobj10 0 obj[1 0 R/XYZ 0 854 0]endobj2 0 obj<</Subtype/Type1/Type/Font/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>endobj9 0 obj<</Kids[1 0 R]/Type/Pages/Count 1>>endobj11 0 obj<</Names[(JR_PAGE_ANCHOR_0_1) 10 0 R]>>endobj12 0 obj<</Dests 11 0 R>>endobj13 0 obj<</Names 12 0 R/Type/Catalog/Pages 9 0 R>>endobj14 0 obj<</ModDate(D:20251205150511-03'00')/Creator(JasperReports \\(Ticket\\))/CreationDate(D:20251205150511-03'00')/Producer(iText 2.0.8 \\(by lowagie.com\\))>>endobjxref0 150000000000 65535 f 0000005057 00000 n 0000005315 00000 n 0000000015 00000 n 0000002301 00000 n 0000002489 00000 n 0000002717 00000 n 0000003027 00000 n 0000004149 00000 n 0000005402 00000 n 0000005280 00000 n 0000005452 00000 n 0000005507 00000 n 0000005540 00000 n 0000005598 00000 n <</Info 14 0 R/ID [<253221fcf83d71a73fe10dfcdccdaa66><4952cb9e3787aec9ee0d34b2f1869fbd>]/Root 13 0 R/Size 15>>startxref5764%%EOF`;

// Función de extracción genérica (igual que en producción)
function extractReceiptAmount(rawText) {
  console.log('🧾 Extrayendo importe genérico de comprobante real...');

  // MÉTODO GENÉRICO: Buscar cualquier importe en comprobantes argentinos
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

  let allFoundAmounts = [];

  commonPatterns.forEach((pattern, index) => {
    const matches = rawText.match(pattern);
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

  // Filtrar números válidos (importes razonables)
  allFoundAmounts = [...new Set(allFoundAmounts)]; // Eliminar duplicados
  const validAmounts = allFoundAmounts.filter(num => {
    if (!num || num.length < 3) return false;
    const cleanNum = num.replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(cleanNum);
    return amount > 10 && amount < 10000000 && !isNaN(amount);
  });

  if (validAmounts.length > 0) {
    console.log('✅ Números válidos encontrados:', validAmounts);

    // Tomar el importe más grande (generalmente el total)
    const sortedAmounts = validAmounts
      .map(num => ({
        original: num,
        value: parseFloat(num.replace(/\./g, '').replace(',', '.'))
      }))
      .sort((a, b) => b.value - a.value);

    const bestAmount = sortedAmounts[0].original;
    console.log('🏆 IMPORTE PRINCIPAL DETECTADO:', bestAmount);

    return bestAmount;
  }

  console.log('❌ No se encontraron importes válidos en el PDF real');
  return '';
}

// Probar con el contenido REAL del PDF de BBVA
console.log('🚀 Probando con PDF REAL de BBVA (contenido exacto)...\n');
console.log('📄 Contenido del PDF (primeros 200 caracteres):');
console.log(contenidoRealPDF.substring(0, 200) + '...\n');

const result = extractReceiptAmount(contenidoRealPDF);

if (result) {
  console.log('\n✅ ¡ÉXITO! Importe detectado en PDF real:', result);

  // Calcular valor numérico
  const cleanAmount = result.replace(/\./g, '').replace(',', '.');
  const numericAmount = parseFloat(cleanAmount);

  console.log('💰 Valor numérico:', numericAmount);
  console.log('📊 Confianza: Alta (PDF bancario real)');

  // Comparar con el importe esperado
  if (numericAmount === 884375) {
    console.log('🎯 ¡PERFECTO! Detectó exactamente $884.375,00');
  } else {
    console.log('⚠️ Detectó un importe diferente. Esperado: 884375, Encontrado:', numericAmount);
  }
} else {
  console.log('\n❌ No se pudo detectar el importe en el PDF real');

  // Mostrar estadísticas del contenido
  const numbersFound = contenidoRealPDF.match(/(\d{3,8})/g) || [];
  console.log('🔍 Números encontrados en el PDF:', numbersFound);

  const validNumbers = numbersFound.filter(num => {
    const amount = parseFloat(num);
    return amount >= 100 && amount <= 10000000;
  });

  console.log('✅ Números válidos (100 - 10M):', validNumbers);

  if (validNumbers.length > 0) {
    const sortedValid = validNumbers
      .map(num => ({
        original: num,
        value: parseFloat(num)
      }))
      .sort((a, b) => b.value - a.value);

    console.log('🎯 Mejor candidato encontrado:', sortedValid[0].original);
    console.log('💡 Sugerencia: El PDF está muy comprimido, pero encontramos números válidos');
  }
}

console.log('\n📋 ANÁLISIS DEL PDF:');
console.log('• Es un PDF generado por JasperReports');
console.log('• Tiene streams comprimidos (FlateDecode)');
console.log('• Contiene imágenes embebidas');
console.log('• El texto real está comprimido en streams binarios');
console.log('• La detección actual encuentra números en metadatos, no el texto real');
