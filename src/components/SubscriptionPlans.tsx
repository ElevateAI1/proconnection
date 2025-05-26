
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

interface SubscriptionPlansProps {
  onPlanSelect: (planId: string) => void;
}

export const SubscriptionPlans = ({ onPlanSelect }: SubscriptionPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'Plan Mensual',
      price: 2900,
      currency: 'ARS',
      interval: 'monthly',
      features: [
        'Gestión ilimitada de pacientes',
        'Sistema de citas y recordatorios',
        'Mensajería segura con pacientes',
        'Reportes y estadísticas básicas',
        'Soporte técnico estándar'
      ]
    },
    {
      id: 'yearly',
      name: 'Plan Anual',
      price: 29000,
      currency: 'ARS',
      interval: 'yearly',
      popular: true,
      features: [
        'Gestión ilimitada de pacientes',
        'Sistema de citas y recordatorios',
        'Mensajería segura con pacientes',
        'Reportes y estadísticas avanzadas',
        'Documentos y formularios profesionales',
        'Soporte técnico prioritario',
        '2 meses gratis (equivale a 10 meses)',
        'Descuentos en futuras actualizaciones'
      ]
    }
  ];

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan.id);
    setIsLoading(true);

    try {
      // Llamar a la función que creará la preferencia de MercadoPago
      await onPlanSelect(plan.id);
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu selección. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(price);
    
    return `${formatted} / ${interval === 'monthly' ? 'mes' : 'año'}`;
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Elige tu Plan de Suscripción
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Activa tu suscripción para continuar usando todas las funciones de PsiConnect 
          y gestionar tu práctica profesional sin interrupciones.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative border-2 transition-all duration-200 hover:shadow-lg ${
              plan.popular ? 'border-blue-500 shadow-md' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Más Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800">
                {plan.name}
              </CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold text-blue-600">
                  {formatPrice(plan.price, plan.currency, plan.interval)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan)}
                disabled={isLoading && selectedPlan === plan.id}
                className={`w-full py-3 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                    : 'bg-slate-800 hover:bg-slate-900'
                }`}
                size="lg"
              >
                {isLoading && selectedPlan === plan.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {isLoading && selectedPlan === plan.id ? 'Procesando...' : 'Suscribirse Ahora'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Pago seguro procesado por MercadoPago. Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  );
};
