
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== SETTING UP AUTH STATE LISTENER ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user signs in, ensure their profile is complete
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('=== SIGNED IN EVENT, ENSURING COMPLETE PROFILE ===');
          setTimeout(async () => {
            await ensureCompleteProfile(session.user);
          }, 100);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== INITIAL SESSION CHECK ===', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureCompleteProfile = async (user: User) => {
    try {
      console.log('=== ENSURING COMPLETE PROFILE ===');
      console.log('User ID:', user.id);
      console.log('User metadata:', user.user_metadata);

      // Check if base profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('=== ERROR CHECKING PROFILE ===', profileCheckError);
        return;
      }

      // Create base profile if it doesn't exist
      if (!existingProfile) {
        console.log('=== CREATING BASE PROFILE ===');
        
        // Use upsert to handle potential race conditions
        const { error: createProfileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email!,
            user_type: user.user_metadata.user_type || 'patient'
          }, {
            onConflict: 'id'
          });
          
        if (createProfileError) {
          console.error('=== ERROR CREATING BASE PROFILE ===', createProfileError);
          // Don't return here, continue with role-specific profile creation
        } else {
          console.log('=== BASE PROFILE CREATED ===');
        }
      }

      const userType = existingProfile?.user_type || user.user_metadata.user_type;
      
      // Handle psychologist profile creation
      if (userType === 'psychologist') {
        const { data: existingPsych } = await supabase
          .from('psychologists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!existingPsych && user.user_metadata.first_name) {
          console.log('=== CREATING PSYCHOLOGIST FROM METADATA ===');
          console.log('User metadata:', user.user_metadata);
          console.log('Professional type from metadata:', user.user_metadata.professionalType || user.user_metadata.profession_type);
          
          // Generate professional code
          const { data: codeData } = await supabase.rpc('generate_professional_code');
          
          if (codeData) {
            // Priorizar professionalType sobre profession_type
            const professionType = user.user_metadata.professionalType || user.user_metadata.profession_type || 'psychologist';
            
            const psychologistData = {
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              professional_code: codeData,
              phone: user.user_metadata.phone,
              profession_type: professionType,
              specialization: user.user_metadata.specialization,
              license_number: user.user_metadata.license_number
            };
            
            console.log('=== PSYCHOLOGIST DATA TO INSERT ===', psychologistData);
            
            const { error: psychError } = await supabase.from('psychologists').insert(psychologistData);
            
            if (psychError) {
              console.error('=== ERROR CREATING PSYCHOLOGIST ===', psychError);
            } else {
              console.log('=== PSYCHOLOGIST CREATED SUCCESSFULLY ===');
              toast({
                title: "¡Bienvenido!",
                description: "Tu perfil de psicólogo ha sido configurado exitosamente",
              });
            }
          }
        }
      } 
      // Handle patient profile creation
      else if (userType === 'patient') {
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!existingPatient && user.user_metadata.first_name && user.user_metadata.professional_code) {
          console.log('=== CREATING PATIENT FROM METADATA ===');
          
          // Validate professional code and get psychologist ID
          const { data: psychologistId, error: validateError } = await supabase.rpc('validate_professional_code', { 
            code: user.user_metadata.professional_code 
          });
          
          if (validateError) {
            console.error('=== ERROR VALIDATING CODE ===', validateError);
            return;
          }
          
          if (psychologistId) {
            console.log('=== CODE VALIDATED, CREATING PATIENT ===', psychologistId);
            
            const { error: patientError } = await supabase.from('patients').insert({
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              psychologist_id: psychologistId,
              phone: user.user_metadata.phone,
              age: user.user_metadata.age ? parseInt(user.user_metadata.age.toString()) : null
            });
            
            if (patientError) {
              console.error('=== ERROR CREATING PATIENT ===', patientError);
            } else {
              console.log('=== PATIENT CREATED SUCCESSFULLY ===');
              toast({
                title: "¡Bienvenido!",
                description: "Tu perfil de paciente ha sido configurado exitosamente",
              });
            }
          } else {
            console.error('=== INVALID PROFESSIONAL CODE ===', user.user_metadata.professional_code);
            toast({
              title: "Error",
              description: "Código profesional inválido",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      console.error('=== EXCEPTION IN PROFILE CREATION ===', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== ATTEMPTING SIGN IN ===', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('=== SIGN IN ERROR ===', error);
      
      if (error.message.includes('Email not confirmed')) {
        toast({
          title: "Email no verificado",
          description: "Tu email aún no ha sido verificado. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
          variant: "destructive"
        });
      } else if (error.message.includes('Invalid login credentials')) {
        toast({
          title: "Credenciales inválidas",
          description: "El email o la contraseña son incorrectos",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive"
        });
      }
    } else if (data.user) {
      // Verificar si el email está confirmado
      if (!data.user.email_confirmed_at) {
        console.log('=== EMAIL NOT CONFIRMED, SIGNING OUT ===');
        await supabase.auth.signOut();
        toast({
          title: "Email no verificado",
          description: "Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada.",
          variant: "destructive"
        });
        return { data: null, error: { message: "Email not confirmed" } };
      }
      
      console.log('=== SIGN IN SUCCESSFUL ===');
      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
      });
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => {
    console.log('=== ATTEMPTING SIGN UP ===', email, 'as', userType);
    console.log('Additional data:', additionalData);
    
    try {
      // Crear el usuario con todos los datos en metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            ...additionalData
          },
          emailRedirectTo: undefined // No redirect automático
        }
      });
      
      if (error) {
        console.error('=== SIGN UP ERROR ===', error);
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive"
        });
        return { data, error };
      }
      
      console.log('=== USER CREATED SUCCESSFULLY ===', data.user?.id);
      
      if (data.user) {
        // Cerrar sesión inmediatamente para evitar auto-login
        await supabase.auth.signOut();
        
        // Enviar email personalizado de verificación
        try {
          console.log('=== SENDING CUSTOM VERIFICATION EMAIL ===');
          
          const verificationData = {
            userId: data.user.id,
            email: data.user.email,
            userType: userType,
            firstName: additionalData?.first_name || '',
            timestamp: Date.now()
          };
          
          const verificationToken = btoa(JSON.stringify(verificationData));
          // Usar el dominio correcto - en producción usar www.proconnection.me, en desarrollo usar localhost
          const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('localhost')
            ? window.location.origin
            : 'https://www.proconnection.me';
          const redirectUrl = `${baseUrl}/app?verify=${verificationToken}`;
          
          console.log('=== VERIFICATION URL ===', redirectUrl);
          
          const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: {
              email: email,
              token: verificationToken,
              action_type: 'signup',
              user_type: userType,
              first_name: additionalData?.first_name || '',
              redirect_to: redirectUrl
            }
          });
          
          if (emailError) {
            console.error('=== ERROR SENDING VERIFICATION EMAIL ===', emailError);
            toast({
              title: "Cuenta creada",
              description: "Tu cuenta fue creada pero hubo un error enviando el email de verificación. Contacta con soporte.",
              variant: "destructive"
            });
          } else {
            console.log('=== VERIFICATION EMAIL SENT SUCCESSFULLY ===');
            toast({
              title: "¡Cuenta creada exitosamente!",
              description: "Te hemos enviado un email de verificación. Una vez verificado, podrás iniciar sesión y acceder directamente al dashboard.",
            });
          }
        } catch (emailError) {
          console.error('=== EXCEPTION SENDING VERIFICATION EMAIL ===', emailError);
        }
      }
      
      return { data, error };
    } catch (error: any) {
      console.error('=== EXCEPTION IN SIGN UP ===', error);
      toast({
        title: "Error al crear cuenta",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('=== SIGNING OUT ===');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('=== SIGN OUT ERROR ===', error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('=== SIGN OUT SUCCESSFUL ===');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
