import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
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
=======
import { useAuth } from '../modules/auth';
import { apiRequest } from '@/lib/queryClient';
import type { Song, Recording, UserSong, SubscriptionPlan, StreamingPlatform, CollaborativeSession } from '@shared/schema';

>>>>>>> origin/main
export function useSongs(search?: string, genre?: string) {
  return useQuery({
    queryKey: ['songs', search, genre],
    queryFn: async () => {
<<<<<<< HEAD
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
=======
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      const queryString = params.toString();
      const url = `/api/songs${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch songs');
      return response.json() as Promise<Song[]>;
>>>>>>> origin/main
    }
  });
}

<<<<<<< HEAD
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
=======
export function useSong(id: number | string | undefined) {
  return useQuery({
    queryKey: ['song', id],
    queryFn: async () => {
      const response = await fetch(`/api/songs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch song');
      return response.json() as Promise<Song>;
    },
    enabled: !!id
  });
}

export function useUserSongs() {
  const { state: { user } } = useAuth();
  return useQuery({
    queryKey: ['userSongs', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/songs', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch user songs');
      }
      return response.json() as Promise<UserSong[]>;
    },
    enabled: !!user
>>>>>>> origin/main
  });
}

export function useSaveSong() {
  const queryClient = useQueryClient();
<<<<<<< HEAD
  
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
=======
  const { state: { user } } = useAuth();

  return useMutation({
    mutationFn: async ({ songId, transposeValue = 0, notes = '' }: {
      songId: number;
      transposeValue?: number;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/user/songs', {
        songId,
        transposeValue,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSongs', user?.id] });
>>>>>>> origin/main
    }
  });
}

export function useRemoveSong() {
  const queryClient = useQueryClient();
<<<<<<< HEAD
  
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
=======
  const { state: { user } } = useAuth();

  return useMutation({
    mutationFn: async (songId: number) => {
      const response = await apiRequest('DELETE', `/api/user/songs/${songId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSongs', user?.id] });
>>>>>>> origin/main
    }
  });
}

<<<<<<< HEAD
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
=======
export function useUserRecordings() {
  const { state: { user } } = useAuth();
  return useQuery({
    queryKey: ['recordings', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/recordings', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch recordings');
      }
      return response.json() as Promise<Recording[]>;
    },
    enabled: !!user
>>>>>>> origin/main
  });
}

export function useSaveRecording() {
  const queryClient = useQueryClient();
<<<<<<< HEAD
  
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
=======
  const { state: { user } } = useAuth();

  return useMutation({
    mutationFn: async (recording: {
      songId: number;
      title: string;
      fileUrl: string;
      duration: number;
      transposeUsed?: number;
      isCollaborative?: boolean;
      quality?: string;
    }) => {
      const response = await apiRequest('POST', '/api/recordings', recording);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings', user?.id] });
    }
  });
}

export function useDeleteRecording() {
  const queryClient = useQueryClient();
  const { state: { user } } = useAuth();

  return useMutation({
    mutationFn: async (recordingId: number) => {
      const response = await apiRequest('DELETE', `/api/recordings/${recordingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings', user?.id] });
>>>>>>> origin/main
    }
  });
}

<<<<<<< HEAD
// Collaborative Sessions Hooks
=======
>>>>>>> origin/main
export function useActiveSessions() {
  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
<<<<<<< HEAD
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
=======
      const response = await fetch('/api/sessions/active');
      if (!response.ok) return [];
      return response.json() as Promise<CollaborativeSession[]>;
>>>>>>> origin/main
    }
  });
}

<<<<<<< HEAD
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
=======
export function useSessionByCode(code: string | undefined) {
  return useQuery({
    queryKey: ['session', code],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/code/${code}`);
      if (!response.ok) throw new Error('Session not found');
      return response.json() as Promise<CollaborativeSession>;
    },
    enabled: !!code
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, maxParticipants = 4 }: {
      songId?: number;
      maxParticipants?: number;
    }) => {
      const response = await apiRequest('POST', '/api/sessions', {
        songId,
        maxParticipants
      });
      return response.json();
>>>>>>> origin/main
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });
}

<<<<<<< HEAD
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
=======
export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', `/api/sessions/${sessionId}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });
}

export function useLeaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', `/api/sessions/${sessionId}/leave`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });
}

export function useSessionParticipants(sessionId: number | undefined) {
  return useQuery({
    queryKey: ['sessionParticipants', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/participants`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      return response.json();
    },
    enabled: !!sessionId
  });
}

export function useUserSubscription() {
  const { state: { user } } = useAuth();
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/subscription', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
    enabled: !!user
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch subscription plans');
      return response.json() as Promise<SubscriptionPlan[]>;
    }
  });
}

export function useStreamingPlatforms() {
  return useQuery({
    queryKey: ['streamingPlatforms'],
    queryFn: async () => {
      const response = await fetch('/api/streaming-platforms');
      if (!response.ok) throw new Error('Failed to fetch streaming platforms');
      return response.json() as Promise<StreamingPlatform[]>;
    }
  });
}

export function useUserPlatformConnections() {
  const { state: { user } } = useAuth();
  return useQuery({
    queryKey: ['platformConnections', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/platform-connections', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch platform connections');
      }
      return response.json();
    },
    enabled: !!user
  });
}

export function useUploadJobs() {
  const { state: { user } } = useAuth();
  return useQuery({
    queryKey: ['uploadJobs', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/upload-jobs', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch upload jobs');
      }
      return response.json();
    },
    enabled: !!user
  });
}

export function useCreateUploadJob() {
  const queryClient = useQueryClient();
  const { state: { user } } = useAuth();

  return useMutation({
    mutationFn: async (job: {
      recordingId: number;
      platformId: number;
      title: string;
      description?: string;
    }) => {
      const response = await apiRequest('POST', '/api/upload-jobs', job);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploadJobs', user?.id] });
    }
  });
}
>>>>>>> origin/main
