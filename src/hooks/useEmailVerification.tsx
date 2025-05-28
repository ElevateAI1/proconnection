
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useEmailVerification = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const verifyToken = searchParams.get('verify');
      
      if (!verifyToken) return;

      try {
        console.log('Processing email verification token:', verifyToken);
        
        // Limpiar URL inmediatamente para evitar re-procesamiento
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verify');
        window.history.replaceState({}, '', newUrl.toString());
        
        // Decodificar el token de verificación
        let verificationData;
        try {
          verificationData = JSON.parse(atob(verifyToken));
          console.log('Verification data:', verificationData);
        } catch (e) {
          console.error('Error decoding verification token:', e);
          toast({
            title: "Enlace inválido",
            description: "El enlace de verificación no es válido o está corrupto",
            variant: "destructive"
          });
          return;
        }

        // Verificar que el token no sea muy antiguo (24 horas)
        const tokenAge = Date.now() - verificationData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        if (tokenAge > maxAge) {
          console.error('Verification token expired');
          toast({
            title: "Enlace expirado",
            description: "El enlace de verificación ha expirado. Solicita uno nuevo registrándote nuevamente.",
            variant: "destructive"
          });
          return;
        }

        // Verificar el usuario manualmente usando nuestra función RPC
        console.log('Attempting to verify user manually...');
        
        const { error: verifyError } = await supabase.rpc('verify_user_email', {
          user_id: verificationData.userId
        });

        if (verifyError) {
          console.error('Error verifying user:', verifyError);
          toast({
            title: "Error de verificación",
            description: "No se pudo completar la verificación. Intenta nuevamente o contacta con soporte.",
            variant: "destructive"
          });
        } else {
          console.log('Email verification completed successfully');
          toast({
            title: "¡Email verificado exitosamente!",
            description: `¡Hola ${verificationData.firstName || ''}! Tu cuenta ha sido verificada. Ya puedes iniciar sesión.`,
          });
        }

      } catch (error) {
        console.error('Error processing email verification:', error);
        toast({
          title: "Error de verificación",
          description: "Ocurrió un error al verificar tu email. Intenta iniciar sesión normalmente o contacta con soporte.",
          variant: "destructive"
        });
      }
    };

    handleEmailVerification();
  }, [searchParams]);
};
