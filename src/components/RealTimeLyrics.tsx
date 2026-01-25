import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '../lib/utils';

interface LyricsLine {
  startTime: number;
  endTime: number;
  text: string;
  words: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

interface RealTimeLyricsProps {
  lyrics: LyricsLine[];
  currentTime: number;
  isPlaying: boolean;
  onTimeSeek?: (time: number) => void;
  onPlayToggle?: () => void;
  className?: string;
}

export function RealTimeLyrics({ 
  lyrics, 
  currentTime, 
  isPlaying, 
  onTimeSeek, 
  onPlayToggle,
  className 
}: RealTimeLyricsProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [nextLineIndex, setNextLineIndex] = useState(-1);
  const [fontSize, setFontSize] = useState(18);
  const [showUpcoming, setShowUpcoming] = useState(true);

  useEffect(() => {
    // Find current and next lyrics lines
    let current = -1;
    let next = -1;

    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      const currentTimeMs = currentTime * 1000;
      
      if (currentTimeMs >= line.startTime && currentTimeMs <= line.endTime) {
        current = i;
        next = i + 1 < lyrics.length ? i + 1 : -1;
        break;
      } else if (currentTimeMs < line.startTime) {
        next = i;
        break;
      }
    }

    setCurrentLineIndex(current);
    setNextLineIndex(next);
  }, [currentTime, lyrics]);

  const handleLineClick = (line: LyricsLine) => {
    if (onTimeSeek) {
      onTimeSeek(line.startTime / 1000);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordProgress = (word: any, currentTimeMs: number) => {
    if (currentTimeMs < word.startTime) return 0;
    if (currentTimeMs > word.endTime) return 100;
    return ((currentTimeMs - word.startTime) / (word.endTime - word.startTime)) * 100;
  };

  const skipToLine = (direction: 'prev' | 'next') => {
    if (!onTimeSeek) return;
    
    if (direction === 'next' && nextLineIndex !== -1) {
      onTimeSeek(lyrics[nextLineIndex].startTime / 1000);
    } else if (direction === 'prev' && currentLineIndex > 0) {
      onTimeSeek(lyrics[currentLineIndex - 1].startTime / 1000);
    }
  };

  if (lyrics.length === 0) {
    return (
      <div className={cn(
        'bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center min-h-[400px] flex items-center justify-center',
        className
      )}>
        <div>
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Lyrics Available</h3>
          <p className="text-gray-400">
            Lyrics for this song are not available. Sing along with the music!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-black/50 backdrop-blur-lg rounded-2xl p-6', className)}>
      {/* Lyrics Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-white">Real-Time Lyrics</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipToLine('prev')}
              className="text-white hover:bg-white/10"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayToggle}
              className="text-white hover:bg-white/10"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipToLine('next')}
              className="text-white hover:bg-white/10"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Size:</span>
            <Slider
              value={[fontSize]}
              onValueChange={(values) => setFontSize(values[0])}
              min={14}
              max={28}
              step={2}
              className="w-20"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUpcoming(!showUpcoming)}
            className={cn(
              'text-white hover:bg-white/10',
              showUpcoming && 'bg-white/10'
            )}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="text-center mb-4">
        <div className="text-2xl font-mono text-purple-400">
          {formatTime(currentTime * 1000)}
        </div>
      </div>

      {/* Lyrics Display */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {lyrics.map((line, index) => {
          const isCurrent = index === currentLineIndex;
          const isNext = index === nextLineIndex;
          const isPast = currentTime * 1000 > line.endTime;
          const isUpcoming = currentTime * 1000 < line.startTime;

          // Only show current, next, and a few upcoming lines
          if (!showUpcoming && !isCurrent && !isNext && !isPast) {
            return null;
          }

          return (
            <div
              key={index}
              onClick={() => handleLineClick(line)}
              className={cn(
                'p-4 rounded-lg transition-all duration-300 cursor-pointer',
                isCurrent && 'bg-purple-600/30 border-2 border-purple-400 scale-105 shadow-lg shadow-purple-400/20',
                isNext && 'bg-blue-600/20 border border-blue-400/50',
                isPast && 'opacity-40',
                isUpcoming && 'opacity-60',
                !isCurrent && !isNext && 'hover:bg-white/10'
              )}
              style={{ fontSize: `${fontSize}px` }}
            >
              {line.words && line.words.length > 0 ? (
                // Word-by-word highlighting with karaoke-style animation
                <div className="leading-relaxed">
                  {line.words.map((word, wordIndex) => {
                    const currentTimeMs = currentTime * 1000;
                    const progress = isCurrent ? getWordProgress(word, currentTimeMs) : 0;
                    const isWordActive = isCurrent && currentTimeMs >= word.startTime && currentTimeMs <= word.endTime;
                    
                    return (
                      <span
                        key={wordIndex}
                        className={cn(
                          'relative inline-block mr-2 transition-all duration-200',
                          isWordActive && 'text-yellow-400 font-bold scale-110 drop-shadow-lg',
                          !isWordActive && isCurrent && 'text-white',
                          !isCurrent && 'text-gray-300'
                        )}
                        style={{
                          background: isWordActive 
                            ? `linear-gradient(to right, rgba(251, 191, 36, 0.4) ${progress}%, transparent ${progress}%)`
                            : 'transparent',
                          textShadow: isWordActive ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none'
                        }}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              ) : (
                // Line-by-line highlighting
                <div className={cn(
                  'leading-relaxed transition-all duration-300',
                  isCurrent && 'text-yellow-400 font-bold drop-shadow-lg',
                  isNext && 'text-white',
                  !isCurrent && !isNext && 'text-gray-300'
                )}>
                  {line.text}
                </div>
              )}
              
              {/* Timing indicators */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{formatTime(line.startTime)}</span>
                {isCurrent && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400">SINGING</span>
                  </div>
                )}
                <span>{formatTime(line.endTime)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
          <span>Progress</span>
          <span>{currentLineIndex + 1} / {lyrics.length} lines</span>
        </div>
        <div className="bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: lyrics.length > 0 
                ? `${Math.min(100, Math.max(0, (currentLineIndex + 1) / lyrics.length * 100))}%` 
                : '0%' 
            }}
          />
        </div>
      </div>

      {/* Karaoke Mode Toggle */}
      <div className="mt-4 flex items-center justify-center">
        <div className="bg-black/30 rounded-lg p-2 flex items-center space-x-2">
          <span className="text-gray-300 text-sm">Karaoke Mode:</span>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'text-xs',
              isPlaying ? 'text-green-400' : 'text-gray-400'
            )}
          >
            {isPlaying ? 'ACTIVE' : 'PAUSED'}
          </Button>
        </div>
      </div>
    </div>
  );
}