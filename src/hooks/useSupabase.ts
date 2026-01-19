import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type UserProfile, type Song, type UserSong, type Recording, type CollaborativeSession } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Mock data for demo when Supabase is not configured
const mockSongs = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    duration: 355,
    genre: 'Rock',
    difficulty: 'hard',
    youtube_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    spotify_id: '4u7EnebtmKWzUH433cf1Qv',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    duration: 233,
    genre: 'Pop',
    difficulty: 'medium',
    youtube_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    spotify_id: '7qiZfU4dY4WkLyMn4s5iuJ',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Imagine',
    artist: 'John Lennon',
    duration: 183,
    genre: 'Classic',
    difficulty: 'easy',
    youtube_url: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
    spotify_id: '7pKfPomDiuM2OtqtWKpGRb',
    created_at: new Date().toISOString()
  }
];

// User Profile Hooks
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!supabase || !userId) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<UserProfile> & { id: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', data.id] });
    }
  });
}

// Songs Hooks
export function useSongs(search?: string, genre?: string) {
  return useQuery({
    queryKey: ['songs', search, genre],
    queryFn: async () => {
      if (!supabase) {
        // Return filtered mock data
        let filtered = mockSongs;
        if (search) {
          const searchTerm = search.toLowerCase();
          filtered = filtered.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
          );
        }
        if (genre) {
          filtered = filtered.filter(song => song.genre === genre);
        }
        return filtered as Song[];
      }
      
      let query = supabase.from('songs').select('*');
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
      }
      
      if (genre) {
        query = query.eq('genre', genre);
      }
      
      const { data, error } = await query.order('title');
      if (error) throw error;
      return data as Song[];
    }
  });
}

// User Songs Hooks
export function useUserSongs(userId?: string) {
  return useQuery({
    queryKey: ['userSongs', userId],
    queryFn: async () => {
      if (!supabase || !userId) return [];
      
      const { data, error } = await supabase
        .from('user_songs')
        .select(`
          *,
          song:songs(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserSong[];
    },
    enabled: !!userId
  });
}

export function useSaveSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, songId, transposeValue = 0, notes = '' }: {
      userId: string;
      songId: string;
      transposeValue?: number;
      notes?: string;
    }) => {
      if (!supabase) {
        // Mock save for demo
        return { id: Date.now().toString(), user_id: userId, song_id: songId, transpose_value: transposeValue, notes };
      }
      
      const { data, error } = await supabase
        .from('user_songs')
        .insert({
          user_id: userId,
          song_id: songId,
          transpose_value: transposeValue,
          notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userSongs', variables.userId] });
    }
  });
}

export function useRemoveSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, songId }: { userId: string; songId: string }) => {
      if (!supabase) {
        // Mock remove for demo
        return;
      }
      
      const { error } = await supabase
        .from('user_songs')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userSongs', variables.userId] });
    }
  });
}

// Recordings Hooks
export function useUserRecordings(userId?: string) {
  return useQuery({
    queryKey: ['recordings', userId],
    queryFn: async () => {
      if (!supabase || !userId) return [];
      
      const { data, error } = await supabase
        .from('recordings')
        .select(`
          *,
          song:songs(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Recording[];
    },
    enabled: !!userId
  });
}

export function useSaveRecording() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recording: Omit<Recording, 'id' | 'created_at' | 'song'>) => {
      if (!supabase) {
        // Mock save for demo
        return { id: Date.now().toString(), ...recording, created_at: new Date().toISOString() };
      }
      
      const { data, error } = await supabase
        .from('recordings')
        .insert(recording)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordings', variables.user_id] });
    }
  });
}

// Collaborative Sessions Hooks
export function useActiveSessions() {
  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('collaborative_sessions')
        .select(`
          *,
          song:songs(*),
          host:user_profiles(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CollaborativeSession[];
    }
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ hostId, songId, maxParticipants = 4 }: {
      hostId: string;
      songId?: string;
      maxParticipants?: number;
    }) => {
      if (!supabase) {
        // Mock session for demo
        return {
          id: Date.now().toString(),
          host_id: hostId,
          session_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
          song_id: songId,
          max_participants: maxParticipants,
          is_active: true,
          created_at: new Date().toISOString()
        };
      }
      
      // Generate unique session code
      const sessionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { data, error } = await supabase
        .from('collaborative_sessions')
        .insert({
          host_id: hostId,
          session_code: sessionCode,
          song_id: songId,
          max_participants: maxParticipants
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });
}

// Subscription Hooks
export function useUserSubscription(userId?: string) {
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!supabase || !userId) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Subscription | null;
    },
    enabled: !!userId
  });
}