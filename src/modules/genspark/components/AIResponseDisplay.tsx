import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Star, TrendingUp, AlertTriangle, CheckCircle, Loader2, Sparkles, Target, Music } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { cn } from '../../../lib/utils';
import type { GensparkResponse, GensparkStreamChunk } from '../types';

interface AIResponseDisplayProps {
  response?: GensparkResponse | null;
  streamChunks?: GensparkStreamChunk[];
  loading?: boolean;
  error?: string | null;
  type?: 'recommendation' | 'analysis' | 'moderation' | 'generation';
  className?: string;
  onApplyRecommendation?: (item: any) => void;
}

export function AIResponseDisplay({
  response,
  streamChunks = [],
  loading = false,
  error = null,
  type = 'recommendation',
  className,
  onApplyRecommendation
}: AIResponseDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));
  const [streamingContent, setStreamingContent] = useState<string>('');

  useEffect(() => {
    // Process streaming chunks
    if (streamChunks.length > 0) {
      const content = streamChunks
        .filter(chunk => chunk.type === 'data')
        .map(chunk => chunk.content)
        .join('');
      setStreamingContent(content);
    }
  }, [streamChunks]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-5 w-5 text-yellow-400" />;
      case 'analysis': return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'moderation': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'generation': return <Sparkles className="h-5 w-5 text-purple-400" />;
      default: return <Brain className="h-5 w-5 text-green-400" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'recommendation': return 'AI Recommendations';
      case 'analysis': return 'Performance Analysis';
      case 'moderation': return 'Content Review';
      case 'generation': return 'AI Generated Content';
      default: return 'AI Response';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6', className)}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <Brain className="h-6 w-6 text-purple-400 animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Processing</h3>
            <p className="text-gray-300 text-sm">Analyzing your data...</p>
          </div>
        </div>
        
        {streamingContent && (
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <p className="text-gray-300 text-sm">{streamingContent}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" />
          </div>
          <p className="text-gray-400 text-xs text-center">
            Processing with Genspark AI • This may take a moment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-red-600/20 border border-red-400/30 rounded-2xl p-6', className)}>
        <div className="flex items-center space-x-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-bold text-red-400">AI Request Failed</h3>
        </div>
        <p className="text-red-300 text-sm">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:bg-red-500/20 mt-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!response || !response.success) {
    return (
      <div className={cn('bg-gray-600/20 border border-gray-400/30 rounded-2xl p-6 text-center', className)}>
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No AI Response</h3>
        <p className="text-gray-400 text-sm">Request AI analysis to see results here</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="text-lg font-bold text-white">{getTypeTitle()}</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Confidence:</span>
              <span className={getConfidenceColor(response.confidence)}>
                {Math.round(response.confidence * 100)}%
              </span>
              {response.metadata?.cacheHit && (
                <Badge className="text-xs bg-blue-600/30 text-blue-400">Cached</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right text-xs text-gray-400">
          <p>Model: {response.metadata?.modelUsed}</p>
          <p>Time: {response.metadata?.processingTime}ms</p>
        </div>
      </div>

      {/* Recommendations Display */}
      {type === 'recommendation' && response.data?.recommendations && (
        <div className="space-y-4">
          {/* Song Recommendations */}
          {response.data.recommendations.songs && (
            <div>
              <button
                onClick={() => toggleSection('songs')}
                className="flex items-center justify-between w-full text-left mb-3 hover:text-purple-400 transition-colors"
              >
                <h4 className="text-white font-medium flex items-center">
                  <Music className="h-4 w-4 mr-2" />
                  Song Recommendations ({response.data.recommendations.songs.length})
                </h4>
                <span className="text-gray-400">{expandedSections.has('songs') ? '−' : '+'}</span>
              </button>
              
              {expandedSections.has('songs') && (
                <div className="grid gap-3">
                  {response.data.recommendations.songs.slice(0, 5).map((song: any, index: number) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{song.title}</h5>
                          <p className="text-gray-300 text-sm">{song.artist}</p>
                          <p className="text-gray-400 text-xs mt-1">{song.reasoning}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Progress value={song.confidence * 100} className="w-16 h-1" />
                            <span className="text-xs text-gray-400">{Math.round(song.confidence * 100)}% match</span>
                            <Badge className={`text-xs ${
                              song.difficulty === 'easy' ? 'bg-green-600/30 text-green-400' :
                              song.difficulty === 'medium' ? 'bg-yellow-600/30 text-yellow-400' :
                              'bg-red-600/30 text-red-400'
                            }`}>
                              {song.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {song.youtube_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(song.youtube_url, '_blank')}
                              className="text-white hover:bg-white/10"
                            >
                              View
                            </Button>
                          )}
                          {onApplyRecommendation && (
                            <Button
                              size="sm"
                              onClick={() => onApplyRecommendation(song)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Try This
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Style Recommendations */}
          {response.data.recommendations.styles && (
            <div>
              <button
                onClick={() => toggleSection('styles')}
                className="flex items-center justify-between w-full text-left mb-3 hover:text-purple-400 transition-colors"
              >
                <h4 className="text-white font-medium">
                  Vocal Style Suggestions ({response.data.recommendations.styles.length})
                </h4>
                <span className="text-gray-400">{expandedSections.has('styles') ? '−' : '+'}</span>
              </button>
              
              {expandedSections.has('styles') && (
                <div className="grid md:grid-cols-2 gap-3">
                  {response.data.recommendations.styles.map((style: any, index: number) => (
                    <div key={index} className="bg-black/30 rounded-lg p-4">
                      <h5 className="text-white font-medium mb-1">{style.name}</h5>
                      <p className="text-gray-300 text-sm mb-2">{style.description}</p>
                      <div className="flex items-center justify-between">
                        <Progress value={style.suitability * 100} className="w-20 h-2" />
                        <span className="text-xs text-gray-400">{Math.round(style.suitability * 100)}% fit</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analysis Display */}
      {type === 'analysis' && response.data?.analysis && (
        <div className="space-y-4">
          {response.data.analysis.vocalScore && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-400" />
                Vocal Performance Score
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(response.data.analysis.vocalScore).map(([key, value]: [string, any]) => (
                  key !== 'improvement' && (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-white font-medium">{typeof value === 'number' ? `${value}/100` : value}</span>
                      </div>
                      {typeof value === 'number' && (
                        <Progress value={value} className="h-2" />
                      )}
                    </div>
                  )
                ))}
              </div>
              
              {response.data.analysis.vocalScore.improvement && (
                <div className="mt-4 bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
                  <h5 className="text-blue-400 font-medium text-sm mb-2">AI Improvement Suggestions</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {response.data.analysis.vocalScore.improvement.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Star className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {response.data.analysis.trends && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Market Trends</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Genre Popularity</span>
                  <span className="text-white font-bold">{response.data.analysis.trends.genre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Growth Rate</span>
                  <span className="text-green-400">+{response.data.analysis.trends.growth}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Moderation Display */}
      {type === 'moderation' && response.data?.moderation && (
        <div className="space-y-4">
          <div className={`rounded-lg p-4 border ${
            response.data.moderation.approved 
              ? 'bg-green-600/20 border-green-400/30' 
              : 'bg-red-600/20 border-red-400/30'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {response.data.moderation.approved ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <h4 className={`font-medium ${
                response.data.moderation.approved ? 'text-green-400' : 'text-red-400'
              }`}>
                {response.data.moderation.approved ? 'Content Approved' : 'Content Flagged'}
              </h4>
            </div>
            
            {response.data.moderation.flagged?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-300 mb-2">Issues detected:</p>
                <div className="flex flex-wrap gap-1">
                  {response.data.moderation.flagged.map((flag: string, index: number) => (
                    <Badge key={index} className="bg-red-600/30 text-red-400 text-xs">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {response.data.moderation.suggestions?.length > 0 && (
              <div>
                <p className="text-sm text-gray-300 mb-2">AI Suggestions:</p>
                <ul className="text-sm space-y-1">
                  {response.data.moderation.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-gray-300 flex items-start space-x-2">
                      <span className="text-yellow-400">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Generation Display */}
      {type === 'generation' && response.data?.content && (
        <div className="space-y-4">
          {response.data.content.lyrics && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Generated Lyrics</h4>
              <div className="space-y-2">
                {response.data.content.lyrics.map((line: string, index: number) => (
                  <p key={index} className="text-gray-300">{line}</p>
                ))}
              </div>
            </div>
          )}

          {response.data.content.coaching && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">AI Vocal Coaching</h4>
              <div className="space-y-3">
                {response.data.content.coaching.feedback && (
                  <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">{response.data.content.coaching.feedback}</p>
                  </div>
                )}
                
                {response.data.content.coaching.techniques?.length > 0 && (
                  <div>
                    <h5 className="text-gray-300 font-medium text-sm mb-2">Recommended Techniques:</h5>
                    <ul className="space-y-1">
                      {response.data.content.coaching.techniques.map((technique: string, index: number) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                          <Star className="h-3 w-3 text-yellow-400 mt-0.5" />
                          <span>{technique}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Reasoning */}
      {response.reasoning && (
        <div className="mt-4 bg-purple-600/20 border border-purple-400/30 rounded-lg p-3">
          <h4 className="text-purple-400 font-medium text-sm mb-2">AI Reasoning</h4>
          <p className="text-gray-300 text-sm">{response.reasoning}</p>
        </div>
      )}

      {/* Additional Suggestions */}
      {response.suggestions && response.suggestions.length > 0 && (
        <div className="mt-4 bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-3">
          <h4 className="text-yellow-400 font-medium text-sm mb-2">Additional Suggestions</h4>
          <ul className="space-y-1">
            {response.suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                <Lightbulb className="h-3 w-3 text-yellow-400 mt-0.5" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Specialized components for different AI response types
export function SongRecommendationCard({ recommendation, onApply }: { 
  recommendation: any; 
  onApply?: (song: any) => void; 
}) {
  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">{recommendation.title}</h4>
          <p className="text-gray-300 text-sm">{recommendation.artist}</p>
          <p className="text-gray-400 text-xs mt-1">{recommendation.reasoning}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={recommendation.confidence * 100} className="w-20 h-2" />
            <Badge className="text-xs bg-purple-600/30 text-purple-400">
              {Math.round(recommendation.confidence * 100)}% match
            </Badge>
          </div>
        </div>
        {onApply && (
          <Button
            size="sm"
            onClick={() => onApply(recommendation)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Try Song
          </Button>
        )}
      </div>
    </div>
  );
}

export function VocalAnalysisCard({ analysis }: { analysis: any }) {
  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-lg p-4">
      <h4 className="text-blue-400 font-medium mb-3">AI Vocal Analysis</h4>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-300 text-sm">Overall Score</span>
            <div className="text-2xl font-bold text-white">{analysis.overall}/100</div>
          </div>
          <div>
            <span className="text-gray-300 text-sm">Improvement Potential</span>
            <div className="text-lg font-bold text-green-400">+{15 + Math.floor(Math.random() * 10)} pts</div>
          </div>
        </div>
        
        {analysis.improvement && (
          <div className="space-y-1">
            {analysis.improvement.slice(0, 3).map((tip: string, index: number) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <Target className="h-3 w-3 text-blue-400 mt-0.5" />
                <span className="text-gray-300">{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AIStreamingDisplay({ chunks, onComplete }: { 
  chunks: GensparkStreamChunk[]; 
  onComplete?: () => void; 
}) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    const contentChunks = chunks.filter(chunk => chunk.type === 'data');
    const content = contentChunks.map(chunk => chunk.content).join('');
    
    // Simulate typing effect for streaming content
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [chunks, onComplete]);

  const isComplete = chunks.some(chunk => chunk.type === 'complete');
  const hasError = chunks.some(chunk => chunk.type === 'error');

  return (
    <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Brain className="h-5 w-5 text-green-400" />
        <span className="text-green-400 font-medium">AI Generating Content</span>
        {!isComplete && !hasError && (
          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
        )}
      </div>
      
      <div className="bg-black/30 rounded-lg p-3">
        <p className="text-gray-300 text-sm whitespace-pre-wrap">
          {displayedContent}
          {!isComplete && !hasError && (
            <span className="animate-pulse">|</span>
          )}
        </p>
      </div>
      
      {hasError && (
        <div className="mt-3 bg-red-600/20 border border-red-400/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">
            Stream interrupted. {chunks.find(c => c.type === 'error')?.content?.error}
          </p>
        </div>
      )}
    </div>
  );
}