
import { Shield } from 'lucide-react';

export const PublicProfileFooter = () => {
  return (
    <footer className="text-center py-8 border-t border-white/10">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <Shield className="w-5 h-5" />
          <span className="text-sm">
            Perfil profesional verificado y protegido por
          </span>
        </div>
        <a 
          href="/" 
          className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
        >
          ProConnection Premium
        </a>
        <p className="text-white/40 text-xs max-w-2xl">
          Plataforma líder en gestión profesional • Tecnología segura • Confidencialidad garantizada
        </p>
      </div>
    </footer>
  );
};
