
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  showEmailVerification: boolean;
  verificationEmail: string;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  closeEmailVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // BLOQUEAR completamente si el email no está verificado
        if (session?.user && !session.user.email_confirmed_at) {
          console.log('User email not confirmed, blocking access and signing out');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user confirms email, create their profile automatically
        if (event === 'SIGNED_IN' && session?.user && session.user.user_metadata && session.user.email_confirmed_at) {
          setTimeout(async () => {
            await handlePostSignInProfile(session.user);
          }, 100);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      
      // BLOQUEAR completamente si el email no está verificado
      if (session?.user && !session.user.email_confirmed_at) {
        console.log('Initial session: User email not confirmed, blocking access');
        supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePostSignInProfile = async (user: User) => {
    try {
      console.log('Handling post sign-in profile creation for user:', user.id);
      console.log('User metadata:', user.user_metadata);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('Profile exists, checking for specific role profile');
        
        const userType = user.user_metadata.user_type;
        
        if (userType === 'psychologist') {
          const { data: existingPsych } = await supabase
            .from('psychologists')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!existingPsych && user.user_metadata.first_name) {
            console.log('Creating psychologist profile from metadata');
            const { data: codeData } = await supabase.rpc('generate_professional_code');
            
            const { error: psychError } = await supabase.from('psychologists').insert({
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              professional_code: codeData,
              phone: user.user_metadata.phone,
              specialization: user.user_metadata.specialization,
              license_number: user.user_metadata.license_number
            });
            
            if (psychError) {
              console.error('Error creating psychologist profile:', psychError);
            } else {
              console.log('Psychologist profile created successfully');
            }
          }
        } else if (userType === 'patient') {
          const { data: existingPatient } = await supabase
            .from('patients')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!existingPatient && user.user_metadata.first_name && user.user_metadata.professional_code) {
            console.log('Creating patient profile from metadata with code:', user.user_metadata.professional_code);
            
            // Validate professional code and get psychologist ID
            const { data: psychologistId, error: validateError } = await supabase.rpc('validate_professional_code', { 
              code: user.user_metadata.professional_code 
            });
            
            if (validateError) {
              console.error('Error validating professional code:', validateError);
              return;
            }
            
            if (psychologistId) {
              console.log('Professional code validated, psychologist ID:', psychologistId);
              
              const { error: patientError } = await supabase.from('patients').insert({
                id: user.id,
                first_name: user.user_metadata.first_name,
                last_name: user.user_metadata.last_name,
                psychologist_id: psychologistId,
                phone: user.user_metadata.phone,
                age: user.user_metadata.age ? parseInt(user.user_metadata.age.toString()) : null
              });
              
              if (patientError) {
                console.error('Error creating patient profile:', patientError);
              } else {
                console.log('Patient profile created successfully');
                toast({
                  title: "Registro completado",
                  description: "Tu perfil de paciente ha sido creado exitosamente",
                });
              }
            } else {
              console.error('Invalid professional code:', user.user_metadata.professional_code);
              toast({
                title: "Error",
                description: "Código profesional inválido",
                variant: "destructive"
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling post sign-in profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      
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
      // VERIFICAR ESTRICTAMENTE si el email está confirmado
      if (!data.user.email_confirmed_at) {
        console.log('User email not confirmed during login, blocking access');
        await supabase.auth.signOut();
        toast({
          title: "Email no verificado",
          description: "Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada.",
          variant: "destructive"
        });
        return { data: null, error: { message: "Email not confirmed" } };
      }
      
      console.log('Sign in successful and email confirmed');
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a PsiConnect",
      });
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => {
    console.log('Attempting sign up for:', email, 'as', userType);
    console.log('Additional data:', additionalData);
    
    try {
      // Crear el usuario SIN auto-confirmación
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
        console.error('Sign up error:', error);
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive"
        });
        return { data, error };
      }
      
      console.log('User created successfully:', data.user?.id);
      
      if (data.user) {
        // Crear el perfil manualmente si el trigger no funcionó
        try {
          console.log('Creating profile manually...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              user_type: userType
            });
          
          if (profileError) {
            console.log('Profile creation error (might already exist):', profileError);
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileCreationError) {
          console.error('Exception creating profile:', profileCreationError);
        }
        
        // CERRAR SESIÓN INMEDIATAMENTE para prevenir acceso
        await supabase.auth.signOut();
        
        // Enviar SOLO nuestro email personalizado de verificación
        try {
          console.log('Sending custom verification email...');
          
          // Crear un token de verificación seguro con información del usuario
          const verificationData = {
            userId: data.user.id,
            email: data.user.email,
            userType: userType,
            firstName: additionalData?.first_name || '',
            timestamp: Date.now()
          };
          
          // Codificar los datos de verificación
          const verificationToken = btoa(JSON.stringify(verificationData));
          
          // Crear URL de verificación con el token
          const redirectUrl = `${window.location.origin}/app?verify=${verificationToken}`;
          
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
            console.error('Error sending verification email:', emailError);
          } else {
            console.log('Custom verification email sent successfully');
          }
        } catch (emailError) {
          console.error('Exception sending verification email:', emailError);
        }
        
        // MOSTRAR SIEMPRE la ventana de verificación
        setVerificationEmail(email);
        setShowEmailVerification(true);
      }
      
      return { data, error };
    } catch (error: any) {
      console.error('Exception in sign up:', error);
      toast({
        title: "Error al crear cuenta",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    
    try {
      // Clear browser storage to prevent auth limbo states
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const closeEmailVerification = () => {
    setShowEmailVerification(false);
    setVerificationEmail('');
  };

  const value = {
    user,
    session,
    loading,
    showEmailVerification,
    verificationEmail,
    signIn,
    signUp,
    signOut,
    closeEmailVerification,
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
