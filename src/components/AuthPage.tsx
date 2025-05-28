
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

interface AuthPageProps {
  affiliateCode?: string | null;
  registrationOnly?: boolean;
}

export const AuthPage = ({ affiliateCode, registrationOnly = false }: AuthPageProps) => {
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
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
    userType: "patient",
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
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
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
      let metadata: any = {
        user_type: signUpData.userType,
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone
      };

      // Add affiliate code to metadata if present
      if (affiliateCode) {
        metadata.affiliate_code = affiliateCode;
      }

      if (signUpData.userType === 'psychologist') {
        metadata = {
          ...metadata,
          license_number: signUpData.licenseNumber,
          specialization: signUpData.specialization
        };
      } else if (signUpData.userType === 'patient') {
        metadata = {
          ...metadata,
          professional_code: signUpData.professionalCode
        };
      }

      const result = await signUp(signUpData.email, signUpData.password, metadata);
      
      if (result?.user) {
        toast({
          title: "Cuenta creada",
          description: "Tu cuenta ha sido creada exitosamente. Revisa tu email para verificar tu cuenta.",
        });
      }
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

    try {
      await signIn(signInData.email, signInData.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a PsiConnect",
      });
      navigate("/app");
    } catch (error: any) {
      console.error('Error during sign in:', error);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
    }
  };

  if (registrationOnly) {
    return (
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
    );
  }

  // El código original para login/signup normal se mantiene aquí pero simplificado
  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                id="email" 
                type="email" 
                name="email"
                placeholder="correo@ejemplo.com" 
                className="pl-9"
                value={signInData.email}
                onChange={handleSignInChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                className="pl-9"
                value={signInData.password}
                onChange={handleSignInChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
