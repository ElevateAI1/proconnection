
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Edit, Save, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useVisibilityData } from '@/hooks/useVisibilityData';

interface ProfileAuditModuleProps {
  onComplete: (score: number) => void;
  currentScore: number;
}

export const ProfileAuditModule = ({ onComplete, currentScore }: ProfileAuditModuleProps) => {
  const { psychologist } = useProfile();
  const { updatePsychologistProfile, saveModuleScore, loading } = useVisibilityData();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    phone: '',
    license_number: ''
  });

  useEffect(() => {
    if (psychologist) {
      setFormData({
        first_name: psychologist.first_name || '',
        last_name: psychologist.last_name || '',
        specialization: psychologist.specialization || '',
        phone: psychologist.phone || '',
        license_number: psychologist.license_number || ''
      });
    }
  }, [psychologist]);

  const calculateScore = () => {
    let score = 0;
    let maxScore = 100;

    // Nombre completo (20 puntos)
    if (formData.first_name && formData.last_name) score += 20;

    // Especialización (25 puntos)
    if (formData.specialization && formData.specialization.length > 10) score += 25;

    // Teléfono (15 puntos)
    if (formData.phone && formData.phone.length >= 10) score += 15;

    // Número de licencia (20 puntos)
    if (formData.license_number) score += 20;

    // Código profesional (20 puntos) - automático si tiene psychologist
    if (psychologist?.professional_code) score += 20;

    return Math.round((score / maxScore) * 100);
  };

  const handleSave = async () => {
    const result = await updatePsychologistProfile(formData);
    
    if (!result.error) {
      const newScore = calculateScore();
      await saveModuleScore('profile', newScore, formData);
      onComplete(newScore);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    if (psychologist) {
      setFormData({
        first_name: psychologist.first_name || '',
        last_name: psychologist.last_name || '',
        specialization: psychologist.specialization || '',
        phone: psychologist.phone || '',
        license_number: psychologist.license_number || ''
      });
    }
    setEditMode(false);
  };

  const score = calculateScore();
  const isComplete = score >= 80;

  const auditItems = [
    {
      label: 'Nombre completo',
      completed: !!(formData.first_name && formData.last_name),
      value: `${formData.first_name} ${formData.last_name}`.trim() || 'No completado',
      field: 'name'
    },
    {
      label: 'Especialización',
      completed: !!(formData.specialization && formData.specialization.length > 10),
      value: formData.specialization || 'No especificada',
      field: 'specialization'
    },
    {
      label: 'Teléfono de contacto',
      completed: !!(formData.phone && formData.phone.length >= 10),
      value: formData.phone || 'No proporcionado',
      field: 'phone'
    },
    {
      label: 'Número de licencia',
      completed: !!formData.license_number,
      value: formData.license_number || 'No proporcionado',
      field: 'license_number'
    },
    {
      label: 'Código profesional',
      completed: !!psychologist?.professional_code,
      value: psychologist?.professional_code || 'Generando...',
      field: 'professional_code'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                Auditoría de Perfil Profesional
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Completitud y optimización de tu información profesional
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{score}%</div>
              <div className="text-xs text-slate-500">Completitud</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Progress value={score} className="h-3" />
              <p className="text-sm text-slate-600 mt-2">
                {score >= 80 ? '¡Excelente! Tu perfil está bien optimizado.' :
                 score >= 60 ? 'Buen progreso, falta poco para optimizar completamente.' :
                 'Tu perfil necesita más información para mejorar la visibilidad.'}
              </p>
            </div>

            {editMode ? (
              <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialization">Especialización</Label>
                  <Textarea
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="Ej: Psicólogo clínico especializado en terapia cognitivo-conductual para el tratamiento de ansiedad y depresión"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">Número de Matrícula</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                      placeholder="Ej: MP 12345"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {auditItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-slate-600">{item.value}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <Button 
                    onClick={() => setEditMode(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
