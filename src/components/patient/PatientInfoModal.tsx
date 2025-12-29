import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PatientInfoModalProps {
  open: boolean;
  onComplete: () => void;
}

export const PatientInfoModal = ({ open, onComplete }: PatientInfoModalProps) => {
  const { user } = useAuth();
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!age) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu edad",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    try {
      // Actualizar solo la edad (el paciente debe existir ya)
      const { error } = await supabase
        .from('patients')
        .update({ age: parseInt(age) })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating patient:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la información",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Información guardada",
        description: "Tu información ha sido guardada correctamente"
      });
      
      onComplete();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Completa tu información</DialogTitle>
          <DialogDescription>
            Antes de continuar, necesitamos algunos datos básicos para tu perfil
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Edad *</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Tu edad"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

