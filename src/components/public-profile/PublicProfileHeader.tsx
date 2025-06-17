
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export const PublicProfileHeader = () => {
  return (
    <header className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-luxury">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-white">ProConnection</span>
              <p className="text-white/60 text-sm">Plataforma Premium de Profesionales de Salud</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-md px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Perfil Verificado
          </Badge>
        </div>
      </div>
    </header>
  );
};
