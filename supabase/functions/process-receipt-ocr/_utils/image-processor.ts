export async function downloadAndConvertToBase64(fileUrl: string): Promise<{ base64: string; mimeType: string }> {
  try {
    console.log('📥 Downloading file from:', fileUrl);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    // Gemini puede procesar PDFs directamente, así que los enviamos tal cual
    if (mimeType === 'application/pdf') {
      console.log('📄 Detected PDF, sending directly to Gemini (can handle PDFs natively)');
    }
    
    // Convertir a base64 de forma segura para archivos grandes
    const base64 = arrayBufferToBase64(uint8Array);
    console.log(`✅ File converted to base64: ${mimeType}, size: ${uint8Array.length} bytes`);
    
    return { base64, mimeType };
  } catch (error) {
    console.error('❌ Error downloading and converting file:', error);
    throw new Error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  try {
    // Para archivos grandes, usar chunks
    const chunkSize = 8192;
    let result = '';
    
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      result += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(result);
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw new Error('Failed to convert file to base64');
  }
}

export function resizeImageIfNeeded(base64: string, maxDimension: number = 1536): string {
  // Gemini puede manejar imágenes grandes, así que solo validamos tamaño máximo
  try {
    const sizeInBytes = (base64.length * 3) / 4;
    const maxSizeInMB = 20; // Gemini soporta hasta ~20MB
    
    if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
      console.warn(`⚠️ Image is very large (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB), may cause issues`);
    }
    
    return base64;
  } catch (error) {
    console.warn('Error checking image size, using original:', error);
    return base64;
  }
}
