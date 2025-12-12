import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SubscriptionPlans } from './SubscriptionPlans';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionPlansModal = ({ isOpen, onClose }: SubscriptionPlansModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-full p-0 overflow-hidden flex flex-col max-h-[90vh] [&>button]:hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                Elige tu Plan de Suscripción
              </DialogTitle>
              <DialogDescription className="text-sm mt-1 text-slate-600">
                Selecciona el plan que mejor se adapte a tus necesidades profesionales
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="px-3 sm:px-4 py-3 sm:py-4 overflow-y-auto flex-1 min-h-0">
          <SubscriptionPlans hideHeader={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

