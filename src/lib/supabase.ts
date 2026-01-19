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
  duration: number;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  youtube_url: string;
  spotify_id: string;
  created_at: string;
}

export interface UserSong {
  id: string;
  user_id: string;
  song_id: string;
  transpose_value: number;
  notes: string;
  created_at: string;
  song: Song;
}

export interface Recording {
  id: string;
  user_id: string;
  song_id: string;
  title: string;
  file_url: string;
  duration: number;
  transpose_used: number;
  is_collaborative: boolean;
  quality: 'standard' | 'high';
  created_at: string;
  song: Song;
}

export interface CollaborativeSession {
  id: string;
  host_id: string;
  session_code: string;
  song_id: string | null;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  song?: Song;
  host: UserProfile;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  is_muted: boolean;
  has_video: boolean;
  user: UserProfile;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'platinum';
  status: 'active' | 'cancelled' | 'expired';
  stripe_subscription_id: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}