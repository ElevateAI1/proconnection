import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, AlertTriangle, Crown, Star, MessageCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';
import { PlanBadge } from './PlanBadge';
import { SubscriptionPlans } from './SubscriptionPlans';

export const TrialStatus = () => {
  const { psychologist } = useProfile();
  const { isProConnectionUser, isTeamsUser, isPlusUser, isProUser } = usePlanCapabilities();
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    if (psychologist) {
      fetchTrialStatus();
    }
  }, [psychologist]);

  const fetchTrialStatus = async () => {
    if (!psychologist) return;

    try {
      // Obtener días restantes del trial
      const { data: daysData, error: daysError } = await supabase.rpc('get_trial_days_remaining', {
        psychologist_id: psychologist.id
      });

      if (daysError) {
        console.error('Error fetching trial days:', daysError);
      } else {
        setTrialDaysRemaining(daysData);
      }

      // Verificar si el trial ha expirado
      const { data: expiredData, error: expiredError } = await supabase.rpc('is_trial_expired', {
        psychologist_id: psychologist.id
      });

      if (expiredError) {
        console.error('Error checking trial expiration:', expiredError);
      } else {
        setIsTrialExpired(expiredData);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (message: string) => {
    const phoneNumber = "5491144133576";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If showing subscription plans
  if (showPlans) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowPlans(false)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <SubscriptionPlans />
      </div>
    );
  }

  // Si tiene suscripción activa (ProConnection o Teams)
  if (psychologist?.subscription_status === 'active' && (isProConnectionUser() || isTeamsUser())) {
    return (
      <Card className="border-0 shadow-lg border-l-4 border-l-green-500 py-0 my-[31px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            {isTeamsUser() ? <Crown className="w-5 h-5" /> : <Star className="w-5 h-5" />}
            Plan Activo
            <PlanBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            {isTeamsUser() 
              ? '¡Excelente! Tienes acceso a todas las funciones premium de ProConnection.'
              : '¡Genial! Tu plan ProConnection está activo. Considera actualizar a Teams para funciones avanzadas de equipo.'
            }
          </p>
          {isProConnectionUser() && (
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
              onClick={() => setShowPlans(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Actualizar a Teams
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Si el trial ha expirado
  if (isTrialExpired) {
    return (
      <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Trial Expirado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-600">
              Tu período de prueba ha terminado. Selecciona un plan para continuar usando ProConnection.
            </p>
            <Button 
              className="w-full bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
              onClick={() => setShowPlans(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Ver Planes de Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si está en trial activo
  if (psychologist?.subscription_status === 'trial' && trialDaysRemaining !== null) {
    const isLastDays = trialDaysRemaining <= 2;
    
    return (
      <Card className={`border-0 shadow-lg border-l-4 ${isLastDays ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isLastDays ? 'text-orange-700' : 'text-blue-700'}`}>
            <Clock className="w-5 h-5" />
            Período de Prueba
            <PlanBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${isLastDays ? 'text-orange-600' : 'text-blue-600'}`}>
                {trialDaysRemaining}
              </div>
              <p className="text-sm text-slate-600">
                {trialDaysRemaining === 1 ? 'día restante' : 'días restantes'}
              </p>
            </div>
            
            {isLastDays && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 text-center">
                  ¡Tu trial está por vencer! Selecciona un plan para no perder acceso.
                </p>
              </div>
            )}
            
            <Button 
              variant={isLastDays ? "default" : "outline"} 
              className={`w-full ${isLastDays ? 'bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200' : ''}`}
              onClick={() => setShowPlans(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLastDays ? 'Seleccionar Plan Ahora' : 'Ver Planes de Suscripción'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
