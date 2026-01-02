import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

interface DocumentStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  thisMonth: number;
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  patient_id: string;
  psychologist_id: string;
  created_at: string;
  due_date?: string;
  priority: string;
  workflow_step: number;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

export const DocumentsDashboard = () => {
  const { psychologist } = useProfile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (psychologist?.id) {
      fetchDocuments();
      fetchStats();
    }
  }, [psychologist]);

  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents for psychologist:', psychologist?.id);
      
      // First fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('patient_documents')
        .select('*')
        .eq('psychologist_id', psychologist?.id)
        .order('created_at', { ascending: false });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }

      console.log('Documents fetched:', documentsData);

      // Then fetch patient information for each document
      const documentsWithPatients = await Promise.all(
        (documentsData || []).map(async (doc) => {
          try {
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('first_name, last_name')
              .eq('id', doc.patient_id)
              .maybeSingle();

            if (patientError) {
              console.warn('Error fetching patient for document:', doc.id, patientError);
            }

            return {
              ...doc,
              priority: doc.priority || 'normal',
              workflow_step: doc.workflow_step || 1,
              patient: patientData || undefined
            };
          } catch (error) {
            console.warn('Error processing document:', doc.id, error);
            return {
              ...doc,
              priority: doc.priority || 'normal',
              workflow_step: doc.workflow_step || 1,
              patient: undefined
            };
          }
        })
      );

      console.log('Documents with patients:', documentsWithPatients);
      setDocuments(documentsWithPatients);
      
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_documents')
        .select('status, created_at, due_date')
        .eq('psychologist_id', psychologist?.id);

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(d => ['pending', 'in_progress', 'draft'].includes(d.status)).length || 0,
        completed: data?.filter(d => ['completed', 'approved'].includes(d.status)).length || 0,
        overdue: data?.filter(d => d.due_date && new Date(d.due_date) < now && !['completed', 'approved'].includes(d.status)).length || 0,
        thisMonth: data?.filter(d => new Date(d.created_at) >= startOfMonth).length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'draft': { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
      'pending': { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
      'in_progress': { label: 'En Progreso', className: 'bg-blue-100 text-blue-700' },
      'completed': { label: 'Completado', className: 'bg-green-100 text-green-700' },
      'under_review': { label: 'En Revisión', className: 'bg-purple-100 text-purple-700' },
      'approved': { label: 'Aprobado', className: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Rechazado', className: 'bg-red-100 text-red-700' },
      'expired': { label: 'Vencido', className: 'bg-red-100 text-red-700' }
    };
    
    const { label, className } = config[status as keyof typeof config] || 
      { label: status, className: 'bg-gray-100 text-gray-700' };
    
    return <Badge className={className}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      'low': { label: 'Baja', className: 'bg-gray-100 text-gray-700' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-700' },
      'high': { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
      'urgent': { label: 'Urgente', className: 'bg-red-100 text-red-700' }
    };
    
    const { label, className } = config[priority as keyof typeof config] || 
      { label: priority, className: 'bg-gray-100 text-gray-700' };
    
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${doc.patient?.first_name || ''} ${doc.patient?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título o paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
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
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            Lista de todos los documentos de pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors border-slate-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {document.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                      <span>
                        {document.patient?.first_name || 'Sin'} {document.patient?.last_name || 'paciente'}
                      </span>
                      <span>•</span>
                      <span>{formatDate(document.created_at)}</span>
                      {document.due_date && (
                        <>
                          <span>•</span>
                          <span>Vence: {formatDate(document.due_date)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getPriorityBadge(document.priority)}
                  {getStatusBadge(document.status)}
                </div>
              </div>
            ))}
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">
                  {documents.length === 0 ? 
                    'No hay documentos creados aún' : 
                    'No se encontraron documentos con los filtros aplicados'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
