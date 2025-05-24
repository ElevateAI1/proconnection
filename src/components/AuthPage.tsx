
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'psychologist' | 'patient'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [professionalCode, setProfessionalCode] = useState('');
  const [codeValidation, setCodeValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    specialization: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const validateCode = async (code: string) => {
    if (!code) {
      setCodeValidation(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('validate_professional_code', { code });
      
      if (error) {
        setCodeValidation({ valid: false, message: 'Error validating code' });
        return;
      }

      if (data) {
        setCodeValidation({ valid: true, message: 'Valid professional code' });
      } else {
        setCodeValidation({ valid: false, message: 'Invalid professional code' });
      }
    } catch (error) {
      setCodeValidation({ valid: false, message: 'Error validating code' });
    }
  };

  const handleCodeChange = (value: string) => {
    setProfessionalCode(value);
    validateCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
      } else {
        // Validate professional code for patients
        if (userType === 'patient' && (!professionalCode || !codeValidation?.valid)) {
          throw new Error('Please enter a valid professional code');
        }

        const additionalData: any = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        };

        if (userType === 'patient') {
          additionalData.professional_code = professionalCode;
          if (formData.age) additionalData.age = parseInt(formData.age);
        } else {
          additionalData.specialization = formData.specialization;
          additionalData.license_number = formData.licenseNumber;
        }

        const { error } = await signUp(formData.email, formData.password, userType, additionalData);
        if (error) throw error;
      }
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
            PsiConnect
          </CardTitle>
          <p className="text-slate-600">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    userType === 'patient'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Paciente
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('psychologist')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    userType === 'psychologist'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Psicólogo
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
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
                      <Label htmlFor="professionalCode">Código del Profesional *</Label>
                      <Input
                        id="professionalCode"
                        value={professionalCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="PSI-ABC123"
                        required
                      />
                      {codeValidation && (
                        <p className={`text-sm ${codeValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                          {codeValidation.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Edad</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
