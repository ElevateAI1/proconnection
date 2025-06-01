
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

interface Specialty {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface PublicProfileData {
  id: string;
  first_name: string;
  last_name: string;
  professional_code: string;
  bio: string;
  years_experience: number;
  education: string;
  certifications: string;
  therapy_types: string[];
  languages: string[];
  phone: string;
  email: string;
  office_address: string;
  consultation_price: number;
  custom_url: string;
  is_active: boolean;
  config_title: string;
  config_description: string;
  config_keywords: string;
  config_custom_url: string;
  about_description: string;
  selected_specialties: Specialty[];
}

export const PublicProfilePage = () => {
  const { profileUrl } = useParams<{ profileUrl: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileUrl) {
      fetchPublicProfile(profileUrl);
    }
  }, [profileUrl]);

  const fetchPublicProfile = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('public_profile_detailed_view')
        .select('*')
        .eq('custom_url', url)
        .eq('is_active', true)
        .single();

      if (fetchError) {
        console.error('Error fetching public profile:', fetchError);
        setError('Perfil no encontrado');
        return;
      }

      if (!data) {
        setError('Perfil no encontrado');
        return;
      }

      // Procesar las especialidades
      let selectedSpecialties: Specialty[] = [];
      if (data.selected_specialties) {
        try {
          const specialtiesData = typeof data.selected_specialties === 'string' 
            ? JSON.parse(data.selected_specialties) 
            : data.selected_specialties;
          
          if (Array.isArray(specialtiesData)) {
            selectedSpecialties = specialtiesData;
          }
        } catch (e) {
          console.error('Error parsing selected_specialties:', e);
        }
      }

      const profileData: PublicProfileData = {
        id: data.id || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        professional_code: data.professional_code || '',
        bio: data.specialization || '',
        years_experience: data.years_experience || 0,
        education: '',
        certifications: '',
        therapy_types: [],
        languages: [],
        phone: '',
        email: '',
        office_address: '',
        consultation_price: 0,
        custom_url: data.custom_url || '',
        is_active: data.is_active || false,
        config_title: data.config_title || '',
        config_description: data.config_description || '',
        config_keywords: data.config_keywords || '',
        config_custom_url: data.config_custom_url || '',
        about_description: data.about_description || '',
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

  if (loading) {
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Perfil no encontrado</h1>
          <p className="text-slate-600">{error || 'El perfil que buscas no existe o no está disponible.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.config_title || `${profile.first_name} ${profile.last_name} - Psicólogo`}</title>
        <meta name="description" content={profile.config_description || profile.bio} />
        <meta name="keywords" content={profile.config_keywords || ''} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Dr. {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-slate-600 text-lg">{profile.bio}</p>
                {profile.professional_code && (
                  <p className="text-sm text-slate-500 mt-2">
                    Código Profesional: {profile.professional_code}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Información Profesional</h3>
                  <div className="space-y-3">
                    <p><strong>Experiencia:</strong> {profile.years_experience} años</p>
                    {profile.education && <p><strong>Educación:</strong> {profile.education}</p>}
                    {profile.certifications && <p><strong>Certificaciones:</strong> {profile.certifications}</p>}
                    {profile.consultation_price && (
                      <p><strong>Precio de consulta:</strong> ${profile.consultation_price}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Contacto</h3>
                  <div className="space-y-3">
                    {profile.phone && <p><strong>Teléfono:</strong> {profile.phone}</p>}
                    {profile.email && <p><strong>Email:</strong> {profile.email}</p>}
                    {profile.office_address && <p><strong>Dirección:</strong> {profile.office_address}</p>}
                  </div>
                </div>
              </div>

              {profile.selected_specialties && profile.selected_specialties.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Especialidades</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {profile.selected_specialties.map((specialty) => (
                      <div key={specialty.id} className="bg-blue-50 rounded-lg p-3 text-center">
                        <span className="text-2xl mb-2 block">{specialty.icon}</span>
                        <p className="text-sm font-medium text-slate-800">{specialty.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.about_description && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Acerca de mí</h3>
                  <p className="text-slate-600 leading-relaxed">{profile.about_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
