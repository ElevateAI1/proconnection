
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Settings, Mail, MessageSquare, Phone, Plus, RefreshCw, AlertCircle, BookOpen, Eye, Lightbulb, Copy, Check } from 'lucide-react';
import { useReminderSettings } from '@/hooks/useReminderSettings';
import { toast } from '@/hooks/use-toast';

type ReminderType = 'appointment' | 'payment' | 'document';

interface DefaultTemplate {
  id: string;
  name: string;
  description: string;
  message: string;
  variables: string[];
  category: 'professional' | 'friendly' | 'formal';
}

const defaultTemplates: DefaultTemplate[] = [
  {
    id: 'appointment_professional',
    name: 'Recordatorio de Cita Profesional',
    description: 'Mensaje formal y profesional para recordar citas',
    message: 'Estimado/a {{patient_name}}, le recordamos su cita programada para el {{date}} a las {{time}} con {{psychologist_name}}. Por favor confirme su asistencia.',
    variables: ['patient_name', 'date', 'time', 'psychologist_name'],
    category: 'professional'
  },
  {
    id: 'payment_friendly',
    name: 'Recordatorio de Pago Amigable',
    description: 'Mensaje cordial para recordar pagos pendientes',
    message: 'Hola {{patient_name}}! 😊 Te recordamos que tienes un pago pendiente de ${{amount}} por la sesión del {{date}}. Puedes realizarlo cuando gustes. ¡Gracias!',
    variables: ['patient_name', 'amount', 'date'],
    category: 'friendly'
  },
  {
    id: 'document_ready',
    name: 'Documento Listo - Formal',
    description: 'Notificación formal cuando un documento está disponible',
    message: 'Estimado/a {{patient_name}}, su {{document_name}} está listo y disponible para revisión. Puede acceder a través del portal del paciente.',
    variables: ['patient_name', 'document_name'],
    category: 'formal'
  },
  {
    id: 'followup_caring',
    name: 'Seguimiento Personalizado',
    description: 'Mensaje de seguimiento post-sesión con toque personal',
    message: 'Hola {{patient_name}}, espero que te encuentres bien después de nuestra sesión del {{date}}. Si tienes alguna pregunta o necesitas apoyo, no dudes en contactarme. - {{psychologist_name}}',
    variables: ['patient_name', 'date', 'psychologist_name'],
    category: 'friendly'
  },
  {
    id: 'welcome_message',
    name: 'Mensaje de Bienvenida',
    description: 'Mensaje cálido para nuevos pacientes',
    message: '¡Bienvenido/a {{patient_name}}! 🌟 Me da mucho gusto acompañarte en este proceso. Tu primera cita está programada para el {{date}} a las {{time}}. Si tienes dudas, estoy aquí para ayudarte.',
    variables: ['patient_name', 'date', 'time'],
    category: 'friendly'
  }
];

const availableVariables = [
  { key: 'patient_name', description: 'Nombre del paciente' },
  { key: 'psychologist_name', description: 'Nombre del psicólogo' },
  { key: 'date', description: 'Fecha de la cita (DD/MM/YYYY)' },
  { key: 'time', description: 'Hora de la cita (HH:MM)' },
  { key: 'amount', description: 'Monto del pago' },
  { key: 'document_name', description: 'Nombre del documento' },
  { key: 'appointment_id', description: 'ID de la cita' },
  { key: 'payment_link', description: 'Enlace de pago' },
  { key: 'clinic_address', description: 'Dirección de la clínica' },
  { key: 'phone_number', description: 'Número de teléfono de contacto' }
];

