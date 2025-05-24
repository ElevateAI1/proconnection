
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSetupProps {
  userType: 'psychologist' | 'patient';
  onComplete: () => void;
}

export const ProfileSetup = ({ userType, onComplete }: ProfileSetupProps) => {
  const { createPsychologistProfile, createPatientProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [professionalCode, setProfessionalCode] = useState('');
  const [psychologistId, setPsychologistId] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    specialization: '',
    licenseNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (userType === 'patient') {
      // Get professional code from signup metadata if available
      const getSignupData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.professional_code) {
          setProfessionalCode(user.user_metadata.professional_code);
          validateAndSetPsychologist(user.user_metadata.professional_code);
        }
      };
      getSignupData();
    }
  }, [userType]);

  const validateAndSetPsychologist = async (code: string) => {
    try {
      const { data } = await supabase.rpc('validate_professional_code', { code });
      if (data) {
        setPsychologistId(data);
      }
    } catch (error) {
      console.error('Error validating code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userType === 'psychologist') {
        const { error } = await createPsychologistProfile({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          specialization: formData.specialization,
          license_number: formData.licenseNumber
        });

        if (error) throw new Error(error);
      } else {
        if (!psychologistId) {
          throw new Error('Invalid professional code');
        }

        const { error } = await createPatientProfile({
          first_name: formData.firstName,
          last_name: formData.lastName,
          psychologist_id: psychologistId,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : undefined,
          notes: formData.notes
        });

        if (error) throw new Error(error);
      }

      onComplete();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Completa tu Perfil
          </CardTitle>
          <p className="text-slate-600">
            {userType === 'psychologist' 
              ? 'Configuración del perfil profesional' 
              : 'Información del paciente'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {userType === 'patient' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información relevante para el tratamiento"
                  />
                </div>
              </>
            )}

            {userType === 'psychologist' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Especialización</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Psicología Clínica"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Número de Licencia</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Completar Perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
