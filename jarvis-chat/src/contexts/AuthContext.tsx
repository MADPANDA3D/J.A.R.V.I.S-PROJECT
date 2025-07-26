import React, { createContext, useContext, useEffect, useState } from 'react';
import {} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContextType, AuthState } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error('Failed to get initial session:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          initialized: true,
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // AuthContext will be updated via the auth state change event
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));

      if (error instanceof Error) {
        throw new Error(getAuthErrorMessage(error));
      }
      throw new Error('An unexpected error occurred during sign in');
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Note: User might need to confirm their email depending on Supabase settings
      // AuthContext will be updated via the auth state change event if auto-confirm is enabled
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));

      if (error instanceof Error) {
        throw new Error(getAuthErrorMessage(error));
      }
      throw new Error('An unexpected error occurred during sign up');
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // AuthContext will be updated via the auth state change event
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));

      if (error instanceof Error) {
        throw new Error(getAuthErrorMessage(error));
      }
      throw new Error('An unexpected error occurred during sign out');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(getAuthErrorMessage(error));
      }
      throw new Error('An unexpected error occurred while resetting password');
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to convert Supabase auth errors to user-friendly messages
function getAuthErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  if (message.includes('user already registered')) {
    return 'An account with this email address already exists.';
  }

  if (message.includes('password should be at least')) {
    return 'Password should be at least 6 characters long.';
  }

  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }

  if (message.includes('signup is disabled')) {
    return 'Account registration is currently disabled. Please contact support.';
  }

  if (message.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  // Return the original message if we don't have a user-friendly version
  return error.message;
}
