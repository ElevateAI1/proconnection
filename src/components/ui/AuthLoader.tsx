import { Loader2, Sparkles } from "lucide-react";

interface AuthLoaderProps {
  message?: string;
}

export const AuthLoader = ({ message = "Iniciando sesión..." }: AuthLoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white-warm/95 backdrop-blur-sm">
      {/* Partículas flotantes de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blue particles */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-petrol/20 rounded-full animate-float-1"></div>
        <div className="absolute top-40 left-1/4 w-6 h-6 bg-blue-soft/30 rounded-full animate-float-2"></div>
        <div className="absolute top-60 left-1/3 w-3 h-3 bg-blue-petrol/25 rounded-full animate-float-3"></div>
        <div className="absolute top-32 right-20 w-5 h-5 bg-blue-soft/25 rounded-full animate-float-4"></div>
        <div className="absolute top-52 right-1/4 w-4 h-4 bg-blue-petrol/20 rounded-full animate-float-5"></div>
        <div className="absolute top-72 right-1/3 w-6 h-6 bg-blue-soft/30 rounded-full animate-float-6"></div>
        
        {/* Green/Mint particles */}
        <div className="absolute top-28 left-1/5 w-5 h-5 bg-green-mint/30 rounded-full animate-float-2"></div>
        <div className="absolute top-48 left-2/5 w-4 h-4 bg-green-mint/25 rounded-full animate-float-3"></div>
        <div className="absolute top-68 left-3/5 w-6 h-6 bg-green-mint/30 rounded-full animate-float-4"></div>
        <div className="absolute top-36 right-1/5 w-4 h-4 bg-green-mint/25 rounded-full animate-float-5"></div>
        <div className="absolute top-56 right-2/5 w-5 h-5 bg-green-mint/30 rounded-full animate-float-6"></div>
        
        {/* Lavender particles */}
        <div className="absolute top-24 left-1/6 w-4 h-4 bg-lavender-soft/30 rounded-full animate-float-3"></div>
        <div className="absolute top-44 left-2/6 w-5 h-5 bg-lavender-soft/25 rounded-full animate-float-4"></div>
        <div className="absolute top-64 left-3/6 w-3 h-3 bg-lavender-soft/30 rounded-full animate-float-5"></div>
        <div className="absolute top-40 right-1/6 w-6 h-6 bg-lavender-soft/25 rounded-full animate-float-6"></div>
        <div className="absolute top-60 right-2/6 w-4 h-4 bg-lavender-soft/30 rounded-full animate-float-1"></div>
      </div>

      {/* Contenedor principal del loader */}
      <div className="relative z-10 bg-white-warm border-4 border-lavender-soft/50 rounded-2xl p-12 shadow-[12px_12px_0px_0px_rgba(201,194,230,0.15)]">
        {/* Spinner principal con gradiente animado */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Círculo exterior animado */}
          <div className="absolute inset-0 border-4 border-blue-petrol/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-petrol border-r-lavender-soft rounded-full animate-spin"></div>
          
          {/* Círculo medio */}
          <div className="absolute inset-4 border-4 border-green-mint/20 rounded-full"></div>
          <div className="absolute inset-4 border-4 border-transparent border-t-green-mint border-l-blue-soft rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Círculo interior con icono */}
          <div className="absolute inset-8 bg-gradient-to-br from-blue-soft/20 via-lavender-soft/20 to-green-mint/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-petrol animate-pulse" />
          </div>
        </div>

        {/* Mensaje */}
        <div className="text-center">
          <p className="font-sans-geometric text-lg font-semibold text-blue-petrol mb-2">
            {message}
          </p>
          <p className="font-sans-geometric text-sm text-blue-petrol/70">
            Por favor espera un momento...
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="mt-6 w-48 h-1 bg-blue-petrol/10 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-petrol via-lavender-soft to-green-mint rounded-full animate-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

