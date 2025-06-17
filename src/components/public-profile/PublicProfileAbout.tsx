
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
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          Acerca de {professionTitle} {firstName}
        </h2>
        
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-white/80 leading-relaxed mb-6">
            {aboutDescription || `${professionTitle} especializado en brindar atención de la más alta calidad utilizando enfoques basados en evidencia científica. Comprometido con el bienestar y desarrollo de cada persona.`}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {therapeuticApproach && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Enfoque Profesional
                </h4>
                <p className="text-white/70 text-sm">{therapeuticApproach}</p>
              </div>
            )}
            
            {yearsExperience && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Experiencia
                </h4>
                <p className="text-white/70 text-sm">{yearsExperience} años de experiencia profesional</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
