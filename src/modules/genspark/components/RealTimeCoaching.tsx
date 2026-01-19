import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Zap, Volume2, Music2, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { useRealTimeCoaching } from '../hooks/useAIRecommendations';
import { cn } from '../../../lib/utils';

interface RealTimeCoachingProps {
  audioMetrics?: {
    pitch: number;
    volume: number;
    stability: number;
    frequency: number;
  };
  isRecording?: boolean;
  className?: string;
}

export function RealTimeCoaching({ audioMetrics, isRecording, className }: RealTimeCoachingProps) {
  const {
    analyzeVocalPerformance,
    clearCoaching,
    coachingTips,
    currentAnalysis,
    loading
  } = useRealTimeCoaching();

  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [improvementTrend, setImprovementTrend] = useState<'improving' | 'stable' | 'declining'>('stable');

  // Analyze performance every 2 seconds during recording
  useEffect(() => {
    if (!isRecording || !audioMetrics) return;

    const now = Date.now();
    if (now - lastAnalysisTime > 2000) { // Every 2 seconds
      analyzeVocalPerformance({
        ...audioMetrics,
        timestamp: now
      });
      setLastAnalysisTime(now);
    }
  }, [audioMetrics, isRecording, lastAnalysisTime, analyzeVocalPerformance]);

  // Update session score and trend
  useEffect(() => {
    if (currentAnalysis) {
      setSessionScore(currentAnalysis.score);
      
      // Simple trend calculation
      const previousScore = sessionScore;
      if (currentAnalysis.score > previousScore + 5) {
        setImprovementTrend('improving');
      } else if (currentAnalysis.score < previousScore - 5) {
        setImprovementTrend('declining');
      } else {
        setImprovementTrend('stable');
      }
    }
  }, [currentAnalysis, sessionScore]);

  // Clear coaching when recording stops
  useEffect(() => {
    if (!isRecording) {
      const timer = setTimeout(() => {
        clearCoaching();
      }, 10000); // Clear after 10 seconds of not recording

      return () => clearTimeout(timer);
    }
  }, [isRecording, clearCoaching]);

  const getTrendIcon = () => {
    switch (improvementTrend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'declining': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Target className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTrendColor = () => {
    switch (improvementTrend) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-400' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  if (!isRecording && coachingTips.length === 0) {
    return (
      <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center', className)}>
        <Brain className="h-12 w-12 text-purple-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">AI Vocal Coach</h3>
        <p className="text-gray-400 text-sm">
          Start recording to get real-time AI coaching feedback
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-6 w-6 text-purple-400" />
            {isRecording && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Vocal Coach</h3>
            <p className="text-gray-300 text-sm">Real-time performance analysis</p>
          </div>
        </div>
        
        {isRecording && (
          <Badge className="bg-red-600/30 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-1"></div>
            ANALYZING
          </Badge>
        )}
      </div>

      {/* Current Performance Score */}
      {currentAnalysis && (
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-400 font-medium">Live Performance Score</span>
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={getTrendColor()}>
                {improvementTrend === 'improving' ? 'Improving!' : 
                 improvementTrend === 'declining' ? 'Focus needed' : 'Stable'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${getScoreGrade(sessionScore).color}`}>
                {getScoreGrade(sessionScore).grade}
              </div>
              <div className="text-white text-lg">{sessionScore}/100</div>
            </div>
            <div className="text-right">
              <Progress value={sessionScore} className="w-24 h-3 mb-1" />
              <p className="text-gray-400 text-xs">Live analysis</p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Coaching Tips */}
      {coachingTips.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            Live Coaching Tips
          </h4>
          
          {coachingTips.slice(-3).map((tip, index) => (
            <div
              key={index}
              className={cn(
                'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-lg p-3',
                'animate-in slide-in-from-right duration-300'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-yellow-200 text-sm">{tip}</p>
                  <span className="text-yellow-400 text-xs">AI Coach • Just now</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Analysis Feedback */}
      {currentAnalysis?.feedback && (
        <div className="mt-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-medium text-sm">AI Feedback</span>
          </div>
          <p className="text-green-200 text-sm">{currentAnalysis.feedback}</p>
        </div>
      )}

      {/* Performance Metrics */}
      {audioMetrics && isRecording && (
        <div className="mt-4 bg-black/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Live Metrics</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Volume2 className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{Math.round(audioMetrics.volume)}</div>
              <div className="text-xs text-gray-400">Volume</div>
            </div>
            <div className="text-center">
              <Music2 className="h-4 w-4 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{Math.round(audioMetrics.pitch)}</div>
              <div className="text-xs text-gray-400">Pitch</div>
            </div>
            <div className="text-center">
              <Target className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{Math.round(audioMetrics.stability)}</div>
              <div className="text-xs text-gray-400">Stability</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Processing Status */}
      {loading && (
        <div className="mt-4 bg-purple-600/20 border border-purple-400/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-purple-400 text-sm">AI analyzing your performance...</span>
          </div>
        </div>
      )}
    </div>
  );
}