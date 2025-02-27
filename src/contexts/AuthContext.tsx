
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
            title: 'Authentication Error',
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
          title: 'Login Failed',
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
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
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
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Signup error:', error);
        return { error };
      }

      // If signUp is successful but email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your email to confirm your account.',
        });
      } else if (data.session) {
        setSession(data.session);
        setUser(data.user);
        toast({
          title: 'Account Created',
          description: 'You have successfully signed up!',
        });
      }

      return { error: null };
    } catch (err: any) {
      console.error('Unexpected signup error:', err);
      toast({
        title: 'Signup Error',
        description: 'An unexpected error occurred. Please try again.',
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
          title: 'Logout Error',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Logout error:', error);
      } else {
        setSession(null);
        setUser(null);
        toast({
          title: 'Logged Out',
          description: 'You have been logged out successfully.',
        });
      }
    } catch (err) {
      console.error('Unexpected logout error:', err);
      toast({
        title: 'Logout Error',
        description: 'An unexpected error occurred during logout.',
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
