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
