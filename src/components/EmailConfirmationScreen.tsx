import { useState, useEffect, useRef } from "react";
import { Mail, Home, LogIn, CheckCircle2, RefreshCw, Edit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EmailConfirmationScreenProps {
  email: string;
  userType?: "patient" | "professional";
  onBackToLogin?: () => void;
  onEmailChange?: (newEmail: string) => void;
}

export const EmailConfirmationScreen = ({ 
  email, 
  userType = "patient",
  onBackToLogin,
  onEmailChange
}: EmailConfirmationScreenProps) => {
  const navigate = useNavigate();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenEmail = () => {
    // Intentar abrir el cliente de email del usuario
    window.location.href = `mailto:${email}`;
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      const loginPath = userType === "patient" ? "/auth/patient" : "/auth/professional";
      navigate(loginPath);
    }
  };

  // Cooldown timer para reenvío
  useEffect(() => {
    if (cooldownTime > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldownTime]);

  const handleResendEmail = async () => {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (lastResendTime && (now - lastResendTime) < thirtyMinutes) {
      const remainingTime = Math.ceil((thirtyMinutes - (now - lastResendTime)) / 1000 / 60);
      toast({
        title: "Espera un momento",
        description: `Debes esperar ${remainingTime} minuto(s) antes de reenviar el email`,
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      // Intentar obtener el usuario actual (no verificado)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        // Reenviar email de verificación usando Supabase
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/app`
          }
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setLastResendTime(now);
          setCooldownTime(30 * 60); // 30 minutos en segundos
          toast({
            title: "Email reenviado",
            description: "Se ha reenviado el email de verificación a tu correo",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo reenviar el email. Intenta iniciar sesión o crear una nueva cuenta.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al reenviar el email",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    if (newEmail === email) {
      toast({
        title: "Error",
        description: "El nuevo email debe ser diferente al actual",
        variant: "destructive"
      });
      return;
    }

    setIsChangingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        // Actualizar el email del usuario
        const { error: updateError } = await supabase.auth.updateUser({
          email: newEmail
        });

        if (updateError) {
          toast({
            title: "Error",
            description: updateError.message,
            variant: "destructive"
          });
        } else {
          // Reenviar email de verificación al nuevo correo
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: newEmail,
            options: {
              emailRedirectTo: `${window.location.origin}/app`
            }
          });

          if (resendError) {
            toast({
              title: "Email actualizado",
              description: "Se actualizó el email pero hubo un error al reenviar. Intenta iniciar sesión.",
            });
          } else {
            toast({
              title: "Email actualizado",
              description: `El email se actualizó a ${newEmail}. Se envió un nuevo email de verificación.`,
            });
          }
          
          if (onEmailChange) {
            onEmailChange(newEmail);
          }
          setShowChangeEmail(false);
          setNewEmail("");
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el email. La cuenta ya está verificada o no existe.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al cambiar el email",
        variant: "destructive"
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white-warm flex items-center justify-center p-4">
      {/* Partículas flotantes de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blue particles */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-petrol/20 rounded-full animate-float-1"></div>
        <div className="absolute top-40 left-1/4 w-6 h-6 bg-blue-soft/30 rounded-full animate-float-2"></div>
        <div className="absolute top-60 left-1/3 w-3 h-3 bg-blue-petrol/25 rounded-full animate-float-3"></div>
        <div className="absolute top-32 right-20 w-5 h-5 bg-blue-soft/25 rounded-full animate-float-4"></div>
        
        {/* Green/Mint particles */}
        <div className="absolute top-28 left-1/5 w-5 h-5 bg-green-mint/30 rounded-full animate-float-2"></div>
        <div className="absolute top-48 left-2/5 w-4 h-4 bg-green-mint/25 rounded-full animate-float-3"></div>
        <div className="absolute top-68 left-3/5 w-6 h-6 bg-green-mint/30 rounded-full animate-float-4"></div>
        
        {/* Lavender particles */}
        <div className="absolute top-24 left-1/6 w-4 h-4 bg-lavender-soft/30 rounded-full animate-float-3"></div>
        <div className="absolute top-44 left-2/6 w-5 h-5 bg-lavender-soft/25 rounded-full animate-float-4"></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white-warm border-4 border-lavender-soft/50 rounded-2xl p-10 sm:p-12 shadow-[12px_12px_0px_0px_rgba(201,194,230,0.15)]">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-mint/30 rounded-full flex items-center justify-center border-4 border-green-mint">
              <CheckCircle2 className="w-12 h-12 text-blue-petrol" />
            </div>
          </div>

          {/* Título */}
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-blue-petrol text-center mb-4">
            ¡Email Enviado!
          </h1>

          {/* Mensaje principal */}
          <div className="text-center mb-8 space-y-4">
            <p className="font-sans-geometric text-lg text-blue-petrol/80">
              Hemos enviado un email de verificación a:
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <p className="font-sans-geometric text-xl font-semibold text-blue-petrol break-all">
                {email}
              </p>
              {!showChangeEmail && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChangeEmail(true)}
                  className="text-blue-petrol/70 hover:text-blue-petrol"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Cambiar
                </Button>
              )}
            </div>
            {showChangeEmail && (
              <form onSubmit={handleChangeEmail} className="max-w-md mx-auto space-y-4 p-4 bg-blue-petrol/5 rounded-lg border-2 border-blue-petrol/20">
                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="font-sans-geometric font-semibold text-blue-petrol">Nuevo correo electrónico</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="nuevo@correo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="border-4 border-blue-petrol/20 rounded-lg font-sans-geometric"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowChangeEmail(false);
                      setNewEmail("");
                    }}
                    className="flex-1 border-2 border-blue-petrol/30 text-blue-petrol"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isChangingEmail}
                    className="flex-1 bg-blue-petrol text-white-warm border-4 border-blue-petrol"
                  >
                    {isChangingEmail ? "Actualizando..." : "Actualizar"}
                  </Button>
                </div>
              </form>
            )}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-sans-geometric text-sm font-semibold text-amber-800 mb-1">
                    ¿No encuentras el email?
                  </p>
                  <p className="font-sans-geometric text-sm text-amber-700">
                    Revisa tu carpeta de <strong>spam o correo no deseado</strong>. El email puede tardar unos minutos en llegar.
                  </p>
                </div>
              </div>
            </div>
            <p className="font-sans-geometric text-base text-blue-petrol/70 mt-4">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button
              onClick={handleOpenEmail}
              className="bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(62,95,120,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(62,95,120,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 px-8 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Abrir mi Email
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={cooldownTime > 0 || isResending}
              variant="outline"
              className="bg-white-warm text-blue-petrol border-4 border-blue-petrol/30 shadow-[6px_6px_0px_0px_rgba(62,95,120,0.2)] hover:shadow-[3px_3px_0px_0px_rgba(62,95,120,0.2)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isResending ? 'animate-spin' : ''}`} />
              {cooldownTime > 0 ? `Reenviar (${formatTime(cooldownTime)})` : isResending ? "Reenviando..." : "Reenviar Email"}
            </Button>

            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="bg-white-warm text-blue-petrol border-4 border-lavender-soft shadow-[6px_6px_0px_0px_rgba(201,194,230,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(201,194,230,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 px-8 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Volver al Login
            </Button>

            <Link to="/">
              <Button
                variant="outline"
                className="bg-white-warm text-blue-petrol border-4 border-lavender-soft shadow-[6px_6px_0px_0px_rgba(201,194,230,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(201,194,230,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 w-full sm:w-auto"
              >
                <Home className="w-5 h-5" />
                Volver al Home
              </Button>
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t-2 border-blue-petrol/10">
            <p className="font-sans-geometric text-xs text-blue-petrol/60 text-center">
              💡 El enlace de verificación expira en 24 horas. Si no recibes el email, verifica que la dirección sea correcta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

