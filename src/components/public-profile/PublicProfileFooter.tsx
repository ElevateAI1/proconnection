
import { Shield } from 'lucide-react';

export const PublicProfileFooter = () => {
  return (
    <footer className="text-center py-8 border-t border-blue-petrol/20 bg-white-warm/50">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-blue-petrol/70">
          <Shield className="w-5 h-5" />
          <span className="text-sm">
            Perfil profesional verificado y protegido por
          </span>
        </div>
        <a 
          href="/" 
          className="text-blue-petrol hover:text-blue-soft font-semibold transition-colors"
        >
          ProConnection
        </a>
        <p className="text-blue-petrol/60 text-xs max-w-2xl">
          Plataforma líder en gestión profesional • Tecnología segura • Confidencialidad garantizada
        </p>
      </div>
    </footer>
  );
};
