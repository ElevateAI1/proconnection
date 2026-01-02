
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PatientSelector } from "./PatientSelector";

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId?: string;
}

export const AssessmentFormModal = ({ isOpen, onClose, psychologistId }: AssessmentFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    assessmentType: "",
    chiefComplaint: "",
    historyPresent: "",
    pastHistory: "",
    familyHistory: "",
    mentalStatusExam: "",
    cognitiveAssessment: "",
    riskAssessment: "",
    diagnosticImpression: "",
    recommendations: "",
    treatmentPlan: ""
  });

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName
    }));
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
      const { error } = await supabase
        .from('patient_documents')
        .insert({
          psychologist_id: psychologistId,
          patient_id: formData.patientId,
          title: `Evaluación Psicológica - ${formData.patientName}`,
          type: 'assessment',
          content: formData,
          status: 'draft'
        });

      if (error) {
        console.error('Error creating assessment:', error);
        throw new Error('No se pudo crear la evaluación');
      }

      toast({
        title: "Evaluación creada",
        description: "La evaluación psicológica ha sido creada exitosamente",
      });

      onClose();
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la evaluación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluación Psicológica</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PatientSelector
            selectedPatientId={formData.patientId}
            onPatientSelect={handlePatientSelect}
            required
          />

          <div>
            <Label htmlFor="assessmentType">Tipo de Evaluación</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, assessmentType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de evaluación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Evaluación Inicial</SelectItem>
                <SelectItem value="periodic">Evaluación Periódica</SelectItem>
                <SelectItem value="cognitive">Evaluación Cognitiva</SelectItem>
                <SelectItem value="personality">Evaluación de Personalidad</SelectItem>
                <SelectItem value="neuropsychological">Evaluación Neuropsicológica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chiefComplaint">Motivo de Consulta</Label>
            <Textarea
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder="Describe el motivo principal de la consulta..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="historyPresent">Historia de la Enfermedad Actual</Label>
            <Textarea
              id="historyPresent"
              value={formData.historyPresent}
              onChange={(e) => setFormData(prev => ({ ...prev, historyPresent: e.target.value }))}
              placeholder="Describe la evolución de los síntomas actuales..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="pastHistory">Antecedentes Personales</Label>
            <Textarea
              id="pastHistory"
              value={formData.pastHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, pastHistory: e.target.value }))}
              placeholder="Antecedentes médicos, psiquiátricos, educativos, laborales..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="familyHistory">Antecedentes Familiares</Label>
            <Textarea
              id="familyHistory"
              value={formData.familyHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
              placeholder="Antecedentes familiares relevantes..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="mentalStatusExam">Examen del Estado Mental</Label>
            <Textarea
              id="mentalStatusExam"
              value={formData.mentalStatusExam}
              onChange={(e) => setFormData(prev => ({ ...prev, mentalStatusExam: e.target.value }))}
              placeholder="Apariencia, conducta, humor, afecto, pensamiento, percepción, cognición..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="cognitiveAssessment">Evaluación Cognitiva</Label>
            <Textarea
              id="cognitiveAssessment"
              value={formData.cognitiveAssessment}
              onChange={(e) => setFormData(prev => ({ ...prev, cognitiveAssessment: e.target.value }))}
              placeholder="Orientación, memoria, atención, funciones ejecutivas..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="riskAssessment">Evaluación de Riesgo</Label>
            <Textarea
              id="riskAssessment"
              value={formData.riskAssessment}
              onChange={(e) => setFormData(prev => ({ ...prev, riskAssessment: e.target.value }))}
              placeholder="Riesgo suicida, auto/heteroagresión, otros riesgos..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="diagnosticImpression">Impresión Diagnóstica</Label>
            <Textarea
              id="diagnosticImpression"
              value={formData.diagnosticImpression}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosticImpression: e.target.value }))}
              placeholder="Diagnósticos principales y diferenciales..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Recomendaciones</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Recomendaciones de tratamiento y seguimiento..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0">
              {loading ? "Guardando..." : "Crear Evaluación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
