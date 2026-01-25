import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { GensparkError } from '../types';

export class GensparkErrorHandler {
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'Genspark operation'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.warn(`${context} failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);

        if (attempt < maxRetries && this.isRetryableError(lastError)) {
          const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
          await this.sleep(delay);
          continue;
        }
        break;
      }
    }

    throw lastError;
  }

  isRetryableError(error: Error): boolean {
    // Network errors, timeouts, and 5xx server errors are retryable
    const retryablePatterns = [
      /network error/i,
      /timeout/i,
      /fetch.*failed/i,
      /5\d{2}/,
      /rate limit/i
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  formatError(error: any): GensparkError {
    return {
      code: error.code || error.name || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.stack || error.details,
      retryable: this.isRetryableError(error),
      timestamp: new Date().toISOString()
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const errorHandler = new GensparkErrorHandler();

// Error boundary specifically for Genspark components
export class GensparkErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Genspark component error:', error, errorInfo);
    
    // Report to error monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Genspark Error: ${error.message}`,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-red-400 font-medium mb-1">AI Service Error</h3>
          <p className="text-red-300 text-sm">Unable to load AI features</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utility functions for preparing data for Genspark
export function prepareUserData(user: any, songs: any[], recordings: any[]) {
  return {
    profile: {
      id: user.id,
      subscriptionTier: user.subscriptionTier || 'free',
      language: user.language || 'en',
      country: user.country || 'US',
      joinedAt: user.createdAt
    },
    activity: {
      totalRecordings: recordings.length,
      totalSongs: songs.length,
      genres: [...new Set(songs.map(s => s.song?.genre).filter(Boolean))],
      recentActivity: [
        ...recordings.slice(0, 5).map(r => ({
          type: 'recording',
          item: r.title,
          timestamp: r.created_at
        })),
        ...songs.slice(0, 5).map(s => ({
          type: 'saved_song',
          item: s.song.title,
          timestamp: s.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }
  };
}

export function preparePerformanceData(audioAnalysis: any, vocalScore: any) {
  return {
    metrics: {
      pitch: audioAnalysis?.pitch || [],
      volume: audioAnalysis?.volume || [],
      timing: audioAnalysis?.timing || [],
      stability: vocalScore?.stability || 0
    },
    scores: {
      overall: vocalScore?.overall || 0,
      pitch: vocalScore?.pitch || 0,
      timing: vocalScore?.timing || 0,
      expression: vocalScore?.expression || 0
    },
    metadata: {
      recordingDuration: audioAnalysis?.duration || 0,
      sampleRate: audioAnalysis?.sampleRate || 44100,
      channels: audioAnalysis?.channels || 1
    }
  };
}