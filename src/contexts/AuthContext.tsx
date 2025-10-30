import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; role: 'freelancer' | 'client' }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('AuthProvider rendering');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider state - loading:', loading, 'user:', !!user, 'profile:', !!profile);

  useEffect(() => {
    console.log('AuthContext useEffect running');
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }: { data: { session: Session | null }, error: any }) => {
      if (!mounted) return;

      console.log('Initial session check:', session ? 'Session found' : 'No session', error);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Calling loadProfile for initial session');
        await loadProfile(session.user.id);
      } else {
        console.log('No session, setting loading to false');
        setLoading(false);
      }
    }).catch((err: any) => {
      if (!mounted) return;
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Set a default profile immediately to prevent null profile state
        const defaultProfile = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || 'User',
          role: session.user.user_metadata?.role || 'freelancer',
          availability_status: 'offline' as const,
        };
        console.log('Setting default profile immediately:', defaultProfile);
        setProfile(defaultProfile);
        
        // Then try to load the real profile
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        console.log('No session in auth change, setting loading to false');
        setLoading(false);
      }
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('Safety timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 seconds

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const loadProfile = async (userId: string) => {
    console.log('loadProfile called for userId:', userId);
    try {
      console.log('Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile query result:', { data: data ? 'found' : 'not found', error });

      if (error) {
        console.error('Error loading profile:', error);
        // If there's an error (table doesn't exist, permissions, etc.), create a fallback profile
        console.log('Using fallback profile due to error');
        const fallbackProfile = {
          id: userId,
          full_name: 'User',
          role: 'freelancer' as const,
          availability_status: 'offline' as const,
        };
        console.log('Setting fallback profile:', fallbackProfile);
        setProfile(fallbackProfile);
        console.log('Profile state should be set now');
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      } else {
        console.log('No profile found, attempting to create one');
        // Try to create a basic profile if it doesn't exist
        const defaultProfile = {
          id: userId,
          full_name: 'User',
          role: 'freelancer' as const,
          availability_status: 'offline' as const,
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);

        console.log('Profile creation result:', { error: insertError });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Use fallback profile if creation fails
          console.log('Using fallback profile due to creation error');
          setProfile(defaultProfile);
        } else {
          console.log('Profile created successfully');
          setProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Exception in loadProfile:', error);
      // On any exception, use a fallback profile to prevent infinite loading
      console.log('Using fallback profile due to exception');
      const fallbackProfile = {
        id: userId,
        full_name: 'User',
        role: 'freelancer' as const,
        availability_status: 'offline' as const,
      };
      console.log('Setting fallback profile due to exception:', fallbackProfile);
      setProfile(fallbackProfile);
    } finally {
      console.log('Setting loading to false in loadProfile');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: 'freelancer' | 'client' }) => {
    try {
      // Sign up without email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
          emailRedirectTo: window.location.origin,
          // Try to auto-confirm the email
          captchaToken: undefined
        }
      });

      if (authError) {
        console.error('Signup error:', authError);
        return { error: authError };
      }

      console.log('Signup response:', authData);

      // If user is created but not confirmed, try to sign them in immediately
      // This works if the project allows signin without email confirmation
      if (authData.user && !authData.session) {
        console.log('User created but no session, trying to sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Auto signin failed:', signInError);
          // Return success anyway since user was created
          return { error: null };
        }

        if (signInData.session) {
          setSession(signInData.session);
          setUser(signInData.session.user);
          await loadProfile(signInData.session.user.id);
        }
      } else if (authData.session) {
        // User was auto-confirmed
        setSession(authData.session);
        setUser(authData.session.user);
        await loadProfile(authData.session.user.id);
      }

      if (authData.user) {
        // Create profile immediately
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: userData.full_name,
          role: userData.role,
          availability_status: 'offline',
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail signup if profile creation fails, just log it
        }
      }

      return { error: null };
    } catch (error) {
      console.error('signUp error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        return { error };
      }

      // Update local state immediately if session exists
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      }

      return { error: null };
    } catch (err) {
      console.error('signIn error:', err);
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    await loadProfile(user.id);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log('useAuth called, context exists:', !!context);
  if (context === undefined) {
    console.log('useAuth returning fallback values');
    // Return default values instead of throwing error during initialization
    return {
      user: null,
      profile: null,
      session: null,
      loading: true,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signOut: async () => {},
      updateProfile: async () => {},
    };
  }
  return context;
}
