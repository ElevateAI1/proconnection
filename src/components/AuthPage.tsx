import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmailVerificationNotice } from "./EmailVerificationNotice";

interface AuthPageProps {
  affiliateCode?: string | null;
  registrationOnly?: boolean;
}

export const AuthPage = ({ affiliateCode, registrationOnly = false }: AuthPageProps) => {
  const { signIn, signUp, loading, showEmailVerification, verificationEmail, closeEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(registrationOnly);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient" as "patient" | "psychologist",
    firstName: "",
    lastName: "",
    phone: "",
    licenseNumber: "",
    specialization: "",
    professionalCode: ""
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignUpData({ 
      ...signUpData, 
      [name]: name === 'userType' ? value as "patient" | "psychologist" : value 
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (signUpData.userType === 'patient' && !signUpData.professionalCode) {
      toast({
        title: "Error", 
        description: "El código profesional es requerido para pacientes",
        variant: "destructive"
      });
      return;
    }

    try {
      const metadata = {
        user_type: signUpData.userType,
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        ...(affiliateCode && { affiliate_code: affiliateCode }),
        ...(signUpData.userType === 'psychologist' && {
          license_number: signUpData.licenseNumber,
          specialization: signUpData.specialization
        }),
        ...(signUpData.userType === 'patient' && {
          professional_code: signUpData.professionalCode
        })
      };

      console.log('Attempting sign up with metadata:', metadata);

      const result = await signUp(signUpData.email, signUpData.password, signUpData.userType, metadata);
      
      // La ventana de verificación se maneja automáticamente en useAuth
      // No necesitamos hacer nada más aquí
    } catch (error: any) {
      console.error('Error during sign up:', error);
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

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      console.log('Sign in result:', result);
      
      // Check if there was an error in the result
      if (result.error) {
        console.error('Sign in failed:', result.error);
        // Error handling is now done in the signIn function
        return;
      }
      
      // Check if we have a user and email is confirmed
      if (result.data?.user && result.data.user.email_confirmed_at) {
        console.log('Sign in successful, user:', result.data.user.id);
        navigate("/app");
      } else if (result.data?.user && !result.data.user.email_confirmed_at) {
        console.log('User email not confirmed');
        // Error is already handled in signIn function
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

  if (registrationOnly) {
    return (
      <>
        {showEmailVerification && (
          <EmailVerificationNotice 
            email={verificationEmail} 
            onClose={closeEmailVerification} 
          />
        )}
        
        <Card className="w-full max-w-lg border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Crear Cuenta
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Únete a nuestra plataforma profesional
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-medium">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="María"
                      className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signUpData.firstName}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-medium">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="González"
                      className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signUpData.lastName}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+56912345678"
                    className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                    value={signUpData.phone}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType" className="text-slate-700 font-medium">Tipo de Usuario</Label>
                <select
                  id="userType"
                  name="userType"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                  value={signUpData.userType}
                  onChange={handleSignUpChange}
                >
                  <option value="patient">Paciente</option>
                  <option value="psychologist">Psicólogo</option>
                </select>
              </div>

              {signUpData.userType === "psychologist" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-slate-700 font-medium">Número de Licencia</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="licenseNumber"
                        type="text"
                        name="licenseNumber"
                        placeholder="Ej: 123456"
                        className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        value={signUpData.licenseNumber}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-slate-700 font-medium">Especialización</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="specialization"
                        type="text"
                        name="specialization"
                        placeholder="Ej: Psicología Clínica"
                        className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        value={signUpData.specialization}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {signUpData.userType === "patient" && (
                <div className="space-y-2">
                  <Label htmlFor="professionalCode" className="text-slate-700 font-medium">Código Profesional</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="professionalCode"
                      type="text"
                      name="professionalCode"
                      placeholder="Ingresa el código de tu psicólogo"
                      className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signUpData.professionalCode}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    className="pl-9 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="********"
                    className="pl-9 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg" 
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  ¿Ya tienes cuenta?{" "}
                  <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                    Iniciar sesión
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </>
    );
  }

  // Diseño mejorado para el login normal
  return (
    <>
      {showEmailVerification && (
        <EmailVerificationNotice 
          email={verificationEmail} 
          onClose={closeEmailVerification} 
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {isSignUp ? "Únete a nuestra plataforma profesional" : "Bienvenido de vuelta a PsiConnect"}
            </p>
          </CardHeader>
          <CardContent>
            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      id="email" 
                      type="email" 
                      name="email"
                      placeholder="correo@ejemplo.com" 
                      className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signInData.email}
                      onChange={handleSignInChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="********"
                      className="pl-9 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signInData.password}
                      onChange={handleSignInChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg" 
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                
                <div className="text-center pt-4">
                  <p className="text-sm text-slate-600">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Crear cuenta
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="María"
                        className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        value={signUpData.firstName}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium">Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="lastName"
                        type="text"
                        name="lastName"
                        placeholder="González"
                        className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        value={signUpData.lastName}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signUpData.email}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType" className="text-slate-700 font-medium">Tipo de Usuario</Label>
                  <select
                    id="userType"
                    name="userType"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                    value={signUpData.userType}
                    onChange={handleSignUpChange}
                  >
                    <option value="patient">Paciente</option>
                    <option value="psychologist">Psicólogo</option>
                  </select>
                </div>

                {signUpData.userType === "patient" && (
                  <div className="space-y-2">
                    <Label htmlFor="professionalCode" className="text-slate-700 font-medium">Código Profesional</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="professionalCode"
                        type="text"
                        name="professionalCode"
                        placeholder="Código de tu psicólogo"
                        className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        value={signUpData.professionalCode}
                        onChange={handleSignUpChange}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="********"
                      className="pl-9 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signUpData.password}
                      onChange={handleSignUpChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="********"
                      className="pl-9 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg" 
                  disabled={loading}
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-slate-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Iniciar sesión
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
