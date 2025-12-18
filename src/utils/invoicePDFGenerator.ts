import { jsPDF } from 'jspdf';
import { Invoice } from '@/hooks/useInvoices';

/**
 * Genera un PDF de factura tipo C con formato AFIP
 */
export const generateInvoicePDF = async (invoice: Invoice, psychologist: {
  first_name: string;
  last_name: string;
  professional_code?: string;
  license_number?: string;
  specialization?: string;
  phone?: string;
  email?: string;
  cuit?: string;
  address?: string;
}): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // ============================================================================
  // ENCABEZADO - Datos del Profesional
  // ============================================================================
  
  // Fondo del encabezado
  doc.setFillColor(62, 95, 120); // blue-petrol
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA TIPO C', pageWidth / 2, 15, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante para Consumidor Final', pageWidth / 2, 22, { align: 'center' });
  
  // Datos del profesional
  doc.setFontSize(9);
  const professionalName = `${psychologist.first_name} ${psychologist.last_name}`;
  doc.text(professionalName, pageWidth / 2, 30, { align: 'center' });
  
  if (psychologist.cuit) {
    doc.text(`CUIT: ${psychologist.cuit}`, pageWidth / 2, 35, { align: 'center' });
  }
  
  if (psychologist.professional_code) {
    doc.text(`Código Profesional: ${psychologist.professional_code}`, pageWidth / 2, 40, { align: 'center' });
  }
  
  if (psychologist.address) {
    doc.text(psychologist.address, pageWidth / 2, 45, { align: 'center' });
  }

  yPos = 60;

  // ============================================================================
  // DATOS DE LA FACTURA
  // ============================================================================
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Número de factura
  const invoiceNumberFormatted = `${invoice.point_of_sale.toString().padStart(4, '0')}-${invoice.invoice_number.toString().padStart(8, '0')}`;
  doc.text(`Número: ${invoiceNumberFormatted}`, margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Fecha
  const invoiceDate = new Date(invoice.invoice_date);
  const formattedDate = invoiceDate.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  doc.text(`Fecha: ${formattedDate}`, margin, yPos);
  
  yPos += 7;
  
  // Estado
  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    generated: 'Generada',
    sent: 'Enviada',
    cancelled: 'Cancelada',
    voided: 'Anulada',
  };
  doc.text(`Estado: ${statusLabels[invoice.status] || invoice.status}`, margin, yPos);
  
  yPos += 10;

  // ============================================================================
  // DATOS DEL CLIENTE
  // ============================================================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor(62, 95, 120);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 25);
  
  doc.text('DATOS DEL CLIENTE', margin + 5, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  doc.text(`Nombre: ${invoice.client_name}`, margin + 5, yPos);
  
  yPos += 6;
  if (invoice.client_document_type && invoice.client_document_number) {
    doc.text(`${invoice.client_document_type}: ${invoice.client_document_number}`, margin + 5, yPos);
    yPos += 6;
  }
  
  if (invoice.client_address) {
    doc.text(`Dirección: ${invoice.client_address}`, margin + 5, yPos);
    yPos += 6;
  }
  
  if (invoice.client_email) {
    doc.text(`Email: ${invoice.client_email}`, margin + 5, yPos);
    yPos += 6;
  }
  
  yPos += 5;

  // ============================================================================
  // DETALLE DEL SERVICIO
  // ============================================================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DEL SERVICIO', margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Tabla de items
  const tableStartY = yPos;
  const colWidths = {
    description: pageWidth - 2 * margin - 60,
    quantity: 20,
    price: 30,
    total: 30,
  };
  
  // Encabezado de tabla
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Descripción', margin, yPos);
  doc.text('Cant.', margin + colWidths.description, yPos);
  doc.text('Precio Unit.', margin + colWidths.description + colWidths.quantity, yPos);
  doc.text('Total', margin + colWidths.description + colWidths.quantity + colWidths.price, yPos);
  
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Item del servicio
  const descriptionLines = doc.splitTextToSize(invoice.service_description, colWidths.description - 5);
  const itemHeight = Math.max(descriptionLines.length * 5, 8);
  
  doc.text(descriptionLines, margin, yPos);
  doc.text(invoice.service_quantity.toString(), margin + colWidths.description, yPos, { align: 'right' });
  doc.text(`$${invoice.unit_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, margin + colWidths.description + colWidths.quantity, yPos, { align: 'right' });
  doc.text(`$${invoice.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, margin + colWidths.description + colWidths.quantity + colWidths.price, yPos, { align: 'right' });
  
  yPos += itemHeight + 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;

  // ============================================================================
  // TOTALES
  // ============================================================================
  
  const totalsX = pageWidth - margin - 60;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', totalsX, yPos, { align: 'right' });
  doc.text(`$${invoice.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos, { align: 'right' });
  
  if (invoice.discount > 0) {
    yPos += 6;
    doc.text('Descuento:', totalsX, yPos, { align: 'right' });
    doc.text(`-$${invoice.discount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos, { align: 'right' });
  }
  
  yPos += 8;
  doc.setDrawColor(62, 95, 120);
  doc.setLineWidth(1);
  doc.line(totalsX - 10, yPos, pageWidth - margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPos, { align: 'right' });
  doc.text(`$${invoice.total_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 15;

  // ============================================================================
  // NOTAS Y OBSERVACIONES
  // ============================================================================
  
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Observaciones:', margin, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
    yPos += notesLines.length * 4 + 5;
  }

  // ============================================================================
  // PIE DE PÁGINA
  // ============================================================================
  
  const footerY = pageHeight - 20;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Este comprobante es válido como factura tipo C para consumidor final.', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text('No requiere CAE (Código de Autorización Electrónico) para consumidores finales.', pageWidth / 2, footerY + 10, { align: 'center' });
  
  if (psychologist.email || psychologist.phone) {
    doc.text(
      `Contacto: ${[psychologist.email, psychologist.phone].filter(Boolean).join(' | ')}`,
      pageWidth / 2,
      footerY + 15,
      { align: 'center' }
    );
  }

  // ============================================================================
  // MARCA DE AGUA (si es borrador)
  // ============================================================================
  
  if (invoice.status === 'draft') {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('BORRADOR', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
  }

  // Generar blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

/**
 * Descarga el PDF de la factura
 */
export const downloadInvoicePDF = async (
  invoice: Invoice,
  psychologist: {
    first_name: string;
    last_name: string;
    professional_code?: string;
    license_number?: string;
    specialization?: string;
    phone?: string;
    email?: string;
    cuit?: string;
    address?: string;
  }
): Promise<void> => {
  const pdfBlob = await generateInvoicePDF(invoice, psychologist);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Factura-${invoice.point_of_sale.toString().padStart(4, '0')}-${invoice.invoice_number.toString().padStart(8, '0')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Abre el PDF en una nueva ventana
 */
export const openInvoicePDF = async (
  invoice: Invoice,
  psychologist: {
    first_name: string;
    last_name: string;
    professional_code?: string;
    license_number?: string;
    specialization?: string;
    phone?: string;
    email?: string;
    cuit?: string;
    address?: string;
  }
): Promise<void> => {
  const pdfBlob = await generateInvoicePDF(invoice, psychologist);
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  // Revocar URL después de un tiempo
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

