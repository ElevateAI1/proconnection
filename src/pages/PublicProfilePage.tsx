
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Eye, Calendar, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicProfileData {
  id: string;
  custom_url: string;
  psychologist_id: string;
  profession_type: string;
  profile_data: any;
  about_description?: string;
  therapeutic_approach?: string;
  years_experience?: number;
  view_count: number;
  last_viewed_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  psychologist: {
    id: string;
    plan_type: string;
    first_name: string;
    last_name: string;
    specialization?: string;
    phone?: string;
  };
}

export const PublicProfilePage = () => {
  const { profileUrl } = useParams<{ profileUrl: string }>();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public-profile', profileUrl],
    queryFn: async () => {
      if (!profileUrl) throw new Error('No profile URL provided');
      
      const { data, error } = await supabase
        .from('public_psychologist_profiles')
        .select(`
          *,
          psychologist:psychologists(id, plan_type, first_name, last_name, specialization, phone)
        `)
        .eq('custom_url', profileUrl)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');
      
      return data as PublicProfileData;
    },
    enabled: !!profileUrl
  });

  // Incrementar contador de vistas
  useEffect(() => {
    if (profile && profileUrl) {
      supabase.rpc('increment_profile_view', { profile_url: profileUrl });
    }
  }, [profile, profileUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Perfil no encontrado</h1>
          <p className="text-slate-600 mb-6">
            El perfil que buscas no existe o ha sido desactivado.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const isPro = profile.psychologist?.plan_type === 'pro';
  const displayName = `${profile.psychologist.first_name} ${profile.psychologist.last_name}`;
  const specialties = profile.profile_data?.selected_specialties || [];
  const bio = profile.about_description || '';
  const location = profile.profile_data?.location || '';
  const email = profile.profile_data?.email || '';
  const website = profile.profile_data?.website || '';
  const languages = profile.profile_data?.languages || [];
  const sessionFormat = profile.profile_data?.session_format || '';
  const sessionDuration = profile.profile_data?.session_duration || 60;
  const pricingInfo = profile.profile_data?.pricing_info || '';
  const education = profile.profile_data?.education || '';
  const certifications = profile.profile_data?.certifications || '';

  return (
    <>
      <Helmet>
        <title>{profile.seo_title || `${displayName} - ${profile.psychologist.specialization || 'Psicólogo'}`}</title>
        <meta name="description" content={profile.seo_description || bio} />
        {profile.seo_keywords && <meta name="keywords" content={profile.seo_keywords} />}
        <meta property="og:title" content={profile.seo_title || `${displayName} - ${profile.psychologist.specialization || 'Psicólogo'}`} />
        <meta property="og:description" content={profile.seo_description || bio} />
        <meta property="og:type" content="profile" />
      </Helmet>

      <div className={`min-h-screen ${isPro ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Header Section */}
          <Card className={`mb-8 ${isPro ? 'bg-gradient-to-r from-white to-blue-50/50 border-blue-200 shadow-xl' : 'bg-white shadow-md'}`}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className={`text-3xl font-bold ${isPro ? 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent' : 'text-slate-800'}`}>
                      {displayName}
                    </h1>
                    {isPro && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        Profesional Pro
                      </Badge>
                    )}
                  </div>
                  
                  <p className={`text-xl mb-4 ${isPro ? 'text-blue-700' : 'text-slate-600'}`}>
                    {profile.psychologist.specialization || 'Psicólogo'}
                  </p>
                  
                  {location && (
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  
                  {profile.years_experience && (
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{profile.years_experience} años de experiencia</span>
                    </div>
                  )}

                  {profile.view_count > 0 && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{profile.view_count} visualizaciones</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {profile.psychologist.phone && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Llamar
                    </Button>
                  )}
                  
                  {email && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contactar
                    </Button>
                  )}
                  
                  <Button className={isPro ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600' : ''}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {bio && (
            <Card className={`mb-8 ${isPro ? 'border-blue-200' : ''}`}>
              <CardContent className="p-6">
                <h2 className={`text-xl font-semibold mb-4 ${isPro ? 'text-blue-800' : 'text-slate-800'}`}>
                  Sobre mí
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <Card className={`mb-8 ${isPro ? 'border-blue-200' : ''}`}>
              <CardContent className="p-6">
                <h2 className={`text-xl font-semibold mb-4 ${isPro ? 'text-blue-800' : 'text-slate-800'}`}>
                  Especialidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={isPro ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Therapeutic Approach - Solo para Pro */}
          {isPro && profile.therapeutic_approach && (
            <Card className="mb-8 border-blue-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">
                  Enfoque Terapéutico
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  {profile.therapeutic_approach}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Additional Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Session Info */}
            {(sessionFormat || sessionDuration || pricingInfo) && (
              <Card className={isPro ? 'border-blue-200' : ''}>
                <CardContent className="p-6">
                  <h3 className={`font-semibold mb-3 ${isPro ? 'text-blue-800' : 'text-slate-800'}`}>
                    Información de Sesiones
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    {sessionFormat && (
                      <p><span className="font-medium">Formato:</span> {sessionFormat}</p>
                    )}
                    {sessionDuration && (
                      <p><span className="font-medium">Duración:</span> {sessionDuration} minutos</p>
                    )}
                    {pricingInfo && (
                      <p><span className="font-medium">Precios:</span> {pricingInfo}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <Card className={isPro ? 'border-blue-200' : ''}>
                <CardContent className="p-6">
                  <h3 className={`font-semibold mb-3 ${isPro ? 'text-blue-800' : 'text-slate-800'}`}>
                    Idiomas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education - Solo para Pro */}
            {isPro && education && (
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-blue-800">
                    Educación
                  </h3>
                  <p className="text-sm text-slate-600">{education}</p>
                </CardContent>
              </Card>
            )}

            {/* Certifications - Solo para Pro */}
            {isPro && certifications && (
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-blue-800">
                    Certificaciones
                  </h3>
                  <p className="text-sm text-slate-600">{certifications}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Section */}
          <Card className={`mt-8 ${isPro ? 'bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200' : ''}`}>
            <CardContent className="p-6 text-center">
              <h2 className={`text-xl font-semibold mb-4 ${isPro ? 'text-blue-800' : 'text-slate-800'}`}>
                ¿Listo para comenzar tu proceso terapéutico?
              </h2>
              <p className="text-slate-600 mb-6">
                Agenda una cita y da el primer paso hacia tu bienestar emocional.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className={isPro ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600' : ''}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Primera Cita
                </Button>
                
                {website && (
                  <Button variant="outline" size="lg">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visitar Sitio Web
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
