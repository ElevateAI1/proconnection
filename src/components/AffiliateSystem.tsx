
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAffiliateSystem } from '@/hooks/useAffiliateSystem';
import { Copy, DollarSign, Users, TrendingUp, Gift } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AffiliateSystem = () => {
  const { affiliateCode, referrals, stats, loading, createAffiliateCode } = useAffiliateSystem();
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      toast({
        title: "Copiado",
        description: "Código copiado al portapapeles",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmado', variant: 'default' as const },
      paid: { label: 'Pagado', variant: 'destructive' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistema de Afiliados</h2>
          <p className="text-muted-foreground">
            Recomienda PsiConnect y gana comisiones por cada nuevo psicólogo
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="code" className="space-y-4">
        <TabsList>
          <TabsTrigger value="code">Mi Código</TabsTrigger>
          <TabsTrigger value="referrals">Referidos</TabsTrigger>
          <TabsTrigger value="earnings">Ganancias</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tu Código de Afiliado</CardTitle>
              <CardDescription>
                Comparte este código para que otros psicólogos obtengan un descuento y tú ganes comisiones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {affiliateCode ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="affiliate-code">Código de Afiliado:</Label>
                    <div className="flex-1 flex items-center space-x-2">
                      <Input
                        id="affiliate-code"
                        value={affiliateCode.code}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        onClick={() => copyToClipboard(affiliateCode.code)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedCode ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Comisión Principal</div>
                      <div className="text-green-600">{affiliateCode.commission_rate}%</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Descuento para Referidos</div>
                      <div className="text-blue-600">{affiliateCode.discount_rate}%</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">Comisión Secundaria</div>
                      <div className="text-purple-600">{affiliateCode.secondary_commission_rate}%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">¿Cómo funciona?</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Comparte tu código con otros psicólogos</li>
                      <li>• Ellos obtienen un {affiliateCode.discount_rate}% de descuento en su suscripción</li>
                      <li>• Tú ganas {affiliateCode.commission_rate}% de comisión por cada pago</li>
                      <li>• Si tus referidos refieren a otros, ganas {affiliateCode.secondary_commission_rate}% adicional</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Aún no tienes un código de afiliado. Créalo para comenzar a ganar comisiones.
                  </p>
                  <Button onClick={createAffiliateCode} disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Código de Afiliado'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Referidos</CardTitle>
              <CardDescription>
                Psicólogos que se han registrado usando tu código de afiliado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          {referral.referred_psychologist?.first_name} {referral.referred_psychologist?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Registrado: {new Date(referral.created_at).toLocaleDateString()}
                        </div>
                        {referral.subscription_start_date && (
                          <div className="text-sm text-muted-foreground">
                            Suscripción iniciada: {new Date(referral.subscription_start_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={getStatusBadge(referral.status).variant}>
                          {getStatusBadge(referral.status).label}
                        </Badge>
                        <div className="text-sm font-medium">
                          ${referral.commission_earned?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aún no tienes referidos. ¡Comparte tu código para comenzar!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ganancias</CardTitle>
              <CardDescription>
                Resumen de tus comisiones y pagos del sistema de afiliados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Ganancias Totales</div>
                    <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Pendiente de Pago</div>
                    <div className="text-2xl font-bold text-orange-600">${stats.pendingPayments.toFixed(2)}</div>
                  </div>
                </div>

                {stats.pendingPayments > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-orange-800 font-medium">Pago Pendiente</div>
                    <div className="text-orange-700 text-sm">
                      Tienes ${stats.pendingPayments.toFixed(2)} pendientes de pago. 
                      Los pagos se procesan mensualmente.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
