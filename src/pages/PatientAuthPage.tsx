
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Heart, Stethoscope, Shield, Lock as LockIcon, CheckCircle2, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createTestPatient } from "@/utils/debugPatient";

export const PatientAuthPage = () => {
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);
  
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    professionalCode: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (authRef.current) {
      observer.observe(authRef.current);
    }

    return () => {
      if (authRef.current) {
        observer.unobserve(authRef.current);
      }
    };
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Attempting sign in with:', { email: signInData.email });

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      console.log('Sign in result:', result);
      
      if (result.error) {
        console.error('Sign in failed:', result.error);
        return;
      }
      
      if (result.data?.user && result.data.user.email_confirmed_at) {
        console.log('Sign in successful, user:', result.data.user.id);
        toast({
          title: "¡Bienvenido!",
          description: "Inicio de sesión exitoso",
        });
        navigate("/dashboard", { replace: true });
      } else if (result.data?.user && !result.data.user.email_confirmed_at) {
        console.log('User email not confirmed');
        toast({
          title: "Email no confirmado",
          description: "Por favor confirma tu email antes de iniciar sesión",
          variant: "destructive"
        });
      } else {
        console.error('No user data received');
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Exception during sign in:', error);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(signUpData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    try {
      const metadata = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        professional_code: signUpData.professionalCode
      };

      const result = await signUp(signUpData.email, signUpData.password, 'patient', metadata);

      if (result.error) {
        console.error('Sign up failed:', result.error);
        return;
      }

      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu email para confirmar tu cuenta",
      });
    } catch (error: any) {
      console.error('Exception during sign up:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la cuenta",
        variant: "destructive"
      });
    }
  };

  const handleTestPatient = async () => {
    try {
      await createTestPatient();
      toast({
        title: "¡Usuario de prueba creado!",
        description: "Iniciando sesión...",
      });
      
      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
      
    } catch (error: any) {
      console.error('Error creating test patient:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear usuario de prueba",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      ref={authRef}
      className="min-h-screen bg-white-warm flex items-center justify-center p-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
        {/* Left: Illustration with floating UI cards */}
        <div className={`hidden lg:flex flex-col items-center justify-center space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Floating UI cards illustration */}
          <div className="relative w-full max-w-md">
            {/* Main privacy card */}
            <div className="relative bg-white-warm border-4 border-lavender-soft/50 rounded-2xl p-6 shadow-[12px_12px_0px_0px_rgba(201,194,230,0.15)] transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-peach-pale/30 rounded-full flex items-center justify-center border-2 border-peach-pale">
                  <Heart className="w-6 h-6 text-blue-petrol" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-blue-petrol">Privacidad</h3>
                  <p className="font-sans-geometric text-sm text-blue-petrol/70">Tu información protegida</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-mint" />
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">Confidencialidad total</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-mint" />
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">Datos seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-mint" />
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">Solo tú y tu profesional</span>
                </div>
              </div>
            </div>

            {/* Floating security card */}
            <div className="absolute -top-8 -right-8 bg-white-warm border-4 border-blue-soft/50 rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(108,175,240,0.2)] transform hover:rotate-2 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-petrol" />
                <span className="font-sans-geometric text-sm font-bold text-blue-petrol">Seguro</span>
              </div>
            </div>

            {/* Floating trust card */}
            <div className="absolute -bottom-6 -left-6 bg-white-warm border-4 border-green-mint/50 rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(185,228,201,0.2)] transform hover:rotate-[-2deg] transition-transform duration-300">
              <div className="flex items-center gap-3">
                <LockIcon className="w-5 h-5 text-blue-petrol" />
                <span className="font-sans-geometric text-sm font-bold text-blue-petrol">Protegido</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-4 py-2 bg-peach-pale/30 border-2 border-peach-pale rounded-lg">
              <span className="font-sans-geometric text-sm font-bold text-blue-petrol">💜 Confidencial</span>
            </div>
            <div className="px-4 py-2 bg-lavender-soft/30 border-2 border-lavender-soft rounded-lg">
              <span className="font-sans-geometric text-sm font-bold text-blue-petrol">🔒 Privado</span>
            </div>
            <div className="px-4 py-2 bg-green-mint/30 border-2 border-green-mint rounded-lg">
              <span className="font-sans-geometric text-sm font-bold text-blue-petrol">🛡️ Seguro</span>
            </div>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className={`w-full max-w-md mx-auto ${isVisible ? 'animate-card-enter' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <div className="bg-white-warm border-4 border-lavender-soft/50 rounded-2xl p-8 sm:p-10 shadow-[12px_12px_0px_0px_rgba(201,194,230,0.15)]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-end mb-2">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-petrol/60 hover:text-blue-petrol hover:bg-lavender-soft/10"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    <span className="text-sm">Volver al inicio</span>
                  </Button>
                </Link>
              </div>
              {/* Diferenciador visual: Badge de Paciente */}
              <div className="flex items-center justify-center mb-4">
                <div className="inline-flex items-center gap-2 bg-lavender-soft/30 border-2 border-lavender-soft rounded-full px-4 py-2">
                  <Heart className="w-5 h-5 text-blue-petrol" />
                  <span className="font-sans-geometric font-bold text-sm text-blue-petrol">Área Paciente</span>
                </div>
              </div>
              <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-blue-petrol mb-3">
                {isSignUp ? "Registro de Paciente" : "Iniciar Sesión"}
              </h1>
              <p className="font-sans-geometric text-lg text-blue-petrol/70">
                {isSignUp ? "Crea tu cuenta de paciente" : "Bienvenido de vuelta"}
              </p>
            </div>

            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-sans-geometric font-semibold text-blue-petrol">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input 
                      id="email" 
                      type="email" 
                      name="email"
                      placeholder="correo@ejemplo.com" 
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                      value={signInData.email}
                      onChange={handleSignInChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-sans-geometric font-semibold text-blue-petrol">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="********"
                      className="pl-12 pr-12 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                      value={signInData.password}
                      onChange={handleSignInChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-petrol/50 hover:text-blue-petrol hover:bg-transparent"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-lavender-soft text-blue-petrol border-4 border-lavender-soft shadow-[6px_6px_0px_0px_rgba(201,194,230,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(201,194,230,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleTestPatient}
                  className="w-full bg-white-warm text-blue-petrol border-4 border-peach-pale/50 shadow-[6px_6px_0px_0px_rgba(247,210,196,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(247,210,196,0.3)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200 mt-3"
                  disabled={loading}
                >
                  🧪 Probar como Paciente
                </Button>

                <div className="text-center pt-4">
                  <p className="font-sans-geometric text-sm text-blue-petrol/70">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="font-bold text-blue-petrol hover:text-lavender-soft transition-colors"
                    >
                      Crear cuenta
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-sans-geometric font-semibold text-blue-petrol">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                      <Input
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="María"
                        className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                        value={signUpData.firstName}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-sans-geometric font-semibold text-blue-petrol">Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                      <Input
                        id="lastName"
                        type="text"
                        name="lastName"
                        placeholder="González"
                        className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                        value={signUpData.lastName}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-sans-geometric font-semibold text-blue-petrol">Teléfono</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+54 11 1234-5678"
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.phone}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-sans-geometric font-semibold text-blue-petrol">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input 
                      id="email" 
                      type="email" 
                      name="email"
                      placeholder="correo@ejemplo.com" 
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.email}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalCode" className="font-sans-geometric font-semibold text-blue-petrol">Código de Profesional</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="professionalCode"
                      type="text"
                      name="professionalCode"
                      placeholder="Ingresa el código de tu profesional"
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.professionalCode}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-sans-geometric font-semibold text-blue-petrol">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mínimo 6 caracteres"
                        className="pl-12 pr-12 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-petrol/50 hover:text-blue-petrol hover:bg-transparent"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-sans-geometric font-semibold text-blue-petrol">Confirmar</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirma tu contraseña"
                        className="pl-12 pr-12 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-lavender-soft focus:ring-4 focus:ring-lavender-soft/20 font-sans-geometric text-blue-petrol"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-petrol/50 hover:text-blue-petrol hover:bg-transparent"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-lavender-soft text-blue-petrol border-4 border-lavender-soft shadow-[6px_6px_0px_0px_rgba(201,194,230,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(201,194,230,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>

                <div className="text-center pt-4">
                  <p className="font-sans-geometric text-sm text-blue-petrol/70">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="font-bold text-blue-petrol hover:text-lavender-soft transition-colors"
                    >
                      Iniciar sesión
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Privacy notice */}
            <div className="mt-6 pt-6 border-t-2 border-blue-petrol/10">
              <p className="font-sans-geometric text-xs text-blue-petrol/60 text-center">
                🔒 Tus datos están protegidos con encriptación de nivel bancario
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

