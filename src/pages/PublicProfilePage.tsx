
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { ProProfileTemplate } from "@/components/templates/ProProfileTemplate";
import { PlusProfileTemplate } from "@/components/templates/PlusProfileTemplate";
import { Button } from "@/components/ui/button";

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
      
      console.log('=== FETCHING PROFILE ===', profileUrl);
      
      const { data, error } = await supabase
        .from('public_psychologist_profiles')
        .select(`
          *,
          psychologist:psychologists(id, plan_type, first_name, last_name, specialization, phone)
        `)
        .eq('custom_url', profileUrl)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('=== PROFILE FETCH ERROR ===', error);
        throw error;
      }
      if (!data) {
        console.log('=== PROFILE NOT FOUND ===');
        throw new Error('Profile not found');
      }
      
      console.log('=== PROFILE FOUND ===', data);
      console.log('=== PLAN TYPE ===', data.psychologist?.plan_type);
      
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

  // DEBUGGING CRÍTICO - Verificar plan del psicólogo
  const planType = profile.psychologist?.plan_type;
  const isPro = planType === 'pro';
  
  console.log('=== DEBUGGING TEMPLATE SELECTION ===');
  console.log('Profile data:', profile);
  console.log('Psychologist data:', profile.psychologist);
  console.log('Plan type from DB:', planType);
  console.log('Is Pro?:', isPro);
  console.log('Profile URL:', profileUrl);
  console.log('About description length:', profile.about_description?.length);
  console.log('Therapeutic approach exists?:', !!profile.therapeutic_approach);
  console.log('Years experience:', profile.years_experience);
  
  // FORZAR TEMPLATE PRO PARA DEBUGGING
  if (profileUrl === 'mati') {
    console.log('=== FORCING PRO TEMPLATE FOR MATI ===');
    return <ProProfileTemplate profile={profile} />;
  }
  
  // Renderizar template según el plan (lógica original)
  if (isPro) {
    console.log('=== RENDERING PRO TEMPLATE (NORMAL LOGIC) ===');
    return <ProProfileTemplate profile={profile} />;
  } else {
    console.log('=== RENDERING PLUS TEMPLATE (FALLBACK) ===');
    return <PlusProfileTemplate profile={profile} />;
  }
};
