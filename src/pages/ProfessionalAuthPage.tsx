
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOptimizedProfile } from "@/hooks/useOptimizedProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Stethoscope, Shield, Lock as LockIcon, CheckCircle2, Home, LogOut } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthLoader } from "@/components/ui/AuthLoader";
import { EmailConfirmationScreen } from "@/components/EmailConfirmationScreen";
import { AsYouType } from 'libphonenumber-js';

// Professional categories
const PROFESSIONAL_CATEGORIES = {
  mentalHealth: [
    "Psicólogo/a",
    "Psiquiatra", 
    "Terapeuta",
    "Psicoanalista",
    "Consejero/a",
    "Trabajador/a Social",
    "Terapista Ocupacional",
    "Neuropsicólogo/a"
  ],
  generalHealth: [
    "Dermatólogo/a",
    "Médico General",
    "Enfermero/a",
    "Nutricionista",
    "Fisioterapeuta",
    "Odontólogo/a",
    "Ginecólogo/a",
    "Pediatra"
  ],
  wellness: [
    "Manicurista",
    "Esteticista",
    "Masajista",
    "Peluquero/a",
    "Maquillador/a",
    "Cosmetólogo/a"
  ]
};

export const ProfessionalAuthPage = () => {
  const { signIn, signUp, loading, user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useOptimizedProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);
  
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "psychologist" as "patient" | "psychologist",
    firstName: "",
    lastName: "",
    phone: "",
    licenseNumber: "",
    specialization: "",
    professionalCode: "",
    professionalType: "",
    otherProfessionalType: ""
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

  // Redirect only if user is a professional, otherwise allow switching account
  useEffect(() => {
    if (user && !profileLoading && profile) {
      if (profile.user_type === 'psychologist') {
        console.log('Professional is authenticated, redirecting to dashboard');
        navigate("/dashboard", { replace: true });
      }
      // Si es paciente, no redirigimos - deja que pueda cerrar sesión o cambiar
    }
  }, [user, profile, profileLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Puedes iniciar sesión con otra cuenta",
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !validateEmail(resetEmail)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/professional?type=recovery`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        });
        setShowForgotPassword(false);
        setResetEmail("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar el email",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const formatPhoneInput = (value: string): string => {
    if (!value) return '';
    
    try {
      // Si empieza con + o 54, usar formato internacional
      if (value.startsWith('+') || value.trim().startsWith('54')) {
        const formatterIntl = new AsYouType();
        return formatterIntl.input(value);
      }
      
      // Para números locales argentinos, usar formato nacional
      const formatter = new AsYouType('AR');
      return formatter.input(value);
    } catch (error) {
      // Si hay error, devolver el valor sin formatear (pero limpio)
      return value.replace(/[^\d+\s-()]/g, '');
    }
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'userType') {
      setSignUpData({ 
        ...signUpData, 
        userType: value as "patient" | "psychologist",
        professionalType: "",
        otherProfessionalType: ""
      });
      setShowOtherInput(false);
    } else if (name === 'phone') {
      setSignUpData({ ...signUpData, [name]: formatPhoneInput(value) });
    } else {
      setSignUpData({ 
        ...signUpData, 
        [name]: value 
      });
    }
  };

  const handleUserTypeChange = (value: string) => {
    setSignUpData({ 
      ...signUpData, 
      userType: value as "patient" | "psychologist",
      professionalType: "",
      otherProfessionalType: ""
    });
    setShowOtherInput(false);
  };

  const handleProfessionalTypeChange = (value: string) => {
    setSignUpData({ 
      ...signUpData, 
      professionalType: value,
      otherProfessionalType: ""
    });
    setShowOtherInput(value === "Otros...");
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar email
    if (!validateEmail(signUpData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    // Validar contraseña
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
      const professionalTypeToUse = signUpData.professionalType === "Otros..." 
        ? signUpData.otherProfessionalType 
        : signUpData.professionalType;

      const metadata = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        license_number: signUpData.licenseNumber,
        specialization: signUpData.specialization,
        professional_type: professionalTypeToUse,
        affiliate_code: affiliateCode || null,
        professional_code: signUpData.professionalCode || null
      };

      const result = await signUp(signUpData.email, signUpData.password, 'psychologist', metadata);

      if (result.error) {
        console.error('Sign up failed:', result.error);
        return;
      }

      // Mostrar pantalla de confirmación en vez de toast
      setRegisteredEmail(signUpData.email);
      setShowEmailConfirmation(true);
    } catch (error: any) {
      console.error('Exception during sign up:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la cuenta",
        variant: "destructive"
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Attempting sign in with:', { email: signInData.email });
    setIsSigningIn(true);

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      console.log('Sign in result:', result);
      
      if (result.error) {
        console.error('Sign in failed:', result.error);
        setIsSigningIn(false);
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
        setIsSigningIn(false);
        toast({
          title: "Email no confirmado",
          description: "Por favor confirma tu email antes de iniciar sesión",
          variant: "destructive"
        });
      } else {
        console.error('No user data received');
        setIsSigningIn(false);
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Exception during sign in:', error);
      setIsSigningIn(false);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
    }
  };

  // Mostrar pantalla de confirmación de email si el registro fue exitoso
  if (showEmailConfirmation) {
    return (
      <EmailConfirmationScreen 
        email={registeredEmail}
        userType="professional"
        onBackToLogin={() => {
          setShowEmailConfirmation(false);
          setIsSignUp(false);
          // Limpiar el formulario
          setSignUpData({
            email: "",
            password: "",
            confirmPassword: "",
            userType: "psychologist" as "patient" | "psychologist",
            firstName: "",
            lastName: "",
            phone: "",
            licenseNumber: "",
            specialization: "",
            professionalCode: "",
            professionalType: "",
            otherProfessionalType: ""
          });
        }}
        onEmailChange={(newEmail) => {
          setRegisteredEmail(newEmail);
        }}
      />
    );
  }

  return (
    <>
      {isSigningIn && <AuthLoader message="Iniciando sesión..." />}
      <div 
        ref={authRef}
        className="min-h-screen bg-white-warm flex items-center justify-center p-4"
      >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
        {/* Left: Illustration with floating UI cards */}
        <div className={`hidden lg:flex flex-col items-center justify-center space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Floating UI cards illustration */}
          <div className="relative w-full max-w-md">
            {/* Main security card */}
            <div className="relative bg-white-warm border-4 border-blue-petrol/30 rounded-2xl p-6 shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)] transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-mint/30 rounded-full flex items-center justify-center border-2 border-green-mint">
                  <Shield className="w-6 h-6 text-blue-petrol" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-blue-petrol">Seguridad</h3>
                  <p className="font-sans-geometric text-sm text-blue-petrol/70">Datos encriptados</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-mint" />
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">Encriptación end-to-end</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-mint" />
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">Cumplimiento HIPAA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-mint" />
                  <span className="font-sans-geometric text-sm text-blue-petrol/80">Privacidad garantizada</span>
                </div>
              </div>
            </div>

            {/* Floating privacy card */}
            <div className="absolute -top-8 -right-8 bg-white-warm border-4 border-lavender-soft/50 rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(201,194,230,0.2)] transform hover:rotate-2 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <LockIcon className="w-5 h-5 text-blue-petrol" />
                <span className="font-sans-geometric text-sm font-bold text-blue-petrol">Privacidad</span>
              </div>
            </div>

            {/* Floating trust card */}
            <div className="absolute -bottom-6 -left-6 bg-white-warm border-4 border-blue-soft/50 rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(108,175,240,0.2)] transform hover:rotate-[-2deg] transition-transform duration-300">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-petrol" />
                <span className="font-sans-geometric text-sm font-bold text-blue-petrol">Confianza</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-4 py-2 bg-green-mint/20 border-2 border-green-mint rounded-lg">
              <span className="font-sans-geometric text-sm font-bold text-blue-petrol">✓ Confiable</span>
            </div>
            <div className="px-4 py-2 bg-blue-soft/20 border-2 border-blue-soft rounded-lg">
              <span className="font-sans-geometric text-sm font-bold text-blue-petrol">🔒 Seguro</span>
            </div>
            <div className="px-4 py-2 bg-lavender-soft/20 border-2 border-lavender-soft rounded-lg">
              <span className="font-sans-geometric text-sm font-bold text-blue-petrol">🛡️ Protegido</span>
            </div>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className={`w-full max-w-md mx-auto ${isVisible ? 'animate-card-enter' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <div className="bg-white-warm border-4 border-blue-petrol/30 rounded-2xl p-8 sm:p-10 shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-between items-center mb-2">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-petrol/60 hover:text-blue-petrol hover:bg-blue-petrol/5"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    <span className="text-sm">Volver al inicio</span>
                  </Button>
                </Link>
                {user && profile && profile.user_type !== 'psychologist' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-blue-petrol/60 hover:text-blue-petrol border-blue-petrol/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="text-sm">Cerrar sesión</span>
                  </Button>
                )}
              </div>
              {user && profile && profile.user_type !== 'psychologist' && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800 font-sans-geometric">
                    Tienes una sesión activa como {profile.user_type === 'patient' ? 'paciente' : 'admin'}. 
                    Cierra sesión para iniciar como profesional.
                  </p>
                </div>
              )}
              {/* Diferenciador visual: Badge de Profesional */}
              <div className="flex items-center justify-center mb-4">
                <div className="inline-flex items-center gap-2 bg-blue-petrol/10 border-2 border-blue-petrol/30 rounded-full px-4 py-2">
                  <Stethoscope className="w-5 h-5 text-blue-petrol" />
                  <span className="font-sans-geometric font-bold text-sm text-blue-petrol">Área Profesional</span>
                </div>
              </div>
              <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-blue-petrol mb-3">
                {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
              </h1>
              <p className="font-sans-geometric text-lg text-blue-petrol/70">
                {isSignUp ? "Únete a ProConnection" : "Bienvenido de vuelta"}
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
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                      value={signInData.email}
                      onChange={handleSignInChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="font-sans-geometric font-semibold text-blue-petrol">Contraseña</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-sans-geometric text-blue-petrol/70 hover:text-blue-petrol hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="********"
                      className="pl-12 pr-12 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
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
                  className="w-full bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-petrol/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white-warm text-blue-petrol/60 font-sans-geometric">O</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-blue-petrol/30 text-blue-petrol hover:bg-blue-petrol/5 font-sans-geometric font-semibold py-6 rounded-lg transition-all duration-200"
                  disabled
                >
                  Acceder con otro método (Próximamente)
                </Button>
                
                <div className="text-center pt-4">
                  <p className="font-sans-geometric text-sm text-blue-petrol/70">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="font-bold text-blue-petrol hover:text-blue-soft transition-colors"
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
                        className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
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
                        className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                        value={signUpData.lastName}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
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
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.email}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-sans-geometric font-semibold text-blue-petrol">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+54 11 12345-6789"
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.phone}
                      onChange={handleSignUpChange}
                      maxLength={18}
                    />
                  </div>
                  <p className="text-xs text-blue-petrol/60 font-sans-geometric">
                    Formato: +54 11 12345-6789
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalType" className="font-sans-geometric font-semibold text-blue-petrol">Tipo de Profesional</Label>
                  <Select onValueChange={handleProfessionalTypeChange} value={signUpData.professionalType}>
                    <SelectTrigger className="w-full border-4 border-blue-petrol/20 rounded-lg py-3 font-sans-geometric text-blue-petrol focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20">
                      <SelectValue placeholder="Selecciona tu profesión" />
                    </SelectTrigger>
                    <SelectContent className="bg-white-warm border-4 border-blue-petrol/20 shadow-xl">
                      <div className="px-2 py-1 text-xs font-bold text-blue-petrol/60 uppercase font-sans-geometric">Salud Mental</div>
                      {PROFESSIONAL_CATEGORIES.mentalHealth.map(type => (
                        <SelectItem key={type} value={type} className="font-sans-geometric">{type}</SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-bold text-blue-petrol/60 uppercase font-sans-geometric">Salud General</div>
                      {PROFESSIONAL_CATEGORIES.generalHealth.map(type => (
                        <SelectItem key={type} value={type} className="font-sans-geometric">{type}</SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-bold text-blue-petrol/60 uppercase font-sans-geometric">Bienestar y Belleza</div>
                      {PROFESSIONAL_CATEGORIES.wellness.map(type => (
                        <SelectItem key={type} value={type} className="font-sans-geometric">{type}</SelectItem>
                      ))}
                      <SelectItem value="Otros..." className="font-sans-geometric">Otros...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showOtherInput && (
                  <div className="space-y-2 animate-fade-in-up">
                    <Label htmlFor="otherProfessionalType" className="font-sans-geometric font-semibold text-blue-petrol">Especifica tu profesión</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                      <Input
                        id="otherProfessionalType"
                        type="text"
                        name="otherProfessionalType"
                        placeholder="Ej: Coach de vida, Contador, etc."
                        className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                        value={signUpData.otherProfessionalType}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="font-sans-geometric font-semibold text-blue-petrol">Número de Licencia</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="licenseNumber"
                      type="text"
                      name="licenseNumber"
                      placeholder="Ej: 123456"
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.licenseNumber}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="font-sans-geometric font-semibold text-blue-petrol">Especialización</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="specialization"
                      type="text"
                      name="specialization"
                      placeholder="Ej: Psicología Clínica"
                      className="pl-12 pr-4 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
                      value={signUpData.specialization}
                      onChange={handleSignUpChange}
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
                      placeholder="Mínimo 6 caracteres"
                      className="pl-12 pr-12 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
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
                  <Label htmlFor="confirmPassword" className="font-sans-geometric font-semibold text-blue-petrol">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-petrol/50" size={18} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirma tu contraseña"
                      className="pl-12 pr-12 py-3 border-4 border-blue-petrol/20 rounded-lg focus:border-blue-soft focus:ring-4 focus:ring-blue-soft/20 font-sans-geometric text-blue-petrol"
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

                <Button 
                  type="submit" 
                  className="w-full bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200" 
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
                      className="font-bold text-blue-petrol hover:text-blue-soft transition-colors"
                    >
                      Iniciar sesión
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white-warm border-4 border-blue-petrol/30 rounded-2xl p-6 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)]">
                  <h2 className="font-serif-display text-2xl font-bold text-blue-petrol mb-4">Recuperar Contraseña</h2>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="font-sans-geometric font-semibold text-blue-petrol">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="border-4 border-blue-petrol/20 rounded-lg py-3 font-sans-geometric"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmail("");
                        }}
                        className="flex-1 border-2 border-blue-petrol/30 text-blue-petrol"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 bg-blue-petrol text-white-warm border-4 border-blue-petrol"
                      >
                        {resetLoading ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
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
    </>
  );
};

