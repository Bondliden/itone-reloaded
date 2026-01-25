<<<<<<< HEAD
import { useMemo } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> origin/main
import { Music, Play, Pause } from 'lucide-react';
import { cn } from '../lib/utils';

interface LyricsLine {
  startTime: number;
  endTime: number;
  text: string;
  words?: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

interface LyricsDisplayProps {
  lyrics: LyricsLine[];
  currentTime: number;
  isPlaying: boolean;
  className?: string;
  onTimeSeek?: (time: number) => void;
}

<<<<<<< HEAD
export function LyricsDisplay({
  lyrics,
  currentTime,
  isPlaying,
  className,
  onTimeSeek
}: LyricsDisplayProps) {
  // Derive current and next line indices from currentTime instead of using state
  const { currentLineIndex, nextLineIndex } = useMemo(() => {
=======
export function LyricsDisplay({ 
  lyrics, 
  currentTime, 
  isPlaying, 
  className,
  onTimeSeek 
}: LyricsDisplayProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [nextLineIndex, setNextLineIndex] = useState(-1);

  useEffect(() => {
    // Find current and next lyrics lines
>>>>>>> origin/main
    let current = -1;
    let next = -1;

    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      if (currentTime >= line.startTime && currentTime <= line.endTime) {
        current = i;
        next = i + 1 < lyrics.length ? i + 1 : -1;
        break;
      } else if (currentTime < line.startTime) {
        next = i;
        break;
      }
    }

<<<<<<< HEAD
    return { currentLineIndex: current, nextLineIndex: next };
=======
    setCurrentLineIndex(current);
    setNextLineIndex(next);
>>>>>>> origin/main
  }, [currentTime, lyrics]);

  const handleLineClick = (line: LyricsLine) => {
    if (onTimeSeek) {
      onTimeSeek(line.startTime);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

<<<<<<< HEAD
  const getWordProgress = (word: { startTime: number; endTime: number; text: string }, currentTime: number) => {
=======
  const getWordProgress = (word: any, currentTime: number) => {
>>>>>>> origin/main
    if (currentTime < word.startTime) return 0;
    if (currentTime > word.endTime) return 100;
    return ((currentTime - word.startTime) / (word.endTime - word.startTime)) * 100;
  };

  if (lyrics.length === 0) {
    return (
      <div className={cn(
        'bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center min-h-[300px] flex items-center justify-center',
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
    <div className={cn(
      'bg-black/50 backdrop-blur-lg rounded-2xl p-6 min-h-[300px]',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Lyrics</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          {isPlaying ? (
            <Play className="h-4 w-4 text-green-400" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          <span>{formatTime(currentTime * 1000)}</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {lyrics.map((line, index) => {
          const isCurrent = index === currentLineIndex;
          const isNext = index === nextLineIndex;
          const isPast = currentTime > line.endTime;
          const isUpcoming = currentTime < line.startTime;

          return (
            <div
              key={index}
              onClick={() => handleLineClick(line)}
              className={cn(
                'p-4 rounded-lg transition-all duration-300 cursor-pointer',
                isCurrent && 'bg-purple-600/30 border-2 border-purple-400 scale-105',
                isNext && 'bg-blue-600/20 border border-blue-400/50',
                isPast && 'opacity-60',
                isUpcoming && 'opacity-40',
                !isCurrent && !isNext && 'hover:bg-white/10'
              )}
            >
              {line.words && line.words.length > 0 ? (
                // Word-by-word highlighting
                <div className="text-lg leading-relaxed">
                  {line.words.map((word, wordIndex) => {
                    const progress = isCurrent ? getWordProgress(word, currentTime) : 0;
                    const isWordActive = isCurrent && currentTime >= word.startTime && currentTime <= word.endTime;
<<<<<<< HEAD

=======
                    
>>>>>>> origin/main
                    return (
                      <span
                        key={wordIndex}
                        className={cn(
                          'relative inline-block mr-2 transition-all duration-200',
                          isWordActive && 'text-yellow-400 font-bold scale-110',
                          !isWordActive && isCurrent && 'text-white',
                          !isCurrent && 'text-gray-300'
                        )}
                        style={{
<<<<<<< HEAD
                          background: isWordActive
=======
                          background: isWordActive 
>>>>>>> origin/main
                            ? `linear-gradient(to right, rgba(251, 191, 36, 0.3) ${progress}%, transparent ${progress}%)`
                            : 'transparent'
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
                  'text-lg leading-relaxed transition-all duration-300',
                  isCurrent && 'text-yellow-400 font-bold text-xl',
                  isNext && 'text-white',
                  !isCurrent && !isNext && 'text-gray-300'
                )}>
                  {line.text}
                </div>
              )}
<<<<<<< HEAD

=======
              
>>>>>>> origin/main
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{formatTime(line.startTime)}</span>
                <span>{formatTime(line.endTime)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 bg-gray-700 rounded-full h-1">
<<<<<<< HEAD
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
          style={{
            width: lyrics.length > 0
              ? `${Math.min(100, (currentLineIndex + 1) / lyrics.length * 100)}%`
              : '0%'
=======
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
          style={{ 
            width: lyrics.length > 0 
              ? `${Math.min(100, (currentLineIndex + 1) / lyrics.length * 100)}%` 
              : '0%' 
>>>>>>> origin/main
          }}
        />
      </div>
    </div>
  );
}