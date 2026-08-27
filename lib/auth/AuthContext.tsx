'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfileData {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpParams {
  fullName: string;
  email: string;
  password: string;
  currency?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: string | null; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<{ error: string | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_AUTH_STORAGE_KEY = 'spendy_auth_session_v1';
const LOCAL_PROFILE_STORAGE_KEY = 'spendy_user_profile_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch profile from database
  const fetchProfile = useCallback(async (userId: string, userEmail: string) => {
    if (!isSupabaseConfigured()) {
      // Local fallback
      try {
        const saved = localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
        if (saved) {
          setProfile(JSON.parse(saved));
          return;
        }
      } catch {
        // safe
      }
      const mockProfile: UserProfileData = {
        id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0] || 'Spendy User',
        currency: 'UGX',
      };
      setProfile(mockProfile);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading profile:', error.message);
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email || userEmail,
          full_name: data.full_name || userEmail.split('@')[0],
          phone_number: data.phone_number,
          avatar_url: data.avatar_url,
          currency: data.default_currency || data.currency || 'UGX',
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      } else {
        // Profile not found yet (create optimistic profile)
        const newProfile: UserProfileData = {
          id: userId,
          email: userEmail,
          full_name: userEmail.split('@')[0] || 'User',
          currency: 'UGX',
        };
        setProfile(newProfile);
        await supabase.from('profiles').upsert({
          id: userId,
          email: userEmail,
          full_name: newProfile.full_name,
          default_currency: 'UGX',
        });
      }
    } catch (e) {
      console.warn('Profile fetch exception:', e);
    }
  }, [supabase]);

  // Initialize Session
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!isSupabaseConfigured()) {
        try {
          const savedAuth = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
          if (savedAuth) {
            const parsed = JSON.parse(savedAuth);
            if (parsed.user) {
              setUser(parsed.user);
              setSession(parsed.session || null);
              await fetchProfile(parsed.user.id, parsed.user.email || '');
            }
          }
        } catch {
          // safe
        }
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session error:', error.message);
        }

        if (isMounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id, initialSession.user.email || '');
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (e) {
        console.warn('Auth initialization error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    // Listen for auth state changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user.id, newSession.user.email || '');
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, fetchProfile]);

  // Audit Logging Helper
  const logAuditEvent = async (
    eventType: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGED' | 'EMAIL_CHANGED' | 'PROFILE_UPDATED' | 'ACCOUNT_DELETED' | 'DATA_EXPORTED',
    userId?: string,
    metadata?: Record<string, unknown>
  ) => {
    const targetUserId = userId || user?.id;
    if (!isSupabaseConfigured() || !targetUserId) return;
    try {
      await supabase.from('audit_logs').insert({
        user_id: targetUserId,
        event_type: eventType,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });
    } catch {
      // safe non-blocking audit logging
    }
  };

  // Sign In
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      if (!email.trim() || !password) {
        return { error: 'Please enter both your email address and password.' };
      }

      if (!isSupabaseConfigured()) {
        // Offline / Local Mock Auth
        const mockId = `usr_${Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))}`;
        const mockUser: User = {
          id: mockId,
          app_metadata: {},
          user_metadata: { full_name: email.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email.trim().toLowerCase(),
          email_confirmed_at: new Date().toISOString(),
        } as unknown as User;

        const mockProfile: UserProfileData = {
          id: mockId,
          email: email.trim().toLowerCase(),
          full_name: email.split('@')[0],
          currency: 'UGX',
        };

        setUser(mockUser);
        setProfile(mockProfile);
        try {
          localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser }));
          localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(mockProfile));
        } catch {
          // safe
        }
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email || '');
        await logAuditEvent('LOGIN', data.user.id, { email: data.user.email });
      }

      return { error: null };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Unable to sign in. Please check your connection and try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const signUp = async (params: SignUpParams): Promise<{ error: string | null; needsEmailVerification?: boolean }> => {
    setIsLoading(true);
    try {
      const { fullName, email, password, currency = 'UGX' } = params;

      if (!fullName.trim()) return { error: 'Full name is required.' };
      if (!email.trim()) return { error: 'Email address is required.' };
      if (!password) return { error: 'Password is required.' };

      if (!isSupabaseConfigured()) {
        const mockId = `usr_${Date.now()}`;
        const mockUser: User = {
          id: mockId,
          app_metadata: {},
          user_metadata: { full_name: fullName.trim() },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email.trim().toLowerCase(),
          email_confirmed_at: new Date().toISOString(),
        } as unknown as User;

        const mockProfile: UserProfileData = {
          id: mockId,
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          currency,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        try {
          localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser }));
          localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(mockProfile));
        } catch {
          // safe
        }
        return { error: null, needsEmailVerification: false };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            default_currency: currency,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/app` : undefined,
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (data.user) {
        // If user already confirmed (or email confirmation disabled)
        if (data.session) {
          setUser(data.user);
          setSession(data.session);
          await fetchProfile(data.user.id, data.user.email || '');
          await logAuditEvent('LOGIN', data.user.id, { action: 'signup_confirmed' });
          return { error: null, needsEmailVerification: false };
        }

        // Email confirmation is required
        return { error: null, needsEmailVerification: true };
      }

      return { error: null, needsEmailVerification: true };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (user?.id) {
        await logAuditEvent('LOGOUT', user.id);
      }
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      try {
        localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
        localStorage.removeItem(LOCAL_PROFILE_STORAGE_KEY);
      } catch {
        // safe
      }
      setIsLoading(false);
    }
  };

  // Reset Password for Email
  const resetPasswordForEmail = async (email: string): Promise<{ error: string | null }> => {
    try {
      if (!email.trim()) return { error: 'Please enter your email address.' };

      if (!isSupabaseConfigured()) {
        return { error: null };
      }

      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Unable to send password recovery link. Please try again.' };
    }
  };

  // Update Password
  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    try {
      if (!newPassword || newPassword.length < 8) {
        return { error: 'Password must be at least 8 characters long.' };
      }

      if (!isSupabaseConfigured()) {
        return { error: null };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (user?.id) {
        await logAuditEvent('PASSWORD_CHANGED', user.id);
      }

      return { error: null };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Unable to update password. Please try again.' };
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfileData>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'You must be logged in to update your profile.' };

    try {
      const updatedProfile: UserProfileData = {
        ...profile,
        id: user.id,
        email: user.email || '',
        full_name: updates.full_name !== undefined ? updates.full_name.trim() : (profile?.full_name || ''),
        currency: updates.currency || profile?.currency || 'UGX',
        phone_number: updates.phone_number !== undefined ? updates.phone_number : profile?.phone_number,
        avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : profile?.avatar_url,
        updated_at: new Date().toISOString(),
      };

      setProfile(updatedProfile);

      if (!isSupabaseConfigured()) {
        try {
          localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
        } catch {
          // safe
        }
        return { error: null };
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: updatedProfile.full_name,
          phone_number: updatedProfile.phone_number,
          avatar_url: updatedProfile.avatar_url,
          default_currency: updatedProfile.currency,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { error: 'Failed to save profile changes. Please try again.' };
      }

      await logAuditEvent('PROFILE_UPDATED', user.id, { full_name: updatedProfile.full_name, currency: updatedProfile.currency });

      return { error: null };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'An error occurred while updating your profile.' };
    }
  };

  // Resend Verification Email
  const resendVerificationEmail = async (email: string): Promise<{ error: string | null }> => {
    try {
      if (!isSupabaseConfigured()) {
        return { error: null };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Failed to resend verification email.' };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email || '');
    }
  };

  const isAuthenticated = Boolean(user);
  const isEmailVerified = Boolean(user?.email_confirmed_at);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        resendVerificationEmail,
        refreshProfile,
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

// User-friendly error message sanitization
function formatAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password. Please double check your credentials and try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your inbox and verify your email address before logging in.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'An account with this email address already exists. Please log in instead.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Password must be at least 8 characters long and include numbers and uppercase letters.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. For security, please wait a moment and try again.';
  }
  if (msg.includes('fetch') || msg.includes('network')) {
    return 'Network connection problem. Please check your internet connection.';
  }

  return 'Unable to process authentication. Please try again.';
}
