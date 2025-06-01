<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======

import { useState, useEffect } from 'react';
>>>>>>> parent of bbf9548 (Implement Jitsi Meet creation)
import { useParams } from 'react-router-dom';
import { useExpandedPublicProfiles } from '@/hooks/useExpandedPublicProfiles';
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
  about_description?: string;
  therapeutic_approach?: string;
  years_experience?: number;
  profession_type?: string;
  first_name: string;
  last_name: string;
  specialization?: string;
  professional_code: string;
  config_title?: string;
  config_description?: string;
  config_keywords?: string;
  config_custom_url?: string;
  selected_specialties?: Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
  }>;
}

const professionTitles: Record<string, string> = {
  psychologist: 'Psicólogo/a',
  doctor: 'Dr.',
  physiotherapist: 'Fisioterapeuta',
  kinesiologist: 'Kinesiólogo/a',
  occupational_therapist: 'Terapeuta Ocupacional',
  massage_therapist: 'Masajista Terapéutico',
  osteopath: 'Osteópata',
  nutritionist: 'Nutricionista',
  coach: 'Coach',
};

const professionDescriptions: Record<string, string> = {
  psychologist: 'Especialista en salud mental y bienestar emocional',
  doctor: 'Profesional médico especializado',
  physiotherapist: 'Especialista en rehabilitación y movimiento',
  kinesiologist: 'Experto en kinesiología y terapia física',
  occupational_therapist: 'Especialista en terapia ocupacional',
  massage_therapist: 'Experto en terapias de masaje',
  osteopath: 'Especialista en osteopatía',
  nutritionist: 'Experto en nutrición y alimentación',
  coach: 'Especialista en coaching y desarrollo personal',
};