export const AdvancedReminderSettings: React.FC = () => {
  const { settings, loading, error, updateSetting, getSetting, createDefaultSettings, fetchSettings } = useReminderSettings();
  const [editingType, setEditingType] = useState<ReminderType | null>(null);
  const [tempSettings, setTempSettings] = useState<any>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [copiedTemplate, setCopiedTemplate] = useState<string>('');

  const reminderTypes: { type: ReminderType; label: string; description: string; icon: any }[] = [
    {
      type: 'appointment',
      label: 'Recordatorios de Citas',
      description: 'Notificar a pacientes sobre citas próximas',
      icon: Clock
    },
    {
      type: 'payment',
      label: 'Recordatorios de Pago',
      description: 'Notificar sobre pagos pendientes',
      icon: AlertCircle
    },
    {
      type: 'document',
      label: 'Documentos Listos',
      description: 'Notificar cuando hay documentos disponibles',
      icon: BookOpen
    }
  ];

  const deliveryOptions = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'sms', label: 'SMS', icon: Phone }
  ];

  const handleEdit = (type: ReminderType) => {
    const setting = getSetting(type);
    setEditingType(type);
    setTempSettings({
      enabled: setting?.enabled ?? true,
      hours_before: setting?.hours_before ?? 24,
      delivery_methods: setting?.delivery_methods ?? ['email'],
      custom_message: setting?.custom_message ?? ''
    });
    setSelectedTemplate('');
    updatePreview(setting?.custom_message || '');
  };

  const handleSave = async () => {
    if (!editingType) return;
    
    await updateSetting(editingType, tempSettings);
    setEditingType(null);
    setTempSettings({});
    setSelectedTemplate('');
    setPreviewMessage('');
  };

  const handleCancel = () => {
    setEditingType(null);
    setTempSettings({});
    setSelectedTemplate('');
    setPreviewMessage('');
  };

  const selectTemplate = (template: DefaultTemplate) => {
    setSelectedTemplate(template.id);
    setTempSettings(prev => ({
      ...prev,
      custom_message: template.message
    }));
    updatePreview(template.message);
  };

  const updatePreview = (message: string) => {
    // Crear un preview con datos de ejemplo
    const exampleData = {
      patient_name: 'María González',
      psychologist_name: 'Dr. Juan Pérez',
      date: '15/01/2024',
      time: '14:30',
      amount: '3500',
      document_name: 'Informe Psicológico',
      appointment_id: 'CITA-001',
      payment_link: 'https://example.com/pay/123',
      clinic_address: 'Av. Corrientes 1234, CABA',
      phone_number: '+54 11 1234-5678'
    };

    let preview = message;
    Object.entries(exampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(regex, value);
    });

    setPreviewMessage(preview);
  };

  const copyTemplate = (template: DefaultTemplate) => {
    navigator.clipboard.writeText(template.message);
    setCopiedTemplate(template.id);
    setTimeout(() => setCopiedTemplate(''), 2000);
    toast({
      title: "✅ Template copiado",
      description: "El mensaje ha sido copiado al portapapeles"
    });
  };

  const insertVariable = (variable: string) => {
    if (!editingType) return;
    
    const currentMessage = tempSettings.custom_message || '';
    const newMessage = currentMessage + `{{${variable}}}`;
    
    setTempSettings(prev => ({
      ...prev,
      custom_message: newMessage
    }));
    updatePreview(newMessage);
  };

  useEffect(() => {
    if (tempSettings.custom_message) {
      updatePreview(tempSettings.custom_message);
    }
  }, [tempSettings.custom_message]);

  if (loading && settings.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando configuraciones avanzadas...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración Avanzada de Recordatorios
            </CardTitle>
            <div className="flex gap-2">
              {settings.length === 0 && (
                <Button
                  onClick={createDefaultSettings}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear Configuraciones
                </Button>
              )}
              <Button
                onClick={fetchSettings}
                size="sm"
                variant="outline"
                className="text-xs"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 mb-4">No tienes configuraciones de recordatorios</p>
              <Button onClick={createDefaultSettings} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crear configuraciones por defecto
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reminderTypes.map(({ type, label, description, icon: Icon }) => {
                const setting = getSetting(type);
                const isEditing = editingType === type;

                return (
                  <Card key={type} className="border-2 border-slate-100">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{label}</h3>
                            <p className="text-sm text-slate-600">{description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isEditing ? tempSettings.enabled : setting?.enabled ?? false}
                            onCheckedChange={(checked) => {
                              if (isEditing) {
                                setTempSettings(prev => ({ ...prev, enabled: checked }));
                              } else {
                                updateSetting(type, { enabled: checked });
                              }
                            }}
                          />
                          {!isEditing && (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>
                              <Settings className="w-4 h-4 mr-1" />
                              Configurar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {isEditing ? (
                        <Tabs defaultValue="basic" className="space-y-4">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Configuración Básica</TabsTrigger>
                            <TabsTrigger value="templates">Mensajes Predeterminados</TabsTrigger>
                            <TabsTrigger value="custom">Mensaje Personalizado</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`hours-${type}`}>Horas antes del evento</Label>
                                <Input
                                  id={`hours-${type}`}
                                  type="number"
                                  min="1"
                                  max="168"
                                  value={tempSettings.hours_before}
                                  onChange={(e) => setTempSettings(prev => ({ 
                                    ...prev, 
                                    hours_before: parseInt(e.target.value) 
                                  }))}
                                />
                              </div>
                              
                              <div>
                                <Label>Métodos de entrega</Label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                  {deliveryOptions.map(({ value, label: optionLabel, icon: Icon }) => (
                                    <div key={value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${type}-${value}`}
                                        checked={tempSettings.delivery_methods?.includes(value)}
                                        onCheckedChange={(checked) => {
                                          const methods = tempSettings.delivery_methods || [];
                                          if (checked) {
                                            setTempSettings(prev => ({
                                              ...prev,
                                              delivery_methods: [...methods, value]
                                            }));
                                          } else {
                                            setTempSettings(prev => ({
                                              ...prev,
                                              delivery_methods: methods.filter(m => m !== value)
                                            }));
                                          }
                                        }}
                                      />
                                      <Label 
                                        htmlFor={`${type}-${value}`}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <Icon className="w-4 h-4" />
                                        {optionLabel}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="templates" className="space-y-4">
                            <div className="grid gap-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                                <h4 className="font-medium">Mensajes Predeterminados</h4>
                              </div>
                              
                              {defaultTemplates.map((template) => (
                                <Card 
                                  key={template.id} 
                                  className={`border-2 transition-all cursor-pointer hover:border-blue-200 ${
                                    selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                                  }`}
                                  onClick={() => selectTemplate(template)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-medium text-slate-800">{template.name}</h5>
                                          <Badge variant={template.category === 'professional' ? 'default' : template.category === 'friendly' ? 'secondary' : 'outline'}>
                                            {template.category}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                          {template.message}
                                        </p>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyTemplate(template);
                                        }}
                                      >
                                        {copiedTemplate === template.id ? (
                                          <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {template.variables.map((variable) => (
                                        <Badge key={variable} variant="outline" className="text-xs">
                                          {`{{${variable}}}`}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="custom" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Editor de mensaje personalizado */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5 text-blue-500" />
                                  <h4 className="font-medium">Mensaje Personalizado</h4>
                                </div>
                                
                                <Textarea
                                  placeholder="Escribe tu mensaje personalizado aquí..."
                                  value={tempSettings.custom_message || ''}
                                  onChange={(e) => {
                                    setTempSettings(prev => ({ 
                                      ...prev, 
                                      custom_message: e.target.value 
                                    }));
                                    updatePreview(e.target.value);
                                  }}
                                  rows={6}
                                  className="resize-none"
                                />
                                
                                <div className="space-y-2">
                                  <Label>Variables Disponibles</Label>
                                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                    {availableVariables.map((variable) => (
                                      <Button
                                        key={variable.key}
                                        variant="outline"
                                        size="sm"
                                        className="justify-start text-xs"
                                        onClick={() => insertVariable(variable.key)}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        {`{{${variable.key}}}`}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Vista previa */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-5 h-5 text-green-500" />
                                  <h4 className="font-medium">Vista Previa</h4>
                                </div>
                                
                                <div className="border rounded-lg p-4 bg-slate-50 min-h-[200px]">
                                  <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                      {previewMessage || 'Escribe un mensaje para ver la vista previa...'}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Documentación de variables */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                  <h5 className="font-medium text-blue-800 mb-2">📋 Documentación de Variables</h5>
                                  <div className="space-y-1 text-sm">
                                    {availableVariables.slice(0, 6).map((variable) => (
                                      <div key={variable.key} className="flex justify-between">
                                        <code className="text-blue-700">{`{{${variable.key}}}`}</code>
                                        <span className="text-blue-600">{variable.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      ) : setting && (
                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {setting.hours_before}h antes
                            </span>
                            <span>
                              Métodos: {setting.delivery_methods.join(', ')}
                            </span>
                          </div>
                          {setting.custom_message && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-1">Mensaje personalizado:</p>
                              <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                                {setting.custom_message}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {isEditing && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button onClick={handleSave}>
                            Guardar Configuración
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
