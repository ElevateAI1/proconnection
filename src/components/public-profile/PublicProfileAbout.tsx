
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Heart, Clock } from 'lucide-react';

interface PublicProfileAboutProps {
  firstName: string;
  professionTitle: string;
  aboutDescription?: string;
  therapeuticApproach?: string;
  yearsExperience?: number;
}

export const PublicProfileAbout = ({
  firstName,
  professionTitle,
  aboutDescription,
  therapeuticApproach,
  yearsExperience
}: PublicProfileAboutProps) => {
  return (
    <Card className="bg-white-warm border-2 border-blue-petrol/20 shadow-lg animate-fade-in-scale">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-blue-petrol mb-6 flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-petrol" />
          Acerca de {professionTitle} {firstName}
        </h2>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-blue-petrol/80 leading-relaxed mb-6">
            {aboutDescription || `${professionTitle} especializado en brindar atención de la más alta calidad utilizando enfoques basados en evidencia científica. Comprometido con el bienestar y desarrollo de cada persona.`}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {therapeuticApproach && (
              <div className="bg-gradient-to-br from-blue-soft/20 to-green-mint/20 p-4 rounded-lg border-2 border-blue-petrol/20">
                <h4 className="text-blue-petrol font-semibold mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-petrol" />
                  Enfoque Profesional
                </h4>
                <p className="text-blue-petrol/70 text-sm">{therapeuticApproach}</p>
              </div>
            )}
            
            {yearsExperience && (
              <div className="bg-gradient-to-br from-green-mint/20 to-blue-soft/20 p-4 rounded-lg border-2 border-green-mint/30">
                <h4 className="text-blue-petrol font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-petrol" />
                  Experiencia
                </h4>
                <p className="text-blue-petrol/70 text-sm">{yearsExperience} años de experiencia profesional</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
