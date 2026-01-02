
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, AlertTriangle, CheckCircle, Printer } from "lucide-react";
import { useAccountingReports } from "@/hooks/useAccountingReports";
import { exportAccountingReportAsCSV, printAccountingReport } from "@/utils/reportExporter";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

interface MonthlyReportGeneratorProps {
  psychologistId: string;
}

export const MonthlyReportGenerator = ({ psychologistId }: MonthlyReportGeneratorProps) => {
  const { generateMonthlyReport, reports } = useAccountingReports(psychologistId);
  const { psychologist } = useProfile();
  const [generating, setGenerating] = useState(false);
  const [exportingReport, setExportingReport] = useState<string | null>(null);

  // Use current date - June 2025
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const handleGenerateReport = async (month: number, year: number) => {
    setGenerating(true);
    try {
      await generateMonthlyReport(month, year);
      toast({
        title: "✅ Reporte generado",
        description: `Reporte de ${getMonthName(month)} ${year} generado exitosamente`
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "❌ Error",
        description: "Error al generar el reporte mensual",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = (report: any) => {
    if (!psychologist) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del psicólogo",
        variant: "destructive"
      });
      return;
    }

    try {
      setExportingReport(report.id);
      exportAccountingReportAsCSV(report, psychologist);
      toast({
        title: "Exportado exitosamente",
        description: "El reporte se ha exportado como CSV"
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Error al exportar el reporte",
        variant: "destructive"
      });
    } finally {
      setExportingReport(null);
    }
  };

  const handlePrintReport = (report: any) => {
    if (!psychologist) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del psicólogo",
        variant: "destructive"
      });
      return;
    }

    try {
      setExportingReport(report.id);
      printAccountingReport(report, psychologist);
      toast({
        title: "Abriendo impresión",
        description: "Se ha abierto la ventana de impresión"
      });
    } catch (error) {
      console.error('Error printing report:', error);
      toast({
        title: "Error",
        description: "Error al imprimir el reporte",
        variant: "destructive"
      });
    } finally {
      setExportingReport(null);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const canGenerateReport = (month: number, year: number) => {
    if (year > currentYear) return false;
    if (year === currentYear && month >= currentMonth) return false;
    
    const existingReport = reports.find(r => r.report_month === month && r.report_year === year);
    return !existingReport;
  };

  const hasExistingReport = (month: number, year: number) => {
    return reports.find(r => r.report_month === month && r.report_year === year);
  };

  // Generate list of the last 6 available months for reports
  const availableMonths = [];
  for (let i = 1; i <= 6; i++) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    availableMonths.push({
      month,
      year,
      name: getMonthName(month),
      canGenerate: canGenerateReport(month, year),
      existingReport: hasExistingReport(month, year)
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Generador de Reportes Mensuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              📅 Mes actual: {getMonthName(currentMonth)} {currentYear}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Los reportes se pueden generar solo para meses anteriores completos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMonths.map((period) => {
              const report = period.existingReport;
              
              return (
                <div key={`${period.year}-${period.month}`} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-medium text-slate-800">
                    {period.name} {period.year}
                  </h3>
                  
                  {report ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Reporte generado</span>
                      </div>
                      
                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong>{report.total_receipts}</strong> comprobantes</p>
                        <p><strong>${report.total_amount.toLocaleString()}</strong> total</p>
                        {report.generation_date && (
                          <p>Generado: {new Date(report.generation_date).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>

                      {report.monotax_alert && (
                        <div className={`flex items-center gap-1 text-xs ${
                          report.monotax_alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Alerta monotributo</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleGenerateReport(period.month, period.year)}
                          disabled={generating}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Regenerar
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleExportCSV(report)}
                            disabled={exportingReport === report.id}
                          >
                            {exportingReport === report.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                            ) : (
                              <Download className="w-3 h-3 mr-1" />
                            )}
                            CSV
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePrintReport(report)}
                            disabled={exportingReport === report.id}
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Imprimir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : period.canGenerate ? (
                    <div className="mt-3">
                      <Button 
                        onClick={() => handleGenerateReport(period.month, period.year)}
                        disabled={generating}
                        className="w-full"
                        variant="outline"
                      >
                        <FileText className="w-4 w-4 mr-1" />
                        {generating ? 'Generando...' : 'Generar Reporte'}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-sm text-slate-500">
                        {period.year === currentYear && period.month >= currentMonth 
                          ? 'Mes en curso/futuro' 
                          : 'No disponible'
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800 mb-2">✨ Sistema Mensual Actualizado</h4>
            <div className="text-sm text-emerald-700 space-y-1">
              <p>• Exporta reportes como CSV para análisis en Excel</p>
              <p>• Imprime reportes directamente desde el navegador</p>
              <p>• Genera PDFs usando la función "Imprimir como PDF" del navegador</p>
              <p>• Sistema más estable y sin dependencias problemáticas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
