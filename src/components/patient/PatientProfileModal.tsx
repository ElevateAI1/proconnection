import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePatientProfileImage } from "@/hooks/usePatientProfileImage";
import { toast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/forms/PhoneInput";

interface PatientProfileModalProps {
  open: boolean;
  onClose: () => void;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    age?: number | null;
    profile_image_url?: string | null;
  };
  onUpdate: () => void;
}

export const PatientProfileModal = ({ open, onClose, patient, onUpdate }: PatientProfileModalProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfileImage, deleteProfileImage, uploading } = usePatientProfileImage();
  const [formData, setFormData] = useState({
    first_name: patient.first_name,
    last_name: patient.last_name,
    phone: patient.phone || '',
    age: patient.age?.toString() || ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(patient.profile_image_url || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: patient.phone || '',
        age: patient.age?.toString() || ''
      });
      setProfileImage(patient.profile_image_url || null);
      setPreviewUrl(null);
    }
  }, [open, patient]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const newUrl = await uploadProfileImage(file, patient.id);
      setProfileImage(newUrl);
      setPreviewUrl(null);
      onUpdate();
    } catch (error) {
      setPreviewUrl(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!profileImage) return;
    try {
      await deleteProfileImage(patient.id, profileImage);
      setProfileImage(null);
      onUpdate();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Error",
        description: "Nombre y apellido son obligatorios",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          age: formData.age ? parseInt(formData.age) : null
        })
        .eq('id', patient.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente"
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const displayImage = previewUrl || profileImage;
  const getInitials = () => {
    return `${formData.first_name.charAt(0)}${formData.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {displayImage ? (
                <div className="relative">
                  <img
                    src={displayImage}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-soft shadow-lg"
                  />
                  <button
                    onClick={handleDeleteImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-soft to-celeste-gray rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Subiendo..." : "Cambiar foto"}
              </Button>
              {profileImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <PhoneInput
                value={formData.phone}
                onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                label="Teléfono"
                required={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={saving || uploading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-blue-petrol text-white-warm"
              disabled={saving || uploading}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

