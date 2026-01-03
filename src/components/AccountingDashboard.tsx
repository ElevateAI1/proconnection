
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useAccountingReports } from "@/hooks/useAccountingReports";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { ReceiptValidationPanel } from "./ReceiptValidationPanel";
import { MonthlyReportGenerator } from "./MonthlyReportGenerator";
import { MonotaxCategorySelector } from "./MonotaxCategorySelector";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { InvoiceList } from "./InvoiceList";
import { formatDateArgentina } from "@/utils/dateFormatting";

interface AccountingDashboardProps {
  psychologistId: string;
}

export const AccountingDashboard = ({ psychologistId }: AccountingDashboardProps) => {
  const { reports, categories, currentCategory, checkLimitAlerts, updateMonotaxCategory } = useAccountingReports(psychologistId);
  const { receipts } = usePaymentReceipts(psychologistId);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Filtrar comprobantes del mes actual con validación más robusta
  const thisMonthReceipts = receipts.filter(r => {
    const receiptDate = r.receipt_date ? new Date(r.receipt_date) : new Date(r.created_at);
    const receiptMonth = receiptDate.getMonth() + 1;
    const receiptYear = receiptDate.getFullYear();
    
    return receiptMonth === currentMonth && 
           receiptYear === currentYear &&
           r.validation_status === 'approved' &&
           r.include_in_report !== false;
  });

  const thisMonthApproved = thisMonthReceipts;
  const thisMonthPending = receipts.filter(r => {
    const receiptDate = r.receipt_date ? new Date(r.receipt_date) : new Date(r.created_at);
    return receiptDate.getMonth() + 1 === currentMonth && 
           receiptDate.getFullYear() === currentYear &&
           r.validation_status === 'pending';
  });

  const thisMonthRevenue = thisMonthApproved.reduce((sum, receipt) => {
    const amount = receipt.amount || 0;
    return sum + amount;
  }, 0);

  // Estadísticas del mes anterior para comparación
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const lastMonthReport = reports.find(r => r.report_month === lastMonth && r.report_year === lastMonthYear);
  const lastMonthRevenue = lastMonthReport?.total_amount || 0;
  
  // Calcular crecimiento mensual
  const monthlyGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Estadísticas generales
  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;
  const processingReceipts = receipts.filter(r => r.extraction_status === 'processing').length;
  
  // Acumulado anual para alertas de monotributo
  const currentYearReports = reports.filter(r => r.report_year === currentYear);
  const annualAccumulated = currentYearReports.reduce((sum, report) => sum + report.total_amount, 0) + thisMonthRevenue;
  
  const limitAlert = checkLimitAlerts(annualAccumulated);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'generated':
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Generado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Sistema Contable Mensual</h1>
        <MonotaxCategorySelector 
          currentCategory={currentCategory}
          categories={categories}
          onCategoryChange={updateMonotaxCategory}
        />
      </div>

      {/* Alert de límites de monotributo */}
      {limitAlert && (
        <Card className={`border-l-4 ${limitAlert.level === 'critical' ? 'border-red-500' : 'border-yellow-500'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${limitAlert.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
              <p className="font-medium">{limitAlert.message}</p>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Acumulado anual: ${annualAccumulated.toLocaleString()} | Restante: ${limitAlert.remaining?.toLocaleString() || 'N/A'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas principales - Enfoque mensual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {getMonthName(currentMonth)} {currentYear}
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  ${thisMonthRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {monthlyGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyGrowth.toFixed(1)}% vs mes anterior
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Comprobantes del Mes</p>
                <p className="text-3xl font-bold text-emerald-600">{thisMonthReceipts.length}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {thisMonthApproved.length} aprobados, {thisMonthPending.length} pendientes
                </p>
              </div>
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes de Validación</p>
                <p className="text-3xl font-bold text-orange-600">{pendingReceipts}</p>
                {processingReceipts > 0 && (
                  <p className="text-sm text-blue-600 mt-1">{processingReceipts} procesando OCR</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Acumulado Anual</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${annualAccumulated.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {currentYearReports.length + 1} meses registrados
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de validación de comprobantes */}
      <ReceiptValidationPanel psychologistId={psychologistId} />

      {/* Generador de facturas */}
      <InvoiceGenerator psychologistId={psychologistId} />

      {/* Lista de facturas */}
      <InvoiceList psychologistId={psychologistId} />

      {/* Generador de reportes mensuales */}
      <MonthlyReportGenerator psychologistId={psychologistId} />

      {/* Reportes mensuales recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial de Reportes Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.slice(0, 6).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {getMonthName(report.report_month)} {report.report_year}
                  </h3>
                  <div className="text-sm text-slate-600 mt-1 space-y-1">
                    <p>
                      <strong>{report.total_receipts}</strong> comprobantes • 
                      <strong className="ml-1">${report.total_amount.toLocaleString()}</strong>
                    </p>
                    {report.auto_approved_receipts !== null && (
                      <p className="text-xs">
                        {report.auto_approved_receipts} auto-aprobados, {report.manually_reviewed_receipts || 0} revisados manualmente
                      </p>
                    )}
                    {report.generation_date && (
                      <p className="text-xs">
                        Generado: {formatDateArgentina(report.generation_date)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {report.monotax_alert && (
                    <div className={`flex items-center gap-1 ${
                      report.monotax_alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">Alerta</span>
                    </div>
                  )}
                  
                  {getStatusBadge(report.status)}
                  
                  {report.report_file_url && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay reportes mensuales generados aún</p>
                <p className="text-sm mt-1">Usa el generador arriba para crear tu primer reporte</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
