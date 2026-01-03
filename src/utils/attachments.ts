import { PDFDocument } from 'pdf-lib';

export type SanitizedAttachment = {
  file: File;
  kind: 'image' | 'audio' | 'file';
};

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.8;

const resizeImage = async (file: File): Promise<File> => {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(
      (b) => resolve(b),
      'image/webp',
      IMAGE_QUALITY
    )
  );
  if (!blob) return file;

  const cleanName = file.name.replace(/\.[^.]+$/, '') + '.webp';
  return new File([blob], cleanName, { type: 'image/webp', lastModified: Date.now() });
};

const sanitizePdf = async (file: File): Promise<File> => {
  const array = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(array);
  // Limpiar metadatos comunes
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');
  pdfDoc.setKeywords([]);

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return new File([pdfBytes], file.name, { type: 'application/pdf', lastModified: Date.now() });
};

export const sanitizeAttachment = async (file: File): Promise<SanitizedAttachment> => {
  const mime = file.type || '';

  if (mime.startsWith('image/')) {
    const processed = await resizeImage(file);
    return { file: processed, kind: 'image' };
  }

  if (mime === 'application/pdf') {
    const processed = await sanitizePdf(file);
    return { file: processed, kind: 'file' };
  }

  if (mime.startsWith('audio/')) {
    // Sin transcodificar: dependemos de que el archivo ya venga comprimido (ej. opus/webm).
    return { file, kind: 'audio' };
  }

  // Otros documentos: tratarlos como archivo genérico
  return { file, kind: 'file' };
};
