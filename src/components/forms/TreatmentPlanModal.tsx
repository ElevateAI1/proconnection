import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PatientSelector } from "./PatientSelector";

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId?: string;
}

interface Goal {
  id: string;
  description: string;
  timeline: string;
  measurable: string;
}

interface Intervention {
  id: string;
  technique: string;
  frequency: string;
  duration: string;
}

export const TreatmentPlanModal = ({ isOpen, onClose, psychologistId }: TreatmentPlanModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    diagnosis: "",
    treatmentModality: "",
    sessionFrequency: "",
    estimatedDuration: "",
    overallGoal: "",
    riskFactors: "",
    strengthsResources: "",
    emergencyPlan: "",
    reviewDate: ""
  });

  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', description: '', timeline: '', measurable: '' }
  ]);

  const [interventions, setInterventions] = useState<Intervention[]>([
    { id: '1', technique: '', frequency: '', duration: '' }
  ]);

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName
    }));
  };

  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      description: '',
      timeline: '',
      measurable: ''
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (id: string) => {
    if (goals.length > 1) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  const updateGoal = (id: string, field: keyof Goal, value: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const addIntervention = () => {
    const newIntervention: Intervention = {
      id: Date.now().toString(),
      technique: '',
      frequency: '',
      duration: ''
    };
    setInterventions([...interventions, newIntervention]);
  };

  const removeIntervention = (id: string) => {
    if (interventions.length > 1) {
      setInterventions(interventions.filter(intervention => intervention.id !== id));
    }
  };

  const updateIntervention = (id: string, field: keyof Intervention, value: string) => {
    setInterventions(interventions.map(intervention => 
      intervention.id === id ? { ...intervention, [field]: value } : intervention
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psychologistId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo",
        variant: "destructive"
      });
      return;
    }

    if (!formData.patientId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un paciente",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const treatmentPlanData = {
        ...formData,
        goals: goals.filter(goal => goal.description.trim()),
        interventions: interventions.filter(intervention => intervention.technique.trim())
      };

      const { error } = await supabase
        .from('patient_documents')
        .insert({
          psychologist_id: psychologistId,
          patient_id: formData.patientId,
          title: `Plan de Tratamiento - ${formData.patientName}`,
          type: 'treatment_plan',
          content: treatmentPlanData as any,
          status: 'draft'
        });

      if (error) {
        console.error('Error creating treatment plan:', error);
        throw new Error('No se pudo crear el plan de tratamiento');
      }

      toast({
        title: "Plan de tratamiento creado",
        description: "El plan de tratamiento ha sido creado exitosamente",
      });

      onClose();
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el plan de tratamiento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plan de Tratamiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PatientSelector
            selectedPatientId={formData.patientId}
            onPatientSelect={handlePatientSelect}
            required
          />

          <div>
            <Label htmlFor="diagnosis">Diagnóstico Principal</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Diagnóstico según DSM-5 o CIE-11"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="treatmentModality">Modalidad de Tratamiento</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentModality: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona modalidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Grupal</SelectItem>
                  <SelectItem value="family">Familiar</SelectItem>
                  <SelectItem value="couple">Pareja</SelectItem>
                  <SelectItem value="mixed">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sessionFrequency">Frecuencia de Sesiones</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, sessionFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="asNeeded">Según necesidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimatedDuration">Duración Estimada</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedDuration: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Corto plazo (1-3 meses)</SelectItem>
                  <SelectItem value="medium">Mediano plazo (3-6 meses)</SelectItem>
                  <SelectItem value="long">Largo plazo (6+ meses)</SelectItem>
                  <SelectItem value="ongoing">Continuo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="overallGoal">Objetivo General</Label>
            <Textarea
              id="overallGoal"
              value={formData.overallGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, overallGoal: e.target.value }))}
              placeholder="Objetivo principal del tratamiento..."
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Objetivos Específicos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Objetivos Específicos</Label>
              <Button type="button" onClick={addGoal} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Objetivo
              </Button>
            </div>
            
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={goal.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Objetivo {index + 1}</h4>
                    {goals.length > 1 && (
                      <Button 
                        type="button" 
                        onClick={() => removeGoal(goal.id)} 
                        size="sm" 
                        variant="ghost"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-3">
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={goal.description}
                        onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                        placeholder="Describe el objetivo específico..."
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Plazo</Label>
                        <Input
                          value={goal.timeline}
                          onChange={(e) => updateGoal(goal.id, 'timeline', e.target.value)}
                          placeholder="ej: 4 semanas"
                        />
                      </div>
                      <div>
                        <Label>Criterio Medible</Label>
                        <Input
                          value={goal.measurable}
                          onChange={(e) => updateGoal(goal.id, 'measurable', e.target.value)}
                          placeholder="¿Cómo se medirá el progreso?"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intervenciones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Intervenciones Terapéuticas</Label>
              <Button type="button" onClick={addIntervention} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Intervención
              </Button>
            </div>
            
            <div className="space-y-4">
              {interventions.map((intervention, index) => (
                <div key={intervention.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Intervención {index + 1}</h4>
                    {interventions.length > 1 && (
                      <Button 
                        type="button" 
                        onClick={() => removeIntervention(intervention.id)} 
                        size="sm" 
                        variant="ghost"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Técnica/Enfoque</Label>
                      <Input
                        value={intervention.technique}
                        onChange={(e) => updateIntervention(intervention.id, 'technique', e.target.value)}
                        placeholder="ej: TCC, Mindfulness"
                      />
                    </div>
                    <div>
                      <Label>Frecuencia</Label>
                      <Input
                        value={intervention.frequency}
                        onChange={(e) => updateIntervention(intervention.id, 'frequency', e.target.value)}
                        placeholder="ej: Cada sesión"
                      />
                    </div>
                    <div>
                      <Label>Duración</Label>
                      <Input
                        value={intervention.duration}
                        onChange={(e) => updateIntervention(intervention.id, 'duration', e.target.value)}
                        placeholder="ej: 20 minutos"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="riskFactors">Factores de Riesgo</Label>
            <Textarea
              id="riskFactors"
              value={formData.riskFactors}
              onChange={(e) => setFormData(prev => ({ ...prev, riskFactors: e.target.value }))}
              placeholder="Factores que podrían interferir con el tratamiento..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="strengthsResources">Fortalezas y Recursos</Label>
            <Textarea
              id="strengthsResources"
              value={formData.strengthsResources}
              onChange={(e) => setFormData(prev => ({ ...prev, strengthsResources: e.target.value }))}
              placeholder="Fortalezas del paciente y recursos disponibles..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="emergencyPlan">Plan de Crisis/Emergencia</Label>
            <Textarea
              id="emergencyPlan"
              value={formData.emergencyPlan}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyPlan: e.target.value }))}
              placeholder="Protocolo a seguir en caso de crisis..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="reviewDate">Fecha de Revisión</Label>
            <Input
              id="reviewDate"
              type="date"
              value={formData.reviewDate}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-emerald-500">
              {loading ? "Guardando..." : "Crear Plan de Tratamiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
