
import { useState, useEffect } from "react";
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
import { PhoneInput } from "@/components/forms/PhoneInput";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { isValidArgentinePhoneNumber } from "@/utils/phoneValidation";
import { formatDateArgentina, formatTimeArgentina } from "@/utils/dateFormatting";

interface NewAppointmentModalProps {
  onAppointmentCreated: () => void;
  defaultPatientId?: string;
  defaultPatientName?: string;
  defaultPatientPhone?: string;
  defaultDate?: string;
  defaultType?: string;
  defaultNotes?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NewAppointmentModal = ({ 
  onAppointmentCreated,
  defaultPatientId = "",
  defaultPatientName = "",
  defaultPatientPhone = "",
  defaultDate = "",
  defaultType = "",
  defaultNotes = "",
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: NewAppointmentModalProps) => {
  const { psychologist } = useProfile();
  const { createScheduledNotification } = useReminderSettings();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: defaultPatientId,
    patientName: defaultPatientName,
    patientPhone: defaultPatientPhone,
    appointmentDate: defaultDate || "",
    appointmentTime: "",
    type: defaultType,
    notes: defaultNotes
  });

  // Actualizar formData cuando cambien las props externas
  useEffect(() => {
    if (isOpen) {
      setFormData({
        patientId: defaultPatientId || "",
        patientName: defaultPatientName || "",
        patientPhone: defaultPatientPhone || "",
        appointmentDate: defaultDate || "",
        appointmentTime: "",
        type: defaultType || "",
        notes: defaultNotes || ""
      });
    }
  }, [isOpen, defaultPatientId, defaultPatientName, defaultPatientPhone, defaultDate, defaultType, defaultNotes]);
  const [phoneError, setPhoneError] = useState("");

  // Solo usar el hook si tenemos un psychologist ID válido y fecha seleccionada
  const { getAvailableSlots, loading: slotsLoading } = useAvailableSlots({
    psychologistId: psychologist?.id || "",
    selectedDate: formData.appointmentDate
  });

  const availableSlots = getAvailableSlots();

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
  };

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, patientPhone: phone }));
    setPhoneError("");
  };

  const validatePhone = () => {
    if (!formData.patientPhone.trim()) {
      setPhoneError("El número de teléfono es obligatorio para los recordatorios");
      return false;
    }
    
    if (!isValidArgentinePhoneNumber(formData.patientPhone)) {
      setPhoneError("Ingresa un número de teléfono válido");
      return false;
    }
    
    return true;
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

    // Validar teléfono obligatorio
    if (!validatePhone()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono válido para enviar recordatorios",
        variant: "destructive"
      });
      return;
    }

    // Verificar que el horario seleccionado esté disponible
    if (formData.appointmentDate && !availableSlots.includes(formData.appointmentTime)) {
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

      // Actualizar información del paciente con el teléfono
      const { error: patientUpdateError } = await supabase
        .from('patients')
        .update({
          phone: formData.patientPhone
        })
        .eq('id', formData.patientId);

      if (patientUpdateError) {
        console.error('Error updating patient phone:', patientUpdateError);
        // No fallar por esto, pero logearlo
      }

      // Crear la cita directamente con el paciente seleccionado
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          psychologist_id: psychologist.id,
          patient_id: formData.patientId,
          appointment_date: appointmentDateTime.toISOString(),
          type: formData.type,
          status: 'scheduled',
          notes: formData.notes || null
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Error al crear la cita');
      }

      // Crear recordatorio automático si hay configuración
      try {
        await createScheduledNotification(
          formData.patientId,
          'appointment_reminder',
          {
            patient_name: formData.patientName,
            appointment_date: formatDateArgentina(appointmentDateTime),
            appointment_time: formatTimeArgentina(appointmentDateTime),
            phone_number: formData.patientPhone
          },
          'whatsapp'
        );
        console.log('Appointment reminder scheduled successfully');
      } catch (reminderError) {
        console.error('Error scheduling reminder:', reminderError);
        // No fallar la creación de la cita por esto
      }

      toast({
        title: "Cita creada",
        description: "La cita ha sido creada exitosamente y se programó un recordatorio automático"
      });

      // Resetear formulario y cerrar modal
      setFormData({
        patientId: "",
        patientName: "",
        patientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        type: "",
        notes: ""
      });
      setPhoneError("");
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

  // Mostrar mensaje si no hay psicólogo válido
  if (!psychologist?.id) {
    return (
      <div className="text-center text-red-600">
        No se pudo cargar la información del psicólogo
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="px-6 py-2 bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {externalOpen !== undefined ? "Reagendar Cita" : "Nueva Cita"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PatientSelector
            selectedPatientId={formData.patientId}
            onPatientSelect={handlePatientSelect}
            required={true}
          />

          <PhoneInput
            value={formData.patientPhone}
            onChange={handlePhoneChange}
            label="Teléfono del Paciente"
            placeholder="+54 9 11 1234-5678"
            required={true}
            error={phoneError}
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
                ) : formData.appointmentDate && availableSlots.length > 0 ? (
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
              disabled={loading || slotsLoading}
              className="flex-1 bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {loading ? "Creando..." : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
