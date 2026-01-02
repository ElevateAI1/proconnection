
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Send, AlertCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useAppointmentRates } from "@/hooks/useAppointmentRates";
import { formatDateArgentina, dateFormatOptions } from "@/utils/dateFormatting";

interface AppointmentRequestFormProps {
  psychologistId: string;
  patientId: string;
  onSuccess?: () => void;
}

export const AppointmentRequestForm = ({ 
  psychologistId, 
  patientId, 
  onSuccess 
}: AppointmentRequestFormProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [consultationReason, setConsultationReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    bookedSlots,
    loading: slotsLoading,
    isSlotAvailable,
    getAvailableSlots,
    refreshAvailability
  } = useAvailableSlots({
    psychologistId,
    selectedDate
  });

  const { getRateForType, formatPrice, loading: ratesLoading } = useAppointmentRates(psychologistId);
  const selectedRate = getRateForType(appointmentType);

  // Refresh availability when date changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedTime(""); // Reset selected time when date changes
      refreshAvailability();
    }
  }, [selectedDate, refreshAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !appointmentType || !patientAge || !consultationReason) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // Double-check availability before submitting
    if (!isSlotAvailable(selectedTime)) {
      toast({
        title: "Horario no disponible",
        description: "Este horario ya no está disponible. Por favor selecciona otro.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting appointment request:', {
        patient_id: patientId,
        psychologist_id: psychologistId,
        preferred_date: selectedDate,
        preferred_time: selectedTime,
        type: appointmentType,
        notes: `Edad: ${patientAge} años\nMotivo de consulta: ${consultationReason}\n\nNotas adicionales: ${notes || 'Ninguna'}`
      });

      const { error } = await supabase
        .from('appointment_requests')
        .insert({
          patient_id: patientId,
          psychologist_id: psychologistId,
          preferred_date: selectedDate,
          preferred_time: selectedTime,
          type: appointmentType,
          notes: `Edad: ${patientAge} años\nMotivo de consulta: ${consultationReason}\n\nNotas adicionales: ${notes || 'Ninguna'}`
        });

      if (error) {
        console.error('Error creating appointment request:', error);
        throw new Error('No se pudo crear la solicitud de cita');
      }

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cita ha sido enviada al profesional. Te notificaremos cuando sea respondida."
      });

      // Reset form
      setSelectedDate("");
      setSelectedTime("");
      setAppointmentType("");
      setPatientAge("");
      setConsultationReason("");
      setNotes("");
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting appointment request:', error);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return formatDateArgentina(dateString, dateFormatOptions.full);
    } catch {
      return dateString;
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get available time slots for display
  const availableSlots = getAvailableSlots();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-5 h-5" />
          Solicitar Cita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de consulta *</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de consulta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {getTypeLabel("individual")}
                  </div>
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
            
            {selectedRate && !ratesLoading && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Tarifa: {formatPrice(selectedRate.price, selectedRate.currency)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientAge">Edad del paciente *</Label>
            <Input
              id="patientAge"
              type="number"
              min="1"
              max="120"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="Edad en años"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationReason">Motivo de consulta *</Label>
            <Textarea
              id="consultationReason"
              value={consultationReason}
              onChange={(e) => setConsultationReason(e.target.value)}
              placeholder="Describe brevemente el motivo de la consulta..."
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha preferida *</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              required
              className="w-full"
            />
            {selectedDate && (
              <p className="text-sm text-slate-600">
                {formatDate(selectedDate)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Hora preferida *</Label>
            <Select 
              value={selectedTime} 
              onValueChange={setSelectedTime}
              disabled={!selectedDate || slotsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedDate 
                    ? "Primero selecciona una fecha" 
                    : slotsLoading 
                    ? "Cargando horarios..."
                    : availableSlots.length === 0
                    ? "No hay horarios disponibles"
                    : "Selecciona una hora"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedDate && bookedSlots.length > 0 && (
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

            {selectedDate && availableSlots.length === 0 && (
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
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cualquier información adicional que consideres importante..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || !selectedDate || !selectedTime || !appointmentType || !patientAge || !consultationReason || availableSlots.length === 0}
            className="w-full bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
