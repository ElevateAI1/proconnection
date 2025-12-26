import { Mail, Home, LogIn, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface EmailConfirmationScreenProps {
  email: string;
  userType?: "patient" | "professional";
  onBackToLogin?: () => void;
}

export const EmailConfirmationScreen = ({ 
  email, 
  userType = "patient",
  onBackToLogin 
}: EmailConfirmationScreenProps) => {
  const navigate = useNavigate();

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
            <p className="font-sans-geometric text-xl font-semibold text-blue-petrol break-all">
              {email}
            </p>
            <p className="font-sans-geometric text-base text-blue-petrol/70 mt-6">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
            </p>
            <p className="font-sans-geometric text-sm text-blue-petrol/60 mt-4">
              Si no encuentras el email, revisa también tu carpeta de spam o correo no deseado.
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

