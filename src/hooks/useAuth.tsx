
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

      // Create base profile if it doesn't exist (usar upsert para evitar errores 409)
      if (!existingProfile) {
        console.log('=== CREATING BASE PROFILE ===');
        
        // Use upsert to handle potential race conditions and avoid 409 errors
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
          // Si es error 409, el profile ya existe, continuar normalmente
          if (createProfileError.code === '23505' || createProfileError.message.includes('duplicate')) {
            console.log('=== PROFILE ALREADY EXISTS (409), CONTINUING ===');
          } else {
            // Otro error, pero continuamos con role-specific profile creation
            console.log('=== CONTINUING DESPITE PROFILE ERROR ===');
          }
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
          
          // Generate professional code (solo si no existe)
          const { data: codeData, error: codeError } = await supabase.rpc('generate_professional_code');
          
          if (codeError) {
            console.error('=== ERROR GENERATING PROFESSIONAL CODE ===', codeError);
            return;
          }
          
          if (codeData) {
            // Priorizar professionalType sobre profession_type
            const professionType = user.user_metadata.professionalType || user.user_metadata.profession_type || 'psychologist';
            
            const psychologistData = {
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              professional_code: codeData, // Código permanente y único
              phone: user.user_metadata.phone,
              profession_type: professionType,
              specialization: user.user_metadata.specialization,
              license_number: user.user_metadata.license_number
            };
            
            console.log('=== PSYCHOLOGIST DATA TO INSERT ===', psychologistData);
            console.log('=== PROFESSIONAL CODE TO SAVE ===', codeData);
            
            const { error: psychError } = await supabase.from('psychologists').insert(psychologistData);
            
            if (psychError) {
              console.error('=== ERROR CREATING PSYCHOLOGIST ===', psychError);
              // Si es error de código duplicado, el código ya existe (no debería pasar por UNIQUE constraint)
              if (psychError.code === '23505' || psychError.message.includes('duplicate')) {
                console.error('=== PROFESSIONAL CODE ALREADY EXISTS (SHOULD NOT HAPPEN) ===');
              }
            } else {
              console.log('=== PSYCHOLOGIST CREATED SUCCESSFULLY ===');
              console.log('=== PROFESSIONAL CODE SAVED PERMANENTLY ===', codeData);
              toast({
                title: "¡Bienvenido!",
                description: "Tu perfil de psicólogo ha sido configurado exitosamente",
              });
            }
          }
        } else if (existingPsych) {
          // Si ya existe, verificar que tiene código profesional
          console.log('=== PSYCHOLOGIST ALREADY EXISTS ===');
          console.log('=== EXISTING PROFESSIONAL CODE ===', existingPsych.professional_code);
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
            // Si es error 404, la función puede no existir o el código es inválido
            // Continuar sin crear el paciente, el usuario puede completar su perfil después
            if (validateError.code === 'P0001' || validateError.message.includes('not found') || validateError.message.includes('404')) {
              console.log('=== PROFESSIONAL CODE VALIDATION FUNCTION NOT AVAILABLE OR CODE INVALID ===');
              // No mostrar error al usuario, simplemente no crear el paciente
              return;
            }
            return;
          }
          
          if (psychologistId) {
            console.log('=== CODE VALIDATED, CREATING PATIENT ===', psychologistId);
            
            const { error: patientError } = await supabase.from('patients').upsert({
              id: user.id,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              psychologist_id: psychologistId,
              phone: user.user_metadata.phone,
              age: user.user_metadata.age ? parseInt(user.user_metadata.age.toString()) : null
            }, {
              onConflict: 'id'
            });
            
            if (patientError) {
              console.error('=== ERROR CREATING PATIENT ===', patientError);
              // Si es error 409, el paciente ya existe, continuar normalmente
              if (patientError.code === '23505' || patientError.message.includes('duplicate')) {
                console.log('=== PATIENT ALREADY EXISTS (409), CONTINUING ===');
              }
            } else {
              console.log('=== PATIENT CREATED/UPDATED SUCCESSFULLY ===');
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
      // Usar el dominio correcto para la redirección
      const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('localhost')
        ? window.location.origin
        : 'https://www.proconnection.me';
      const redirectUrl = `${baseUrl}/app`;
      
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
      
      if (error) {
        console.error('=== SIGN UP ERROR ===', error);
        
        // Si el usuario ya existe, no mostrar error (puede ser que ya se registró antes)
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
          console.log('=== USER ALREADY EXISTS, SILENTLY HANDLING ===');
          // No mostrar error, el usuario puede intentar iniciar sesión
          return { data, error: { ...error, silent: true } };
        }
        
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
        
        console.log('=== VERIFICATION EMAIL WILL BE SENT BY SUPABASE ===');
        // Supabase enviará automáticamente el email de verificación
        // No necesitamos hacer nada más aquí
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
