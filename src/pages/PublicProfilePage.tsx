
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfileByUrlDetailed } from '@/hooks/usePublicProfiles';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { PublicProfileHeader } from '@/components/public-profile/PublicProfileHeader';
import { PublicProfileHero } from '@/components/public-profile/PublicProfileHero';
import { PublicProfileAbout } from '@/components/public-profile/PublicProfileAbout';
import { PublicProfileSpecialties } from '@/components/public-profile/PublicProfileSpecialties';
import { PublicProfileContact } from '@/components/public-profile/PublicProfileContact';
import { PublicProfileFooter } from '@/components/public-profile/PublicProfileFooter';

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
  const { customUrl } = useParams<{ customUrl: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setProfile(null);
      setNotFound(false);

      if (!customUrl) {
        console.warn('[PublicProfilePage] No customUrl in params.');
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        console.log(`[PublicProfilePage] Attempting to load profile for: "${customUrl}"`);
        
        const profileData = await getPublicProfileByUrlDetailed(customUrl);
        console.log(`[PublicProfilePage] Fetched profile data for "${customUrl}":`, profileData);
        
        if (profileData) {
          setProfile(profileData as PublicProfileData);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error(`[PublicProfilePage] CATCH BLOCK: Error loading profile for "${customUrl}"`, error);
        setNotFound(true);
      } finally {
        setLoading(false);
        console.log(`[PublicProfilePage] Finished loading attempt for "${customUrl}".`);
      }
    };

    loadProfile();
  }, [customUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white-warm via-blue-soft/10 to-green-mint/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-soft/10 via-transparent to-green-mint/10"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-petrol/20 border-t-blue-petrol rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-blue-petrol/80 text-lg">Cargando perfil profesional...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white-warm via-blue-soft/10 to-green-mint/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-soft/10 via-transparent to-green-mint/10"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-soft/30 to-green-mint/30 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-blue-petrol/20">
              <Users className="w-16 h-16 text-blue-petrol/60" />
            </div>
            <h1 className="text-4xl font-bold text-blue-petrol mb-6">
              Perfil no encontrado
            </h1>
            <p className="text-xl text-blue-petrol/70 mb-8">
              El perfil profesional que buscas no existe o no está disponible públicamente.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-petrol hover:bg-blue-petrol/90 text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 px-8 py-3"
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

      <div className="min-h-screen bg-gradient-to-br from-white-warm via-blue-soft/10 to-green-mint/10 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-soft/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-green-mint/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-lavender-soft/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <PublicProfileHeader />

        <main className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            
            <PublicProfileHero
              firstName={profile.first_name}
              lastName={profile.last_name}
              professionTitle={professionTitle}
              professionDescription={professionDescription}
              professionalCode={profile.professional_code}
              yearsExperience={profile.years_experience}
              viewCount={profile.view_count}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              
              {/* Professional Information - 2 columns */}
              <div className="lg:col-span-2 space-y-8">
                
                <PublicProfileAbout
                  firstName={profile.first_name}
                  professionTitle={professionTitle}
                  aboutDescription={profile.about_description}
                  therapeuticApproach={profile.therapeutic_approach}
                  yearsExperience={profile.years_experience}
                />

                <PublicProfileSpecialties selectedSpecialties={profile.selected_specialties} />
              </div>

              {/* Contact & CTA - 1 column */}
              <PublicProfileContact />
            </div>

            <PublicProfileFooter />
          </div>
        </main>
      </div>
    </>
  );
};
