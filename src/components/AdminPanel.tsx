import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Users, Calendar, Clock, AlertTriangle, Crown, Star, Shield } from 'lucide-react';

interface PsychologistStats {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  professional_code: string;
  subscription_status: string;
  trial_start_date: string;
  trial_end_date: string;
  subscription_end_date: string;
  created_at: string;
  trial_days_remaining: number;
  subscription_days_remaining: number;
  is_expired: boolean;
  plan_type: string;
}

export const AdminPanel = () => {
  const { isAdmin, psychologistStats, loading, forceRefresh } = useAdmin();
  const [selectedPsychologist, setSelectedPsychologist] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [subscriptionDays, setSubscriptionDays] = useState<number>(30);
  const [trialDays, setTrialDays] = useState<number>(7);
  const [newPlanType, setNewPlanType] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600">No tienes permisos para acceder al panel de administración.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updatePsychologistStatus = async () => {
    if (!selectedPsychologist || !newStatus) {
      toast({
        title: "Error",
        description: "Selecciona un psicólogo y un nuevo estado",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      console.log('Updating psychologist status:', { selectedPsychologist, newStatus, subscriptionDays });

      const { error } = await supabase.rpc('admin_update_subscription_status', {
        psychologist_id: selectedPsychologist,
        new_status: newStatus,
        subscription_days: newStatus === 'active' ? subscriptionDays : null
      });

      if (error) {
        console.error('Error updating subscription status:', error);
        throw error;
      }

      // Disparar eventos de actualización
      window.dispatchEvent(new CustomEvent('adminPlanUpdated', {
        detail: { psychologistId: selectedPsychologist, newStatus }
      }));

      toast({
        title: "Estado actualizado",
        description: "El estado de suscripción ha sido actualizado exitosamente",
      });

      // Refrescar datos
      await forceRefresh();
      
      // Limpiar formulario
      setSelectedPsychologist('');
      setNewStatus('');
      setSubscriptionDays(30);

    } catch (error: any) {
      console.error('Error updating psychologist status:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateTrialDays = async () => {
    if (!selectedPsychologist || trialDays <= 0) {
      toast({
        title: "Error",
        description: "Selecciona un psicólogo y especifica días válidos",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      console.log('Updating trial days:', { selectedPsychologist, trialDays });

      const { error } = await supabase.rpc('admin_update_trial_days', {
        psychologist_id: selectedPsychologist,
        additional_days: trialDays
      });

      if (error) {
        console.error('Error updating trial days:', error);
        throw error;
      }

      // Disparar eventos de actualización
      window.dispatchEvent(new CustomEvent('adminPlanUpdated', {
        detail: { psychologistId: selectedPsychologist, additionalDays: trialDays }
      }));

      toast({
        title: "Trial actualizado",
        description: `Se han agregado ${trialDays} días al trial`,
      });

      // Refrescar datos
      await forceRefresh();
      
      // Limpiar formulario
      setSelectedPsychologist('');
      setTrialDays(7);

    } catch (error: any) {
      console.error('Error updating trial days:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron actualizar los días del trial",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updatePlanType = async () => {
    if (!selectedPsychologist || !newPlanType) {
      toast({
        title: "Error",
        description: "Selecciona un psicólogo y un tipo de plan",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      console.log('Updating plan type:', { selectedPsychologist, newPlanType });

      const { error } = await supabase
        .from('psychologists')
        .update({ 
          plan_type: newPlanType,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPsychologist);

      if (error) {
        console.error('Error updating plan type:', error);
        throw error;
      }

      // Disparar múltiples eventos para asegurar sincronización
      window.dispatchEvent(new CustomEvent('adminPlanUpdated', {
        detail: { psychologistId: selectedPsychologist, newPlan: newPlanType }
      }));
      
      window.dispatchEvent(new CustomEvent('planUpdated', {
        detail: { psychologistId: selectedPsychologist, newPlan: newPlanType }
      }));

      toast({
        title: "Plan actualizado",
        description: `El plan ha sido cambiado a ${newPlanType.toUpperCase()}`,
      });

      // Forzar refresh en todos los hooks relacionados
      await forceRefresh();
      
      // Pequeño delay para asegurar que los eventos se procesen
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('adminPlanUpdated', {
          detail: { psychologistId: selectedPsychologist, newPlan: newPlanType }
        }));
      }, 100);
      
      // Limpiar formulario
      setSelectedPsychologist('');
      setNewPlanType('');

    } catch (error: any) {
      console.error('Error updating plan type:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el tipo de plan",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case 'pro':
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        );
      case 'plus':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            PLUS
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            BASIC
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Activo</Badge>;
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Panel de Administración
          </h1>
          <p className="text-slate-600">Gestión de psicólogos y suscripciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Psicólogos Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{psychologistStats.length}</div>
              <p className="text-sm text-muted-foreground">En la plataforma</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {psychologistStats.filter(p => p.subscription_status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Suscripciones pagas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Trial</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {psychologistStats.filter(p => p.subscription_status === 'trial').length}
              </div>
              <p className="text-sm text-muted-foreground">Periodo de prueba</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {psychologistStats.filter(p => p.is_expired).length}
              </div>
              <p className="text-sm text-muted-foreground">Cuentas vencidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Update Subscription Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Actualizar Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="psychologist-select">Psicólogo</Label>
                <Select value={selectedPsychologist} onValueChange={setSelectedPsychologist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar psicólogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {psychologistStats.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id}>
                        Dr. {psychologist.first_name} {psychologist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-select">Nuevo Estado</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === 'active' && (
                <div>
                  <Label htmlFor="subscription-days">Días de Suscripción</Label>
                  <Input
                    id="subscription-days"
                    type="number"
                    value={subscriptionDays}
                    onChange={(e) => setSubscriptionDays(Number(e.target.value))}
                    min="1"
                  />
                </div>
              )}

              <Button 
                onClick={updatePsychologistStatus} 
                disabled={updating || !selectedPsychologist || !newStatus}
                className="w-full"
              >
                {updating ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </CardContent>
          </Card>

          {/* Update Plan Type */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Cambiar Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plan-psychologist-select">Psicólogo</Label>
                <Select value={selectedPsychologist} onValueChange={setSelectedPsychologist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar psicólogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {psychologistStats.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id}>
                        Dr. {psychologist.first_name} {psychologist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="plan-type-select">Tipo de Plan</Label>
                <Select value={newPlanType} onValueChange={setNewPlanType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plus">Plus</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={updatePlanType} 
                disabled={updating || !selectedPsychologist || !newPlanType}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {updating ? 'Actualizando...' : 'Cambiar Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Update Trial Days */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Extender Trial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trial-psychologist-select">Psicólogo</Label>
                <Select value={selectedPsychologist} onValueChange={setSelectedPsychologist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar psicólogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {psychologistStats.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id}>
                        Dr. {psychologist.first_name} {psychologist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="trial-days-input">Días a Agregar</Label>
                <Input
                  id="trial-days-input"
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  min="1"
                />
              </div>

              <Button 
                onClick={updateTrialDays} 
                disabled={updating || !selectedPsychologist || trialDays <= 0}
                className="w-full"
                variant="outline"
              >
                {updating ? 'Actualizando...' : 'Extender Trial'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Psychologists Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Psicólogos
            </CardTitle>
            <Button onClick={forceRefresh} variant="outline" size="sm">
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Trial</th>
                    <th className="text-left p-2">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {psychologistStats.map((psychologist) => (
                    <tr key={psychologist.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">
                        Dr. {psychologist.first_name} {psychologist.last_name}
                      </td>
                      <td className="p-2 text-sm text-slate-600">
                        {psychologist.email}
                      </td>
                      <td className="p-2 font-mono text-sm">
                        {psychologist.professional_code}
                      </td>
                      <td className="p-2">
                        {getPlanBadge(psychologist.plan_type)}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(psychologist.subscription_status, psychologist.is_expired)}
                      </td>
                      <td className="p-2">
                        {psychologist.subscription_status === 'trial' ? (
                          <span className={`text-sm ${psychologist.trial_days_remaining <= 2 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                            {psychologist.trial_days_remaining} días
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-2 text-sm text-slate-600">
                        {new Date(psychologist.created_at).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
