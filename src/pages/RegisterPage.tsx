import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthPage } from "@/components/AuthPage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, ArrowRight, CheckCircle, Star, Shield, Headphones, Clock, CreditCard } from "lucide-react";

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [affiliateInfo, setAffiliateInfo] = useState<{
    code: string;
    discount_rate: number;
    psychologist_name?: string;
  } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidationComplete, setCodeValidationComplete] = useState(false);

  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (referralCode) {
      validateAffiliateCode(referralCode);
    } else {
      setCodeValidationComplete(true);
    }
  }, [referralCode]);

  const validateAffiliateCode = async (code: string) => {
    try {
      setValidatingCode(true);
      
      // Get the affiliate code
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliate_codes')
        .select('code, discount_rate, psychologist_id, is_active')
        .eq('code', code)
        .maybeSingle();

      if (affiliateError) {
        console.error('Error fetching affiliate code:', affiliateError);
        setCodeValidationComplete(true);
        return;
      }

      if (!affiliateData) {
        setCodeValidationComplete(true);
        return;
      }

      if (!affiliateData.is_active) {
        setCodeValidationComplete(true);
        return;
      }

      // Get the psychologist info separately
      let psychologistName = undefined;
      if (affiliateData.psychologist_id) {
        const { data: psychologistData, error: psychologistError } = await supabase
          .from('psychologists')
          .select('first_name, last_name')
          .eq('id', affiliateData.psychologist_id)
          .maybeSingle();

        if (!psychologistError && psychologistData) {
          psychologistName = `${psychologistData.first_name} ${psychologistData.last_name}`;
        }
      }

      setAffiliateInfo({
        code: affiliateData.code,
        discount_rate: affiliateData.discount_rate,
        psychologist_name: psychologistName
      });

      toast({
        title: "¡Código válido!",
        description: `Obtendrás un ${affiliateData.discount_rate}% de descuento en tu primera suscripción`,
      });

    } catch (error) {
      console.error('Error validating affiliate code:', error);
    } finally {
      setValidatingCode(false);
      setCodeValidationComplete(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header with Enhanced Trial Messaging */}
        <div className="text-center mb-12">
          {/* Trial Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">7 DÍAS GRATIS</span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Únete a ProConnection
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Crea tu cuenta y comienza a gestionar tu práctica profesional con las mejores herramientas del mercado
          </p>
          
          {/* Free Trial Highlights */}
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800">
                Prueba GRATIS por 7 días - Sin tarjeta de crédito
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Acceso completo a todas las funciones</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Cancela en cualquier momento</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Sin compromisos ni permanencia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Referral Info Card */}
            {referralCode && (
              <div className="lg:order-1">
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-emerald-800">
                      <UserCheck className="w-6 h-6" />
                      Código de Referido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validatingCode ? (
                      <div className="flex items-center justify-center gap-3 text-slate-600 py-8">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">Validando código...</span>
                      </div>
                    ) : codeValidationComplete && affiliateInfo ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="inline-block">
                            <div className="text-3xl font-mono font-bold text-emerald-700 bg-white p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
                              {affiliateInfo.code}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Badge className="bg-emerald-600 text-white px-6 py-2 text-lg font-semibold">
                            {affiliateInfo.discount_rate}% de descuento
                          </Badge>
                        </div>

                        {affiliateInfo.psychologist_name && (
                          <div className="text-center bg-white p-4 rounded-lg border border-emerald-200">
                            <p className="text-sm text-slate-600 mb-1">
                              Referido por:
                            </p>
                            <p className="font-semibold text-slate-800 text-lg">
                              Dr. {affiliateInfo.psychologist_name}
                            </p>
                          </div>
                        )}

                        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-emerald-600" />
                            Beneficios incluidos:
                          </h4>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-700">{affiliateInfo.discount_rate}% de descuento en tu primera suscripción</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-700">Acceso completo a todas las funcionalidades</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <Headphones className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-700">Soporte prioritario durante el primer mes</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-700">Configuración guiada de tu perfil profesional</span>
                            </li>
                          </ul>
                        </div>

                        <div className="flex items-center gap-3 text-emerald-700 bg-white p-4 rounded-lg border-2 border-emerald-200">
                          <ArrowRight className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">
                            Completa tu registro para aplicar el descuento automáticamente
                          </span>
                        </div>
                      </div>
                    ) : codeValidationComplete && !affiliateInfo && referralCode ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">❌</span>
                        </div>
                        <p className="text-red-600 font-medium text-lg">Código de referido inválido</p>
                        <p className="text-slate-600 mt-2">
                          El código "{referralCode}" no existe o ha expirado. Puedes continuar con el registro normal.
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Auth Component - Solo mostrar cuando la validación esté completa */}
            {(!referralCode || codeValidationComplete) && (
              <div className={`${referralCode ? 'lg:order-2' : 'mx-auto'}`}>
                <AuthPage affiliateCode={referralCode} registrationOnly={true} />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Features Section with Trial Benefits */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              ¿Por qué elegir ProConnection?
            </h2>
            <p className="text-slate-600">
              Descubre todo lo que incluye tu prueba gratuita de 7 días
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">7 Días Completamente Gratis</h3>
              <p className="text-slate-600 text-sm">Acceso total sin limitaciones ni tarjeta de crédito</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Seguro y Confiable</h3>
              <p className="text-slate-600 text-sm">Cumplimos con todos los estándares de seguridad y privacidad</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Soporte Incluido</h3>
              <p className="text-slate-600 text-sm">Asistencia personalizada durante tu período de prueba</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
