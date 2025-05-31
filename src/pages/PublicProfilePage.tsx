
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicProfiles } from '@/hooks/usePublicProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Calendar, Star, Award, Users, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface PublicProfileData {
  id: string;
  custom_url: string;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  last_viewed_at?: string;
  profile_data: any;
  first_name: string;
  last_name: string;
  specialization?: string;
  professional_code: string;
  config_title?: string;
  config_description?: string;
  config_keywords?: string;
  config_custom_url?: string;
}

export const PublicProfilePage = () => {
  const { profileUrl } = useParams<{ profileUrl: string }>();
  const { getPublicProfileByUrl } = usePublicProfiles();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileUrl) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('=== LOADING PUBLIC PROFILE ===', profileUrl);
        
        const profileData = await getPublicProfileByUrl(profileUrl);
        
        if (profileData) {
          setProfile(profileData);
          console.log('=== PROFILE LOADED ===', profileData);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('=== ERROR LOADING PROFILE ===', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando perfil profesional...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Perfil no encontrado
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              El perfil profesional que buscas no existe o no está disponible públicamente.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const seoTitle = profile.seo_title || profile.config_title || `Dr. ${profile.first_name} ${profile.last_name} - Psicólogo Profesional`;
  const seoDescription = profile.seo_description || profile.config_description || `Consulta psicológica profesional con Dr. ${profile.first_name} ${profile.last_name}. ${profile.specialization || 'Especialista en terapia psicológica'}.`;
  const seoKeywords = profile.seo_keywords || profile.config_keywords || `psicólogo, terapia, ${profile.specialization || 'terapia psicológica'}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/perfil/${profile.custom_url}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": `Dr. ${profile.first_name} ${profile.last_name}`,
            "jobTitle": "Psicólogo",
            "description": seoDescription,
            "url": `${window.location.origin}/perfil/${profile.custom_url}`,
            "knowsAbout": profile.specialization || "Terapia psicológica",
            "professionalCredentials": profile.professional_code
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">PC</span>
                </div>
                <span className="font-semibold text-slate-800">ProConnection</span>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                Perfil Verificado
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Perfil principal */}
            <Card className="mb-8 shadow-xl border-0">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Dr. {profile.first_name} {profile.last_name}
                  </h1>
                  
                  {profile.specialization && (
                    <p className="text-lg text-slate-600 mb-3">
                      {profile.specialization}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>Código: {profile.professional_code}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{profile.view_count} visitas</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Información profesional */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-emerald-500" />
                      Información Profesional
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-700">Especialidad</p>
                          <p className="text-slate-600">{profile.specialization || 'Terapia general'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-700">Código Profesional</p>
                          <p className="text-slate-600 font-mono">{profile.professional_code}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-700">Modalidad</p>
                          <p className="text-slate-600">Consulta presencial y online</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-500" />
                      Contacto
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 mb-2 font-medium">
                          Solicitar consulta profesional
                        </p>
                        <p className="text-xs text-blue-600 mb-3">
                          Para agendar una cita, regístrate en nuestra plataforma y solicita tu consulta.
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/register'}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Solicitar Cita
                        </Button>
                      </div>
                      
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-700 mb-2 font-medium">
                          Plataforma ProConnection
                        </p>
                        <p className="text-xs text-emerald-600 mb-3">
                          Sistema seguro de gestión de consultas psicológicas profesionales.
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => window.location.href = '/'}
                          className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        >
                          Conocer ProConnection
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer informativo */}
            <div className="text-center text-sm text-slate-500">
              <p>
                Este perfil profesional está verificado y gestionado a través de{' '}
                <a 
                  href="/" 
                  className="text-blue-500 hover:underline font-medium"
                >
                  ProConnection
                </a>
                {' '}• Plataforma de gestión psicológica profesional
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
