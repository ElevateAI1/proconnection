
import { formatDateArgentina, ARGENTINA_LOCALE } from './dateFormatting';

export interface AccountingReportData {
  id: string;
  psychologist_id: string;
  report_month: number;
  report_year: number;
  total_amount: number;
  total_receipts: number;
  amount_by_payment_method: Record<string, number>;
  amount_by_receipt_type: Record<string, number>;
  annual_accumulated: number;
  auto_approved_receipts?: number;
  manually_reviewed_receipts?: number;
  generation_date?: string;
  monotax_alert?: any;
}

export interface PsychologistInfo {
  first_name: string;
  last_name: string;
  professional_code: string;
  phone?: string;
}

export const exportAccountingReportAsCSV = (
  reportData: AccountingReportData,
  psychologist: PsychologistInfo
): void => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const csvContent = generateAccountingCSV(reportData, psychologist, monthNames);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte_contable_${monthNames[reportData.report_month - 1]}_${reportData.report_year}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printAccountingReport = (
  reportData: AccountingReportData,
  psychologist: PsychologistInfo
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const htmlContent = generateAccountingHTML(reportData, psychologist);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const generateAccountingCSV = (
  reportData: AccountingReportData,
  psychologist: PsychologistInfo,
  monthNames: string[]
): string => {
  const lines: string[] = [];
  
  // Header
  lines.push('REPORTE CONTABLE MENSUAL');
  lines.push(`Profesional,${psychologist.first_name} ${psychologist.last_name}`);
  lines.push(`Período,${monthNames[reportData.report_month - 1]} ${reportData.report_year}`);
  lines.push(`Código Profesional,${psychologist.professional_code}`);
  lines.push('');
  
  // Summary
  lines.push('RESUMEN EJECUTIVO');
  lines.push('Concepto,Valor');
  lines.push(`Total de ingresos del mes,$${reportData.total_amount.toLocaleString(ARGENTINA_LOCALE)}`);
  lines.push(`Cantidad de comprobantes,${reportData.total_receipts}`);
  lines.push(`Acumulado anual,$${reportData.annual_accumulated.toLocaleString(ARGENTINA_LOCALE)}`);
  lines.push(`Promedio por comprobante,$${(reportData.total_amount / Math.max(reportData.total_receipts, 1)).toLocaleString(ARGENTINA_LOCALE)}`);
  lines.push('');
  
  // Payment methods
  if (reportData.amount_by_payment_method && Object.keys(reportData.amount_by_payment_method).length > 0) {
    lines.push('INGRESOS POR MÉTODO DE PAGO');
    lines.push('Método de Pago,Monto,Porcentaje');
    Object.entries(reportData.amount_by_payment_method).forEach(([method, amount]) => {
      const percentage = ((amount / reportData.total_amount) * 100).toFixed(1);
      lines.push(`${getPaymentMethodLabel(method)},$${amount.toLocaleString(ARGENTINA_LOCALE)},${percentage}%`);
    });
    lines.push('');
  }
  
  // Receipt types
  if (reportData.amount_by_receipt_type && Object.keys(reportData.amount_by_receipt_type).length > 0) {
    lines.push('INGRESOS POR TIPO DE COMPROBANTE');
    lines.push('Tipo de Comprobante,Monto,Porcentaje');
    Object.entries(reportData.amount_by_receipt_type).forEach(([type, amount]) => {
      const percentage = ((amount / reportData.total_amount) * 100).toFixed(1);
      lines.push(`${getReceiptTypeLabel(type)},$${amount.toLocaleString(ARGENTINA_LOCALE)},${percentage}%`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
};

const generateAccountingHTML = (
  reportData: AccountingReportData,
  psychologist: PsychologistInfo
): string => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte Contable - ${monthNames[reportData.report_month - 1]} ${reportData.report_year}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          background-color: #3B82F6;
          color: white;
          padding: 10px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .alert {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte Contable Mensual</h1>
        <h2>${monthNames[reportData.report_month - 1]} ${reportData.report_year}</h2>
        <p><strong>${psychologist.first_name} ${psychologist.last_name}</strong></p>
        <p>Código Profesional: ${psychologist.professional_code}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Resumen Ejecutivo</div>
        <table>
          <tr><td><strong>Total de ingresos del mes</strong></td><td>$${reportData.total_amount.toLocaleString(ARGENTINA_LOCALE)}</td></tr>
          <tr><td><strong>Cantidad de comprobantes</strong></td><td>${reportData.total_receipts}</td></tr>
          <tr><td><strong>Acumulado anual</strong></td><td>$${reportData.annual_accumulated.toLocaleString(ARGENTINA_LOCALE)}</td></tr>
          <tr><td><strong>Promedio por comprobante</strong></td><td>$${(reportData.total_amount / Math.max(reportData.total_receipts, 1)).toLocaleString(ARGENTINA_LOCALE)}</td></tr>
        </table>
      </div>

      ${reportData.monotax_alert ? `
        <div class="alert">
          <strong>⚠️ Alerta de Monotributo:</strong> ${reportData.monotax_alert.message}
        </div>
      ` : ''}

      ${Object.keys(reportData.amount_by_payment_method || {}).length > 0 ? `
        <div class="section">
          <div class="section-title">Ingresos por Método de Pago</div>
          <table>
            <thead>
              <tr><th>Método de Pago</th><th>Monto</th><th>Porcentaje</th></tr>
            </thead>
            <tbody>
              ${Object.entries(reportData.amount_by_payment_method).map(([method, amount]) => `
                <tr>
                  <td>${getPaymentMethodLabel(method)}</td>
                  <td>$${amount.toLocaleString(ARGENTINA_LOCALE)}</td>
                  <td>${((amount / reportData.total_amount) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${Object.keys(reportData.amount_by_receipt_type || {}).length > 0 ? `
        <div class="section">
          <div class="section-title">Ingresos por Tipo de Comprobante</div>
          <table>
            <thead>
              <tr><th>Tipo de Comprobante</th><th>Monto</th><th>Porcentaje</th></tr>
            </thead>
            <tbody>
              ${Object.entries(reportData.amount_by_receipt_type).map(([type, amount]) => `
                <tr>
                  <td>${getReceiptTypeLabel(type)}</td>
                  <td>$${amount.toLocaleString(ARGENTINA_LOCALE)}</td>
                  <td>${((amount / reportData.total_amount) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="section">
        <p><strong>Fecha de generación:</strong> ${formatDateArgentina(new Date())}</p>
        <p><strong>ID del reporte:</strong> ${reportData.id}</p>
      </div>
    </body>
    </html>
  `;
};

const getPaymentMethodLabel = (method: string): string => {
  const methods: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'card': 'Tarjeta',
    'mercadopago': 'MercadoPago',
    'other': 'Otro',
    'no_especificado': 'No especificado'
  };
  return methods[method] || method;
};

const getReceiptTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'factura_a': 'Factura A',
    'factura_b': 'Factura B',
    'factura_c': 'Factura C',
    'recibo': 'Recibo',
    'nota_credito': 'Nota de Crédito',
    'nota_debito': 'Nota de Débito',
    'other': 'Otro',
    'no_especificado': 'No especificado'
  };
  return types[type] || type;
};
