
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
          <div className="w-full h-full bg-gradient-to-br from-blue-petrol to-blue-soft rounded-full flex items-center justify-center shadow-xl border-4 border-white-warm">
            <span className="text-white-warm text-5xl font-bold">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </span>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-soft/30 to-green-mint/30 rounded-full opacity-40 blur animate-pulse"></div>
          <div className="absolute -bottom-2 -right-2 bg-green-mint rounded-full p-2 shadow-lg border-2 border-white-warm">
            <CheckCircle className="w-6 h-6 text-blue-petrol" />
          </div>
        </div>
      </div>
      
      {/* Name and Title */}
      <h1 className="text-5xl md:text-6xl font-bold text-blue-petrol mb-4 tracking-tight">
        {professionTitle} {firstName} {lastName}
      </h1>
      
      <p className="text-2xl text-blue-petrol/70 mb-6 italic">
        {professionDescription}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-6 text-blue-petrol mb-8">
        <div className="flex items-center gap-2 bg-white-warm backdrop-blur-md px-4 py-2 rounded-full border-2 border-blue-petrol/20 shadow-md">
          <Award className="w-5 h-5 text-blue-petrol" />
          <span className="font-semibold">Código: {professionalCode}</span>
        </div>
        {yearsExperience && (
          <div className="flex items-center gap-2 bg-white-warm backdrop-blur-md px-4 py-2 rounded-full border-2 border-green-mint/30 shadow-md">
            <Clock className="w-5 h-5 text-blue-petrol" />
            <span className="font-semibold">{yearsExperience} años de experiencia</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-white-warm backdrop-blur-md px-4 py-2 rounded-full border-2 border-blue-soft/30 shadow-md">
          <Users className="w-5 h-5 text-blue-petrol" />
          <span className="font-semibold">{viewCount} consultas</span>
        </div>
        <div className="flex items-center gap-2 bg-white-warm backdrop-blur-md px-4 py-2 rounded-full border-2 border-green-mint/30 shadow-md">
          <Star className="w-5 h-5 text-blue-petrol" />
          <span className="font-semibold">Especialista Certificado</span>
        </div>
      </div>
    </section>
  );
};
