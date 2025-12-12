import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Crown, Mail, Phone, Shield, CreditCard, Clock, AlertTriangle, Bell, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { ReminderSettingsManager } from "./ReminderSettingsManager";
import { NotificationCenter } from "./NotificationCenter";

interface ExpandedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpandedSettingsModal = ({ isOpen, onClose }: ExpandedSettingsModalProps) => {
  const { profile, psychologist, refetch } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(psychologist?.first_name || "");
  const [lastName, setLastName] = useState(psychologist?.last_name || "");
  const [phone, setPhone] = useState(psychologist?.phone || "");
  const [specialization, setSpecialization] = useState(psychologist?.specialization || "");
  const [newEmail, setNewEmail] = useState("");
  
  // Subscription info state
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  useEffect(() => {
    if (psychologist) {
      setFirstName(psychologist.first_name || "");
      setLastName(psychologist.last_name || "");
      setPhone(psychologist.phone || "");
      setSpecialization(psychologist.specialization || "");
      fetchSubscriptionInfo();
    }
  }, [psychologist]);

  const fetchSubscriptionInfo = async () => {
    if (!psychologist?.id) return;

    try {
      // Get trial days remaining
      const { data: trialDays } = await supabase.rpc('get_trial_days_remaining', {
        psychologist_id: psychologist.id
      });
      
      setTrialDaysRemaining(trialDays || 0);
      setSubscriptionInfo({
        status: psychologist.subscription_status,
        plan_type: psychologist.plan_type,
        trial_end_date: psychologist.trial_end_date,
        subscription_end_date: psychologist.subscription_end_date
      });
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!psychologist) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('psychologists')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          specialization: specialization,
        })
        .eq('id', psychologist.id);

      if (error) throw error;
      
      toast.success("Perfil actualizado correctamente");
      refetch();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });

      if (error) throw error;
      
      toast.success("Se ha enviado un email de confirmación a tu nueva dirección");
      setNewEmail("");
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast.error(error.message || "Error al cambiar el email");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'pro':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'plus':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'trial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración Profesional</DialogTitle>
          <DialogDescription>
            Gestiona tu perfil, suscripción, notificaciones y recordatorios.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="reminders">Recordatorios</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {/* ... keep existing code (profile tab content) */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Tu número de teléfono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialización</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Tu especialización"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Cambiar Email
                </h4>
                <p className="text-sm text-gray-600">
                  Email actual: {profile?.email}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nuevo@email.com"
                    type="email"
                  />
                  <Button onClick={handleChangeEmail} disabled={isLoading}>
                    Cambiar
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={handleSaveProfile} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Guardando..." : "Guardar Perfil"}
              </Button>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            {/* ... keep existing code (subscription tab content) */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Plan Actual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Plan:</span>
                    <Badge className={getPlanBadgeColor(subscriptionInfo?.plan_type || 'starter')}>
                      {(() => {
                        const planType = (subscriptionInfo?.plan_type || 'starter').toLowerCase();
                        if (planType === 'proconnection') return 'PROCONNECTION';
                        if (planType === 'teams') return 'TEAMS';
                        return 'STARTER';
                      })()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Estado:</span>
                    <Badge className={getStatusBadgeColor(subscriptionInfo?.status || 'trial')}>
                      {subscriptionInfo?.status === 'trial' ? 'PRUEBA GRATUITA' : 
                       subscriptionInfo?.status === 'active' ? 'ACTIVO' : 
                       'EXPIRADO'}
                    </Badge>
                  </div>

                  {subscriptionInfo?.status === 'trial' && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Días restantes:
                      </span>
                      <span className="font-semibold">
                        {trialDaysRemaining} días
                      </span>
                    </div>
                  )}

                  {subscriptionInfo?.trial_end_date && (
                    <div className="flex items-center justify-between">
                      <span>Finaliza:</span>
                      <span className="text-sm">
                        {new Date(subscriptionInfo.trial_end_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}

                  {trialDaysRemaining <= 3 && trialDaysRemaining > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Tu prueba gratuita expira pronto
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Gestión de Suscripción
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subscriptionInfo?.plan_type === 'starter' && (
                    <Button className="w-full" variant="outline">
                      <Crown className="w-4 h-4 mr-2" />
                      Actualizar a ProConnection
                    </Button>
                  )}
                  {subscriptionInfo?.plan_type === 'proconnection' && (
                    <Button className="w-full" variant="outline">
                      <Crown className="w-4 h-4 mr-2" />
                      Actualizar a Teams
                    </Button>
                  )}
                  
                  <Button className="w-full" variant="outline">
                    Renovar Suscripción
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    Ver Historial de Pagos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Centro de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Configuración de Recordatorios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReminderSettingsManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visibilidad del perfil</Label>
                  <p className="text-sm text-slate-600">
                    Permite que otros profesionales vean tu perfil
                  </p>
                </div>
                <Switch
                  checked={profileVisibility}
                  onCheckedChange={setProfileVisibility}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir datos analíticos</Label>
                  <p className="text-sm text-slate-600">
                    Ayuda a mejorar la plataforma compartiendo datos anónimos
                  </p>
                </div>
                <Switch
                  checked={shareAnalytics}
                  onCheckedChange={setShareAnalytics}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Button className="w-full">
                  Guardar Configuración
                </Button>
                
                <Button variant="destructive" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
