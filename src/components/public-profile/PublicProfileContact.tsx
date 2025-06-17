
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, Video, MapPin, Globe } from 'lucide-react';

export const PublicProfileContact = () => {
  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            Contacto Premium
          </h3>
          
          <div className="space-y-4">
            {/* Primary CTA */}
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-6 rounded-xl border border-white/20 shadow-luxury">
              <h4 className="text-white font-bold mb-2">Solicitar Consulta</h4>
              <p className="text-white/90 text-sm mb-4">
                Agenda tu sesión profesional de manera segura y confidencial
              </p>
              <Button 
                onClick={() => window.location.href = '/register'}
                className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-3"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Cita
              </Button>
            </div>
            
            {/* Video Consultation */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Video className="w-5 h-5" />
                <span className="font-semibold">Consulta Online</span>
              </div>
              <p className="text-white/70 text-sm">
                Sesiones por videollamada desde la comodidad de tu hogar
              </p>
            </div>
            
            {/* In-Person */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Consulta Presencial</span>
              </div>
              <p className="text-white/70 text-sm">
                Atención personalizada en consultorio profesional
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
        <CardContent className="p-6">
          <div className="text-center">
            <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-white font-bold mb-2">ProConnection</h4>
            <p className="text-white/70 text-sm mb-4">
              Plataforma premium de gestión profesional con los más altos estándares de seguridad
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-white text-slate-800 hover:bg-gray-100 hover:text-slate-900 font-semibold py-3 transition-all duration-300"
            >
              Conocer la Plataforma
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
