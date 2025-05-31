
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicProfiles } from '@/hooks/usePublicProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Calendar, Star, Award, Users, Clock, Shield, CheckCircle, Sparkles, Heart, Brain, MessageCircle, Video, Globe } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white/80 text-lg font-inter">Cargando perfil profesional premium...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
              <Users className="w-16 h-16 text-white/60" />
            </div>
            <h1 className="text-4xl font-playfair font-bold text-white mb-6">
              Perfil no encontrado
            </h1>
            <p className="text-xl text-white/80 mb-8 font-inter">
              El perfil profesional que buscas no existe o no está disponible públicamente.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white font-inter px-8 py-3"
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

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Premium animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        </div>

        {/* Premium Header */}
        <header className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-luxury">
                  <span className="text-white font-bold text-xl font-playfair">P</span>
                </div>
                <div>
                  <span className="font-playfair font-bold text-2xl text-white">ProConnection</span>
                  <p className="text-white/60 text-sm font-inter">Plataforma Premium de Salud Mental</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-md px-4 py-2 font-inter">
                <Shield className="w-4 h-4 mr-2" />
                Perfil Verificado
              </Badge>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section Premium */}
            <section className="text-center mb-16 animate-fade-in-up">
              {/* Professional Avatar */}
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto relative">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-premium animate-float">
                    <span className="text-white text-5xl font-bold font-playfair">
                      {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full opacity-20 blur animate-pulse"></div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-luxury">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Name and Title */}
              <h1 className="text-5xl md:text-6xl font-playfair font-bold text-white mb-4 tracking-tight">
                Dr. {profile.first_name} {profile.last_name}
              </h1>
              
              {profile.specialization && (
                <p className="text-2xl text-blue-200 mb-6 font-crimson italic">
                  {profile.specialization}
                </p>
              )}
              
              {/* Professional Credentials */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="font-inter">Código: {profile.professional_code}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="font-inter">{profile.view_count} consultas</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Star className="w-5 h-5 text-emerald-400" />
                  <span className="font-inter">Especialista Certificado</span>
                </div>
              </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              
              {/* Professional Information - 2 columns */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* About Section */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center gap-3">
                      <Brain className="w-8 h-8 text-blue-400" />
                      Acerca del Dr. {profile.first_name}
                    </h2>
                    
                    <div className="prose prose-lg prose-invert max-w-none">
                      <p className="text-white/80 leading-relaxed font-inter mb-6">
                        Psicólogo profesional especializado en {profile.specialization || 'terapia psicológica'}, 
                        con amplia experiencia en el tratamiento de diversos trastornos emocionales y del comportamiento. 
                        Comprometido con brindar atención de la más alta calidad utilizando enfoques terapéuticos 
                        basados en evidencia científica.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-400" />
                            Enfoque Terapéutico
                          </h4>
                          <p className="text-white/70 text-sm">Terapia cognitivo-conductual, humanística y sistémica</p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-400" />
                            Experiencia
                          </h4>
                          <p className="text-white/70 text-sm">Más de 5 años de experiencia clínica</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-playfair font-bold text-white mb-6 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      Especialidades
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "Ansiedad y Estrés", icon: "🧘‍♀️" },
                        { name: "Depresión", icon: "🌅" },
                        { name: "Terapia de Pareja", icon: "💑" },
                        { name: "Terapia Familiar", icon: "👨‍👩‍👧‍👦" },
                        { name: "Trastornos del Sueño", icon: "😴" },
                        { name: "Autoestima", icon: "💪" }
                      ].map((specialty, index) => (
                        <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{specialty.icon}</span>
                            <span className="text-white font-inter">{specialty.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact & CTA - 1 column */}
              <div className="space-y-8">
                
                {/* Contact Information */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-playfair font-bold text-white mb-6 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-blue-400" />
                      Contacto Premium
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Primary CTA */}
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-6 rounded-xl border border-white/20 shadow-luxury">
                        <h4 className="text-white font-bold mb-2 font-inter">Solicitar Consulta</h4>
                        <p className="text-white/90 text-sm mb-4 font-inter">
                          Agenda tu sesión profesional de manera segura y confidencial
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/register'}
                          className="w-full bg-white text-blue-600 hover:bg-white/90 font-inter font-semibold py-3"
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Agendar Cita
                        </Button>
                      </div>
                      
                      {/* Video Consultation */}
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                          <Video className="w-5 h-5" />
                          <span className="font-semibold font-inter">Consulta Online</span>
                        </div>
                        <p className="text-white/70 text-sm font-inter">
                          Sesiones por videollamada desde la comodidad de tu hogar
                        </p>
                      </div>
                      
                      {/* In-Person */}
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                          <MapPin className="w-5 h-5" />
                          <span className="font-semibold font-inter">Consulta Presencial</span>
                        </div>
                        <p className="text-white/70 text-sm font-inter">
                          Atención personalizada en consultorio profesional
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Info */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                      <h4 className="text-white font-bold mb-2 font-inter">ProConnection</h4>
                      <p className="text-white/70 text-sm mb-4 font-inter">
                        Plataforma premium de gestión de salud mental con los más altos estándares de seguridad
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="w-full border-white/20 text-white hover:bg-white/10 font-inter"
                      >
                        Conocer la Plataforma
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Premium Footer */}
            <footer className="text-center py-8 border-t border-white/10">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Shield className="w-5 h-5" />
                  <span className="font-inter text-sm">
                    Perfil profesional verificado y protegido por
                  </span>
                </div>
                <a 
                  href="/" 
                  className="text-emerald-400 hover:text-emerald-300 font-semibold font-inter transition-colors"
                >
                  ProConnection Premium
                </a>
                <p className="text-white/40 text-xs font-inter max-w-2xl">
                  Plataforma líder en gestión psicológica profesional • Tecnología segura • Confidencialidad garantizada
                </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
};
