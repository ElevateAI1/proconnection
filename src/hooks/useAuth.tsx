
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
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user confirms email, create their profile automatically
        if (event === 'SIGNED_IN' && session?.user && session.user.user_metadata) {
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
        console.log('Profile already exists, checking for specific role profile');
        
        // Check if we need to create psychologist or patient profile
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
            
            await supabase.from('psychologists').insert({
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              professional_code: codeData,
              phone: user.user_metadata.phone,
              specialization: user.user_metadata.specialization,
              license_number: user.user_metadata.license_number
            });
          }
        } else if (userType === 'patient') {
          const { data: existingPatient } = await supabase
            .from('patients')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!existingPatient && user.user_metadata.first_name && user.user_metadata.professional_code) {
            console.log('Creating patient profile from metadata');
            
            // Validate professional code and get psychologist ID
            const { data: psychologistId } = await supabase.rpc('validate_professional_code', { 
              code: user.user_metadata.professional_code 
            });
            
            if (psychologistId) {
              await supabase.from('patients').insert({
                id: user.id,
                first_name: user.user_metadata.first_name,
                last_name: user.user_metadata.last_name,
                psychologist_id: psychologistId,
                phone: user.user_metadata.phone,
                age: user.user_metadata.age
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
    } else {
      console.log('Sign in successful');
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => {
    console.log('Attempting sign up for:', email, 'as', userType);
    console.log('Additional data:', additionalData);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable Supabase's automatic email
        data: {
          user_type: userType,
          ...additionalData
        }
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { data, error };
    } else {
      console.log('Sign up successful, user created:', data.user?.id);
      
      // Send our custom verification email immediately
      if (data.user && !data.user.email_confirmed_at) {
        try {
          console.log('Sending custom verification email...');
          
          // Get the actual verification token from the session
          const { data: sessionData } = await supabase.auth.getSession();
          
          const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
            body: {
              email: email,
              token: data.user.id, // Using user ID as token
              action_type: 'signup',
              redirect_to: `${window.location.origin}/`
            }
          });
          
          if (emailError) {
            console.error('Error sending verification email:', emailError);
            toast({
              title: "Cuenta creada",
              description: "Tu cuenta fue creada pero hubo un error enviando el email de verificación. Intenta iniciar sesión.",
              variant: "destructive"
            });
          } else {
            console.log('Verification email sent successfully');
            toast({
              title: "¡Cuenta creada exitosamente!",
              description: "Te hemos enviado un email de verificación profesional. Por favor revisa tu bandeja de entrada.",
            });
          }
        } catch (emailError) {
          console.error('Exception sending verification email:', emailError);
          toast({
            title: "Cuenta creada",
            description: "Tu cuenta fue creada pero hubo un error enviando el email de verificación. Intenta iniciar sesión.",
            variant: "destructive"
          });
        }
      }
    }
    
    return { data, error };
  };

  const signOut = async () => {
    console.log('Signing out');
    await supabase.auth.signOut();
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
