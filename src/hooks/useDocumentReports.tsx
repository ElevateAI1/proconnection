
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { formatDateArgentina } from '@/utils/dateFormatting';

interface DocumentReportData {
  totalDocuments: number;
  documentsByStatus: Record<string, number>;
  documentsByType: Record<string, number>;
  documentsByMonth: Record<string, number>;
  overdueDocuments: number;
  avgProcessingTime: number;
  productivityTrend: Array<{ date: string; count: number }>;
}

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  documentType?: string;
  status?: string;
  psychologistId?: string;
}

export const useDocumentReports = (filters: ReportFilters = {}) => {
  const { psychologist } = useProfile();
  const [reportData, setReportData] = useState<DocumentReportData>({
    totalDocuments: 0,
    documentsByStatus: {},
    documentsByType: {},
    documentsByMonth: {},
    overdueDocuments: 0,
    avgProcessingTime: 0,
    productivityTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (psychologist?.id) {
      fetchReportData();
    }
  }, [psychologist, filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Build query with filters
      let query = supabase
        .from('patient_documents')
        .select('*')
        .eq('psychologist_id', psychologist?.id);

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters.documentType && filters.documentType !== 'all') {
        query = query.eq('type', filters.documentType);
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data: documents, error } = await query;

      if (error) throw error;

      if (documents) {
        const data = processReportData(documents);
        setReportData(data);
      }
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (documents: any[]): DocumentReportData => {
    const now = new Date();
    
    // Count by status
    const documentsByStatus = documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    // Count by type
    const documentsByType = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {});

    // Count by month
    const documentsByMonth = documents.reduce((acc, doc) => {
      const month = formatDateArgentina(doc.created_at, { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Count overdue documents
    const overdueDocuments = documents.filter(doc => 
      doc.due_date && 
      new Date(doc.due_date) < now && 
      !['completed', 'approved'].includes(doc.status)
    ).length;

    // Calculate average processing time (simplified)
    const completedDocs = documents.filter(doc => 
      ['completed', 'approved'].includes(doc.status)
    );
    
    const avgProcessingTime = completedDocs.length > 0 
      ? completedDocs.reduce((acc, doc) => {
          const created = new Date(doc.created_at);
          const updated = new Date(doc.updated_at);
          return acc + (updated.getTime() - created.getTime());
        }, 0) / completedDocs.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Generate productivity trend (last 6 months)
    const productivityTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = formatDateArgentina(date, { 
        year: 'numeric', 
        month: 'short' 
      });
      
      const count = documents.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getMonth() === date.getMonth() && 
               docDate.getFullYear() === date.getFullYear();
      }).length;
      
      productivityTrend.push({ date: monthKey, count });
    }

    return {
      totalDocuments: documents.length,
      documentsByStatus,
      documentsByType,
      documentsByMonth,
      overdueDocuments,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      productivityTrend
    };
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Add ProConnection watermark
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('ProConnection', 105, 150, { 
      angle: 45, 
      align: 'center' 
    });
    
    // Reset colors for content
    doc.setTextColor(0, 0, 0);
    
    // Professional header with gradient effect
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Header shadow effect
    doc.setFillColor(45, 115, 230);
    doc.rect(0, 42, 210, 3, 'F');
    
    // Header content
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE AVANZADO DE DOCUMENTOS', 15, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date();
    const formattedDate = formatDateArgentina(currentDate, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generado el: ${formattedDate}`, 15, 30);
    
    if (psychologist) {
      doc.text(`Profesional: ${psychologist.first_name} ${psychologist.last_name}`, 15, 37);
    }

    // Reset text color for body
    doc.setTextColor(0, 0, 0);
    
    let yPos = 65;
    
    // Executive Summary Section with icon
    doc.setFillColor(248, 250, 252);
    doc.rect(10, yPos - 8, 190, 30, 'F');
    
    // Section border
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(10, yPos - 8, 190, 30);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('RESUMEN EJECUTIVO', 15, yPos + 5);
    
    // Add chart icon representation
    doc.setFillColor(59, 130, 246);
    doc.circle(175, yPos + 2, 3, 'F');
    doc.rect(172, yPos - 1, 6, 6);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPos += 25;
    
    // Key metrics in professional grid
    const completedDocs = (reportData.documentsByStatus.completed || 0) + (reportData.documentsByStatus.approved || 0);
    const completionRate = reportData.totalDocuments > 0 ? Math.round((completedDocs / reportData.totalDocuments) * 100) : 0;
    
    const metrics = [
      { label: 'Total de Documentos:', value: reportData.totalDocuments.toString(), color: [59, 130, 246] },
      { label: 'Documentos Vencidos:', value: reportData.overdueDocuments.toString(), color: [239, 68, 68] },
      { label: 'Tiempo Promedio:', value: `${reportData.avgProcessingTime} dias`, color: [16, 185, 129] },
      { label: 'Tasa de Completado:', value: `${completionRate}%`, color: [168, 85, 247] }
    ];
    
    metrics.forEach((metric, index) => {
      const xPos = 15 + (index % 2) * 95;
      const yOffset = Math.floor(index / 2) * 12;
      
      // Metric box
      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2], 0.1);
      doc.rect(xPos - 2, yPos + yOffset - 2, 90, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(metric.label, xPos, yPos + yOffset + 3);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.text(metric.value, xPos + 55, yPos + yOffset + 3);
    });
    
    yPos += 40;
    
    // Status Distribution Section
    if (Object.keys(reportData.documentsByStatus).length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, yPos - 8, 190, 20, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.rect(10, yPos - 8, 190, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('DISTRIBUCION POR ESTADO', 15, yPos + 2);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPos += 20;
      
      // Enhanced table with colors
      const tableHeaders = ['Estado', 'Cantidad', 'Porcentaje'];
      const colWidths = [60, 40, 40];
      let xStart = 25;
      
      // Table header
      doc.setFillColor(59, 130, 246);
      doc.rect(xStart, yPos, 140, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      tableHeaders.forEach((header, i) => {
        doc.text(header, xStart + 5 + (i * (colWidths[i] + 5)), yPos + 5);
      });
      
      yPos += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      const statusLabels: Record<string, string> = {
        'draft': 'Borrador',
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'completed': 'Completado',
        'under_review': 'En Revision',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'expired': 'Vencido'
      };
      
      Object.entries(reportData.documentsByStatus).forEach(([status, count], index) => {
        const percentage = ((count / reportData.totalDocuments) * 100).toFixed(1);
        const statusLabel = statusLabels[status] || status;
        
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(xStart, yPos - 2, 140, 8, 'F');
        }
        
        // Status indicator
        const statusColors: Record<string, number[]> = {
          'draft': [156, 163, 175],
          'pending': [245, 158, 11],
          'in_progress': [59, 130, 246],
          'completed': [16, 185, 129],
          'approved': [5, 150, 105],
          'rejected': [239, 68, 68],
          'expired': [220, 38, 38]
        };
        
        const color = statusColors[status] || [107, 114, 128];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(xStart + 2, yPos + 2, 1.5, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.text(statusLabel, xStart + 8, yPos + 3);
        doc.text(count.toString(), xStart + 70, yPos + 3);
        doc.text(`${percentage}%`, xStart + 115, yPos + 3);
        yPos += 8;
      });
      
      yPos += 15;
    }
    
    // Document Types Section
    if (Object.keys(reportData.documentsByType).length > 0) {
      doc.setFillColor(254, 249, 195);
      doc.rect(10, yPos - 8, 190, 20, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.rect(10, yPos - 8, 190, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('ANALISIS POR TIPO DE DOCUMENTO', 15, yPos + 2);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPos += 20;
      
      const xStart = 25;
      
      // Table header
      doc.setFillColor(245, 158, 11);
      doc.rect(xStart, yPos, 140, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Tipo de Documento', xStart + 5, yPos + 5);
      doc.text('Cantidad', xStart + 85, yPos + 5);
      doc.text('Porcentaje', xStart + 115, yPos + 5);
      
      yPos += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      const typeLabels: Record<string, string> = {
        'assessment': 'Evaluacion',
        'consent': 'Consentimiento',
        'treatment_plan': 'Plan de Tratamiento',
        'progress_report': 'Reporte de Progreso'
      };
      
      Object.entries(reportData.documentsByType).forEach(([type, count], index) => {
        const percentage = ((count / reportData.totalDocuments) * 100).toFixed(1);
        const typeLabel = typeLabels[type] || type;
        
        if (index % 2 === 0) {
          doc.setFillColor(254, 252, 232);
          doc.rect(xStart, yPos - 2, 140, 8, 'F');
        }
        
        doc.text(typeLabel, xStart + 5, yPos + 3);
        doc.text(count.toString(), xStart + 85, yPos + 3);
        doc.text(`${percentage}%`, xStart + 115, yPos + 3);
        yPos += 8;
      });
    }
    
    // Add new page for productivity trends
    doc.addPage();
    
    // Add watermark to second page
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('ProConnection', 105, 150, { 
      angle: 45, 
      align: 'center' 
    });
    doc.setTextColor(0, 0, 0);
    
    yPos = 30;
    
    // Productivity Trends Section
    doc.setFillColor(236, 254, 255);
    doc.rect(10, yPos - 8, 190, 20, 'F');
    doc.setDrawColor(6, 182, 212);
    doc.rect(10, yPos - 8, 190, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(8, 145, 178);
    doc.text('TENDENCIAS DE PRODUCTIVIDAD (ULTIMOS 6 MESES)', 15, yPos + 2);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    yPos += 30;
    
    // Enhanced chart representation
    const maxCount = Math.max(...reportData.productivityTrend.map(item => item.count));
    const chartHeight = 70;
    const chartWidth = 160;
    const barWidth = chartWidth / reportData.productivityTrend.length;
    
    // Chart background with grid
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos, chartWidth, chartHeight, 'F');
    
    // Grid lines
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    for (let i = 1; i <= 4; i++) {
      const gridY = yPos + (chartHeight / 5) * i;
      doc.line(15, gridY, 15 + chartWidth, gridY);
    }
    
    // Draw enhanced bars with gradient effect
    reportData.productivityTrend.forEach((item, index) => {
      const barHeight = maxCount > 0 ? (item.count / maxCount) * (chartHeight - 10) : 0;
      const x = 15 + (index * barWidth) + (barWidth * 0.1);
      const y = yPos + chartHeight - barHeight - 5;
      
      // Bar shadow
      doc.setFillColor(200, 200, 200, 0.3);
      doc.rect(x + 1, y + 1, barWidth * 0.8, barHeight, 'F');
      
      // Main bar
      doc.setFillColor(59, 130, 246);
      doc.rect(x, y, barWidth * 0.8, barHeight, 'F');
      
      // Bar highlight
      doc.setFillColor(96, 165, 250);
      doc.rect(x, y, barWidth * 0.8, 2, 'F');
      
      // Labels
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const labelX = x + (barWidth * 0.4) - 8;
      doc.text(item.date, labelX, yPos + chartHeight + 10);
      
      if (barHeight > 15) {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(item.count.toString(), x + (barWidth * 0.4) - 3, y + barHeight / 2 + 2);
      } else {
        doc.setTextColor(59, 130, 246);
        doc.text(item.count.toString(), x + (barWidth * 0.4) - 3, y - 3);
      }
      doc.setFont('helvetica', 'normal');
    });
    
    yPos += chartHeight + 30;
    
    // Professional insights section
    doc.setFillColor(254, 249, 195);
    doc.rect(10, yPos - 8, 190, 50, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(10, yPos - 8, 190, 50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('INSIGHTS Y RECOMENDACIONES', 15, yPos + 2);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 15;
    
    // Dynamic insights
    const insights = [];
    
    if (reportData.overdueDocuments > 0) {
      insights.push(`• Atencion requerida: ${reportData.overdueDocuments} documento(s) vencido(s).`);
    }
    
    if (reportData.avgProcessingTime > 7) {
      insights.push(`• Optimizacion sugerida: Tiempo promedio ${reportData.avgProcessingTime} dias.`);
    }
    
    const mostUsedType = Object.entries(reportData.documentsByType).sort(([,a], [,b]) => b - a)[0];
    if (mostUsedType) {
      const typeLabels: Record<string, string> = {
        'assessment': 'Evaluacion',
        'consent': 'Consentimiento',
        'treatment_plan': 'Plan de Tratamiento',
        'progress_report': 'Reporte de Progreso'
      };
      const typeLabel = typeLabels[mostUsedType[0]] || mostUsedType[0];
      insights.push(`• Tipo mas utilizado: "${typeLabel}" con ${mostUsedType[1]} documentos.`);
    }
    
    if (insights.length === 0) {
      insights.push('• Excelente gestion documental. Mantén el buen trabajo.');
    }
    
    insights.forEach((insight, index) => {
      const wrappedLines = doc.splitTextToSize(insight, 170);
      wrappedLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 20, yPos + (index * 10) + (lineIndex * 5));
      });
    });
    
    // Professional footer
    yPos = 280;
    doc.setFillColor(59, 130, 246);
    doc.rect(0, yPos, 210, 20, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('ProConnection - Sistema de Gestion Documental Profesional', 15, yPos + 8);
    doc.text(`Pagina 2 de 2 | ${formatDateArgentina(new Date())}`, 15, yPos + 15);
    
    doc.text('Reporte generado automaticamente', 150, yPos + 12);
    
    // Save the PDF
    const fileName = `reporte-documentos-avanzado-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Exito",
      description: "Reporte avanzado exportado correctamente",
    });
  };

  return {
    reportData,
    loading,
    refetch: fetchReportData,
    exportToPDF
  };
};
