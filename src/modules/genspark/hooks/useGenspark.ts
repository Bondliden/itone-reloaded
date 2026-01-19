import { useState, useRef, useCallback, useEffect } from 'react';
import { useSupabase } from '../../../hooks/useSupabase';
import { gensparkService } from '../services/gensparkService';
import { useAuth } from "../../auth";
import { useUserSongs, useUserRecordings } from "../../../hooks/useSupabase.ts";
import { errorHandler } from '../utils/errorHandling.tsx';
import type {
  GensparkResponse,
  RecommendationRequest,
  ModerationRequest,
  AnalysisRequest,
  PersonalizationRequest,
  ContentGenerationRequest,
  GensparkStreamChunk
} from '../types';

interface UseGensparkState {
  loading: boolean;
  error: string | null;
  response: GensparkResponse | null;
  streamChunks: GensparkStreamChunk[];
}

export function useGenspark() {
  const { state: authState } = useAuth();
  const { data: userSongs = [] } = useUserSongs(authState.user?.id);
  const { data: recordings = [] } = useUserRecordings(authState.user?.id);
  
  const [state, setState] = useState<UseGensparkState>({
    loading: false,
    error: null,
    response: null,
    streamChunks: []
  });

  const activeRequestRef = useRef<string | null>(null);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setResponse = (response: GensparkResponse | null) => {
    setState(prev => ({ ...prev, response }));
  };

  const addStreamChunk = (chunk: GensparkStreamChunk) => {
    setState(prev => ({
      ...prev,
      streamChunks: [...prev.streamChunks, chunk]
    }));
  };

  const clearStreamChunks = () => {
    setState(prev => ({ ...prev, streamChunks: [] }));
  };

  // Song Recommendations
  const getRecommendations = useCallback(async (preferences: any = {}) => {
    if (!authState.user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const request: RecommendationRequest = {
        type: 'song_recommendation',
        userHistory: {
          recordedSongs: recordings.map(r => ({
            title: r.song?.title || r.title,
            artist: r.song?.artist || 'Unknown',
            genre: r.song?.genre || 'Unknown',
            score: Math.floor(Math.random() * 40) + 60, // Mock score
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
            range: 'mid',
            strength: 'medium',
            preferredGenres: ['pop', 'rock']
          }
        },
        preferences: {
          genres: preferences.genres || ['pop', 'rock'],
          difficulty: preferences.difficulty || 'medium',
          collaborationStyle: preferences.collaborationStyle || 'casual',
          platforms: preferences.platforms || []
        },
        contextualData: {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
          mood: preferences.mood
        }
      };

      const response = await gensparkService.getRecommendations(request);
      setResponse(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recommendations';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authState.user, recordings, userSongs]);

  // Content Moderation
  const moderateContent = useCallback(async (content: any, context: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      const request: ModerationRequest = {
        type: 'content_moderation',
        content: {
          text: content.text,
          audioUrl: content.audioUrl,
          videoUrl: content.videoUrl,
          metadata: content.metadata
        },
        context: {
          userId: authState.user?.id || 'anonymous',
          sessionType: context.sessionType || 'solo',
          platformDestination: context.platform
        }
      };

      const response = await gensparkService.moderateContent(request);
      setResponse(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content moderation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  // Performance Analysis
  const analyzePerformance = useCallback(async (performanceData: any) => {
    setLoading(true);
    setError(null);

    try {
      const request: AnalysisRequest = {
        type: 'vocal_analysis',
        audioData: performanceData.audioUrl ? {
          url: performanceData.audioUrl,
          duration: performanceData.duration || 0,
          format: performanceData.format || 'webm'
        } : undefined,
        performanceData: {
          pitch: performanceData.pitch || [],
          volume: performanceData.volume || [],
          timing: performanceData.timing || [],
          lyrics: performanceData.lyrics
        },
        historicalData: recordings.slice(0, 10) // Last 10 recordings for comparison
      };

      const response = await gensparkService.analyzePerformance(request);
      setResponse(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Performance analysis failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [recordings]);

  // UI Personalization
  const getPersonalization = useCallback(async (behaviorData: any) => {
    setLoading(true);
    setError(null);

    try {
      const request: PersonalizationRequest = {
        type: 'ui_customization',
        userBehavior: {
          sessionDuration: behaviorData.sessionDuration || 0,
          featuresUsed: behaviorData.featuresUsed || [],
          preferences: {
            subscriptionTier: authState.user?.subscriptionTier || 'free',
            language: authState.user?.language || 'en'
          },
          skillLevel: behaviorData.skillLevel || 'beginner'
        },
        goalData: behaviorData.goals
      };

      const response = await gensparkService.getPersonalization(request);
      setResponse(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Personalization failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  // Content Generation (with streaming support)
  const generateContent = useCallback(async (
    contentRequest: Partial<ContentGenerationRequest>,
    streaming: boolean = false,
    onChunk?: (chunk: GensparkStreamChunk) => void
  ) => {
    if (streaming && !onChunk) {
      setError('Streaming callback required for streaming requests');
      return null;
    }

    setLoading(true);
    setError(null);
    if (streaming) clearStreamChunks();

    try {
      const request: ContentGenerationRequest = {
        type: contentRequest.type || 'vocal_coaching',
        sourceContent: contentRequest.sourceContent || {},
        parameters: {
          creativity: contentRequest.parameters?.creativity || 0.7,
          difficulty: contentRequest.parameters?.difficulty || 'medium',
          language: authState.user?.language || 'en',
          mood: contentRequest.parameters?.mood
        }
      };

      if (streaming && onChunk) {
        await gensparkService.generateContentStream(request, (chunk) => {
          addStreamChunk(chunk);
          onChunk(chunk);
        });
        return null;
      } else {
        const response = await gensparkService.generateContent(request);
        setResponse(response);
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content generation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  // Real-time vocal coaching
  const getVocalCoaching = useCallback(async (audioData: any, streaming: boolean = false) => {
    return generateContent({
      type: 'vocal_coaching',
      sourceContent: {
        recordingUrl: audioData.url,
        userVocalRange: audioData.vocalRange || 'medium',
        preferredStyle: audioData.style || 'natural'
      },
      parameters: {
        creativity: 0.6,
        difficulty: authState.user?.subscriptionTier === 'free' ? 'easy' : 'medium',
        language: authState.user?.language || 'en'
      }
    }, streaming);
  }, [authState.user, generateContent]);

  // Smart song suggestions based on time and mood
  const getSmartSuggestions = useCallback(async (context: any = {}) => {
    return getRecommendations({
      ...context,
      contextualData: {
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        mood: context.mood,
        location: context.location
      }
    });
  }, [getRecommendations]);

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (activeRequestRef.current) {
      gensparkService.cancelRequest(activeRequestRef.current);
      setLoading(false);
      setError('Request cancelled');
    }
  }, []);

  // Clear state
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      response: null,
      streamChunks: []
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gensparkService.cancelAllRequests();
    };
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    response: state.response,
    streamChunks: state.streamChunks,
    
    // Actions
    getRecommendations,
    moderateContent,
    analyzePerformance,
    getPersonalization,
    generateContent,
    getVocalCoaching,
    getSmartSuggestions,
    
    // Utilities
    cancelRequest,
    reset,
    
    // Direct service access for advanced usage
    service: gensparkService
  };
}

// Specialized hooks for specific use cases
export function useAIRecommendations() {
  const { getRecommendations, getSmartSuggestions, loading, error, response } = useGenspark();

  const getSongRecommendations = useCallback(async (mood?: string, genre?: string) => {
    return getSmartSuggestions({
      mood,
      genres: genre ? [genre] : undefined
    });
  }, [getSmartSuggestions]);

  const getVocalStyleRecommendations = useCallback(async (currentStyle: string) => {
    return getRecommendations({
      type: 'vocal_style',
      preferences: { currentStyle }
    });
  }, [getRecommendations]);

  return {
    getSongRecommendations,
    getVocalStyleRecommendations,
    loading,
    error,
    recommendations: response?.data?.recommendations
  };
}

export function useContentModeration() {
  const { moderateContent, loading, error, response } = useGenspark();

  const moderateText = useCallback(async (text: string, context: any = {}) => {
    return moderateContent({ text }, context);
  }, [moderateContent]);

  const moderateAudio = useCallback(async (audioUrl: string, context: any = {}) => {
    return moderateContent({ audioUrl }, context);
  }, [moderateContent]);

  const moderateVideo = useCallback(async (videoUrl: string, context: any = {}) => {
    return moderateContent({ videoUrl }, context);
  }, [moderateContent]);

  return {
    moderateText,
    moderateAudio,
    moderateVideo,
    loading,
    error,
    moderation: response?.data?.moderation
  };
}

export function useVocalAnalysis() {
  const { analyzePerformance, loading, error, response } = useGenspark();

  const analyzeRecording = useCallback(async (audioUrl: string, performanceMetrics: any = {}) => {
    return analyzePerformance({
      audioData: { url: audioUrl, duration: performanceMetrics.duration, format: 'webm' },
      performanceData: performanceMetrics
    });
  }, [analyzePerformance]);

  return {
    analyzeRecording,
    loading,
    error,
    analysis: response?.data?.analysis
  };
}