
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface NewAppointmentModalProps {
  onAppointmentCreated: () => void;
}

export const NewAppointmentModal = ({ onAppointmentCreated }: NewAppointmentModalProps) => {
  const { psychologist } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "",
    notes: ""
  });

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

    if (!formData.appointmentDate || !formData.appointmentTime || !formData.type || !formData.patientName) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Crear la fecha y hora del appointment
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);

      // Primero crear o buscar el paciente
      let patientId = '';
      
      // Buscar si el paciente ya existe
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('psychologist_id', psychologist.id)
        .ilike('first_name', formData.patientName.split(' ')[0] || '')
        .ilike('last_name', formData.patientName.split(' ').slice(1).join(' ') || '')
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Crear nuevo paciente
        const nameParts = formData.patientName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            psychologist_id: psychologist.id,
            first_name: firstName,
            last_name: lastName,
            phone: formData.patientPhone || null,
            notes: `Email: ${formData.patientEmail || 'No proporcionado'}`
          })
          .select('id')
          .single();

        if (patientError) {
          throw new Error('Error al crear el paciente');
        }

        patientId = newPatient.id;
      }

      // Crear la cita
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          psychologist_id: psychologist.id,
          patient_id: patientId,
          appointment_date: appointmentDateTime.toISOString(),
          type: formData.type,
          status: 'scheduled',
          notes: formData.notes || null
        });

      if (appointmentError) {
        throw new Error('Error al crear la cita');
      }

      toast({
        title: "Cita creada",
        description: "La cita ha sido creada exitosamente"
      });

      // Resetear formulario y cerrar modal
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
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
          <div className="space-y-2">
            <Label htmlFor="patientName">Nombre del paciente *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({...formData, patientName: e.target.value})}
              placeholder="Nombre completo del paciente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientEmail">Email del paciente</Label>
            <Input
              id="patientEmail"
              type="email"
              value={formData.patientEmail}
              onChange={(e) => setFormData({...formData, patientEmail: e.target.value})}
              placeholder="email@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientPhone">Teléfono del paciente</Label>
            <Input
              id="patientPhone"
              value={formData.patientPhone}
              onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentDate">Fecha *</Label>
            <Input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
              min={getMinDate()}
              required
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
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
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
              disabled={loading}
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
