import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth';
import { useUserSongs, useUserRecordings } from '../../../hooks/useSupabase.ts';
import { useGenspark } from './useGenspark';
import { prepareUserData } from '../utils/errorHandling';
import type { GensparkResponse } from '../types';

interface AIRecommendationsState {
  songRecommendations: any[];
  styleRecommendations: any[];
  platformRecommendations: any[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useAIRecommendations() {
  const { state: authState } = useAuth();
  const { data: userSongs = [] } = useUserSongs(authState.user?.id);
  const { data: recordings = [] } = useUserRecordings(authState.user?.id);
  const { getRecommendations, loading, error } = useGenspark();

  const [recommendationsState, setRecommendationsState] = useState<AIRecommendationsState>({
    songRecommendations: [],
    styleRecommendations: [],
    platformRecommendations: [],
    loading: false,
    error: null,
    lastUpdate: null
  });

  // Get personalized song recommendations
  const getSongRecommendations = useCallback(async (options: {
    mood?: string;
    genre?: string;
    difficulty?: string;
    collaborationType?: 'solo' | 'duet' | 'group';
    timeOfDay?: string;
  } = {}) => {
    if (!authState.user) return null;

    try {
      setRecommendationsState(prev => ({ ...prev, loading: true, error: null }));

      const userData = prepareUserData(authState.user, userSongs, recordings);
      
      const response = await getRecommendations({
        type: 'song_recommendation',
        userHistory: {
          recordedSongs: recordings.map(r => ({
            title: r.song?.title || r.title,
            artist: r.song?.artist || 'Unknown',
            genre: r.song?.genre || 'Unknown',
            difficulty: r.song?.difficulty || 'medium',
            transpose: r.transpose_used || 0,
            score: Math.floor(Math.random() * 40) + 60, // Mock performance score
            timestamp: r.created_at
          })),
          savedSongs: userSongs.map(s => ({
            title: s.song.title,
            artist: s.song.artist,
            genre: s.song.genre,
            transpose: s.transpose_value,
            timestamp: s.created_at
          })),
          collaborations: [], // Would be loaded from collaborative sessions
          vocalAnalysis: {
            range: options.difficulty || 'medium',
            preferredGenres: userData.activity.genres,
            recentPerformance: recordings.slice(0, 3)
          }
        },
        preferences: {
          genres: options.genre ? [options.genre] : userData.activity.genres,
          difficulty: options.difficulty || 'medium',
          collaborationStyle: options.collaborationType || 'solo',
          platforms: [] // Would be loaded from connected platforms
        },
        contextualData: {
          timeOfDay: options.timeOfDay || (new Date().getHours() < 12 ? 'morning' : 'afternoon'),
          mood: options.mood,
          location: authState.user.country
        }
      });

      if (response?.success && response.data?.recommendations?.songs) {
        setRecommendationsState(prev => ({
          ...prev,
          songRecommendations: response.data.recommendations.songs,
          lastUpdate: new Date()
        }));
        return response.data.recommendations.songs;
      }

      return null;
    } catch (error) {
      setRecommendationsState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      }));
      return null;
    } finally {
      setRecommendationsState(prev => ({ ...prev, loading: false }));
    }
  }, [authState.user, userSongs, recordings, getRecommendations]);

  // Get AI-powered vocal style recommendations
  const getStyleRecommendations = useCallback(async (currentPerformance: any) => {
    if (!authState.user) return null;

    try {
      const response = await getRecommendations({
        type: 'vocal_style',
        userHistory: {
          recordedSongs: recordings.slice(0, 5),
          savedSongs: userSongs.slice(0, 10),
          collaborations: [],
          vocalAnalysis: currentPerformance
        },
        preferences: {
          genres: [...new Set(userSongs.map(s => s.song.genre))],
          difficulty: authState.user.subscriptionTier === 'free' ? 'easy' : 'medium',
          collaborationStyle: 'solo',
          platforms: []
        }
      });

      if (response?.success && response.data?.recommendations?.styles) {
        setRecommendationsState(prev => ({
          ...prev,
          styleRecommendations: response.data.recommendations.styles
        }));
        return response.data.recommendations.styles;
      }

      return null;
    } catch (error) {
      console.error('Style recommendations failed:', error);
      return null;
    }
  }, [authState.user, recordings, userSongs, getRecommendations]);

  // Get platform upload recommendations
  const getPlatformRecommendations = useCallback(async (recording: any) => {
    if (!authState.user || authState.user.subscriptionTier !== 'platinum') return null;

    try {
      const response = await getRecommendations({
        type: 'platform_suggestion',
        userHistory: {
          recordedSongs: [recording],
          savedSongs: userSongs,
          collaborations: [],
          vocalAnalysis: recording.analysis
        },
        preferences: {
          genres: [recording.song?.genre || 'pop'],
          difficulty: recording.song?.difficulty || 'medium',
          collaborationStyle: recording.is_collaborative ? 'group' : 'solo',
          platforms: [] // Connected platforms would be loaded here
        }
      });

      if (response?.success && response.data?.recommendations?.platforms) {
        setRecommendationsState(prev => ({
          ...prev,
          platformRecommendations: response.data.recommendations.platforms
        }));
        return response.data.recommendations.platforms;
      }

      return null;
    } catch (error) {
      console.error('Platform recommendations failed:', error);
      return null;
    }
  }, [authState.user, userSongs, getRecommendations]);

  // Get contextual recommendations based on time and user activity
  const getContextualRecommendations = useCallback(async () => {
    if (!authState.user) return null;

    const hour = new Date().getHours();
    let mood = 'neutral';
    let timeContext = 'any';

    // AI-like mood detection based on time
    if (hour < 9) {
      mood = 'energetic';
      timeContext = 'morning';
    } else if (hour < 17) {
      mood = 'focused';
      timeContext = 'daytime';
    } else if (hour < 22) {
      mood = 'relaxed';
      timeContext = 'evening';
    } else {
      mood = 'chill';
      timeContext = 'night';
    }

    return getSongRecommendations({
      mood,
      timeOfDay: timeContext,
      difficulty: recordings.length > 5 ? 'medium' : 'easy' // Adaptive difficulty
    });
  }, [authState.user, recordings.length, getSongRecommendations]);

  // Auto-refresh recommendations periodically
  useEffect(() => {
    if (authState.isAuthenticated && userSongs.length > 0) {
      // Auto-fetch contextual recommendations when user has some data
      getContextualRecommendations();
    }
  }, [authState.isAuthenticated, userSongs.length]);

  return {
    // State
    ...recommendationsState,
    loading: recommendationsState.loading || loading,
    error: recommendationsState.error || error,

    // Actions
    getSongRecommendations,
    getStyleRecommendations,
    getPlatformRecommendations,
    getContextualRecommendations,

    // Utilities
    hasRecommendations: recommendationsState.songRecommendations.length > 0,
    totalRecommendations: recommendationsState.songRecommendations.length + 
                         recommendationsState.styleRecommendations.length + 
                         recommendationsState.platformRecommendations.length
  };
}

