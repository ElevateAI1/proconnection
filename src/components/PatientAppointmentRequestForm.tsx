
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface PatientAppointmentRequestFormProps {
  onRequestCreated: () => void;
}

export const PatientAppointmentRequestForm = ({ onRequestCreated }: PatientAppointmentRequestFormProps) => {
  const { patient } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    type: "",
    notes: ""
  });

  // Verificar disponibilidad de horarios
  const {
    loading: slotsLoading,
    isSlotAvailable,
    getAvailableSlots,
    bookedSlots
  } = useAvailableSlots({
    psychologistId: patient?.psychologist_id || "",
    selectedDate: formData.preferredDate
  });

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Obtener solo los horarios disponibles
  const availableTimeSlots = getAvailableSlots();

  console.log('=== FORM STATE DEBUG ===');
  console.log('Patient psychologist_id:', patient?.psychologist_id);
  console.log('Selected date:', formData.preferredDate);
  console.log('Booked slots:', bookedSlots);
  console.log('Available slots:', availableTimeSlots);
  console.log('Is slots loading:', slotsLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== CREATING APPOINTMENT REQUEST ===');
    console.log('Patient data:', patient);
    console.log('Form data:', formData);
    
    if (!patient?.psychologist_id) {
      console.error('No psychologist_id found for patient:', patient);
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo asignado",
        variant: "destructive"
      });
      return;
    }

    if (!formData.preferredDate || !formData.preferredTime || !formData.type) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // VERIFICACIÓN CRÍTICA: Verificar disponibilidad antes de enviar
    console.log('Checking slot availability for:', formData.preferredTime);
    console.log('Is slot available?', isSlotAvailable(formData.preferredTime));
    
    if (!isSlotAvailable(formData.preferredTime)) {
      console.error('Slot not available:', formData.preferredTime);
      toast({
        title: "Horario no disponible",
        description: "Este horario ya no está disponible. Por favor selecciona otro.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        patient_id: patient.id,
        psychologist_id: patient.psychologist_id,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        type: formData.type,
        status: 'pending',
        notes: formData.notes || null
      };

      console.log('Creating appointment request with data:', requestData);

      const { data: insertedData, error: requestError } = await supabase
        .from('appointment_requests')
        .insert(requestData)
        .select()
        .single();

      if (requestError) {
        console.error('Error creating appointment request:', requestError);
        throw new Error('Error al enviar la solicitud de cita: ' + requestError.message);
      }

      console.log('✅ Appointment request created successfully:', insertedData);

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cita ha sido enviada al psicólogo para su aprobación"
      });

      // Resetear formulario
      setFormData({
        preferredDate: "",
        preferredTime: "",
        type: "",
        notes: ""
      });
      
      onRequestCreated();

    } catch (error) {
      console.error('Error creating appointment request:', error);
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

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return "";
    
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!patient?.psychologist_id) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>No tienes un psicólogo asignado. Contacta al administrador.</p>
        <p className="text-sm mt-2">
          Debug: Patient ID: {patient?.id || 'N/A'}, Psychologist ID: {patient?.psychologist_id || 'N/A'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Solicitar Cita</h2>
        <p className="text-sm text-slate-600">Envía una solicitud de cita a tu psicólogo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferredDate">Fecha preferida *</Label>
          <input
            id="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => {
              console.log('Date changed to:', e.target.value);
              setFormData({...formData, preferredDate: e.target.value, preferredTime: ""});
            }}
            min={getMinDate()}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {formData.preferredDate && (
            <p className="text-sm text-slate-600">
              Fecha seleccionada: {formatSelectedDate(formData.preferredDate)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredTime">Hora preferida *</Label>
          <Select 
            value={formData.preferredTime} 
            onValueChange={(value) => {
              console.log('Time selected:', value);
              setFormData({...formData, preferredTime: value});
            }}
            disabled={!formData.preferredDate || slotsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !formData.preferredDate 
                  ? "Primero selecciona una fecha" 
                  : slotsLoading 
                  ? "Cargando horarios..."
                  : availableTimeSlots.length === 0
                  ? "No hay horarios disponibles"
                  : "Selecciona una hora"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))
              ) : (
                formData.preferredDate && !slotsLoading && (
                  <SelectItem value="" disabled>
                    No hay horarios disponibles
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          {formData.preferredDate && bookedSlots.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Horarios ocupados:</p>
                  <p className="text-sm text-amber-700">
                    {bookedSlots.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.preferredDate && availableTimeSlots.length === 0 && !slotsLoading && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-800">
                  No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha.
                </p>
              </div>
            </div>
          )}
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
          <Label htmlFor="notes">Notas adicionales (opcional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Describe brevemente el motivo de la consulta o cualquier información relevante..."
            className="min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          disabled={
            loading || 
            !formData.preferredDate || 
            !formData.preferredTime || 
            !formData.type || 
            availableTimeSlots.length === 0 ||
            !isSlotAvailable(formData.preferredTime)
          }
          className="w-full bg-gradient-to-r from-blue-500 to-emerald-500"
        >
          {loading ? "Enviando solicitud..." : "Enviar Solicitud"}
        </Button>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Psychologist ID: {patient?.psychologist_id}</p>
            <p>Selected Date: {formData.preferredDate}</p>
            <p>Selected Time: {formData.preferredTime}</p>
            <p>Available Slots: [{availableTimeSlots.join(', ')}]</p>
            <p>Booked Slots: [{bookedSlots.join(', ')}]</p>
            <p>Slots Loading: {slotsLoading ? 'Yes' : 'No'}</p>
            <p>Can Submit: {isSlotAvailable(formData.preferredTime) ? 'Yes' : 'No'}</p>
          </div>
        )}
      </form>
    </div>
  );
};
