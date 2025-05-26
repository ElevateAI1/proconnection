
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { SubscriptionPlans } from './SubscriptionPlans';
import { useMercadoPago } from '@/hooks/useMercadoPago';

interface TrialExpiredModalProps {
  onUpgrade: () => void;
}

export const TrialExpiredModal = ({ onUpgrade }: TrialExpiredModalProps) => {
  const { createSubscription } = useMercadoPago();

  const handlePlanSelect = async (planId: string) => {
    try {
      await createSubscription(planId);
      onUpgrade(); // Ejecutar callback original si es necesario
    } catch (error) {
      console.error('Error selecting plan:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl border-0 shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Trial Expirado
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-center mb-6">
            <p className="text-slate-600 mb-4">
              Tu período de prueba de 7 días ha terminado. Para continuar usando 
              PsiConnect y acceder a todas las funciones, selecciona un plan de suscripción.
            </p>
          </div>

          <SubscriptionPlans onPlanSelect={handlePlanSelect} />
        </CardContent>
      </Card>
    </div>
  );
};