// Hook for real-time AI coaching during recording
export function useRealTimeCoaching() {
  const { generateContent, loading, error } = useGenspark();
  const [coachingTips, setCoachingTips] = useState<string[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  const analyzeVocalPerformance = useCallback(async (audioMetrics: {
    pitch: number;
    volume: number;
    stability: number;
    timestamp: number;
  }) => {
    try {
      const response = await generateContent({
        type: 'vocal_coaching',
        sourceContent: {
          userVocalRange: 'medium', // Would be calculated from historical data
          preferredStyle: 'natural'
        },
        parameters: {
          creativity: 0.5, // More conservative for coaching
          difficulty: 'medium',
          language: 'en'
        }
      });

      if (response?.success && response.data?.content?.coaching) {
        const coaching = response.data.content.coaching;
        setCurrentAnalysis({
          score: Math.round((audioMetrics.pitch + audioMetrics.volume + audioMetrics.stability) / 3),
          feedback: coaching.feedback,
          timestamp: audioMetrics.timestamp
        });

        // Add new coaching tips
        if (coaching.techniques) {
          setCoachingTips(prev => [
            ...prev.slice(-4), // Keep last 4 tips
            ...coaching.techniques.slice(0, 2) // Add up to 2 new tips
          ]);
        }
      }
    } catch (error) {
      console.error('Real-time coaching failed:', error);
    }
  }, [generateContent]);

  const clearCoaching = () => {
    setCoachingTips([]);
    setCurrentAnalysis(null);
  };

  return {
    analyzeVocalPerformance,
    clearCoaching,
    coachingTips,
    currentAnalysis,
    loading,
    error
  };
}