import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FileText, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface PatientAppointmentRequestFormProps {
  psychologistId: string;
  onClose: () => void;
  onRequestCreated?: () => void;
}

export const PatientAppointmentRequestForm = ({ psychologistId, onClose, onRequestCreated }: PatientAppointmentRequestFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    preferredDate: "",
    preferredTime: "",
    sessionType: "presencial",
    notes: ""
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------- useAvailableSlots
  const {
    getAvailableSlots,
    loading: slotsLoading,
    refreshAvailability
  } = useAvailableSlots({
    psychologistId,
    selectedDate: formData.preferredDate
  });
  const availableSlots = getAvailableSlots();

  // -------- Actualizar available slots cuando cambia preferredDate
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

    // Verificar que el bucket existe, si no, intentar crearlo
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      const paymentProofsBucket = buckets.find(bucket => bucket.id === 'payment-proofs');
      if (!paymentProofsBucket) {
        console.warn('payment-proofs bucket not found in bucket list');
      } else {
        console.log('payment-proofs bucket exists:', paymentProofsBucket);
      }
    }

    // Subir archivo a Supabase Storage
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
    
    // Obtener URL pública válida
    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData.publicUrl;
    console.log('Generated public URL:', publicUrl);
    
    // Validar que la URL es correcta
    if (!publicUrl || !publicUrl.startsWith('http')) {
      throw new Error('No se pudo generar una URL válida para el archivo');
    }

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.patientEmail || !formData.preferredDate || !formData.preferredTime) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validar que el preferredTime es uno de los disponibles estrictamente
    if (!availableSlots.includes(formData.preferredTime)) {
      toast({
        title: "Error",
        description: "El horario seleccionado no es válido o ya no está disponible. Elige uno de la lista.",
        variant: "destructive"
      });
      setFormData(prev => ({ ...prev, preferredTime: "" }));
      return;
    }

    setIsSubmitting(true);

    try {
      let proofUrl = null;
      let receiptId = null;

      // Upload payment proof if provided
      if (paymentProof) {
        console.log('=== STARTING PAYMENT PROOF PROCESSING ===');
        
        // 1. Subir archivo y obtener URL válida
        proofUrl = await uploadFileToStorage(paymentProof);
        
        // 2. Crear registro en payment_receipts
        console.log('=== CREATING PAYMENT RECEIPT RECORD ===');
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

        // 3. Disparar procesamiento OCR
        console.log('=== STARTING OCR PROCESSING ===');
        
        try {
          console.log('=== TRIGGERING EDGE FUNCTION ===');
          const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
            body: { 
              fileUrl: proofUrl, 
              receiptId: receiptId 
            }
          });
          
          if (ocrError) {
            console.error('Edge function error:', ocrError);
            // Continue without blocking the flow
          } else {
            console.log('Edge function completed:', ocrData);
          }
        } catch (edgeFunctionError) {
          console.error('Edge function exception:', edgeFunctionError);
          // Continue without blocking the flow
        }
      }

      // Create appointment request
      console.log('=== CREATING APPOINTMENT REQUEST ===');
      const { error } = await supabase
        .from('appointment_requests')
        .insert({
          psychologist_id: psychologistId,
          patient_id: user?.id || '',
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          type: 'individual',
          notes: `Nombre: ${formData.patientName}\nEmail: ${formData.patientEmail}\nTeléfono: ${formData.patientPhone}\nTipo de sesión: ${formData.sessionType}\n\nNotas adicionales: ${formData.notes}`,
          payment_proof_url: proofUrl,
          status: 'pending'
        });

      if (error) {
        console.error('Appointment request creation error:', error);
        throw error;
      }

      console.log('Appointment request created successfully');

      toast({
        title: "Solicitud enviada",
        description: paymentProof 
          ? "Tu solicitud y comprobante han sido enviados. El comprobante está siendo procesado automáticamente."
          : "Tu solicitud de cita ha sido enviada exitosamente. El psicólogo se contactará contigo pronto."
      });

      onRequestCreated?.();
      onClose();
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
                <Label htmlFor="patientPhone">Teléfono</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>
            
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-medium">Detalles de la Cita</h3>
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
            
            <div className="space-y-2">
              <Label htmlFor="sessionType">Tipo de Sesión</Label>
              <select
                id="sessionType"
                value={formData.sessionType}
                onChange={(e) => handleInputChange('sessionType', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md"
              >
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
              </select>
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
