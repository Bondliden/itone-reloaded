import type { 
  GensparkConfig, 
  GensparkRequest, 
  GensparkResponse, 
  GensparkError,
  GensparkStreamChunk,
  RecommendationRequest,
  ModerationRequest,
  AnalysisRequest,
  PersonalizationRequest,
  ContentGenerationRequest
} from '../types';

class GensparkService {
  private config: GensparkConfig;
  private requestQueue: Map<string, AbortController> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GENSPARK_API_KEY || '',
      baseUrl: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' 
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genspark-proxy` 
        : 'mock',
      timeout: parseInt(import.meta.env.VITE_GENSPARK_TIMEOUT || '30000'),
      retryAttempts: parseInt(import.meta.env.VITE_GENSPARK_RETRY_ATTEMPTS || '3'),
      version: import.meta.env.VITE_GENSPARK_VERSION || '1.0'
    };
  }

  async makeRequest(request: GensparkRequest): Promise<GensparkResponse> {
    const requestId = this.generateRequestId();
    const cacheKey = this.generateCacheKey(request);
    
    // Use mock data if no valid Supabase URL configured
    if (this.config.baseUrl === 'mock') {
      return this.getMockResponse(request, requestId);
    }
    
    // Check cache first for non-real-time requests
    if (request.priority !== 'high' && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached.data,
          confidence: 1.0,
          metadata: {
            processingTime: 0,
            modelUsed: 'cache',
            requestId,
            cacheHit: true
          }
        };
      }
    }

    const controller = new AbortController();
    this.requestQueue.set(requestId, controller);

    try {
      const response = await this.executeRequest(request, requestId, controller.signal);
      
      // Cache successful responses
      if (response.success && request.priority !== 'high') {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000 // 5 minutes
        });
      }
      
      return response;
    } catch (error) {
      // Fallback to mock data if API is unavailable
      console.warn('Genspark API unavailable, using mock data:', error);
      return this.getMockResponse(request, requestId);
    } finally {
      this.requestQueue.delete(requestId);
    }
  }

  async makeStreamingRequest(
    request: GensparkRequest, 
    onChunk: (chunk: GensparkStreamChunk) => void
  ): Promise<void> {
    // Use mock streaming if no valid Supabase URL configured
    if (this.config.baseUrl === 'mock') {
      return this.getMockStreamingResponse(request, onChunk);
    }
    
    const requestId = this.generateRequestId();
    const controller = new AbortController();
    this.requestQueue.set(requestId, controller);

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getProxyHeaders(),
        body: JSON.stringify({ ...request, streaming: true, requestId }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            const streamChunk: GensparkStreamChunk = {
              id: requestId,
              type: data.type || 'data',
              content: data.content || data,
              timestamp: Date.now()
            };
            onChunk(streamChunk);
          } catch (parseError) {
            console.warn('Failed to parse stream chunk:', line);
          }
        }
      }
    } catch (error) {
      // Fallback to mock streaming data
      console.warn('Genspark streaming unavailable, using mock data:', error);
      this.getMockStreamingResponse(request, onChunk);
    } finally {
      this.requestQueue.delete(requestId);
    }
  }

  // Specialized Request Methods
  async getRecommendations(request: RecommendationRequest): Promise<GensparkResponse> {
    return this.makeRequest({
      type: 'recommendation',
      userId: request.userHistory ? 'current_user' : undefined,
      data: request,
      priority: 'medium'
    });
  }

  async moderateContent(request: ModerationRequest): Promise<GensparkResponse> {
    return this.makeRequest({
      type: 'moderation',
      userId: request.context.userId,
      data: request,
      priority: 'high' // Moderation is time-sensitive
    });
  }

  async analyzePerformance(request: AnalysisRequest): Promise<GensparkResponse> {
    return this.makeRequest({
      type: 'analysis',
      data: request,
      priority: 'medium'
    });
  }

  async getPersonalization(request: PersonalizationRequest): Promise<GensparkResponse> {
    return this.makeRequest({
      type: 'personalization',
      data: request,
      priority: 'low'
    });
  }

  async generateContent(request: ContentGenerationRequest): Promise<GensparkResponse> {
    return this.makeRequest({
      type: 'content_generation',
      data: request,
      priority: 'medium'
    });
  }

  // Streaming versions for real-time AI responses
  async getRecommendationsStream(
    request: RecommendationRequest, 
    onChunk: (chunk: GensparkStreamChunk) => void
  ): Promise<void> {
    return this.makeStreamingRequest({
      type: 'recommendation',
      data: request,
      priority: 'medium',
      streaming: true
    }, onChunk);
  }

  async generateContentStream(
    request: ContentGenerationRequest,
    onChunk: (chunk: GensparkStreamChunk) => void
  ): Promise<void> {
    return this.makeStreamingRequest({
      type: 'content_generation',
      data: request,
      priority: 'medium',
      streaming: true
    }, onChunk);
  }

  // Private helper methods
  private async executeRequest(
    request: GensparkRequest, 
    requestId: string, 
    signal: AbortSignal
  ): Promise<GensparkResponse> {
    const startTime = Date.now();
    
    // Add timeout
    const timeoutId = setTimeout(() => {
      const controller = this.requestQueue.get(requestId);
      if (controller) {
        controller.abort();
      }
    }, this.config.timeout);

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getProxyHeaders(),
        body: JSON.stringify({
          ...request,
          requestId,
          timestamp: Date.now(),
          version: this.config.version
        }),
        signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: data.result || data,
        confidence: data.confidence || 0.8,
        reasoning: data.reasoning,
        suggestions: data.suggestions,
        metadata: {
          processingTime,
          modelUsed: data.model || 'genspark-v1',
          requestId,
          cacheHit: false
        }
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-API-Version': this.config.version,
      'User-Agent': 'iTone-Karaoke/1.0',
      'X-Request-Source': 'iTone-Frontend'
    };
  }

  private getProxyHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'X-API-Version': this.config.version,
      'X-Request-Source': 'iTone-Frontend'
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(request: GensparkRequest): string {
    const keyData = {
      type: request.type,
      userId: request.userId,
      data: JSON.stringify(request.data)
    };
    return btoa(JSON.stringify(keyData)).substr(0, 32);
  }

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private handleError(error: any, requestId: string): GensparkResponse {
    const gensparkError: GensparkError = {
      code: error.name === 'AbortError' ? 'TIMEOUT' : 'REQUEST_FAILED',
      message: error.message || 'Unknown error occurred',
      details: error.stack,
      retryable: error.name !== 'AbortError',
      timestamp: new Date().toISOString()
    };

    console.error('Genspark API Error:', gensparkError);

    return {
      success: false,
      data: null,
      confidence: 0,
      error: gensparkError.message,
      metadata: {
        processingTime: 0,
        modelUsed: 'error',
        requestId
      }
    };
  }

  // Utility methods for data preparation
  prepareUserContext(user: any, userSongs: any[], recordings: any[]): GensparkContext {
    return {
      userProfile: {
        id: user.id,
        preferences: {
          subscriptionTier: user.subscriptionTier || 'free',
          language: user.language || 'en',
          country: user.country || 'US'
        },
        history: [
          ...userSongs.map(s => ({ type: 'saved_song', data: s, timestamp: s.created_at })),
          ...recordings.map(r => ({ type: 'recording', data: r, timestamp: r.created_at }))
        ],
        subscriptionTier: user.subscriptionTier || 'free'
      }
    };
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Request cancellation
  cancelRequest(requestId: string): boolean {
    const controller = this.requestQueue.get(requestId);
    if (controller) {
      controller.abort();
      this.requestQueue.delete(requestId);
      return true;
    }
    return false;
  }

  cancelAllRequests(): void {
    this.requestQueue.forEach(controller => controller.abort());
    this.requestQueue.clear();
  }

  // Mock response generation for demo mode
  private getMockResponse(request: GensparkRequest, requestId: string): GensparkResponse {
    const mockData = this.generateMockData(request);
    
    return {
      success: true,
      data: mockData,
      confidence: 0.85,
      reasoning: "This is a mock AI response for demonstration purposes. Real AI integration requires Genspark API configuration.",
      suggestions: ["Try different song genres for variety", "Explore collaborative features", "Check out premium audio effects"],
      metadata: {
        processingTime: 500 + Math.random() * 1000,
        modelUsed: 'mock-genspark-v1',
        requestId,
        cacheHit: false
      }
    };
  }

  private getMockStreamingResponse(request: GensparkRequest, onChunk: (chunk: GensparkStreamChunk) => void): Promise<void> {
    return new Promise((resolve) => {
      const mockContent = this.generateMockStreamingContent(request);
      const chunks = mockContent.split(' ');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          onChunk({
            id: `mock_${Date.now()}`,
            type: 'data',
            content: chunks.slice(0, index + 1).join(' '),
            timestamp: Date.now()
          });
          index++;
        } else {
          onChunk({
            id: `mock_${Date.now()}`,
            type: 'complete',
            content: 'Stream complete',
            timestamp: Date.now()
          });
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  private generateMockData(request: GensparkRequest): any {
    switch (request.type) {
      case 'recommendation':
        return {
          recommendations: {
            songs: [
              {
                title: "Don't Stop Believin'",
                artist: "Journey",
                confidence: 0.92,
                reasoning: "Perfect match for your vocal range and style preferences",
                difficulty: "medium",
                youtube_url: "https://www.youtube.com/watch?v=1k8craCGpgs"
              },
              {
                title: "Sweet Child O' Mine",
                artist: "Guns N' Roses",
                confidence: 0.87,
                reasoning: "Great for practicing rock vocals and building confidence",
                difficulty: "hard",
                youtube_url: "https://www.youtube.com/watch?v=1w7OgIMMRc4"
              },
              {
                title: "Imagine",
                artist: "John Lennon",
                confidence: 0.89,
                reasoning: "Classic song that matches your emotional expression style",
                difficulty: "easy",
                youtube_url: "https://www.youtube.com/watch?v=YkgkThdzX-8"
              }
            ]
          }
        };
      
      case 'analysis':
        return {
          analysis: {
            vocalScore: {
              overall: 78,
              pitch: 82,
              timing: 75,
              expression: 80,
              improvement: [
                "Focus on breath control during long notes",
                "Try warming up with scales before recording",
                "Great emotion - keep expressing yourself!"
              ]
            }
          }
        };
      
      case 'moderation':
        return {
          moderation: {
            approved: true,
            flagged: [],
            severity: "low",
            suggestions: ["Content looks great!", "Ready for upload"]
          }
        };
      
      case 'content_generation':
        return {
          content: {
            coaching: {
              feedback: "Your performance shows great potential! Focus on breath support and try to maintain consistent pitch throughout the song.",
              techniques: [
                "Practice diaphragmatic breathing",
                "Warm up with vocal scales",
                "Record yourself to identify areas for improvement"
              ]
            }
          }
        };
      
      default:
        return { message: "Mock response for " + request.type };
    }
  }

  private generateMockStreamingContent(request: GensparkRequest): string {
    switch (request.type) {
      case 'content_generation':
        return "Based on your vocal analysis, I recommend focusing on breath control and pitch accuracy. Your performance shows great emotional expression, which is excellent for karaoke. Try practicing with songs in your comfortable range first, then gradually challenge yourself with more difficult pieces.";
      default:
        return "AI analysis complete. Great job on your performance!";
    }
  }
}

export const gensparkService = new GensparkService();