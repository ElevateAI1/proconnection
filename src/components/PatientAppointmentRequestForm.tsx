import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FileText, Upload, X, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useAppointmentRates } from "@/hooks/useAppointmentRates";
import { useConversations } from "@/hooks/useConversations";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { isValidArgentinePhoneNumber } from "@/utils/phoneValidation";

interface PatientAppointmentRequestFormProps {
  psychologistId: string;
  onClose: () => void;
  onRequestCreated?: () => void;
}

export const PatientAppointmentRequestForm = ({ psychologistId, onClose, onRequestCreated }: PatientAppointmentRequestFormProps) => {
  const { user } = useAuth();
  const { createOrGetConversation, sendMessage } = useConversations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientAge: "",
    preferredDate: "",
    preferredTime: "",
    sessionType: "individual",
    consultationReason: "",
    notes: ""
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Available slots and rates
  const {
    getAvailableSlots,
    loading: slotsLoading,
    refreshAvailability
  } = useAvailableSlots({
    psychologistId,
    selectedDate: formData.preferredDate
  });
  
  const { getRateForType, formatPrice, loading: ratesLoading } = useAppointmentRates(psychologistId);
  const availableSlots = getAvailableSlots();
  const selectedRate = getRateForType(formData.sessionType);

  // Update available slots when date changes
  const handlePreferredDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDate: date,
      preferredTime: ""
    }));
    refreshAvailability();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear phone error when user starts typing
    if (field === 'patientPhone' && phoneError) {
      setPhoneError("");
    }
  };

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, patientPhone: phone }));
    setPhoneError("");
  };

  const validatePhone = () => {
    if (!formData.patientPhone.trim()) {
      setPhoneError("El número de teléfono es obligatorio");
      return false;
    }
    
    if (!isValidArgentinePhoneNumber(formData.patientPhone)) {
      setPhoneError("Ingresa un número de teléfono válido");
      return false;
    }
    
    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen (JPG, PNG, GIF) o PDF",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no puede ser mayor a 5MB",
          variant: "destructive"
        });
        return;
      }

      setPaymentProof(file);
    }
  };

  const removeFile = () => {
    setPaymentProof(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    console.log('=== UPLOADING FILE TO SUPABASE STORAGE ===');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id || 'anonymous'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log('Generated filename:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Error al subir archivo: ${uploadError.message}`);
    }
    
    console.log('Upload successful:', uploadData);
    
    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData.publicUrl;
    console.log('Generated public URL:', publicUrl);
    
    if (!publicUrl || !publicUrl.startsWith('http')) {
      throw new Error('No se pudo generar una URL válida para el archivo');
    }

    return publicUrl;
  };

  const createAutomaticMessage = async () => {
    try {
      if (!user?.id) return;

      const conversation = await createOrGetConversation(psychologistId, user.id);
      if (!conversation) return;

      const messageContent = `Nueva solicitud de cita recibida:

📅 Fecha: ${formData.preferredDate}
🕐 Hora: ${formData.preferredTime}
👤 Paciente: ${formData.patientName} (${formData.patientAge} años)
📧 Email: ${formData.patientEmail}
📞 Teléfono: ${formData.patientPhone}
🏥 Tipo de consulta: ${getTypeLabel(formData.sessionType)}
💰 Tarifa: ${selectedRate ? formatPrice(selectedRate.price, selectedRate.currency) : 'No definida'}

📝 Motivo de consulta:
${formData.consultationReason}

${formData.notes ? `📋 Notas adicionales:\n${formData.notes}` : ''}

${paymentProof ? '💳 Comprobante de pago adjunto' : ''}`;

      await sendMessage(conversation.id, user.id, messageContent);
      console.log('Automatic message sent to psychologist');
    } catch (error) {
      console.error('Error sending automatic message:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.patientEmail || !formData.patientAge || 
        !formData.preferredDate || !formData.preferredTime || !formData.consultationReason) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validar teléfono obligatorio
    if (!validatePhone()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono válido",
        variant: "destructive"
      });
      return;
    }

    if (!availableSlots.includes(formData.preferredTime)) {
      toast({
        title: "Error",
        description: "El horario seleccionado no es válido o ya no está disponible.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let proofUrl = null;
      let receiptId = null;

      // Upload payment proof if provided
      if (paymentProof) {
        console.log('=== STARTING PAYMENT PROOF PROCESSING ===');
        proofUrl = await uploadFileToStorage(paymentProof);
        
        const { data: receiptData, error: receiptError } = await supabase
          .from('payment_receipts')
          .insert({
            psychologist_id: psychologistId,
            patient_id: user?.id || '',
            original_file_url: proofUrl,
            extraction_status: 'pending',
            validation_status: 'pending',
            include_in_report: false,
            validation_notes: 'Comprobante subido desde formulario de solicitud de cita'
          })
          .select()
          .single();

        if (receiptError) {
          console.error('Receipt creation error:', receiptError);
          throw receiptError;
        }
        
        receiptId = receiptData.id;
        console.log('Receipt record created:', receiptId);

        try {
          const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
            body: { 
              fileUrl: proofUrl, 
              receiptId: receiptId 
            }
          });
          
          if (ocrError) {
            console.error('Edge function error:', ocrError);
          } else {
            console.log('Edge function completed:', ocrData);
          }
        } catch (edgeFunctionError) {
          console.error('Edge function exception:', edgeFunctionError);
        }
      }

      // Create appointment request with phone number
      console.log('=== CREATING APPOINTMENT REQUEST ===');
      const { error } = await supabase
        .from('appointment_requests')
        .insert({
          psychologist_id: psychologistId,
          patient_id: user?.id || '',
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          type: formData.sessionType,
          notes: `Nombre: ${formData.patientName}\nEdad: ${formData.patientAge} años\nEmail: ${formData.patientEmail}\nTeléfono: ${formData.patientPhone}\n\nMotivo de consulta: ${formData.consultationReason}\n\nNotas adicionales: ${formData.notes}`,
          payment_proof_url: proofUrl,
          status: 'pending'
        });

      if (error) {
        console.error('Appointment request creation error:', error);
        throw error;
      }

      // Send automatic message to psychologist
      await createAutomaticMessage();

      console.log('Appointment request created successfully');

      toast({
        title: "Solicitud enviada",
        description: paymentProof 
          ? "Tu solicitud y comprobante han sido enviados. El psicólogo ha sido notificado automáticamente."
          : "Tu solicitud de cita ha sido enviada exitosamente. El psicólogo ha sido notificado automáticamente."
      });

      // Cerrar el modal primero
      onClose();
      
      // Luego actualizar los datos (esto puede causar re-render pero el modal ya está cerrado)
      setTimeout(() => {
        onRequestCreated?.();
      }, 100);
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      toast({
        title: "Error",
        description: "Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          Solicitar Cita
        </CardTitle>
        <p className="text-slate-600">
          Completa el formulario para solicitar una cita
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              <h3 className="font-medium">Información Personal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nombre Completo *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientAge">Edad *</Label>
                <Input
                  id="patientAge"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.patientAge}
                  onChange={(e) => handleInputChange('patientAge', e.target.value)}
                  placeholder="Tu edad"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <PhoneInput
                value={formData.patientPhone}
                onChange={handlePhoneChange}
                label="Teléfono"
                required={true}
                error={phoneError}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-medium">Detalles de la Cita</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionType">Tipo de Consulta *</Label>
              <Select
                value={formData.sessionType}
                onValueChange={(value) => handleInputChange('sessionType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Terapia Individual</SelectItem>
                  <SelectItem value="couple">Terapia de Pareja</SelectItem>
                  <SelectItem value="family">Terapia Familiar</SelectItem>
                  <SelectItem value="evaluation">Evaluación</SelectItem>
                  <SelectItem value="follow_up">Seguimiento</SelectItem>
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
              <Label htmlFor="consultationReason">Motivo de Consulta *</Label>
              <Textarea
                id="consultationReason"
                value={formData.consultationReason}
                onChange={(e) => handleInputChange('consultationReason', e.target.value)}
                placeholder="Describe brevemente el motivo de tu consulta..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Fecha Preferida *</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handlePreferredDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Horario Preferido *</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => handleInputChange('preferredTime', value)}
                  disabled={!formData.preferredDate || slotsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.preferredDate
                        ? "Selecciona una fecha primero"
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
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4" />
              <h3 className="font-medium">Comprobante de Pago (Opcional)</h3>
            </div>
            
            {!paymentProof ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600 mb-2">
                  Arrastra y suelta tu comprobante aquí, o
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={triggerFileInput}
                >
                  Seleccionar archivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Formatos: JPG, PNG, GIF, PDF (máx. 5MB)
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ✨ Se procesará automáticamente con IA
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium">{paymentProof.name}</span>
                  <span className="text-xs text-slate-500">
                    ({(paymentProof.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Cualquier información adicional que consideres importante..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
