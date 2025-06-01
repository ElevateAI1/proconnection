
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useExpandedPublicProfiles } from '@/hooks/useExpandedPublicProfiles';
import { useSpecialties } from '@/hooks/useSpecialties';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, Save, Plus } from 'lucide-react';

interface FormData {
  custom_url: string;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  about_description: string;
  therapeutic_approach: string;
  years_experience: number | undefined;
  profession_type: string;
  location: string;
  session_format: string;
  session_duration: number;
  pricing_info: string;
  education: string;
  certifications: string;
  email: string;
  website: string;
  languages: string;
}

const professionTypes = [
  { value: 'psychologist', label: 'Psicólogo/a' },
  { value: 'doctor', label: 'Médico/a' },
  { value: 'physiotherapist', label: 'Fisioterapeuta' },
  { value: 'kinesiologist', label: 'Kinesiólogo/a' },
  { value: 'occupational_therapist', label: 'Terapeuta Ocupacional' },
  { value: 'massage_therapist', label: 'Masajista Terapéutico' },
  { value: 'osteopath', label: 'Osteópata' },
  { value: 'nutritionist', label: 'Nutricionista' },
  { value: 'coach', label: 'Coach' },
];

const sessionFormats = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hibrido', label: 'Híbrido (Presencial y Virtual)' },
];

const commonLanguages = [
  'Español', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán', 'Catalán', 'Euskera', 'Gallego'
];

