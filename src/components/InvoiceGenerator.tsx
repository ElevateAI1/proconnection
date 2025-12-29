import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices, CreateInvoiceData } from '@/hooks/useInvoices';
import { useProfile } from '@/hooks/useProfile';
import { useOptimizedPatients } from '@/hooks/useOptimizedPatients';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, Loader2, User, Calendar, DollarSign, AlertCircle, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDateArgentina } from '@/utils/dateFormatting';

interface InvoiceGeneratorProps {
  psychologistId?: string;
  defaultPatientId?: string;
  defaultAppointmentId?: string;
  onInvoiceCreated?: () => void;
}

export const InvoiceGenerator = ({
  psychologistId,
  defaultPatientId,
  defaultAppointmentId,
  onInvoiceCreated,
}: InvoiceGeneratorProps) => {
  const { psychologist } = useProfile();
  const { patients } = useOptimizedPatients(psychologistId);
  const { createInvoice, loading } = useInvoices(psychologistId);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateInvoiceData>({
    invoice_type: 'C',
    point_of_sale: 1,
    client_name: '',
    client_document_type: 'DNI',
    client_document_number: '',
    client_address: '',
    client_email: '',
    service_description: '',
    service_quantity: 1,
    unit_price: 0,
    discount: 0,
    notes: '',
    patient_id: defaultPatientId,
    appointment_id: defaultAppointmentId,
  });

  // Cargar datos del paciente si está seleccionado
  useEffect(() => {
    if (formData.patient_id) {
      const patient = patients.find((p) => p.id === formData.patient_id);
      if (patient) {
        setFormData((prev) => ({
          ...prev,
          client_name: `${patient.first_name} ${patient.last_name}`,
        }));
      }
    }
  }, [formData.patient_id, patients]);

  // Cargar citas disponibles
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!psychologistId && !psychologist?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('id, appointment_date, type, status')
          .eq('psychologist_id', psychologistId || psychologist?.id)
          .in('status', ['confirmed', 'completed'])
          .order('appointment_date', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    
    fetchAppointments();
  }, [psychologistId, psychologist?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del cliente es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.service_description.trim()) {
      toast({
        title: 'Error',
        description: 'La descripción del servicio es requerida',
        variant: 'destructive',
      });
      return;
    }

    if (formData.unit_price <= 0) {
      toast({
        title: 'Error',
        description: 'El precio unitario debe ser mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createInvoice(formData);
      setShowForm(false);
      setFormData({
        invoice_type: 'C',
        point_of_sale: 1,
        client_name: '',
        client_document_type: 'DNI',
        client_document_number: '',
        client_address: '',
        client_email: '',
        service_description: '',
        service_quantity: 1,
        unit_price: 0,
        discount: 0,
        notes: '',
      });
      onInvoiceCreated?.();
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const calculateTotal = () => {
    const subtotal = (formData.service_quantity || 1) * formData.unit_price;
    const discount = formData.discount || 0;
    return subtotal - discount;
  };

  if (!showForm) {
    return (
      <Card className="bg-white-warm border-2 border-blue-petrol/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-petrol">
            <FileText className="w-5 h-5" />
            Generador de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <p className="text-blue-petrol/70">
              Genera facturas <strong>tipo C (consumidor final)</strong> automáticamente. 
            </p>
            <div className="bg-gradient-to-br from-green-mint/20 to-blue-soft/20 p-3 rounded-lg border border-green-mint/30">
              <p className="text-sm text-blue-petrol/80">
                ✅ <strong>No requieren certificado digital ni CAE</strong><br/>
                ✅ Válidas para tu categoría de monotributo (A, B, C, D, E...)<br/>
                ✅ Perfectas para facturar a pacientes particulares
              </p>
            </div>
            <p className="text-xs text-blue-petrol/60">
              <strong>Nota:</strong> Las facturas tipo A y B (a empresas/responsables inscriptos) requieren certificado digital y están disponibles próximamente.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Nueva Factura
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white-warm border-2 border-blue-petrol/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-petrol">
          <FileText className="w-5 h-5" />
          Nueva Factura (Tipo C - Consumidor Final)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Aclaración importante */}
        <Alert className="mb-6 bg-gradient-to-br from-blue-soft/10 to-green-mint/10 border-2 border-blue-petrol/30">
          <AlertCircle className="h-4 w-4 text-blue-petrol" />
          <AlertTitle className="text-blue-petrol font-semibold">Importante: Tipo de Factura vs Categoría de Monotributo</AlertTitle>
          <AlertDescription className="text-blue-petrol/80 text-sm mt-2">
            <p className="mb-2">
              <strong>Tu categoría de monotributo</strong> (A, B, C, etc.) indica tu nivel de facturación anual permitido.
            </p>
            <p className="mb-2">
              <strong>El tipo de factura</strong> (A, B, C) indica a quién facturás:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Tipo C (Consumidor Final):</strong> ✅ Disponible - No requiere certificado digital ni CAE</li>
              <li><strong>Tipo A (Responsable Inscripto):</strong> 🔒 Requiere certificado digital y CAE</li>
              <li><strong>Tipo B (Consumidor Final con CUIT):</strong> 🔒 Requiere certificado digital y CAE</li>
            </ul>
            <p className="mt-2 text-xs">
              Actualmente solo puedes generar <strong>facturas tipo C</strong> sin certificado digital.
            </p>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de paciente/cita */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_id" className="text-blue-petrol">
                <User className="w-4 h-4 inline mr-1" />
                Paciente (Opcional)
              </Label>
              <Select
                value={formData.patient_id || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, patient_id: value || undefined }))
                }
              >
                <SelectTrigger className="border-blue-petrol/20">
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment_id" className="text-blue-petrol">
                <Calendar className="w-4 h-4 inline mr-1" />
                Cita (Opcional)
              </Label>
              <Select
                value={formData.appointment_id || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, appointment_id: value || undefined }))
                }
              >
                <SelectTrigger className="border-blue-petrol/20">
                  <SelectValue placeholder="Seleccionar cita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna</SelectItem>
                  {appointments
                    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
                    .map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {formatDateArgentina(appointment.appointment_date)} -{' '}
                        {appointment.type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-blue-soft/10 to-green-mint/10 rounded-lg border-2 border-blue-petrol/20">
            <h3 className="font-semibold text-blue-petrol">Datos del Cliente</h3>

            <div>
              <Label htmlFor="client_name" className="text-blue-petrol">
                Nombre Completo *
              </Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                }
                required
                className="border-blue-petrol/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_document_type" className="text-blue-petrol">
                  Tipo de Documento
                </Label>
                <Select
                  value={formData.client_document_type || 'DNI'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, client_document_type: value }))
                  }
                >
                  <SelectTrigger className="border-blue-petrol/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CUIT">CUIT</SelectItem>
                    <SelectItem value="CUIL">CUIL</SelectItem>
                    <SelectItem value="LC">LC</SelectItem>
                    <SelectItem value="LE">LE</SelectItem>
                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client_document_number" className="text-blue-petrol">
                  Número de Documento
                </Label>
                <Input
                  id="client_document_number"
                  value={formData.client_document_number || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, client_document_number: e.target.value }))
                  }
                  className="border-blue-petrol/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="client_address" className="text-blue-petrol">
                Dirección
              </Label>
              <Input
                id="client_address"
                value={formData.client_address || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_address: e.target.value }))
                }
                className="border-blue-petrol/20"
              />
            </div>

            <div>
              <Label htmlFor="client_email" className="text-blue-petrol">
                Email
              </Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_email: e.target.value }))
                }
                className="border-blue-petrol/20"
              />
            </div>
          </div>

          {/* Datos del servicio */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-green-mint/10 to-blue-soft/10 rounded-lg border-2 border-green-mint/30">
            <h3 className="font-semibold text-blue-petrol">Datos del Servicio</h3>

            <div>
              <Label htmlFor="service_description" className="text-blue-petrol">
                Descripción del Servicio *
              </Label>
              <Textarea
                id="service_description"
                value={formData.service_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, service_description: e.target.value }))
                }
                required
                rows={3}
                className="border-blue-petrol/20"
                placeholder="Ej: Consulta psicológica individual - Sesión de 50 minutos"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="service_quantity" className="text-blue-petrol">
                  Cantidad
                </Label>
                <Input
                  id="service_quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.service_quantity || 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      service_quantity: parseFloat(e.target.value) || 1,
                    }))
                  }
                  className="border-blue-petrol/20"
                />
              </div>

              <div>
                <Label htmlFor="unit_price" className="text-blue-petrol">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Precio Unitario *
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unit_price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                  className="border-blue-petrol/20"
                />
              </div>

              <div>
                <Label htmlFor="discount" className="text-blue-petrol">
                  Descuento
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="border-blue-petrol/20"
                />
              </div>
            </div>

            <div className="p-3 bg-white-warm rounded border-2 border-blue-petrol/30">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-petrol">Total:</span>
                <span className="text-2xl font-bold text-blue-petrol">
                  ${calculateTotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes" className="text-blue-petrol">
              Notas Adicionales (Opcional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="border-blue-petrol/20"
              placeholder="Información adicional para la factura..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Crear Factura
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  invoice_type: 'C',
                  point_of_sale: 1,
                  client_name: '',
                  client_document_type: 'DNI',
                  client_document_number: '',
                  client_address: '',
                  client_email: '',
                  service_description: '',
                  service_quantity: 1,
                  unit_price: 0,
                  discount: 0,
                  notes: '',
                });
              }}
              className="border-blue-petrol/30 text-blue-petrol hover:bg-blue-soft/20"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

