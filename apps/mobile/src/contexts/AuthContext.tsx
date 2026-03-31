// ============================================================
// mobile/src/contexts/AuthContext.tsx
//
// React Context wrapping Supabase auth. Provides user, session,
// loading state, and auth methods to the entire app.
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

// ── Types ───────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Helper to format Supabase auth errors into readable messages
  const formatError = (err: AuthError): string => {
    if (err.message.includes('Invalid login credentials')) {
      return 'Invalid email or password.';
    }
    if (err.message.includes('Email not confirmed')) {
      return 'Please confirm your email before signing in.';
    }
    if (err.message.includes('already registered')) {
      return 'An account with this email already exists.';
    }
    return err.message;
  };

  // ── Bootstrap: check existing session ─────────────────────

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          setState((s) => ({ ...s, loading: false, error: formatError(error) }));
          return;
        }

        setState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
          error: null,
        });
      } catch {
        if (mounted) {
          setState((s) => ({ ...s, loading: false, error: 'Failed to restore session.' }));
        }
      }
    }

    bootstrap();

    // ── Listen for auth state changes (sign-in, sign-out, token refresh)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setState((s) => ({
          ...s,
          user: session?.user ?? null,
          session: session ?? null,
          error: null,
        }));
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth methods ──────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState((s) => ({ ...s, loading: false, error: formatError(error) }));
      throw error;
    }

    // Session will be set by onAuthStateChange listener
    setState((s) => ({ ...s, loading: false }));
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setState((s) => ({ ...s, loading: false, error: formatError(error) }));
      throw error;
    }

    setState((s) => ({ ...s, loading: false }));
  }, []);

  const signOut = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((s) => ({ ...s, loading: false, error: formatError(error) }));
      throw error;
    }

    setState({ user: null, session: null, loading: false, error: null });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setState((s) => ({ ...s, loading: false, error: formatError(error) }));
      throw error;
    }

    setState((s) => ({ ...s, loading: false }));
  }, []);

  // ── Render ────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
