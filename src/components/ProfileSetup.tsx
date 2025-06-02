
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  userType: 'psychologist' | 'patient';
  onComplete: () => void;
}

export const ProfileSetup = ({ userType, onComplete }: ProfileSetupProps) => {
  const { createPatientProfile, forceRefresh } = useProfile();
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
    console.log('ProfileSetup mounted for:', userType);
    if (userType === 'patient') {
      const getSignupData = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          console.log('User metadata:', user?.user_metadata);
          if (user?.user_metadata?.professional_code) {
            setProfessionalCode(user.user_metadata.professional_code);
            validateAndSetPsychologist(user.user_metadata.professional_code);
          }
        } catch (error) {
          console.error('Error getting signup data:', error);
        }
      };
      getSignupData();
    }
  }, [userType]);

  const validateAndSetPsychologist = async (code: string) => {
    try {
      console.log('Validating professional code for patient setup:', code);
      const { data } = await supabase.rpc('validate_professional_code', { code });
      console.log('Validation result:', data);
      if (data) {
        setPsychologistId(data);
        console.log('Psychologist ID set:', data);
      } else {
        console.warn('Invalid professional code:', code);
      }
    } catch (error) {
      console.error('Error validating code:', error);
    }
  };

  const updatePsychologistProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Updating psychologist profile for user:', user.id);
      console.log('Update data:', formData);

      const { data: result, error: updateError } = await supabase
        .from('psychologists')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          specialization: formData.specialization || null,
          license_number: formData.licenseNumber || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating psychologist profile:', updateError);
        throw new Error(`Error al actualizar perfil: ${updateError.message}`);
      }

      console.log('Psychologist profile updated successfully:', result);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil de psicólogo ha sido actualizado exitosamente",
      });

      return { data: result, error: null };
    } catch (error: any) {
      console.error('Exception updating psychologist profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('=== PROFILE SETUP SUBMIT START ===');
    console.log('User type:', userType);
    console.log('Form data:', formData);

    try {
      if (userType === 'psychologist') {
        console.log('Updating psychologist profile');
        await updatePsychologistProfile();
      } else {
        if (!psychologistId) {
          throw new Error('Invalid professional code - no psychologist ID found');
        }

        console.log('Creating patient profile with psychologist ID:', psychologistId);
        const result = await createPatientProfile({
          first_name: formData.firstName,
          last_name: formData.lastName,
          psychologist_id: psychologistId,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : undefined,
          notes: formData.notes
        });

        console.log('Patient profile creation result:', result);
        if (result.error) {
          throw new Error(result.error);
        }
      }

      console.log('=== PROFILE SETUP COMPLETED SUCCESSFULLY ===');
      
      // Simplified completion - just force refresh and complete
      forceRefresh();
      
      // Immediate completion with minimal delay
      setTimeout(() => {
        console.log('Calling onComplete');
        onComplete();
      }, 200);
      
    } catch (error: any) {
      console.error('Profile setup error:', error);
      setError(error.message || 'An error occurred while setting up your profile');
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
                    min="1"
                    max="120"
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

                {professionalCode && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Código del profesional:</strong> {professionalCode}
                    </p>
                    {psychologistId && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Código validado correctamente
                      </p>
                    )}
                  </div>
                )}
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
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
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
