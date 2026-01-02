
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Heart, Sparkles, UserPlus, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AffiliateInfo {
  psychologist_name: string;
  discount_rate: number;
  code: string;
}

export const ReferralLandingPage = () => {
  const { affiliateCode } = useParams<{ affiliateCode: string }>();
  const navigate = useNavigate();
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAndLoadAffiliateInfo = async () => {
      if (!affiliateCode) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('affiliate_codes')
          .select(`
            code,
            discount_rate,
            psychologists(first_name, last_name)
          `)
          .eq('code', affiliateCode)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          toast({
            title: "Código no válido",
            description: "El código de referido no existe o ha expirado",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setAffiliateInfo({
          psychologist_name: `${data.psychologists.first_name} ${data.psychologists.last_name}`,
          discount_rate: data.discount_rate,
          code: data.code
        });

      } catch (error) {
        console.error('Error validating affiliate code:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadAffiliateInfo();
  }, [affiliateCode, navigate]);

  const handleRegister = () => {
    // Redirect to register with the affiliate code pre-filled
    navigate(`/register?ref=${affiliateCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando código de referido...</p>
        </div>
      </div>
    );
  }

  if (!affiliateInfo) {
    return null;
  }

  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Plataforma Segura",
      description: "Comunicación cifrada y datos protegidos según estándares internacionales"
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      title: "Gestión Integral",
      description: "Maneja pacientes, citas, historiales y facturación en un solo lugar"
    },
    {
      icon: <Heart className="w-6 h-6 text-purple-600" />,
      title: "Enfoque Profesional",
      description: "Herramientas diseñadas específicamente para profesionales de la salud mental"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-orange-600" />,
      title: "Funciones Avanzadas",
      description: "IA para reportes, SEO automático, y sistema de referidos integrado"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-300">
            Invitación Especial
          </Badge>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            ¡Has sido invitado a ProConnection!
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            <span className="font-semibold text-blue-600">{affiliateInfo.psychologist_name}</span> te invita a unirte
          </p>
          <p className="text-lg text-slate-600">
            La plataforma líder para profesionales de la salud mental
          </p>
        </div>

        {/* Discount Banner */}
        <Card className="mb-12 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">
              {affiliateInfo.discount_rate}% de Descuento
            </h2>
            <p className="text-xl opacity-90 mb-4">
              Exclusivo por usar el código: <span className="font-mono bg-white/20 px-2 py-1 rounded">{affiliateInfo.code}</span>
            </p>
            <p className="opacity-75">
              Descuento aplicado automáticamente en tu primer mes
            </p>
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features List */}
        <Card className="mb-12 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-slate-800">
              Lo que incluye ProConnection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Gestión completa de pacientes",
                "Sistema de citas integrado",
                "Mensajería segura",
                "Historiales clínicos digitales",
                "Reportes automáticos",
                "Facturación inteligente",
                "Perfil público SEO",
                "Soporte prioritario",
                "Backup automático"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="border-0 shadow-lg bg-slate-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                ¿Listo para transformar tu práctica profesional?
              </h2>
              <p className="text-slate-600 mb-6">
                Únete a cientos de profesionales que ya confían en ProConnection
              </p>
              <Button 
                onClick={handleRegister} 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg transition-all"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Crear mi cuenta con descuento
              </Button>
              <p className="text-sm text-slate-500 mt-4">
                Sin compromisos • Prueba gratuita de 7 días
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
