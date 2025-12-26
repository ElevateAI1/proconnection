import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stethoscope, Heart, Home, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface UserTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfessional?: () => void;
  onSelectPatient?: () => void;
  redirectTo?: "auth" | "register";
  referralCode?: string | null;
}

export const UserTypeSelectionModal = ({
  isOpen,
  onClose,
  onSelectProfessional,
  onSelectPatient,
  redirectTo = "auth",
  referralCode,
}: UserTypeSelectionModalProps) => {
  const navigate = useNavigate();

  const handleSelectProfessional = () => {
    if (onSelectProfessional) {
      onSelectProfessional();
    } else {
      const url = referralCode 
        ? `/${redirectTo}/professional?ref=${referralCode}`
        : `/${redirectTo}/professional`;
      navigate(url);
    }
  };

  const handleSelectPatient = () => {
    if (onSelectPatient) {
      onSelectPatient();
    } else {
      const url = referralCode 
        ? `/${redirectTo}/patient?ref=${referralCode}`
        : `/${redirectTo}/patient`;
      navigate(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        overlayClassName="bg-white"
        className="sm:max-w-lg p-0"
      >
        <div className="bg-white-warm border-4 border-blue-petrol/30 rounded-2xl shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)] p-10 relative overflow-hidden">
          {/* Partículas flotantes de fondo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {/* Blue particles */}
            <div className="absolute top-10 left-8 w-3 h-3 bg-blue-petrol/30 rounded-full animate-float-1"></div>
            <div className="absolute top-20 left-1/4 w-4 h-4 bg-blue-soft/40 rounded-full animate-float-2"></div>
            <div className="absolute top-32 left-1/3 w-2 h-2 bg-blue-petrol/25 rounded-full animate-float-3"></div>
            <div className="absolute top-16 right-12 w-5 h-5 bg-blue-soft/35 rounded-full animate-float-4"></div>
            <div className="absolute top-28 right-1/4 w-3 h-3 bg-blue-petrol/30 rounded-full animate-float-5"></div>
            <div className="absolute top-40 right-1/3 w-4 h-4 bg-blue-soft/40 rounded-full animate-float-6"></div>
            
            {/* Green/Mint particles */}
            <div className="absolute top-24 left-1/5 w-4 h-4 bg-green-mint/35 rounded-full animate-float-2"></div>
            <div className="absolute top-36 left-2/5 w-3 h-3 bg-green-mint/30 rounded-full animate-float-3"></div>
            <div className="absolute top-14 right-1/5 w-3 h-3 bg-green-mint/40 rounded-full animate-float-4"></div>
            <div className="absolute top-26 right-2/5 w-5 h-5 bg-green-mint/30 rounded-full animate-float-5"></div>
            <div className="absolute top-38 right-3/5 w-2 h-2 bg-green-mint/35 rounded-full animate-float-1"></div>
            
            {/* Lavender particles */}
            <div className="absolute top-18 left-1/6 w-3 h-3 bg-lavender-soft/30 rounded-full animate-float-3"></div>
            <div className="absolute top-30 left-2/6 w-5 h-5 bg-lavender-soft/25 rounded-full animate-float-4"></div>
            <div className="absolute top-22 right-1/6 w-2 h-2 bg-lavender-soft/35 rounded-full animate-float-5"></div>
            <div className="absolute top-34 right-2/6 w-4 h-4 bg-lavender-soft/30 rounded-full animate-float-6"></div>
            <div className="absolute top-12 right-3/6 w-3 h-3 bg-lavender-soft/35 rounded-full animate-float-1"></div>
            
            {/* Peach particles */}
            <div className="absolute top-26 left-3/5 w-4 h-4 bg-peach-pale/30 rounded-full animate-float-2"></div>
            <div className="absolute top-38 left-4/5 w-3 h-3 bg-peach-pale/35 rounded-full animate-float-3"></div>
            <div className="absolute top-20 right-4/5 w-2 h-2 bg-peach-pale/30 rounded-full animate-float-4"></div>
            
            {/* Large floating shapes with blur */}
            <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-petrol/8 rounded-full blur-2xl animate-float-slow"></div>
            <div className="absolute top-1/3 right-12 w-36 h-36 bg-green-mint/8 rounded-full blur-2xl animate-float-slow-delayed"></div>
            <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-lavender-soft/8 rounded-full blur-2xl animate-float-slow"></div>
            <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-blue-soft/8 rounded-full blur-2xl animate-float-slow-delayed"></div>
          </div>
          
          <DialogHeader className="text-center relative z-10">
          {/* Indicador de progreso */}
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-petrol/10 border-2 border-blue-petrol/20 text-sm font-sans-geometric font-semibold text-blue-petrol">
              Paso 1 de 3
            </span>
          </div>

          {/* Ícono ilustrativo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-soft/20 to-emerald-200/30 rounded-full flex items-center justify-center border-4 border-blue-petrol/20 shadow-lg">
              <Users className="w-10 h-10 text-blue-petrol" />
            </div>
          </div>

          <DialogTitle className="font-serif-display text-3xl sm:text-4xl font-bold text-blue-petrol mb-3">
            ¿Eres profesional o paciente?
          </DialogTitle>
          <DialogDescription className="font-sans-geometric text-base text-blue-petrol/70 mb-2">
            Esto nos ayudará a personalizar tu experiencia
          </DialogDescription>
        </DialogHeader>
        
          {/* Botones con mejor espaciado */}
          <div className="grid grid-cols-1 gap-5 mt-10 relative z-10">
          <Button
            onClick={handleSelectProfessional}
            className="w-full bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[2px_2px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-2 hover:translate-y-2 hover:scale-[1.02] font-sans-geometric font-bold text-lg py-8 px-6 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xl">Profesional</span>
            </div>
            <span className="text-sm font-normal text-white-warm/90 opacity-90">
              Gestiona pacientes y agenda
            </span>
          </Button>
          
          <Button
            onClick={handleSelectPatient}
            className="w-full bg-lavender-soft text-blue-petrol border-4 border-lavender-soft shadow-[6px_6px_0px_0px_rgba(201,194,230,0.4)] hover:shadow-[2px_2px_0px_0px_rgba(201,194,230,0.4)] hover:translate-x-2 hover:translate-y-2 hover:scale-[1.02] font-sans-geometric font-bold text-lg py-8 px-6 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xl">Paciente</span>
            </div>
            <span className="text-sm font-normal text-blue-petrol/80 opacity-90">
              Agenda citas y consulta tu historial
            </span>
          </Button>
          
          <Link to="/" className="w-full mt-2">
            <Button
              variant="outline"
              className="w-full bg-white-warm text-blue-petrol border-2 border-blue-petrol/30 hover:bg-blue-petrol/5 font-sans-geometric font-medium text-base py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Volver al inicio</span>
            </Button>
          </Link>
        </div>

          {/* Pie del modal con texto de ayuda */}
          <div className="mt-8 pt-6 border-t-2 border-blue-petrol/10 relative z-10">
            <p className="text-center text-xs sm:text-sm font-sans-geometric text-blue-petrol/50">
              ¿No estás seguro? Podrás cambiar esto después en configuración
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

