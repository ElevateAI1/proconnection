
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, TrendingUp, Clock, CheckCircle, CreditCard, Plus, Eye, UserPlus } from 'lucide-react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { useAdmin } from '@/hooks/useAdmin';

export const AffiliateAdminPanel = () => {
  const { 
    affiliateStats, 
    pendingPayments, 
    affiliateReferrals,
    loading, 
    isAdmin, 
    approvePayment,
    processSubscriptionCommission,
    createAffiliateCode,
    refetch 
  } = useAffiliateAdmin();

  const { psychologistStats } = useAdmin();

  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [commissionDialog, setCommissionDialog] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<any>(null);
  const [subscriptionAmount, setSubscriptionAmount] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  const handleApprovePayment = async () => {
    if (!selectedPayment || !paymentMethod) return;

    setIsProcessing(true);
    try {
      await approvePayment(selectedPayment.id, paymentMethod, paymentReference);
      setPaymentDialog(false);
      setSelectedPayment(null);
      setPaymentMethod('');
      setPaymentReference('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessCommission = async () => {
    if (!selectedPsychologist || !subscriptionAmount) return;

    setIsProcessing(true);
    try {
      await processSubscriptionCommission(selectedPsychologist.id, parseFloat(subscriptionAmount));
      setCommissionDialog(false);
      setSelectedPsychologist(null);
      setSubscriptionAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAffiliateCode = async (psychologistId: string) => {
    await createAffiliateCode(psychologistId);
  };

  const totalPendingPayments = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaidAmount = affiliateStats.reduce((sum, stat) => sum + stat.paid_amount, 0);
  const totalActiveReferrals = affiliateStats.reduce((sum, stat) => sum + stat.active_referrals, 0);

  // Psicólogos sin código de afiliado
  const psychologistsWithoutAffiliate = psychologistStats.filter(p => 
    !affiliateStats.some(a => a.id === p.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sistema de Afiliados</h2>
          <p className="text-slate-600">Gestiona comisiones, pagos y referidos</p>
        </div>
        <Button onClick={refetch} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveReferrals}</div>
            <p className="text-xs text-muted-foreground">Total de referidos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${totalPendingPayments.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">{pendingPayments.length} pagos pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaidAmount.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">Comisiones ya pagadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Psicólogos Afiliados</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{affiliateStats.length}</div>
            <p className="text-xs text-muted-foreground">Con código de afiliado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Estadísticas de Afiliados</TabsTrigger>
          <TabsTrigger value="payments">
            Pagos Pendientes 
            {pendingPayments.length > 0 && (
              <Badge className="ml-2 bg-orange-500">{pendingPayments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Eye className="w-4 h-4 mr-1" />
            Referidos
          </TabsTrigger>
          <TabsTrigger value="manage">
            <UserPlus className="w-4 h-4 mr-1" />
            Gestionar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Psicólogos con Sistema de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Código Profesional</TableHead>
                    <TableHead>Código Afiliado</TableHead>
                    <TableHead>Referidos</TableHead>
                    <TableHead>Comisión %</TableHead>
                    <TableHead>Ganancias Totales</TableHead>
                    <TableHead>Pendiente</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">
                        {stat.first_name} {stat.last_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {stat.professional_code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {stat.affiliate_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {stat.active_referrals} activos / {stat.total_referrals} total
                        </Badge>
                      </TableCell>
                      <TableCell>{stat.commission_rate}%</TableCell>
                      <TableCell className="font-semibold">
                        ${stat.affiliate_earnings.toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell>
                        <span className="text-orange-600 font-medium">
                          ${stat.pending_payments.toLocaleString('es-AR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          ${stat.paid_amount.toLocaleString('es-AR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPsychologist(stat);
                            setCommissionDialog(true);
                          }}
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Comisión
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {affiliateStats.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay psicólogos con sistema de afiliados activo
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Pagos de Comisiones Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Código Profesional</TableHead>
                    <TableHead>Código Afiliado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.psychologist.first_name} {payment.psychologist.last_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.psychologist.professional_code}
                      </TableCell>
                      <TableCell>
                        {payment.psychologist.affiliate_code && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {payment.psychologist.affiliate_code}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${payment.amount.toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Pendiente
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setPaymentDialog(true);
                          }}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Aprobar Pago
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {pendingPayments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay pagos pendientes
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Referidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código Afiliado</TableHead>
                    <TableHead>Referidor</TableHead>
                    <TableHead>Referido</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Comisión Ganada</TableHead>
                    <TableHead>Descuento Aplicado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="outline">
                          {referral.affiliate_code?.code || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {referral.referrer?.first_name} {referral.referrer?.last_name}
                        <br />
                        <span className="text-xs text-slate-500">
                          {referral.referrer?.professional_code}
                        </span>
                      </TableCell>
                      <TableCell>
                        {referral.referred?.first_name} {referral.referred?.last_name}
                        <br />
                        <span className="text-xs text-slate-500">
                          {referral.referred?.professional_code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${referral.commission_earned?.toLocaleString('es-AR') || '0'}
                      </TableCell>
                      <TableCell>
                        {referral.discount_applied}%
                      </TableCell>
                      <TableCell>
                        {new Date(referral.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {affiliateReferrals.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay referidos registrados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Crear Códigos de Afiliado</CardTitle>
              <p className="text-sm text-slate-600">
                Psicólogos registrados que aún no tienen código de afiliado
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Código Profesional</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {psychologistsWithoutAffiliate.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell className="font-medium">
                        {psychologist.first_name} {psychologist.last_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {psychologist.professional_code}
                      </TableCell>
                      <TableCell>
                        {new Date(psychologist.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleCreateAffiliateCode(psychologist.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Crear Código
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {psychologistsWithoutAffiliate.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Todos los psicólogos ya tienen código de afiliado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para aprobar pago */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Pago de Comisión</DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Psicólogo:</p>
                <p className="font-medium">
                  {selectedPayment.psychologist.first_name} {selectedPayment.psychologist.last_name}
                </p>
                <p className="text-sm text-slate-600 mt-2">Monto a pagar:</p>
                <p className="text-lg font-bold text-green-600">
                  ${selectedPayment.amount.toLocaleString('es-AR')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de pago</Label>
                <Input
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Ej: Transferencia bancaria, MercadoPago, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Referencia de pago (opcional)</Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Número de transferencia, ID de transacción, etc."
                />
              </div>

              <Button 
                onClick={handleApprovePayment} 
                disabled={!paymentMethod || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Procesando...' : 'Marcar como Pagado'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para procesar comisión manual */}
      <Dialog open={commissionDialog} onOpenChange={setCommissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Comisión Manual</DialogTitle>
          </DialogHeader>
          
          {selectedPsychologist && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Psicólogo:</p>
                <p className="font-medium">
                  {selectedPsychologist.first_name} {selectedPsychologist.last_name}
                </p>
                <p className="text-sm text-slate-600 mt-2">Tasa de comisión:</p>
                <p className="font-medium">{selectedPsychologist.commission_rate}%</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionAmount">Monto de suscripción</Label>
                <Input
                  id="subscriptionAmount"
                  type="number"
                  value={subscriptionAmount}
                  onChange={(e) => setSubscriptionAmount(e.target.value)}
                  placeholder="Ej: 2900"
                  required
                />
                {subscriptionAmount && (
                  <p className="text-sm text-slate-600">
                    Comisión a generar: ${(parseFloat(subscriptionAmount) * selectedPsychologist.commission_rate / 100).toLocaleString('es-AR')}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleProcessCommission} 
                disabled={!subscriptionAmount || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Procesando...' : 'Calcular Comisión'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
