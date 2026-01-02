
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Plus, 
  Calendar, 
  Save, 
  Eye, 
  Download,
  Activity,
  FileText
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDateArgentina } from "@/utils/dateFormatting";

interface ClinicalRecord {
  id: string;
  patient_id: string;
  psychologist_id: string;
  session_date: string;
  session_type: string;
  main_symptoms?: string;
  observations?: string;
  diagnosis?: string;
  treatment?: string;
  medication?: string;
  next_steps?: string;
  created_at: string;
  updated_at: string;
}

interface PatientClinicalHistoryProps {
  patientId: string;
}

export const PatientClinicalHistory = ({ patientId }: PatientClinicalHistoryProps) => {
  const { psychologist } = useProfile();
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRecord, setNewRecord] = useState({
    session_date: new Date().toISOString().split('T')[0],
    session_type: 'consulta',
    main_symptoms: '',
    observations: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    next_steps: ''
  });

  useEffect(() => {
    if (patientId && psychologist?.id) {
      fetchClinicalRecords();
    }
  }, [patientId, psychologist]);

  const fetchClinicalRecords = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clinical_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologist.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching clinical records:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros clínicos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!psychologist?.id || !newRecord.session_date) {
      toast({
        title: "Error",
        description: "Por favor completa al menos la fecha de sesión",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clinical_records')
        .insert({
          patient_id: patientId,
          psychologist_id: psychologist.id,
          session_date: newRecord.session_date,
          session_type: newRecord.session_type,
          main_symptoms: newRecord.main_symptoms || null,
          observations: newRecord.observations || null,
          diagnosis: newRecord.diagnosis || null,
          treatment: newRecord.treatment || null,
          medication: newRecord.medication || null,
          next_steps: newRecord.next_steps || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Registro creado",
        description: "El registro clínico se ha guardado correctamente",
      });

      setRecords(prev => [data, ...prev]);
      setIsCreating(false);
      setNewRecord({
        session_date: new Date().toISOString().split('T')[0],
        session_type: 'consulta',
        main_symptoms: '',
        observations: '',
        diagnosis: '',
        treatment: '',
        medication: '',
        next_steps: ''
      });
    } catch (error) {
      console.error('Error creating record:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro",
        variant: "destructive"
      });
    }
  };

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consulta: "Consulta",
      seguimiento: "Seguimiento",
      evaluacion: "Evaluación",
      terapia: "Terapia",
      urgencia: "Urgencia"
    };
    return labels[type] || type;
  };

  const getSessionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      consulta: "bg-blue-100 text-blue-700",
      seguimiento: "bg-green-100 text-green-700",
      evaluacion: "bg-purple-100 text-purple-700",
      terapia: "bg-orange-100 text-orange-700",
      urgencia: "bg-red-100 text-red-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando historial clínico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear nuevo registro */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Historial Clínico</h3>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Cancelar' : 'Nuevo Registro'}
        </Button>
      </div>

      {/* Formulario para crear nuevo registro */}
      {isCreating && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Nuevo Registro Clínico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Fecha de Sesión</label>
                <Input
                  type="date"
                  value={newRecord.session_date}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, session_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Sesión</label>
                <select
                  value={newRecord.session_type}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, session_type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="consulta">Consulta</option>
                  <option value="seguimiento">Seguimiento</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="terapia">Terapia</option>
                  <option value="urgencia">Urgencia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Síntomas Principales</label>
                <Textarea
                  value={newRecord.main_symptoms}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, main_symptoms: e.target.value }))}
                  placeholder="Describe los síntomas principales..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Observaciones</label>
                <Textarea
                  value={newRecord.observations}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Observaciones de la sesión..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Diagnóstico</label>
                <Textarea
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnóstico clínico..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tratamiento</label>
                <Textarea
                  value={newRecord.treatment}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Plan de tratamiento..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Medicación</label>
                <Textarea
                  value={newRecord.medication}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder="Medicamentos prescritos..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Próximos Pasos</label>
                <Textarea
                  value={newRecord.next_steps}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, next_steps: e.target.value }))}
                  placeholder="Próximos pasos en el tratamiento..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateRecord} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Registro
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de registros clínicos */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Registros Clínicos ({records.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          Sesión del {formatDateArgentina(record.session_date)}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSessionTypeColor(record.session_type)}>
                            {getSessionTypeLabel(record.session_type)}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            Registrado: {formatDateArgentina(record.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {record.main_symptoms && (
                      <div>
                        <span className="font-medium text-slate-600">Síntomas:</span>
                        <p className="text-slate-800 mt-1">{record.main_symptoms}</p>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div>
                        <span className="font-medium text-slate-600">Diagnóstico:</span>
                        <p className="text-slate-800 mt-1">{record.diagnosis}</p>
                      </div>
                    )}
                    {record.treatment && (
                      <div>
                        <span className="font-medium text-slate-600">Tratamiento:</span>
                        <p className="text-slate-800 mt-1">{record.treatment}</p>
                      </div>
                    )}
                    {record.medication && (
                      <div>
                        <span className="font-medium text-slate-600">Medicación:</span>
                        <p className="text-slate-800 mt-1">{record.medication}</p>
                      </div>
                    )}
                    {record.observations && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-slate-600">Observaciones:</span>
                        <p className="text-slate-800 mt-1">{record.observations}</p>
                      </div>
                    )}
                    {record.next_steps && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-slate-600">Próximos Pasos:</span>
                        <p className="text-slate-800 mt-1">{record.next_steps}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay registros clínicos</h3>
              <p className="text-sm">Crea el primer registro clínico para este paciente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