export const PublicProfilePage = () => {
  const { profileUrl } = useParams<{ profileUrl: string }>();
  const { getPublicProfileByUrlDetailed } = useExpandedPublicProfiles();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    if (profileUrl) {
      fetchPublicProfile(profileUrl);
    }
  }, [profileUrl]);

  const fetchPublicProfile = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('public_profiles')
        .select(`
          *,
          specialties (
            id,
            name,
            category,
            icon
          )
        `)
        .eq('custom_url', url)
        .eq('is_active', true)
        .single();

      if (fetchError) {
        console.error('Error fetching public profile:', fetchError);
        setError('Perfil no encontrado');
=======
    const loadProfile = async () => {
      if (!profileUrl) {
        setNotFound(true);
        setLoading(false);
>>>>>>> parent of 7f16e39 (Fix: Handle 404 error on root path)
        return;
      }

      try {
        setLoading(true);
        console.log('=== LOADING EXPANDED PUBLIC PROFILE ===', profileUrl);
        
        const profileData = await getPublicProfileByUrlDetailed(profileUrl);
        
        if (profileData) {
          setProfile(profileData);
          console.log('=== EXPANDED PROFILE LOADED ===', profileData);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('=== ERROR LOADING EXPANDED PROFILE ===', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
      const profileData: PublicProfileData = {
        ...data,
        selected_specialties: selectedSpecialties
      };

      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };
=======
    loadProfile();
  }, [profileUrl]);
>>>>>>> parent of 7f16e39 (Fix: Handle 404 error on root path)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white/80 text-lg">Cargando perfil profesional premium...</p>
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
            <h1 className="text-4xl font-bold text-white mb-6">
              Perfil no encontrado
            </h1>
            <p className="text-xl text-white/80 mb-8">
              El perfil profesional que buscas no existe o no está disponible públicamente.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white px-8 py-3"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const professionTitle = professionTitles[profile.profession_type || 'psychologist'] || 'Profesional';
  const professionDescription = professionDescriptions[profile.profession_type || 'psychologist'] || 'Especialista profesional';

  const seoTitle = profile.seo_title || profile.config_title || `${professionTitle} ${profile.first_name} ${profile.last_name} - Profesional Verificado`;
  const seoDescription = profile.seo_description || profile.config_description || profile.about_description || `Consulta profesional con ${professionTitle} ${profile.first_name} ${profile.last_name}. ${professionDescription}.`;
  const seoKeywords = profile.seo_keywords || profile.config_keywords || `${professionTitle.toLowerCase()}, consulta, ${profile.profession_type || 'profesional'}`;

  // Agrupar especialidades por categoría
  const groupedSpecialties = (profile.selected_specialties || []).reduce((acc, specialty) => {
    const category = specialty.category || 'Otras';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(specialty);
    return acc;
  }, {} as Record<string, typeof profile.selected_specialties>);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/perfil/${profile.custom_url}`} />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": `${professionTitle} ${profile.first_name} ${profile.last_name}`,
            "jobTitle": professionTitle,
            "description": seoDescription,
            "url": `${window.location.origin}/perfil/${profile.custom_url}`,
            "knowsAbout": profile.selected_specialties?.map(s => s.name).join(', ') || professionDescription,
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
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <span className="font-bold text-2xl text-white">ProConnection</span>
                  <p className="text-white/60 text-sm">Plataforma Premium de Profesionales de Salud</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-md px-4 py-2">
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
                    <span className="text-white text-5xl font-bold">
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
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {professionTitle} {profile.first_name} {profile.last_name}
              </h1>
              
              <p className="text-2xl text-blue-200 mb-6 italic">
                {professionDescription}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>Código: {profile.professional_code}</span>
                </div>
                {profile.years_experience && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span>{profile.years_experience} años de experiencia</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>{profile.view_count} consultas</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Star className="w-5 h-5 text-emerald-400" />
                  <span>Especialista Certificado</span>
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
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                      <Brain className="w-8 h-8 text-blue-400" />
                      Acerca de {professionTitle} {profile.first_name}
                    </h2>
                    
                    <div className="prose prose-lg prose-invert max-w-none">
                      <p className="text-white/80 leading-relaxed mb-6">
                        {profile.about_description || `${professionTitle} especializado en brindar atención de la más alta calidad utilizando enfoques basados en evidencia científica. Comprometido con el bienestar y desarrollo de cada persona.`}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {profile.therapeutic_approach && (
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <Heart className="w-5 h-5 text-red-400" />
                              Enfoque Profesional
                            </h4>
                            <p className="text-white/70 text-sm">{profile.therapeutic_approach}</p>
                          </div>
                        )}
                        
                        {profile.years_experience && (
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-green-400" />
                              Experiencia
                            </h4>
                            <p className="text-white/70 text-sm">{profile.years_experience} años de experiencia profesional</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                {profile.selected_specialties && profile.selected_specialties.length > 0 && (
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
                )}
              </div>

              {/* Contact & CTA - 1 column */}
              <div className="space-y-8">
                
                {/* Contact Information */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-glass animate-fade-in-scale">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-blue-400" />
                      Contacto Premium
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Primary CTA */}
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-6 rounded-xl border border-white/20 shadow-luxury">
                        <h4 className="text-white font-bold mb-2">Solicitar Consulta</h4>
                        <p className="text-white/90 text-sm mb-4">
                          Agenda tu sesión profesional de manera segura y confidencial
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/register'}
                          className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-3"
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Agendar Cita
                        </Button>
                      </div>
                      
                      {/* Video Consultation */}
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                          <Video className="w-5 h-5" />
                          <span className="font-semibold">Consulta Online</span>
                        </div>
                        <p className="text-white/70 text-sm">
                          Sesiones por videollamada desde la comodidad de tu hogar
                        </p>
                      </div>
                      
                      {/* In-Person */}
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                          <MapPin className="w-5 h-5" />
                          <span className="font-semibold">Consulta Presencial</span>
                        </div>
                        <p className="text-white/70 text-sm">
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
                      <h4 className="text-white font-bold mb-2">ProConnection</h4>
                      <p className="text-white/70 text-sm mb-4">
                        Plataforma premium de gestión profesional con los más altos estándares de seguridad
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="w-full border-white/20 text-white hover:bg-white/10"
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
                  <span className="text-sm">
                    Perfil profesional verificado y protegido por
                  </span>
                </div>
                <a 
                  href="/" 
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  ProConnection Premium
                </a>
                <p className="text-white/40 text-xs max-w-2xl">
                  Plataforma líder en gestión profesional • Tecnología segura • Confidencialidad garantizada
                </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
};
