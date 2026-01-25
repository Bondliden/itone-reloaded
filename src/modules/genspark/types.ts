// Genspark AI Integration Types
export interface GensparkConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  version: string;
}

export interface GensparkRequest {
  type: 'recommendation' | 'moderation' | 'analysis' | 'personalization' | 'content_generation';
  userId?: string;
  sessionId?: string;
  data: any;
  context?: GensparkContext;
  priority?: 'low' | 'medium' | 'high';
  streaming?: boolean;
}

export interface GensparkContext {
  userProfile?: {
    id: string;
    preferences: any;
    history: any[];
    subscriptionTier: string;
  };
  sessionData?: {
    currentSong?: any;
    recordingHistory: any[];
    collaborativeSession?: any;
  };
  platformData?: {
    connectedPlatforms: string[];
    uploadHistory: any[];
  };
}

export interface GensparkResponse {
  success: boolean;
  data: any;
  confidence: number;
  reasoning?: string;
  suggestions?: string[];
  metadata?: {
    processingTime: number;
    modelUsed: string;
    requestId: string;
    cacheHit?: boolean;
  };
  error?: string;
}

export interface RecommendationRequest {
  type: 'song_recommendation' | 'vocal_style' | 'collaboration_partner' | 'platform_suggestion';
  userHistory: {
    recordedSongs: any[];
    savedSongs: any[];
    collaborations: any[];
    vocalAnalysis?: any;
  };
  preferences: {
    genres: string[];
    difficulty: string;
    collaborationStyle: string;
    platforms: string[];
  };
  contextualData?: {
    timeOfDay: string;
    mood?: string;
    location?: string;
  };
}

export interface ModerationRequest {
  type: 'content_moderation' | 'chat_moderation' | 'username_check' | 'spam_detection';
  content: {
    text?: string;
    audioUrl?: string;
    videoUrl?: string;
    metadata?: any;
  };
  context: {
    userId: string;
    sessionType: 'solo' | 'collaborative' | 'live_stream';
    platformDestination?: string;
  };
}

export interface AnalysisRequest {
  type: 'vocal_analysis' | 'performance_scoring' | 'trend_analysis' | 'engagement_prediction';
  audioData?: {
    url: string;
    duration: number;
    format: string;
  };
  performanceData?: {
    pitch: number[];
    volume: number[];
    timing: number[];
    lyrics?: string;
  };
  historicalData?: any[];
}

export interface PersonalizationRequest {
  type: 'ui_customization' | 'workflow_optimization' | 'feature_suggestions' | 'learning_path';
  userBehavior: {
    sessionDuration: number;
    featuresUsed: string[];
    preferences: any;
    skillLevel: string;
  };
  goalData?: {
    targetGenres: string[];
    improvementAreas: string[];
    collaborationGoals: string[];
  };
}

export interface ContentGenerationRequest {
  type: 'lyrics_generation' | 'harmony_suggestions' | 'vocal_coaching' | 'practice_routine';
  sourceContent: {
    song?: any;
    recordingUrl?: string;
    userVocalRange?: string;
    preferredStyle?: string;
  };
  parameters: {
    creativity: number; // 0-1
    difficulty: string;
    language: string;
    mood?: string;
  };
}

export type GensparkAIResponse = {
  recommendations?: {
    songs: Array<{
      title: string;
      artist: string;
      confidence: number;
      reasoning: string;
      difficulty: string;
      youtube_url?: string;
    }>;
    styles?: Array<{
      name: string;
      description: string;
      parameters: any;
      suitability: number;
    }>;
    platforms?: Array<{
      name: string;
      reasoning: string;
      cost: number;
      audience: string;
    }>;
  };
  moderation?: {
    approved: boolean;
    flagged: string[];
    severity: 'low' | 'medium' | 'high';
    suggestions: string[];
    autoActions?: string[];
  };
  analysis?: {
    vocalScore: {
      overall: number;
      pitch: number;
      timing: number;
      expression: number;
      improvement: string[];
    };
    trends?: {
      genre: string;
      popularity: number;
      growth: number;
      demographic: string;
    };
    predictions?: {
      engagement: number;
      viralPotential: number;
      monetization: number;
    };
  };
  personalization?: {
    uiCustomizations: any;
    workflowSuggestions: string[];
    featureRecommendations: string[];
    learningPath: Array<{
      step: string;
      description: string;
      resources: string[];
    }>;
  };
  content?: {
    lyrics?: string[];
    harmonies?: Array<{
      part: string;
      notes: number[];
      timing: number[];
    }>;
    coaching?: {
      techniques: string[];
      exercises: string[];
      feedback: string;
    };
    practice?: {
      routine: Array<{
        exercise: string;
        duration: number;
        difficulty: string;
      }>;
      goals: string[];
    };
  };
};

export interface GensparkError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: string;
}

export interface GensparkStreamChunk {
  id: string;
  type: 'data' | 'metadata' | 'error' | 'complete';
  content: any;
  timestamp: number;
}