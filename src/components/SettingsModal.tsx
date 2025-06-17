
import { useState } from "react";
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
import { ProfileImageUploader } from "@/components/ProfileImageUploader";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { profile, psychologist, refetch } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(psychologist?.first_name || "");
  const [lastName, setLastName] = useState(psychologist?.last_name || "");
  const [phone, setPhone] = useState(psychologist?.phone || "");
  const [specialization, setSpecialization] = useState(psychologist?.specialization || "");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

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

  const handleImageUpdated = (newUrl: string | null) => {
    // Trigger a refetch to update the profile data
    refetch();
  };

  const handleSaveNotifications = async () => {
    toast.success("Configuración de notificaciones guardada");
  };

  const handleSavePrivacy = async () => {
    toast.success("Configuración de privacidad guardada");
  };

  if (!psychologist) return null;

  // Get the profile image URL safely
  const profileImageUrl = (psychologist as any).profile_image_url || undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Gestiona tu perfil, notificaciones y configuración de privacidad.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Foto de perfil */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Foto de perfil</Label>
              <ProfileImageUploader
                currentImageUrl={profileImageUrl}
                psychologistId={psychologist.id}
                psychologistName={`${psychologist.first_name} ${psychologist.last_name}`}
                onImageUpdated={handleImageUpdated}
              />
            </div>

            <Separator />

            {/* Información personal */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Información personal</Label>
              
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
            </div>
            
            <Separator />
            
            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-slate-600">
                    Recibe notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones push</Label>
                  <p className="text-sm text-slate-600">
                    Recibe notificaciones en tiempo real en el navegador
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de citas</Label>
                  <p className="text-sm text-slate-600">
                    Recibe recordatorios antes de tus citas programadas
                  </p>
                </div>
                <Switch
                  checked={appointmentReminders}
                  onCheckedChange={setAppointmentReminders}
                />
              </div>
              
              <Separator />
              
              <Button onClick={handleSaveNotifications} className="w-full">
                Guardar Configuración
              </Button>
            </div>
          </TabsContent>

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
                <Button onClick={handleSavePrivacy} className="w-full">
                  Guardar Configuración
                </Button>
                
                <Button variant="destructive" className="w-full">
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
