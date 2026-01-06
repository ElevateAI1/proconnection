
import { useState, useEffect, useRef, createContext, useContext } from 'react';
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
  const profileEnsuredRef = useRef<Set<string>>(new Set());
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      if (mounted) {
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Solo asegurar perfil en SIGNED_IN inicial, no en TOKEN_REFRESHED ni en re-renders
        if (event === 'SIGNED_IN' && session?.user && 
            !profileEnsuredRef.current.has(session.user.id) && 
            !processingRef.current.has(session.user.id)) {
          
          processingRef.current.add(session.user.id);
          
          // Verificar si el perfil ya existe antes de ejecutar (sin bloquear el loading)
          supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data: existingProfile }) => {
              if (!mounted) return;
              
              // Solo ejecutar si el perfil no existe
              if (!existingProfile) {
                profileEnsuredRef.current.add(session.user.id);
                setTimeout(async () => {
                  if (mounted) {
                    await ensureCompleteProfile(session.user);
                    processingRef.current.delete(session.user.id);
                  }
                }, 100);
              } else {
                profileEnsuredRef.current.add(session.user.id);
                processingRef.current.delete(session.user.id);
              }
            })
            .catch((error) => {
              console.error('Error checking profile:', error);
              if (mounted) {
                processingRef.current.delete(session.user.id);
              }
            });
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureCompleteProfile = async (user: User) => {
    try {
      // Check if base profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileCheckError) {
        return;
      }

      // Create base profile if it doesn't exist (usar upsert para evitar errores 409)
      if (!existingProfile) {
        // Use upsert to handle potential race conditions and avoid 409 errors
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email!,
            user_type: user.user_metadata.user_type || 'patient'
          }, {
            onConflict: 'id'
          });
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
          // Generate professional code (solo si no existe)
          const { data: codeData, error: codeError } = await supabase.rpc('generate_professional_code');
          
          if (codeError) {
            return;
          }
          
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
            
            const { error: psychError } = await supabase.from('psychologists').insert(psychologistData);
            
            if (!psychError) {
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
          // Validate professional code and get psychologist ID
          const { data: psychologistId, error: validateError } = await supabase.rpc('validate_professional_code', { 
            code: user.user_metadata.professional_code 
          });
          
          if (validateError) {
            // Si es error 404, la función puede no existir o el código es inválido
            if (validateError.code === 'P0001' || validateError.message.includes('not found') || validateError.message.includes('404')) {
              return;
            }
            return;
          }
          
          if (psychologistId) {
            await supabase.from('patients').upsert({
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              psychologist_id: psychologistId,
              phone: user.user_metadata.phone,
              age: user.user_metadata.age ? parseInt(user.user_metadata.age.toString()) : null
            }, {
              onConflict: 'id'
            });
          } else {
            toast({
              title: "Error",
              description: "Código profesional inválido",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      // Silently handle errors in profile creation
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      
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
        await supabase.auth.signOut();
        toast({
          title: "Email no verificado",
          description: "Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada.",
          variant: "destructive"
        });
        return { data: null, error: { message: "Email not confirmed" } };
      }
      
      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
      });
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, userType: 'psychologist' | 'patient', additionalData?: any) => {
    try {
      // Usar el dominio correcto para la redirección
      const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('localhost')
        ? window.location.origin
        : 'https://www.proconnection.me';
      const redirectUrl = `${baseUrl}/app?verify=true`;
      
      // Crear el usuario con todos los datos en metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            ...additionalData
          },
          emailRedirectTo: redirectUrl
        }
      });
      
      // Si hay usuario creado, el registro fue exitoso (aunque pueda haber warnings/errores menores)
      if (data.user) {
        // Cerrar sesión inmediatamente para evitar auto-login
        await supabase.auth.signOut();
        
        // Si hay error pero el usuario se creó, no mostrar error (solo warnings)
        if (error) {
          // Solo mostrar error si es crítico (no warnings de email)
          if (!error.message.includes('email') && !error.message.includes('Email')) {
            toast({
              title: "Cuenta creada",
              description: "Se creó tu cuenta pero hubo un problema. Revisa tu email para verificar.",
            });
          }
          return { data, error: { ...error, silent: true } };
        }
        
        return { data, error: null };
      }
      
      // Si no hay usuario y hay error, mostrar error
      if (error) {
        // Si el usuario ya existe, no mostrar error (puede ser que ya se registró antes)
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
          return { data, error: { ...error, silent: true } };
        }
        
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive"
        });
        return { data, error };
      }
      
      return { data, error };
    } catch (error: any) {
      toast({
        title: "Error al crear cuenta",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive"
      });
    } else {
      profileEnsuredRef.current.clear();
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
