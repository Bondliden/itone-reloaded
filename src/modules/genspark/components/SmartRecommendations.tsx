import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Clock, TrendingUp, Users, Music2, Star, Play, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAIRecommendations } from '../hooks/useAIRecommendations';
import { useAuth } from '../../auth';
import { cn } from '../../../lib/utils';
import { toast } from '../../../components/ui/toast';

interface SmartRecommendationsProps {
  className?: string;
  onSongSelect?: (song: any) => void;
  maxResults?: number;
}

export function SmartRecommendations({ 
  className, 
  onSongSelect, 
  maxResults = 6 
}: SmartRecommendationsProps) {
  const { state: authState } = useAuth();
  const {
    songRecommendations,
    loading,
    error,
    getSongRecommendations,
    getContextualRecommendations,
    lastUpdate
  } = useAIRecommendations();

  const [selectedMood, setSelectedMood] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const moods = [
    { id: 'energetic', name: 'Energetic', emoji: '⚡', color: 'from-yellow-600/20 to-orange-600/20 border-yellow-400/30' },
    { id: 'relaxed', name: 'Relaxed', emoji: '🌙', color: 'from-blue-600/20 to-purple-600/20 border-blue-400/30' },
    { id: 'romantic', name: 'Romantic', emoji: '💕', color: 'from-pink-600/20 to-red-600/20 border-pink-400/30' },
    { id: 'nostalgic', name: 'Nostalgic', emoji: '📻', color: 'from-amber-600/20 to-yellow-600/20 border-amber-400/30' },
    { id: 'powerful', name: 'Powerful', emoji: '🔥', color: 'from-red-600/20 to-orange-600/20 border-red-400/30' },
    { id: 'chill', name: 'Chill', emoji: '😌', color: 'from-teal-600/20 to-cyan-600/20 border-teal-400/30' }
  ];

  // Auto-refresh recommendations every 10 minutes
  useEffect(() => {
    if (!autoRefresh || !authState.isAuthenticated) return;

    const interval = setInterval(() => {
      getContextualRecommendations();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, authState.isAuthenticated, getContextualRecommendations]);

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    await getSongRecommendations({ mood: moodId });
    
    const mood = moods.find(m => m.id === moodId);
    toast({
      title: `${mood?.emoji} ${mood?.name} Songs`,
      description: "Getting AI recommendations for your mood...",
    });
  };

  const handleRefresh = async () => {
    if (selectedMood) {
      await getSongRecommendations({ mood: selectedMood });
    } else {
      await getContextualRecommendations();
    }
  };

  const handleSongSelect = (song: any) => {
    onSongSelect?.(song);
    toast({
      title: "AI Recommendation Applied",
      description: `${song.title} by ${song.artist} added to your session`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-600/30';
      case 'medium': return 'text-yellow-400 bg-yellow-600/30';
      case 'hard': return 'text-red-400 bg-red-600/30';
      default: return 'text-gray-400 bg-gray-600/30';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}% match`;
  };

  return (
    <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            {loading && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Song Recommendations</h3>
            <p className="text-gray-300 text-sm">
              Powered by Genspark • {songRecommendations.length} suggestions
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'text-white hover:bg-white/10',
              autoRefresh && 'bg-green-600/30 text-green-400'
            )}
          >
            <Clock className="h-4 w-4 mr-1" />
            Auto
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className={cn('h-4 w-4 mr-1', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">How are you feeling?</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              disabled={loading}
              className={cn(
                'p-3 rounded-lg text-center transition-all duration-200 border',
                selectedMood === mood.id 
                  ? `bg-gradient-to-r ${mood.color}` 
                  : 'bg-black/30 border-gray-600 hover:border-gray-500 hover:bg-black/40'
              )}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-white text-xs font-medium">{mood.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {songRecommendations.length > 0 ? (
        <div className="grid gap-4">
          {songRecommendations.slice(0, maxResults).map((song, index) => (
            <div
              key={`${song.title}-${index}`}
              className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-400/30 rounded-lg p-4 hover:bg-purple-600/20 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="text-white font-medium">{song.title}</h5>
                    <Badge className={getDifficultyColor(song.difficulty)}>
                      {song.difficulty}
                    </Badge>
                    {index < 3 && (
                      <Badge className="bg-yellow-600/30 text-yellow-400">
                        <Star className="h-3 w-3 mr-1" />
                        Top Pick
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{song.artist}</p>
                  <p className="text-gray-400 text-xs mt-1 italic">{song.reasoning}</p>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-blue-400" />
                      <span className="text-blue-400 text-xs">{formatConfidence(song.confidence)}</span>
                    </div>
                    {selectedMood && (
                      <div className="flex items-center space-x-1">
                        <span className="text-purple-400 text-xs">
                          {moods.find(m => m.id === selectedMood)?.emoji} Mood Match
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {song.youtube_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(song.youtube_url, '_blank')}
                      className="text-white hover:bg-white/10"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleSongSelect(song)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Song
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-white font-medium mb-2">No AI Recommendations Yet</h4>
          <p className="text-gray-400 text-sm mb-4">
            Record some songs or save favorites to get personalized AI recommendations
          </p>
          <Button
            onClick={getContextualRecommendations}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Get Smart Suggestions
          </Button>
        </div>
      )}

      {/* AI Insights */}
      {lastUpdate && (
        <div className="mt-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400 flex items-center">
              <Users className="h-3 w-3 mr-1" />
              AI Analysis Complete
            </span>
            <span className="text-gray-400">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-gray-300 text-xs mt-1">
            Recommendations based on your vocal range, preferences, and current trends
          </p>
        </div>
      )}
    </div>
  );
}

export default SmartRecommendations;