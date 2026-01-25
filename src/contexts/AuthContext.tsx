import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase, isSupabaseConfigured, type UserProfile } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  subscriptionTier?: 'free' | 'pro' | 'platinum';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile) {
        setUser({
          id: profile.id,
          name: profile.display_name,
          email: '',
          avatar: profile.avatar_url,
          bio: profile.bio,
          subscriptionTier: profile.subscription_tier
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      const mockUser = {
        id: crypto.randomUUID(),
        name: 'Demo User',
        email: 'demo@itone.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
        bio: 'Passionate karaoke singer and music lover 🎤',
        subscriptionTier: 'free' as const
      };
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
        setLocation('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      setLocation('/');
      return;
    }
    try {
      await supabase.auth.signOut();
      setUser(null);
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateProfile,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
