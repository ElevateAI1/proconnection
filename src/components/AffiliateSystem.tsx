
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, TrendingUp, Link } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AffiliateCode {
  id: string;
  code: string;
  commission_rate: number;
  discount_rate: number;
  is_active: boolean;
  created_at: string;
}

interface AffiliateStats {
  totalReferrals: number;
  totalEarnings: number;
  pendingPayments: number;
  activeReferrals: number;
}

export const AffiliateSystem = () => {
  const { psychologist } = useProfile();
  const [affiliateCode, setAffiliateCode] = useState<AffiliateCode | null>(null);
  const [stats, setStats] = useState<AffiliateStats>({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    activeReferrals: 0
  });
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    if (psychologist) {
      fetchAffiliateData();
    }
  }, [psychologist]);

  const fetchAffiliateData = async () => {
    if (!psychologist) return;

    try {
      setLoading(true);

      // Fetch affiliate code
      const { data: codeData, error: codeError } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('psychologist_id', psychologist.id)
        .maybeSingle();

      if (codeError && codeError.code !== 'PGRST116') {
        console.error('Error fetching affiliate code:', codeError);
      } else {
        setAffiliateCode(codeData);
      }

      // Fetch affiliate stats
      const { data: referralsData, error: referralsError } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('referrer_psychologist_id', psychologist.id);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      } else {
        const totalReferrals = referralsData?.length || 0;
        const totalEarnings = referralsData?.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0) || 0;
        const activeReferrals = referralsData?.filter(ref => ref.status === 'active').length || 0;

        setStats({
          totalReferrals,
          totalEarnings,
          pendingPayments: totalEarnings, // Simplificado para el demo
          activeReferrals
        });
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de afiliados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateCode = async () => {
    if (!psychologist) return;

    try {
      setGeneratingCode(true);
      console.log('Generando código de afiliado para:', psychologist.id);

      // First call the function to generate a unique code
      const { data: generatedCode, error: codeError } = await supabase
        .rpc('generate_affiliate_code');

      if (codeError) {
        console.error('Error generating code:', codeError);
        throw new Error(`Error al generar código: ${codeError.message}`);
      }

      console.log('Código generado:', generatedCode);

      // Then insert the new affiliate code
      const { data: newCode, error: insertError } = await supabase
        .from('affiliate_codes')
        .insert({
          psychologist_id: psychologist.id,
          code: generatedCode,
          commission_rate: 10,
          discount_rate: 15,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting affiliate code:', insertError);
        throw new Error(`Error al guardar código: ${insertError.message}`);
      }

      setAffiliateCode(newCode);
      toast({
        title: "Código generado",
        description: "Tu código de afiliado ha sido creado exitosamente",
      });
    } catch (error) {
      console.error('Error generating affiliate code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo generar el código de afiliado",
        variant: "destructive"
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Código copiado al portapapeles",
    });
  };

  const copyReferralLink = () => {
    if (affiliateCode) {
      const link = `${window.location.origin}/register?ref=${affiliateCode.code}`;
      copyToClipboard(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-slate-600">Cargando sistema de afiliados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sistema de Afiliados</h2>
        <p className="text-slate-600">Refiere a otros psicólogos y gana comisiones por cada suscripción.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Psicólogos referidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrals}</div>
            <p className="text-xs text-muted-foreground">Con suscripción activa</p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tu Código de Afiliado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {affiliateCode ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  value={affiliateCode.code}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(affiliateCode.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Comisión: {affiliateCode.commission_rate}%
                </Badge>
                <Badge variant="secondary">
                  Descuento: {affiliateCode.discount_rate}%
                </Badge>
                <Badge variant={affiliateCode.is_active ? "default" : "destructive"}>
                  {affiliateCode.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-600">Enlace de referido:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${window.location.origin}/register?ref=${affiliateCode.code}`}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-600 mb-4">No tienes un código de afiliado aún.</p>
              <Button
                onClick={generateAffiliateCode}
                disabled={generatingCode}
              >
                {generatingCode ? "Generando..." : "Generar Código de Afiliado"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Comparte tu código</h3>
              <p className="text-sm text-slate-600">Envía tu enlace de referido a otros psicólogos</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Ellos se registran</h3>
              <p className="text-sm text-slate-600">Obtienen un descuento en su primera suscripción</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Tú ganas</h3>
              <p className="text-sm text-slate-600">Recibes una comisión por cada suscripción</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
