
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { PatientSelector } from "./forms/PatientSelector";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface NewAppointmentModalProps {
  onAppointmentCreated: () => void;
}

export const NewAppointmentModal = ({ onAppointmentCreated }: NewAppointmentModalProps) => {
  const { psychologist } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "",
    notes: ""
  });

  const { getAvailableSlots, loading: slotsLoading, refreshAvailability } = useAvailableSlots({
    psychologistId: psychologist?.id || "",
    selectedDate: formData.appointmentDate
  });

  const availableSlots = formData.appointmentDate ? getAvailableSlots() : [];

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName
    }));
  };

  const handleDateChange = (date: string) => {
    console.log('Date changed to:', date);
    setFormData(prev => ({
      ...prev,
      appointmentDate: date,
      appointmentTime: "" // Reset time when date changes
    }));
    
    // Force refresh of available slots after a brief delay
    setTimeout(() => {
      refreshAvailability();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!psychologist?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo",
        variant: "destructive"
      });
      return;
    }

    if (!formData.appointmentDate || !formData.appointmentTime || !formData.type || !formData.patientId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // Verificar que el horario seleccionado esté disponible
    if (!availableSlots.includes(formData.appointmentTime)) {
      toast({
        title: "Error",
        description: "El horario seleccionado ya no está disponible",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Crear la fecha y hora del appointment
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);

      console.log('Creating appointment with datetime:', appointmentDateTime.toISOString());

      // Crear la cita directamente con el paciente seleccionado
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          psychologist_id: psychologist.id,
          patient_id: formData.patientId,
          appointment_date: appointmentDateTime.toISOString(),
          type: formData.type,
          status: 'scheduled',
          notes: formData.notes || null
        });

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Error al crear la cita');
      }

      toast({
        title: "Cita creada",
        description: "La cita ha sido creada exitosamente"
      });

      // Resetear formulario y cerrar modal
      setFormData({
        patientId: "",
        patientName: "",
        appointmentDate: "",
        appointmentTime: "",
        type: "",
        notes: ""
      });
      setIsOpen(false);
      onAppointmentCreated();

    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Terapia Individual",
      couple: "Terapia de Pareja",
      family: "Terapia Familiar",
      evaluation: "Evaluación",
      follow_up: "Seguimiento"
    };
    return labels[type] || type;
  };

  // Log available slots for debugging
  console.log('Modal render - Available slots:', availableSlots);
  console.log('Modal render - Selected date:', formData.appointmentDate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Nueva Cita
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PatientSelector
            selectedPatientId={formData.patientId}
            onPatientSelect={handlePatientSelect}
            required={true}
          />

          <div className="space-y-2">
            <Label htmlFor="appointmentDate">Fecha *</Label>
            <input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={getMinDate()}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Hora *</Label>
            <Select 
              value={formData.appointmentTime} 
              onValueChange={(value) => setFormData({...formData, appointmentTime: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una hora" />
              </SelectTrigger>
              <SelectContent>
                {slotsLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Cargando horarios...</div>
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))
                ) : formData.appointmentDate ? (
                  <div className="p-2 text-sm text-muted-foreground">No hay horarios disponibles para esta fecha</div>
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">Selecciona primero una fecha</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de consulta *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">
                  {getTypeLabel("individual")}
                </SelectItem>
                <SelectItem value="couple">
                  {getTypeLabel("couple")}
                </SelectItem>
                <SelectItem value="family">
                  {getTypeLabel("family")}
                </SelectItem>
                <SelectItem value="evaluation">
                  {getTypeLabel("evaluation")}
                </SelectItem>
                <SelectItem value="follow_up">
                  {getTypeLabel("follow_up")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notas adicionales sobre la cita..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || slotsLoading || availableSlots.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500"
            >
              {loading ? "Creando..." : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
