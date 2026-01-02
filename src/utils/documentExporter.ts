
import { formatDateArgentina } from './dateFormatting';

export interface DocumentData {
  title: string;
  type: string;
  content: any;
  patient?: {
    first_name: string;
    last_name: string;
    age?: number;
    phone?: string;
  };
  psychologist?: {
    first_name: string;
    last_name: string;
    professional_code: string;
    license_number?: string;
    specialization?: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
  status: string;
}

export const exportAsText = (document: DocumentData): void => {
  const content = formatDocumentAsText(document);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsJSON = (document: DocumentData): void => {
  const content = JSON.stringify(document, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printDocument = (document: DocumentData): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const htmlContent = formatDocumentAsHTML(document);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const formatDocumentAsText = (document: DocumentData): string => {
  const lines: string[] = [];
  
  lines.push(`DOCUMENTO: ${document.title}`);
  lines.push(`Tipo: ${getDocumentTypeLabel(document.type)}`);
  lines.push(`Fecha: ${formatDateArgentina(document.created_at)}`);
  lines.push('');
  
  if (document.psychologist) {
    lines.push('PROFESIONAL:');
    lines.push(`Nombre: ${document.psychologist.first_name} ${document.psychologist.last_name}`);
    lines.push(`Código Profesional: ${document.psychologist.professional_code}`);
    if (document.psychologist.license_number) {
      lines.push(`Matrícula: ${document.psychologist.license_number}`);
    }
    if (document.psychologist.specialization) {
      lines.push(`Especialización: ${document.psychologist.specialization}`);
    }
    lines.push('');
  }
  
  if (document.patient) {
    lines.push('PACIENTE:');
    lines.push(`Nombre: ${document.patient.first_name} ${document.patient.last_name}`);
    if (document.patient.age) {
      lines.push(`Edad: ${document.patient.age} años`);
    }
    if (document.patient.phone) {
      lines.push(`Teléfono: ${document.patient.phone}`);
    }
    lines.push('');
  }
  
  lines.push('CONTENIDO:');
  lines.push(formatContentAsText(document.content, document.type));
  
  return lines.join('\n');
};

const formatDocumentAsHTML = (document: DocumentData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          border-bottom: 2px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .field {
          margin-bottom: 8px;
        }
        .field-label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${document.title}</h1>
        <p><strong>Tipo:</strong> ${getDocumentTypeLabel(document.type)}</p>
        <p><strong>Fecha:</strong> ${formatDateArgentina(document.created_at)}</p>
      </div>
      
      ${document.psychologist ? `
        <div class="section">
          <div class="section-title">Información del Profesional</div>
          <div class="field">
            <span class="field-label">Nombre:</span>
            ${document.psychologist.first_name} ${document.psychologist.last_name}
          </div>
          <div class="field">
            <span class="field-label">Código Profesional:</span>
            ${document.psychologist.professional_code}
          </div>
          ${document.psychologist.license_number ? `
            <div class="field">
              <span class="field-label">Matrícula:</span>
              ${document.psychologist.license_number}
            </div>
          ` : ''}
          ${document.psychologist.specialization ? `
            <div class="field">
              <span class="field-label">Especialización:</span>
              ${document.psychologist.specialization}
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      ${document.patient ? `
        <div class="section">
          <div class="section-title">Información del Paciente</div>
          <div class="field">
            <span class="field-label">Nombre:</span>
            ${document.patient.first_name} ${document.patient.last_name}
          </div>
          ${document.patient.age ? `
            <div class="field">
              <span class="field-label">Edad:</span>
              ${document.patient.age} años
            </div>
          ` : ''}
          ${document.patient.phone ? `
            <div class="field">
              <span class="field-label">Teléfono:</span>
              ${document.patient.phone}
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">Contenido del Documento</div>
        ${formatContentAsHTML(document.content, document.type)}
      </div>
    </body>
    </html>
  `;
};

const formatContentAsText = (content: any, type: string): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  const lines: string[] = [];
  
  if (typeof content === 'object') {
    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        lines.push(`${formatFieldName(key)}: ${value}`);
        lines.push('');
      }
    });
  }
  
  return lines.join('\n');
};

const formatContentAsHTML = (content: any, type: string): string => {
  if (typeof content === 'string') {
    return `<p>${content.replace(/\n/g, '<br>')}</p>`;
  }
  
  if (typeof content === 'object') {
    const fields = Object.entries(content)
      .filter(([_, value]) => typeof value === 'string' && value.trim())
      .map(([key, value]) => `
        <div class="field">
          <span class="field-label">${formatFieldName(key)}:</span>
          <div style="margin-left: 150px; margin-top: 5px;">
            ${String(value).replace(/\n/g, '<br>')}
          </div>
        </div>
      `)
      .join('');
    
    return fields;
  }
  
  return '<p>Contenido no disponible</p>';
};

const getDocumentTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'assessment': 'Evaluación Psicológica',
    'consent': 'Consentimiento Informado',
    'treatment_plan': 'Plan de Tratamiento',
    'progress_report': 'Reporte de Progreso'
  };
  return types[type] || type;
};

const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};
