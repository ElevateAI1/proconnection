
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, Video, MapPin, Globe } from 'lucide-react';

export const PublicProfileContact = () => {
  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <Card className="bg-white-warm border-2 border-blue-petrol/20 shadow-lg animate-fade-in-scale">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-blue-petrol mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-petrol" />
            Contacto
          </h3>
          
          <div className="space-y-4">
            {/* Primary CTA */}
            <div className="bg-gradient-to-r from-blue-petrol to-blue-soft p-6 rounded-xl border-2 border-blue-petrol shadow-lg">
              <h4 className="text-white-warm font-bold mb-2">Solicitar Consulta</h4>
              <p className="text-white-warm/90 text-sm mb-4">
                Agenda tu sesión profesional de manera segura y confidencial
              </p>
              <Button 
                onClick={() => window.location.href = '/register'}
                className="w-full bg-white-warm text-blue-petrol hover:bg-white-warm/90 font-semibold py-3 border-2 border-white-warm shadow-md"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Cita
              </Button>
            </div>
            
            {/* Video Consultation */}
            <div className="bg-gradient-to-br from-green-mint/20 to-blue-soft/20 p-4 rounded-lg border-2 border-green-mint/30">
              <div className="flex items-center gap-2 text-blue-petrol mb-2">
                <Video className="w-5 h-5" />
                <span className="font-semibold">Consulta Online</span>
              </div>
              <p className="text-blue-petrol/70 text-sm">
                Sesiones por videollamada desde la comodidad de tu hogar
              </p>
            </div>
            
            {/* In-Person */}
            <div className="bg-gradient-to-br from-blue-soft/20 to-green-mint/20 p-4 rounded-lg border-2 border-blue-petrol/20">
              <div className="flex items-center gap-2 text-blue-petrol mb-2">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Consulta Presencial</span>
              </div>
              <p className="text-blue-petrol/70 text-sm">
                Atención personalizada en consultorio profesional
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card className="bg-white-warm border-2 border-blue-petrol/20 shadow-lg animate-fade-in-scale">
        <CardContent className="p-6">
          <div className="text-center">
            <Globe className="w-12 h-12 text-blue-petrol mx-auto mb-4" />
            <h4 className="text-blue-petrol font-bold mb-2">ProConnection</h4>
            <p className="text-blue-petrol/70 text-sm mb-4">
              Plataforma de gestión profesional con los más altos estándares de seguridad
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 font-semibold py-3"
            >
              Conocer la Plataforma
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
