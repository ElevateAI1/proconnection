
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PatientSelector } from "./PatientSelector";

interface ConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId?: string;
}

export const ConsentFormModal = ({ isOpen, onClose, psychologistId }: ConsentFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    treatmentDescription: "",
    risksAndBenefits: "",
    alternativeTreatments: "",
    confidentialityAgreement: false,
    recordingConsent: false,
    emergencyContact: "",
    emergencyPhone: "",
    cancellationPolicy: false,
    dataProcessingConsent: false,
    patientSignature: "",
    signatureDate: ""
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

    // Validar que todos los consentimientos estén marcados
    const requiredConsents = [
      formData.confidentialityAgreement,
      formData.cancellationPolicy,
      formData.dataProcessingConsent
    ];

    if (!requiredConsents.every(consent => consent)) {
      toast({
        title: "Error",
        description: "Todos los consentimientos obligatorios deben estar marcados",
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
          title: `Consentimiento Informado - ${formData.patientName}`,
          type: 'consent',
          content: formData,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating consent form:', error);
        throw new Error('No se pudo crear el consentimiento informado');
      }

      toast({
        title: "Consentimiento creado",
        description: "El consentimiento informado ha sido creado exitosamente",
      });

      onClose();
    } catch (error) {
      console.error('Error creating consent form:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el consentimiento informado",
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
          <DialogTitle>Consentimiento Informado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PatientSelector
            selectedPatientId={formData.patientId}
            onPatientSelect={handlePatientSelect}
            required
          />

          <div>
            <Label htmlFor="treatmentDescription">Descripción del Tratamiento</Label>
            <Textarea
              id="treatmentDescription"
              value={formData.treatmentDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, treatmentDescription: e.target.value }))}
              placeholder="Descripción detallada del tratamiento psicológico propuesto..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="risksAndBenefits">Riesgos y Beneficios</Label>
            <Textarea
              id="risksAndBenefits"
              value={formData.risksAndBenefits}
              onChange={(e) => setFormData(prev => ({ ...prev, risksAndBenefits: e.target.value }))}
              placeholder="Descripción de los posibles riesgos y beneficios del tratamiento..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="alternativeTreatments">Tratamientos Alternativos</Label>
            <Textarea
              id="alternativeTreatments"
              value={formData.alternativeTreatments}
              onChange={(e) => setFormData(prev => ({ ...prev, alternativeTreatments: e.target.value }))}
              placeholder="Descripción de tratamientos alternativos disponibles..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                placeholder="Número de teléfono"
                required
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-800">Consentimientos</h3>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confidentialityAgreement"
                checked={formData.confidentialityAgreement}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, confidentialityAgreement: !!checked }))
                }
                required
              />
              <Label htmlFor="confidentialityAgreement" className="text-sm leading-relaxed">
                Entiendo y acepto la política de confidencialidad. Comprendo que la información compartida 
                durante las sesiones será mantenida en estricta confidencialidad, excepto en casos donde 
                la ley requiera su divulgación.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="recordingConsent"
                checked={formData.recordingConsent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, recordingConsent: !!checked }))
                }
              />
              <Label htmlFor="recordingConsent" className="text-sm leading-relaxed">
                Consiento la grabación de sesiones para fines de supervisión y mejora de la calidad 
                del tratamiento (opcional).
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="cancellationPolicy"
                checked={formData.cancellationPolicy}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, cancellationPolicy: !!checked }))
                }
                required
              />
              <Label htmlFor="cancellationPolicy" className="text-sm leading-relaxed">
                He leído y acepto la política de cancelación de citas. Entiendo que debo cancelar 
                con al menos 24 horas de anticipación.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataProcessingConsent"
                checked={formData.dataProcessingConsent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, dataProcessingConsent: !!checked }))
                }
                required
              />
              <Label htmlFor="dataProcessingConsent" className="text-sm leading-relaxed">
                Consiento el procesamiento de mis datos personales de acuerdo con la Ley de Protección 
                de Datos Personales para fines de tratamiento psicológico.
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientSignature">Firma del Paciente</Label>
              <Input
                id="patientSignature"
                value={formData.patientSignature}
                onChange={(e) => setFormData(prev => ({ ...prev, patientSignature: e.target.value }))}
                placeholder="Nombre completo como firma"
                required
              />
            </div>
            <div>
              <Label htmlFor="signatureDate">Fecha</Label>
              <Input
                id="signatureDate"
                type="date"
                value={formData.signatureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, signatureDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500">
              {loading ? "Guardando..." : "Crear Consentimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
