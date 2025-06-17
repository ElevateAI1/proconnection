
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Edit, 
  Save, 
  X,
  Phone,
  Calendar
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePatientStats } from "@/hooks/usePatientStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PatientStatsCards } from "./PatientStatsCards";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  age?: number;
  notes?: string;
  created_at: string;
  psychologist_id: string;
}

interface PatientInfoProps {
  patient: Patient;
  onUpdate: () => void;
  patientId: string;
}

export const PatientInfo = ({ patient, onUpdate, patientId }: PatientInfoProps) => {
  const { psychologist } = useProfile();
  const { stats, loading: statsLoading } = usePatientStats(patientId, psychologist?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [editData, setEditData] = useState({
    first_name: patient.first_name,
    last_name: patient.last_name,
    phone: patient.phone || '',
    age: patient.age || '',
    notes: patient.notes || ''
  });

  const handleSave = async () => {
    if (!psychologist?.id) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('patients')
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          phone: editData.phone || null,
          age: editData.age ? parseInt(editData.age.toString()) : null,
          notes: editData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id)
        .eq('psychologist_id', psychologist.id);

      if (error) throw error;

      toast({
        title: "Información actualizada",
        description: "Los datos del paciente se han actualizado correctamente",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del paciente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone: patient.phone || '',
      age: patient.age || '',
      notes: patient.notes || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <PatientStatsCards stats={stats} loading={statsLoading} />

      {/* Información del paciente */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Información Personal</span>
            </span>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  size="sm" 
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  size="sm" 
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Nombre Completo</label>
                  <p className="text-xl font-bold text-slate-800 mt-2">
                    {patient.first_name} {patient.last_name}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <p className="text-lg text-slate-800 mt-2">
                    {patient.phone || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Edad</label>
                  <p className="text-lg text-slate-800 mt-2">
                    {patient.age ? `${patient.age} años` : 'No especificada'}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha de Registro
                  </label>
                  <p className="text-lg text-slate-800 mt-2">
                    {new Date(patient.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              
              {patient.notes && (
                <div className="md:col-span-2 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">
                  <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Notas</label>
                  <p className="text-slate-800 mt-3 leading-relaxed">{patient.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre</label>
                  <Input
                    value={editData.first_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Nombre del paciente"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Apellido</label>
                  <Input
                    value={editData.last_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Apellido del paciente"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Edad</label>
                  <Input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Edad del paciente"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Teléfono</label>
                  <Input
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Teléfono del paciente"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Notas</label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales sobre el paciente..."
                  rows={4}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
