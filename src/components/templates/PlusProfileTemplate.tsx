
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye, Calendar, Phone, Mail, ExternalLink } from "lucide-react";

interface ProfileData {
  selected_specialties?: string[];
  location?: string;
  languages?: string[];
  session_format?: string;
  session_duration?: number;
  pricing_info?: string;
  education?: string;
  certifications?: string;
  email?: string;
  website?: string;
  [key: string]: any;
}

interface PlusProfileTemplateProps {
  profile: {
    id: string;
    custom_url: string;
    profession_type: string;
    profile_data: ProfileData;
    about_description?: string;
    therapeutic_approach?: string;
    years_experience?: number;
    view_count: number;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    psychologist: {
      first_name: string;
      last_name: string;
      specialization?: string;
      phone?: string;
    };
  };
}

export const PlusProfileTemplate = ({ profile }: PlusProfileTemplateProps) => {
  const displayName = `${profile.psychologist.first_name} ${profile.psychologist.last_name}`;
  const profileData: ProfileData = profile.profile_data || {};
  
  const specialties = profileData.selected_specialties || [];
  const bio = profile.about_description || '';
  const location = profileData.location || '';
  const email = profileData.email || '';
  const website = profileData.website || '';
  const languages = profileData.languages || [];
  const sessionFormat = profileData.session_format || '';
  const sessionDuration = profileData.session_duration || 60;
  const pricingInfo = profileData.pricing_info || '';

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Header Section */}
          <Card className="mb-8 bg-gradient-to-r from-white to-blue-50/30 border-blue-100 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {displayName}
                    </h1>
                    <Badge className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white">
                      Profesional Plus
                    </Badge>
                  </div>
                  
                  <p className="text-xl mb-4 text-blue-600">
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
                  
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {bio && (
            <Card className="mb-8 border-blue-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
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
            <Card className="mb-8 border-blue-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  Especialidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Session Info */}
            {(sessionFormat || sessionDuration || pricingInfo) && (
              <Card className="border-blue-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-blue-700">
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
              <Card className="border-blue-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-blue-700">
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
          </div>

          {/* Contact Section */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-100">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">
                ¿Listo para comenzar tu proceso terapéutico?
              </h2>
              <p className="text-slate-600 mb-6">
                Agenda una cita y da el primer paso hacia tu bienestar emocional.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
