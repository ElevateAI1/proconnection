
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CancelAppointmentModalProps {
  appointmentId: string;
  onCancelled: () => void;
  trigger?: React.ReactNode;
}

export const CancelAppointmentModal = ({ appointmentId, onCancelled, trigger }: CancelAppointmentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    if (!appointmentId) {
      toast({
        title: "Error",
        description: "ID de cita inválido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Cancelling appointment:', appointmentId, 'with reason:', reason);
      
      const { error } = await supabase.rpc('cancel_appointment', {
        appointment_id: appointmentId,
        cancellation_reason: reason || 'Sin razón especificada'
      });

      if (error) {
        console.error('Error cancelling appointment:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente",
      });

      setIsOpen(false);
      setReason("");
      onCancelled();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar Cita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <X className="w-5 h-5" />
            Cancelar Cita
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de cancelación (opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo de la cancelación..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Mantener Cita
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? "Cancelando..." : "Cancelar Cita"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
