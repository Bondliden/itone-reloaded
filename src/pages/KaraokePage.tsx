import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Play, Pause, Volume2, SkipForward } from 'lucide-react';
import { Button } from '../components/ui/button';

export function KaraokePage() {
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 355; // Mock duration

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative z-10 px-6 py-4 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Bohemian Rhapsody</h1>
            <p className="text-gray-300">Queen</p>
          </div>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative h-96 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <button 
              onClick={() => window.open('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', '_blank')}
              className="hover:scale-110 transition-transform duration-200"
            >
              <Play className="h-16 w-16 text-white" />
            </button>
          </div>
          <p className="text-white text-lg">Click to open YouTube video</p>
        </div>
      </div>

      {/* Lyrics Display */}
      <div className="bg-gradient-to-b from-purple-900/50 to-transparent px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-yellow-400 animate-pulse">
                Is this the real life?
              </div>
              <div className="text-2xl text-white/80">
                Is this just fantasy?
              </div>
              <div className="text-xl text-white/60">
                Caught in a landslide
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-6">
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <Volume2 className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={togglePlay}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-16 h-16"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>

            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}