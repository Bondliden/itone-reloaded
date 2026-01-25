import { createClient } from '@supabase/supabase-js';

// Check if Supabase is properly configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if environment variables are properly set
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Database types
export interface UserProfile {
  id: string;
  display_name: string;
  bio: string;
  github_repo: string;
  avatar_url: string;
  subscription_tier: 'free' | 'pro' | 'platinum';
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
}
