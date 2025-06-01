
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Eye, Calendar, Phone, Mail, ExternalLink, Award, Users, BookOpen, Target } from "lucide-react";

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

interface ProProfileTemplateProps {
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

export const ProProfileTemplate = ({ profile }: ProProfileTemplateProps) => {
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
  const education = profileData.education || '';
  const certifications = profileData.certifications || '';

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        
        {/* Hero Section - Exclusivo Pro */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Award className="w-3 h-3 mr-1" />
                    Profesional Pro
                  </Badge>
                  {profile.view_count > 0 && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Eye className="w-4 h-4" />
                      <span>{profile.view_count} visualizaciones</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {displayName}
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-100 mb-6">
                  {profile.psychologist.specialization || 'Psicólogo Profesional'}
                </p>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  {location && (
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-5 h-5" />
                      <span>{location}</span>
                    </div>
                  )}
                  {profile.years_experience && (
                    <div className="flex items-center gap-2 text-white/90">
                      <Clock className="w-5 h-5" />
                      <span>{profile.years_experience} años de experiencia</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-blue-50">
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Consulta
                  </Button>
                  {profile.psychologist.phone && (
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600">
                      <Phone className="w-5 h-5 mr-2" />
                      Llamar Ahora
                    </Button>
                  )}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-xl font-semibold mb-6">Información de Consulta</h3>
                  <div className="space-y-4">
                    {sessionFormat && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Modalidad:</span>
                        <span className="font-medium">{sessionFormat}</span>
                      </div>
                    )}
                    {sessionDuration && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Duración:</span>
                        <span className="font-medium">{sessionDuration} min</span>
                      </div>
                    )}
                    {pricingInfo && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Precio:</span>
                        <span className="font-medium">{pricingInfo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          
          {/* About Section Expandida */}
          {bio && (
            <Card className="mb-12 border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold mb-6 text-slate-800">Sobre mi práctica profesional</h2>
                    <div className="prose prose-lg max-w-none text-slate-700">
                      <p className="whitespace-pre-wrap leading-relaxed">{bio}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6">
                      <h3 className="font-semibold text-slate-800 mb-4">Datos destacados</h3>
                      <div className="space-y-3">
                        {profile.years_experience && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-700">{profile.years_experience} años de experiencia</span>
                          </div>
                        )}
                        {specialties.length > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-700">{specialties.length} especialidades</span>
                          </div>
                        )}
                        {languages.length > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-700">{languages.length} idiomas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metodología y Especialidades en Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Enfoque Terapéutico */}
            {profile.therapeutic_approach && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Mi Enfoque Terapéutico</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {profile.therapeutic_approach}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Especialidades */}
            {specialties.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-blue-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Áreas de Especialización</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {specialties.map((specialty: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                        <span className="font-medium text-slate-700">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Credenciales y Formación */}
          {(education || certifications) && (
            <Card className="mb-12 border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-8 text-slate-800 text-center">Credenciales Profesionales</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {education && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-semibold text-slate-800">Formación Académica</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{education}</p>
                    </div>
                  )}

                  {certifications && (
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="w-6 h-6 text-emerald-600" />
                        <h3 className="text-xl font-semibold text-slate-800">Certificaciones</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{certifications}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Contacto y Idiomas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Idiomas */}
            {languages.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-slate-800">Idiomas</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modalidad */}
            {sessionFormat && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-slate-800">Modalidad de Atención</h3>
                  <div className="text-slate-600">
                    <p className="capitalize">{sessionFormat}</p>
                    {sessionDuration && <p className="text-sm mt-1">{sessionDuration} minutos por sesión</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Precio */}
            {pricingInfo && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-slate-800">Información de Precios</h3>
                  <p className="text-slate-600">{pricingInfo}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Call to Action Final */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Comienza tu proceso de transformación hoy
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Estoy aquí para acompañarte en tu camino hacia el bienestar emocional y mental. 
                Agenda tu consulta y da el primer paso hacia una vida más plena.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-blue-50 text-lg px-8 py-4"
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Agendar Primera Consulta
                </Button>
                
                {email && (
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4">
                    <Mail className="w-6 h-6 mr-3" />
                    Enviar Mensaje
                  </Button>
                )}

                {website && (
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4">
                    <ExternalLink className="w-6 h-6 mr-3" />
                    Mi Sitio Web
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
