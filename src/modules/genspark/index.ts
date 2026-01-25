// Genspark AI Module Exports
export { gensparkService } from './services/gensparkService';
export { useGenspark, useAIRecommendations, useContentModeration, useVocalAnalysis } from './hooks/useGenspark';
export { AIResponseDisplay, SongRecommendationCard, VocalAnalysisCard, AIStreamingDisplay } from './components/AIResponseDisplay';
export { SmartRecommendations } from './components/SmartRecommendations';
export { RealTimeCoaching } from './components/RealTimeCoaching';
export { GensparkErrorBoundary, errorHandler, prepareUserData, preparePerformanceData } from './utils/errorHandling';

export type {
  GensparkConfig,
  GensparkRequest,
  GensparkResponse,
  GensparkError,
  GensparkStreamChunk,
  RecommendationRequest,
  ModerationRequest,
  AnalysisRequest,
  PersonalizationRequest,
  ContentGenerationRequest,
  GensparkAIResponse
} from './types';