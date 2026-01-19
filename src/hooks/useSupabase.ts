import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../modules/auth';
import { apiRequest } from '@/lib/queryClient';
import type { Song, Recording, UserSong, SubscriptionPlan, StreamingPlatform, CollaborativeSession } from '@shared/schema';

export function useSongs(search?: string, genre?: string) {
  return useQuery({
    queryKey: ['songs', search, genre],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      const queryString = params.toString();
      const url = `/api/songs${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch songs');
      return response.json() as Promise<Song[]>;
    }
  });
}

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
  });
}

export function useSaveSong() {
  const queryClient = useQueryClient();
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
    }
  });
}

export function useRemoveSong() {
  const queryClient = useQueryClient();
  const { state: { user } } = useAuth();

  return useMutation({
    mutationFn: async (songId: number) => {
      const response = await apiRequest('DELETE', `/api/user/songs/${songId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSongs', user?.id] });
    }
  });
}

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
  });
}

export function useSaveRecording() {
  const queryClient = useQueryClient();
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
    }
  });
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/active');
      if (!response.ok) return [];
      return response.json() as Promise<CollaborativeSession[]>;
    }
  });
}

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });
}

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
