import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubscriptionPlans } from './SubscriptionPlans';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionModal = ({ open, onOpenChange }: SubscriptionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Planes de Suscripción</DialogTitle>
          <DialogDescription>
            Selecciona el plan que mejor se adapte a tus necesidades profesionales
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <SubscriptionPlans hideHeader={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

