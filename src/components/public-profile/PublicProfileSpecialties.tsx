
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface Specialty {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface PublicProfileSpecialtiesProps {
  selectedSpecialties?: Specialty[];
}

export const PublicProfileSpecialties = ({ selectedSpecialties }: PublicProfileSpecialtiesProps) => {
  if (!selectedSpecialties || selectedSpecialties.length === 0) {
    return null;
  }

  // Agrupar especialidades por categoría
  const groupedSpecialties = selectedSpecialties.reduce((acc, specialty) => {
    const category = specialty.category || 'Otras';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(specialty);
    return acc;
  }, {} as Record<string, Specialty[]>);

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          Especialidades
        </h3>
        
        <div className="space-y-6">
          {Object.entries(groupedSpecialties).map(([category, specialties]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-lg font-semibold text-white/90">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specialties.map((specialty) => (
                  <div key={specialty.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{specialty.icon}</span>
                      <span className="text-white">{specialty.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
