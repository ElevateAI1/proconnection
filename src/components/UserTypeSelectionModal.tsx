import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stethoscope, Heart, Home } from "lucide-react";
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
      <DialogContent className="sm:max-w-md bg-white-warm border-4 border-blue-petrol/30 rounded-2xl shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)]">
        <DialogHeader className="text-center">
          <DialogTitle className="font-serif-display text-3xl font-bold text-blue-petrol mb-2">
            ¿Eres profesional o paciente?
          </DialogTitle>
          <DialogDescription className="font-sans-geometric text-lg text-blue-petrol/70">
            Selecciona el tipo de cuenta que deseas crear
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Button
            onClick={handleSelectProfessional}
            className="w-full bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[6px_6px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Stethoscope className="w-6 h-6" />
            <span>Profesional</span>
          </Button>
          
          <Button
            onClick={handleSelectPatient}
            className="w-full bg-lavender-soft text-blue-petrol border-4 border-lavender-soft shadow-[6px_6px_0px_0px_rgba(201,194,230,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(201,194,230,0.4)] hover:translate-x-1 hover:translate-y-1 font-sans-geometric font-bold text-lg py-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Heart className="w-6 h-6" />
            <span>Paciente</span>
          </Button>
          
          <Link to="/" className="w-full">
            <Button
              variant="outline"
              className="w-full bg-white-warm text-blue-petrol border-2 border-blue-petrol/30 hover:bg-blue-petrol/5 font-sans-geometric font-medium text-base py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              <Home className="w-4 h-4" />
              <span>Volver al inicio</span>
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

