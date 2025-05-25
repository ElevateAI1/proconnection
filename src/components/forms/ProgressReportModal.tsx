
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PatientSelector } from "./PatientSelector";

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId?: string;
}

export const ProgressReportModal = ({ isOpen, onClose, psychologistId }: ProgressReportModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    reportPeriod: "",
    sessionsAttended: "",
    totalSessions: "",
    adherence: "",
    symptomProgress: "",
    goalProgress: "",
    behavioralChanges: "",
    challengesEncountered: "",
    clinicalObservations: "",
    interventionsUsed: "",
    homeworkCompliance: "",
    familyInvolvement: "",
    medicationCompliance: "",
    riskAssessment: "",
    nextSteps: "",
    recommendations: "",
    nextReviewDate: ""
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
          title: `Reporte de Progreso - ${formData.patientName} (${formData.reportPeriod})`,
          type: 'progress_report',
          content: formData,
          status: 'completed'
        });

      if (error) {
        console.error('Error creating progress report:', error);
        throw new Error('No se pudo crear el reporte de progreso');
      }

      toast({
        title: "Reporte de progreso creado",
        description: "El reporte de progreso ha sido creado exitosamente",
      });

      onClose();
    } catch (error) {
      console.error('Error creating progress report:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el reporte de progreso",
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
          <DialogTitle>Reporte de Progreso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PatientSelector
            selectedPatientId={formData.patientId}
            onPatientSelect={handlePatientSelect}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportPeriod">Período del Reporte</Label>
              <Input
                id="reportPeriod"
                value={formData.reportPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, reportPeriod: e.target.value }))}
                placeholder="ej: Enero - Marzo 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="sessionsAttended">Sesiones Asistidas</Label>
              <Input
                id="sessionsAttended"
                type="number"
                value={formData.sessionsAttended}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionsAttended: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="totalSessions">Total de Sesiones</Label>
              <Input
                id="totalSessions"
                type="number"
                value={formData.totalSessions}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSessions: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="adherence">Adherencia al Tratamiento</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, adherence: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el nivel de adherencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excelente (90-100%)</SelectItem>
                <SelectItem value="good">Buena (70-89%)</SelectItem>
                <SelectItem value="fair">Regular (50-69%)</SelectItem>
                <SelectItem value="poor">Deficiente (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="symptomProgress">Progreso de Síntomas</Label>
            <Textarea
              id="symptomProgress"
              value={formData.symptomProgress}
              onChange={(e) => setFormData(prev => ({ ...prev, symptomProgress: e.target.value }))}
              placeholder="Describe los cambios en los síntomas del paciente..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="goalProgress">Progreso hacia Objetivos</Label>
            <Textarea
              id="goalProgress"
              value={formData.goalProgress}
              onChange={(e) => setFormData(prev => ({ ...prev, goalProgress: e.target.value }))}
              placeholder="Evalúa el progreso hacia los objetivos establecidos..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="behavioralChanges">Cambios Conductuales</Label>
            <Textarea
              id="behavioralChanges"
              value={formData.behavioralChanges}
              onChange={(e) => setFormData(prev => ({ ...prev, behavioralChanges: e.target.value }))}
              placeholder="Describe los cambios conductuales observados..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="challengesEncountered">Desafíos Encontrados</Label>
            <Textarea
              id="challengesEncountered"
              value={formData.challengesEncountered}
              onChange={(e) => setFormData(prev => ({ ...prev, challengesEncountered: e.target.value }))}
              placeholder="Describe los obstáculos o dificultades encontradas..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="clinicalObservations">Observaciones Clínicas</Label>
            <Textarea
              id="clinicalObservations"
              value={formData.clinicalObservations}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicalObservations: e.target.value }))}
              placeholder="Observaciones clínicas relevantes durante las sesiones..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="interventionsUsed">Intervenciones Utilizadas</Label>
            <Textarea
              id="interventionsUsed"
              value={formData.interventionsUsed}
              onChange={(e) => setFormData(prev => ({ ...prev, interventionsUsed: e.target.value }))}
              placeholder="Lista las técnicas e intervenciones aplicadas..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeworkCompliance">Cumplimiento de Tareas</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, homeworkCompliance: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de cumplimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Siempre</SelectItem>
                  <SelectItem value="usually">Usualmente</SelectItem>
                  <SelectItem value="sometimes">A veces</SelectItem>
                  <SelectItem value="rarely">Raramente</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="familyInvolvement">Involucramiento Familiar</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, familyInvolvement: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de involucramiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="none">Ninguno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="medicationCompliance">Cumplimiento de Medicación</Label>
            <Textarea
              id="medicationCompliance"
              value={formData.medicationCompliance}
              onChange={(e) => setFormData(prev => ({ ...prev, medicationCompliance: e.target.value }))}
              placeholder="Si aplica, describe el cumplimiento del tratamiento farmacológico..."
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label htmlFor="riskAssessment">Evaluación de Riesgo Actual</Label>
            <Textarea
              id="riskAssessment"
              value={formData.riskAssessment}
              onChange={(e) => setFormData(prev => ({ ...prev, riskAssessment: e.target.value }))}
              placeholder="Evaluación actual del riesgo suicida, autolesión, etc..."
              className="min-h-[80px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="nextSteps">Próximos Pasos</Label>
            <Textarea
              id="nextSteps"
              value={formData.nextSteps}
              onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
              placeholder="Planificación para las próximas sesiones..."
              className="min-h-[80px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Recomendaciones</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Recomendaciones para el paciente, familia, o equipo tratante..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="nextReviewDate">Próxima Fecha de Revisión</Label>
            <Input
              id="nextReviewDate"
              type="date"
              value={formData.nextReviewDate}
              onChange={(e) => setFormData(prev => ({ ...prev, nextReviewDate: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-500 to-emerald-500">
              {loading ? "Guardando..." : "Crear Reporte"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
