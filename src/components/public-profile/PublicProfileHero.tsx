
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Award, Clock, Users, Star } from 'lucide-react';

interface PublicProfileHeroProps {
  firstName: string;
  lastName: string;
  professionTitle: string;
  professionDescription: string;
  professionalCode: string;
  yearsExperience?: number;
  viewCount: number;
}

export const PublicProfileHero = ({
  firstName,
  lastName,
  professionTitle,
  professionDescription,
  professionalCode,
  yearsExperience,
  viewCount
}: PublicProfileHeroProps) => {
  return (
    <section className="text-center mb-16 animate-fade-in-up">
      {/* Professional Avatar */}
      <div className="relative mb-8">
        <div className="w-40 h-40 mx-auto relative">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-premium animate-float">
            <span className="text-white text-5xl font-bold">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </span>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full opacity-20 blur animate-pulse"></div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-luxury">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      {/* Name and Title */}
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
        {professionTitle} {firstName} {lastName}
      </h1>
      
      <p className="text-2xl text-blue-200 mb-6 italic">
        {professionDescription}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 mb-8">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <Award className="w-5 h-5 text-yellow-400" />
          <span>Código: {professionalCode}</span>
        </div>
        {yearsExperience && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Clock className="w-5 h-5 text-green-400" />
            <span>{yearsExperience} años de experiencia</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <Users className="w-5 h-5 text-blue-400" />
          <span>{viewCount} consultas</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <Star className="w-5 h-5 text-emerald-400" />
          <span>Especialista Certificado</span>
        </div>
      </div>
    </section>
  );
};