export const ExpandedPublicProfileManager = () => {
  const { createOrUpdateExpandedProfile, getMyExpandedProfile, loading: profileLoading } = useExpandedPublicProfiles();
  const { specialties, loadSpecialties, saveProfileSpecialties, getProfileSpecialties, loading: specialtiesLoading } = useSpecialties();
  
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      custom_url: '',
      is_active: true,
      profession_type: 'psychologist',
      years_experience: undefined,
      session_duration: 60,
      location: '',
      session_format: 'presencial',
      pricing_info: '',
      education: '',
      certifications: '',
      email: '',
      website: '',
      languages: ''
    }
  });

  const watchedProfessionType = watch('profession_type');
  const watchedCustomUrl = watch('custom_url');

  useEffect(() => {
    if (watchedProfessionType) {
      loadSpecialties(watchedProfessionType);
      setSelectedSpecialties([]); // Reset specialties when profession changes
    }
  }, [watchedProfessionType]);

  useEffect(() => {
    if (watchedCustomUrl) {
      setPreviewUrl(`${window.location.origin}/perfil/${watchedCustomUrl}`);
    }
  }, [watchedCustomUrl]);

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    const profile = await getMyExpandedProfile();
    if (profile) {
      setCurrentProfileId(profile.id);
      
      // Cargar datos del profile_data
      const profileData = profile.profile_data || {};
      const languagesArray = profileData.languages || [];
      
      reset({
        custom_url: profile.custom_url,
        is_active: profile.is_active,
        seo_title: profile.seo_title || '',
        seo_description: profile.seo_description || '',
        seo_keywords: profile.seo_keywords || '',
        about_description: profile.about_description || '',
        therapeutic_approach: profile.therapeutic_approach || '',
        years_experience: profile.years_experience || undefined,
        profession_type: profile.profession_type || 'psychologist',
        location: profileData.location || '',
        session_format: profileData.session_format || 'presencial',
        session_duration: profileData.session_duration || 60,
        pricing_info: profileData.pricing_info || '',
        education: profileData.education || '',
        certifications: profileData.certifications || '',
        email: profileData.email || '',
        website: profileData.website || '',
        languages: languagesArray.join(', ')
      });

      // Cargar especialidades existentes
      const existingSpecialties = profileData.selected_specialties || [];
      setSelectedSpecialties(existingSpecialties);
      setSelectedLanguages(languagesArray);
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      // Convertir idiomas de string a array
      const languagesArray = formData.languages 
        ? formData.languages.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0)
        : [];

      const result = await createOrUpdateExpandedProfile({
        ...formData,
        specialties: selectedSpecialties,
        languages: languagesArray
      });

      if (result && selectedSpecialties.length > 0) {
        await saveProfileSpecialties(result.id, selectedSpecialties);
      }

      setCurrentProfileId(result.id);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialtyId) 
        ? prev.filter(id => id !== specialtyId)
        : [...prev, specialtyId]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => {
      const newLanguages = prev.includes(language) 
        ? prev.filter(lang => lang !== language)
        : [...prev, language];
      
      setValue('languages', newLanguages.join(', '));
      return newLanguages;
    });
  };

  const getSpecialtiesByCategory = () => {
    const categorized: Record<string, typeof specialties> = {};
    specialties.forEach(specialty => {
      const category = specialty.category || 'Otras';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(specialty);
    });
    return categorized;
  };

  const isLoading = profileLoading || specialtiesLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Configuración del Perfil Público Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profession_type">Tipo de Profesión</Label>
                  <Select value={watch('profession_type')} onValueChange={(value) => setValue('profession_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu profesión" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="years_experience">Años de Experiencia</Label>
                  <Input
                    {...register('years_experience', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="Ej: 5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    {...register('location')}
                    placeholder="Ej: Madrid, España"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email de contacto</Label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  {...register('website')}
                  placeholder="https://tu-sitio-web.com"
                />
              </div>

              <div>
                <Label htmlFor="custom_url">URL Personalizada</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 border rounded-l-md bg-muted text-muted-foreground">
                    {window.location.origin}/perfil/
                  </span>
                  <Input
                    {...register('custom_url', { required: true })}
                    placeholder="mi-nombre-profesional"
                    className="rounded-l-none"
                  />
                </div>
                {previewUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {previewUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción Profesional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Descripción Profesional</h3>
              
              <div>
                <Label htmlFor="about_description">Acerca de mí</Label>
                <Textarea
                  {...register('about_description')}
                  placeholder="Describe tu experiencia, enfoque profesional y lo que te hace único..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="therapeutic_approach">Enfoque o Metodología</Label>
                <Input
                  {...register('therapeutic_approach')}
                  placeholder="Ej: Terapia cognitivo-conductual, enfoque humanístico..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="education">Educación</Label>
                  <Textarea
                    {...register('education')}
                    placeholder="Tu formación académica, títulos, universidades..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="certifications">Certificaciones</Label>
                  <Textarea
                    {...register('certifications')}
                    placeholder="Certificaciones profesionales, cursos especializados..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Información de Sesiones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información de Sesiones</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="session_format">Formato de Sesiones</Label>
                  <Select value={watch('session_format')} onValueChange={(value) => setValue('session_format', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionFormats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="session_duration">Duración (minutos)</Label>
                  <Input
                    {...register('session_duration', { valueAsNumber: true })}
                    type="number"
                    min="30"
                    max="180"
                  />
                </div>

                <div>
                  <Label htmlFor="pricing_info">Información de Precios</Label>
                  <Input
                    {...register('pricing_info')}
                    placeholder="Ej: Desde €60 por sesión"
                  />
                </div>
              </div>
            </div>

            {/* Idiomas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Idiomas</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonLanguages.map(language => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={language}
                      checked={selectedLanguages.includes(language)}
                      onCheckedChange={() => toggleLanguage(language)}
                    />
                    <label
                      htmlFor={language}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {language}
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="languages">Idiomas (separados por comas)</Label>
                <Input
                  {...register('languages')}
                  placeholder="Español, Inglés, Francés..."
                />
              </div>
            </div>

            {/* Especialidades */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Especialidades</h3>
              
              {specialtiesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando especialidades...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(getSpecialtiesByCategory()).map(([category, categorySpecialties]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-slate-700">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {categorySpecialties.map(specialty => (
                          <div key={specialty.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={specialty.id}
                              checked={selectedSpecialties.includes(specialty.id)}
                              onCheckedChange={() => toggleSpecialty(specialty.id)}
                            />
                            <label
                              htmlFor={specialty.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {specialty.icon} {specialty.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSpecialties.length > 0 && (
                <div className="space-y-2">
                  <Label>Especialidades seleccionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecialties.map(specialtyId => {
                      const specialty = specialties.find(s => s.id === specialtyId);
                      return specialty ? (
                        <Badge key={specialtyId} variant="secondary">
                          {specialty.icon} {specialty.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuración SEO</h3>
              
              <div>
                <Label htmlFor="seo_title">Título SEO</Label>
                <Input
                  {...register('seo_title')}
                  placeholder="Dr. Juan Pérez - Psicólogo Especializado en Ansiedad"
                />
              </div>

              <div>
                <Label htmlFor="seo_description">Descripción SEO</Label>
                <Textarea
                  {...register('seo_description')}
                  placeholder="Consulta psicológica profesional especializada en ansiedad y estrés..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="seo_keywords">Palabras Clave SEO</Label>
                <Input
                  {...register('seo_keywords')}
                  placeholder="psicólogo, ansiedad, terapia, consulta online"
                />
              </div>
            </div>

            {/* Activación */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(value) => setValue('is_active', value)}
              />
              <Label>Perfil público activo</Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Perfil Público
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
