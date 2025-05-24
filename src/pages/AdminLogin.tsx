
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    console.log('Auth state check:', { user: !!user, isAdmin, adminLoading });
    
    // Only redirect if we have a user, they are confirmed as admin, and admin loading is complete
    if (user && isAdmin === true && !adminLoading) {
      console.log('User is already admin, redirecting to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting login process...');
    
    // Reset previous errors
    setError('');
    
    // Validate form data
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with email:', formData.email);
      
      // First, sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        
        // Handle specific error cases
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Por favor confirma tu email antes de iniciar sesión.');
        } else if (authError.message.includes('Too many requests')) {
          throw new Error('Demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente.');
        } else {
          throw new Error(authError.message);
        }
      }

      if (!authData.user) {
        console.error('No user data returned');
        throw new Error('Error de autenticación');
      }

      console.log('User authenticated successfully:', authData.user.id);
      
      // Check if user is admin
      console.log('Checking admin status for user:', authData.user.id);
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      console.log('Admin check result:', { adminData, adminError });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        await supabase.auth.signOut();
        throw new Error('Error verificando permisos de administrador');
      }

      if (!adminData) {
        console.log('User is not an admin, signing out');
        await supabase.auth.signOut();
        throw new Error('No tienes permisos de administrador');
      }

      console.log('Admin verification successful, showing success message');
      toast({
        title: "Acceso exitoso",
        description: "Bienvenido al panel de administración",
      });

      // Navigate to dashboard
      console.log('Navigating to dashboard...');
      navigate('/admin/dashboard', { replace: true });

    } catch (error: any) {
      console.error('Login process error:', error);
      setError(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setCreateError('');
    
    // Validate form data
    if (!createFormData.email || !createFormData.password || !createFormData.confirmPassword) {
      setCreateError('Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(createFormData.email)) {
      setCreateError('Por favor ingresa un email válido');
      return;
    }

    if (createFormData.password.length < 6) {
      setCreateError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (createFormData.password !== createFormData.confirmPassword) {
      setCreateError('Las contraseñas no coinciden');
      return;
    }

    setCreateLoading(true);

    try {
      // Sign up the admin user with admin-specific metadata
      const { data, error } = await supabase.auth.signUp({
        email: createFormData.email,
        password: createFormData.password,
        options: {
          data: {
            user_type: 'admin'
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Ya existe una cuenta con este email');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        } else {
          throw error;
        }
      }

      if (data.user) {
        // Add to admins table
        const { error: adminError } = await supabase
          .from('admins')
          .insert({ id: data.user.id });

        if (adminError) {
          console.error('Error adding to admins table:', adminError);
          throw new Error('Error al crear la cuenta de administrador');
        }

        toast({
          title: "Cuenta de administrador creada",
          description: `Se ha creado la cuenta para ${createFormData.email}`,
        });

        // Reset form
        setCreateFormData({
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Create admin error:', error);
      setCreateError(error.message || 'Error al crear la cuenta de administrador');
    } finally {
      setCreateLoading(false);
    }
  };

  // Don't render if user is already an admin (to prevent flash)
  if (user && isAdmin === true && !adminLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Panel de Administración
          </CardTitle>
          <p className="text-gray-600">
            Acceso y gestión de administradores
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Crear Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Administrador</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="admin@psiconnect.com"
                    disabled={loading}
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
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Verificando...' : 'Acceder'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="createEmail">Email del Nuevo Administrador</Label>
                  <Input
                    id="createEmail"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    required
                    placeholder="nuevo-admin@psiconnect.com"
                    disabled={createLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createPassword">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="createPassword"
                      type={showCreatePassword ? 'text' : 'password'}
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      disabled={createLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      disabled={createLoading}
                    >
                      {showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={createFormData.confirmPassword}
                    onChange={(e) => setCreateFormData({ ...createFormData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Repetir contraseña"
                    disabled={createLoading}
                  />
                </div>

                {createError && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                    {createError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creando cuenta...' : 'Crear Administrador'}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Solo para personal autorizado</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Acceso restringido al personal autorizado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
