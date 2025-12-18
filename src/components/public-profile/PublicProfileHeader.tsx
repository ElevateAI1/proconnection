
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export const PublicProfileHeader = () => {
  return (
    <header className="relative z-20 bg-white-warm/80 backdrop-blur-xl border-b border-blue-petrol/20 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-petrol to-blue-soft rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white-warm font-bold text-xl">P</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-blue-petrol">ProConnection</span>
              <p className="text-blue-petrol/70 text-sm">Plataforma de Profesionales de Salud</p>
            </div>
          </div>
          <Badge className="bg-green-mint/50 text-blue-petrol border-green-mint px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Perfil Verificado
          </Badge>
        </div>
      </div>
    </header>
  );
};
