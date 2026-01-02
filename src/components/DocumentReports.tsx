
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Calendar,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useDocumentReports } from "@/hooks/useDocumentReports";
import { DocumentProductivityReport } from "./reports/DocumentProductivityReport";
import { DocumentStatusReport } from "./reports/DocumentStatusReport";
import { DocumentTypeReport } from "./reports/DocumentTypeReport";
import { DocumentTrendsReport } from "./reports/DocumentTrendsReport";

export const DocumentReports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    documentType: 'all',
    status: 'all'
  });

  const { reportData, loading, exportToPDF } = useDocumentReports(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      documentType: 'all',
      status: 'all'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reportes de Documentos</h1>
          <p className="text-slate-600 mt-2">Análisis detallado de la gestión documental</p>
        </div>
        <Button onClick={exportToPDF} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Configura los parámetros para generar reportes personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={filters.documentType} onValueChange={(value) => handleFilterChange('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="assessment">Evaluación</SelectItem>
                  <SelectItem value="consent">Consentimiento</SelectItem>
                  <SelectItem value="treatment_plan">Plan de Tratamiento</SelectItem>
                  <SelectItem value="progress_report">Reporte de Progreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Documentos en el período seleccionado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportData.overdueDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reportData.avgProcessingTime} días</div>
            <p className="text-xs text-muted-foreground">
              Tiempo de procesamiento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportData.totalDocuments > 0 
                ? Math.round(((reportData.documentsByStatus.completed || 0) + (reportData.documentsByStatus.approved || 0)) / reportData.totalDocuments * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Documentos finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentProductivityReport 
          data={reportData.productivityTrend} 
          loading={loading} 
        />
        
        <DocumentStatusReport 
          data={reportData.documentsByStatus} 
          loading={loading} 
        />
        
        <DocumentTypeReport 
          data={reportData.documentsByType} 
          loading={loading} 
        />
        
        <DocumentTrendsReport 
          data={reportData.productivityTrend} 
          loading={loading} 
        />
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.overdueDocuments > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Atención Requerida</p>
                  <p className="text-sm text-red-600">
                    Tienes {reportData.overdueDocuments} documento(s) vencido(s) que requieren atención inmediata.
                  </p>
                </div>
              </div>
            )}
            
            {reportData.avgProcessingTime > 7 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Optimización Sugerida</p>
                  <p className="text-sm text-yellow-600">
                    El tiempo promedio de procesamiento es de {reportData.avgProcessingTime} días. 
                    Considera revisar el flujo de trabajo para optimizar los tiempos.
                  </p>
                </div>
              </div>
            )}
            
            {reportData.totalDocuments > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Resumen de Productividad</p>
                  <p className="text-sm text-blue-600">
                    Has creado {reportData.totalDocuments} documentos en el período seleccionado. 
                    Tu tipo de documento más utilizado es {
                      Object.entries(reportData.documentsByType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                    }.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
