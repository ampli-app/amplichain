
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from Supabase
    const initAuth = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting auth session:', error);
          toast({
            title: "Authentication Error",
            description: 'There was a problem retrieving your session.',
            variant: 'destructive',
          });
        } else {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function with email/password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Logowanie nieudane",
          description: error.message,
          variant: 'destructive',
        });
        console.error('Login error:', error);
        return { error };
      }

      setSession(data.session);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      toast({
        title: "Błąd logowania",
        description: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
        variant: 'destructive',
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      // First check if a user with this email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email.split('@')[0].toLowerCase());
      
      if (checkError) {
        console.error('Error checking existing user:', checkError);
      } else if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Rejestracja nieudana",
          description: 'Użytkownik z tym adresem email już istnieje.',
          variant: 'destructive',
        });
        return { error: new Error('User with this email already exists') };
      }
      
      // If no existing user, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Rejestracja nieudana",
          description: error.message,
          variant: 'destructive',
        });
        console.error('Signup error:', error);
        return { error };
      }

      // If signUp is successful but email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Email weryfikacyjny wysłany",
          description: 'Sprawdź swoją skrzynkę odbiorczą, aby potwierdzić rejestrację.',
        });
      } else if (data.session) {
        setSession(data.session);
        setUser(data.user);
        toast({
          title: "Konto utworzone",
          description: 'Rejestracja zakończona sukcesem!',
        });
      }

      return { error: null };
    } catch (err: any) {
      console.error('Unexpected signup error:', err);
      toast({
        title: "Błąd rejestracji",
        description: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
        variant: 'destructive',
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Błąd wylogowania",
          description: error.message,
          variant: 'destructive',
        });
        console.error('Logout error:', error);
      } else {
        setSession(null);
        setUser(null);
        toast({
          title: "Wylogowano",
          description: 'Zostałeś pomyślnie wylogowany.',
        });
      }
    } catch (err) {
      console.error('Unexpected logout error:', err);
      toast({
        title: "Błąd wylogowania",
        description: 'Wystąpił nieoczekiwany błąd podczas wylogowania.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn: !!session, 
        user, 
        session,
        login, 
        signup,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
