
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Settings, Mail, MessageSquare, Phone, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useReminderSettings } from '@/hooks/useReminderSettings';
import { useState } from 'react';

type ReminderType = 'appointment' | 'payment' | 'document';

export const ReminderSettingsManager: React.FC = () => {
  const { settings, loading, error, updateSetting, getSetting, createDefaultSettings, fetchSettings } = useReminderSettings();
  const [editingType, setEditingType] = useState<ReminderType | null>(null);
  const [tempSettings, setTempSettings] = useState<any>({});

  const reminderTypes: { type: ReminderType; label: string; description: string }[] = [
    {
      type: 'appointment',
      label: 'Recordatorios de Citas',
      description: 'Notificar a pacientes sobre citas próximas'
    },
    {
      type: 'payment',
      label: 'Recordatorios de Pago',
      description: 'Notificar sobre pagos pendientes'
    },
    {
      type: 'document',
      label: 'Recordatorios de Documentos',
      description: 'Notificar cuando hay documentos listos'
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
  };

  const handleSave = async () => {
    if (!editingType) return;
    
    await updateSetting(editingType, tempSettings);
    setEditingType(null);
    setTempSettings({});
  };

  const handleCancel = () => {
    setEditingType(null);
    setTempSettings({});
  };

  const handleCreateDefaults = async () => {
    await createDefaultSettings();
  };

  if (loading && settings.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando configuraciones...</p>
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
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Recordatorios
          </CardTitle>
          <div className="flex gap-2">
            {settings.length === 0 && (
              <Button
                onClick={handleCreateDefaults}
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
        <div className="space-y-6">
          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 mb-4">No tienes configuraciones de recordatorios</p>
              <Button onClick={handleCreateDefaults} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crear configuraciones por defecto
              </Button>
            </div>
          ) : (
            reminderTypes.map(({ type, label, description }) => {
              const setting = getSetting(type);
              const isEditing = editingType === type;

              return (
                <div key={type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-slate-800">{label}</h3>
                      <p className="text-sm text-slate-600">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <Label htmlFor={`hours-${type}`}>Horas antes de la cita</Label>
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

                      <div>
                        <Label htmlFor={`message-${type}`}>Mensaje personalizado (opcional)</Label>
                        <Textarea
                          id={`message-${type}`}
                          placeholder="Mensaje personalizado para este tipo de recordatorio..."
                          value={tempSettings.custom_message || ''}
                          onChange={(e) => setTempSettings(prev => ({ 
                            ...prev, 
                            custom_message: e.target.value 
                          }))}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave}>
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isEditing && setting && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-md">
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
                        <p className="text-sm text-slate-600 mt-2">
                          <strong>Mensaje:</strong> {setting.custom_message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
