
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';

export const useMercadoPago = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { psychologist } = useProfile();

  const createSubscription = async (planId: string) => {
    if (!psychologist) {
      throw new Error('No hay psicólogo autenticado');
    }

    setIsLoading(true);

    try {
      // Llamar a la edge function que creará la preferencia de MercadoPago
      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: {
          planId,
          psychologistId: psychologist.id,
          psychologistEmail: psychologist.email || '',
          psychologistName: `${psychologist.first_name} ${psychologist.last_name}`
        }
      });

      if (error) {
        console.error('Error creating MercadoPago preference:', error);
        throw new Error('Error al crear la preferencia de pago');
      }

      if (data?.init_point) {
        // Redirigir al checkout de MercadoPago
        window.open(data.init_point, '_blank');
        
        toast({
          title: "Redirigiendo al pago",
          description: "Se abrió una nueva ventana con el formulario de pago de MercadoPago."
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
    checkPaymentStatus,
    isLoading
  };
};
