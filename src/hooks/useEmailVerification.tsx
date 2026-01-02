
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useEmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailVerification = async () => {
      // Supabase puede usar diferentes formatos de URL
      // Formato 1: ?token=...&type=signup
      // Formato 2: #access_token=...&type=signup (hash)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const token = urlParams.get('token') || hashParams.get('access_token');
      const type = urlParams.get('type') || hashParams.get('type');
      
      // Si no hay token o el type no es signup, no hacer nada
      if (!token || (type && type !== 'signup')) return;

      // Validar formato básico del token (debe tener al menos 10 caracteres)
      if (token.length < 10) {
        console.warn('Token format seems invalid, but proceeding...');
      }

      try {
        console.log('Processing Supabase email verification...');
        
        // Limpiar URL inmediatamente para evitar re-procesamiento
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('type');
        newUrl.hash = '';
        window.history.replaceState({}, '', newUrl.toString());
        
        // Función helper para obtener la ruta de login según el tipo de usuario
        const getLoginPath = (userType?: string) => {
          if (userType === 'psychologist') {
            return '/auth/professional';
          }
          return '/auth/patient'; // default a patient
        };

        // Verificar el email usando el token de Supabase
        // Si es access_token, Supabase ya procesó la verificación automáticamente
        if (hashParams.get('access_token')) {
          // Supabase ya verificó automáticamente con el hash
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && user.email_confirmed_at) {
            const firstName = user.user_metadata?.first_name || '';
            const userType = user.user_metadata?.user_type || 'patient';
            const loginPath = getLoginPath(userType);
            
            toast({
              title: "¡Email verificado exitosamente!",
              description: firstName 
                ? `¡Hola ${firstName}! Tu cuenta ha sido verificada. Ya puedes iniciar sesión.`
                : "Tu cuenta ha sido verificada. Ya puedes iniciar sesión.",
            });
            navigate(loginPath);
            return;
          }
        }
        
        // Si es token en query params, usar verifyOtp
        // Primero verificar si el usuario ya está verificado
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser?.email_confirmed_at) {
          const userType = currentUser.user_metadata?.user_type || 'patient';
          const loginPath = getLoginPath(userType);
          
          toast({
            title: "Email ya verificado",
            description: "Tu cuenta ya está verificada. Puedes iniciar sesión.",
          });
          navigate(loginPath);
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Error verifying email:', error);
          
          // Si el token ya fue usado o expiró, verificar si el usuario ya está verificado
          if (error.message.includes('expired') || error.message.includes('invalid') || error.message.includes('403')) {
            // Obtener el usuario actual si existe
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              // Si el usuario ya está verificado, redirigir al login
              if (user.email_confirmed_at) {
                const userType = user.user_metadata?.user_type || 'patient';
                const loginPath = getLoginPath(userType);
                
                toast({
                  title: "Email ya verificado",
                  description: "Tu cuenta ya está verificada. Puedes iniciar sesión.",
                });
                navigate(loginPath);
                return;
              }
              
              // Intentar verificar manualmente usando la función RPC
              const { error: verifyError } = await supabase.rpc('verify_user_email', {
                user_id: user.id
              });

              if (verifyError) {
                const userType = user.user_metadata?.user_type || 'patient';
                const loginPath = getLoginPath(userType);
                
                toast({
                  title: "Enlace expirado o inválido",
                  description: "El enlace de verificación ha expirado o ya fue usado. Puedes iniciar sesión normalmente.",
                  variant: "destructive"
                });
                navigate(loginPath);
              } else {
                const userType = user.user_metadata?.user_type || 'patient';
                const loginPath = getLoginPath(userType);
                
                toast({
                  title: "¡Email verificado exitosamente!",
                  description: "Tu cuenta ha sido verificada. Ya puedes iniciar sesión.",
                });
                navigate(loginPath);
              }
            } else {
              // No hay usuario, redirigir al login de paciente por defecto
              toast({
                title: "Enlace inválido",
                description: "El enlace de verificación no es válido o ha expirado. Intenta iniciar sesión normalmente.",
                variant: "destructive"
              });
              navigate('/auth/patient');
            }
          } else {
            // Otro tipo de error, redirigir al login
            const userType = 'patient'; // default
            const loginPath = getLoginPath(userType);
            
            toast({
              title: "Error de verificación",
              description: "No se pudo completar la verificación. Intenta iniciar sesión normalmente.",
              variant: "destructive"
            });
            navigate(loginPath);
          }
        } else {
          console.log('Email verification completed successfully');
          
          // Obtener información del usuario para el mensaje personalizado
          const firstName = data.user?.user_metadata?.first_name || '';
          const userType = data.user?.user_metadata?.user_type || 'patient';
          const loginPath = getLoginPath(userType);
          
          toast({
            title: "¡Email verificado exitosamente!",
            description: firstName 
              ? `¡Hola ${firstName}! Tu cuenta ha sido verificada. Ya puedes iniciar sesión.`
              : "Tu cuenta ha sido verificada. Ya puedes iniciar sesión.",
          });
          
          // Redirigir a la página de login según el tipo de usuario
          navigate(loginPath);
        }

      } catch (error) {
        console.error('Error processing email verification:', error);
        toast({
          title: "Error de verificación",
          description: "Ocurrió un error al verificar tu email. Intenta iniciar sesión normalmente.",
          variant: "destructive"
        });
        // Redirigir al login en caso de error
        navigate('/auth/patient');
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate]);
};
