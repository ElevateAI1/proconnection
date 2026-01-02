
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

export const useMercadoPago = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { psychologist, profile } = useProfile();

  const createSubscription = async (planKey: string, payerEmail: string) => {
    if (!psychologist) {
      throw new Error('No hay psicólogo autenticado');
    }

    if (!payerEmail || !payerEmail.includes('@')) {
      throw new Error('Email de facturación inválido');
    }

    setIsLoading(true);

    try {
      // Llamar a la edge function que creará el Preapproval de MercadoPago
      const { data, error } = await supabase.functions.invoke('create-mercadopago-subscription', {
        body: {
          planKey,
          psychologistId: psychologist.id,
          payerEmail,
          backUrl: `${window.location.origin}/plans?result=subscription`
        }
      });

      if (error) {
        console.error('Error creating MercadoPago subscription:', error);
        throw new Error(error.message || 'Error al crear la suscripción');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Error al crear la suscripción');
      }

      if (data?.init_point) {
        // Redirigir al checkout de MercadoPago
        window.location.href = data.init_point;
        
        toast({
          title: "Redirigiendo a MercadoPago",
          description: "Serás redirigido para completar el pago de forma segura."
        });
      } else {
        throw new Error('No se recibió la URL de pago');
      }

    } catch (error) {
      console.error('Error in createSubscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!psychologist) {
      throw new Error('No hay psicólogo autenticado');
    }

    setIsCancelling(true);

    try {
      const { data, error } = await supabase.functions.invoke('cancel-mercadopago-subscription', {
        body: {}
      });

      if (error) {
        console.error('Error cancelling MercadoPago subscription:', error);
        throw new Error(error.message || 'Error al cancelar la suscripción');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Error al cancelar la suscripción');
      }

      toast({
        title: "Suscripción cancelada",
        description: data.message || "Tu suscripción ha sido cancelada exitosamente."
      });

      // Disparar evento para refrescar
      window.dispatchEvent(new CustomEvent('planUpdated'));
      window.dispatchEvent(new CustomEvent('forceRefreshCapabilities'));

      return data;

    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsCancelling(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-mercadopago-payment', {
        body: { paymentId }
      });

      if (error) {
        console.error('Error checking payment status:', error);
        throw new Error('Error al verificar el estado del pago');
      }

      return data;
    } catch (error) {
      console.error('Error in checkPaymentStatus:', error);
      throw error;
    }
  };

  return {
    createSubscription,
    cancelSubscription,
    checkPaymentStatus,
    isLoading,
    isCancelling
  };
};
