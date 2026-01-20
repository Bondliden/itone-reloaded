import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings, Repeat } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { LyricsDisplay } from './LyricsDisplay';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceAnalyzer } from './VoiceAnalyzer';
import { TransposeControl } from './TransposeControl';
import { cn } from '../lib/utils';

interface KaraokePlayerProps {
  song: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    youtube_url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lyrics?: any[];
  };
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  className?: string;
}

export function KaraokePlayer({ song, className }: KaraokePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [transpose, setTranspose] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream>();

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize user microphone for voice analysis
    const initMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setUserStream(stream);
      } catch (error) {
        console.error('Microphone access denied:', error);
      }
    };

    initMicrophone();

    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= song.duration) {
            if (repeat) {
              return 0;
            } else {
              setIsPlaying(false);
              return song.duration;
            }
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, song.duration, repeat]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(Math.max(0, Math.min(song.duration, newTime)));
  };

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    handleSeek(currentTime + 10);
  };

  const skipBackward = () => {
    handleSeek(currentTime - 10);
  };

  const openYouTube = () => {
    window.open(song.youtube_url, '_blank');
  };

  const mockLyrics = [
    { startTime: 0, endTime: 4000, text: "Is this the real life?" },
    { startTime: 4000, endTime: 8000, text: "Is this just fantasy?" },
    { startTime: 8000, endTime: 12000, text: "Caught in a landslide" },
    { startTime: 12000, endTime: 16000, text: "No escape from reality" },
    { startTime: 16000, endTime: 20000, text: "Open your eyes" },
    { startTime: 20000, endTime: 24000, text: "Look up to the skies and see" },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Song Info */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{song.title}</h2>
            <p className="text-gray-300 text-lg">{song.artist}</p>
          </div>
          <Button
            onClick={openYouTube}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            YouTube
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Player */}
        <div className="lg:col-span-2 space-y-4">
          {/* Audio Visualizer */}
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6">
            <AudioVisualizer
              stream={userStream}
              type="bars"
              color="#8b5cf6"
              height={120}
            />
          </div>

          {/* Lyrics Display */}
          <LyricsDisplay
            lyrics={song.lyrics || mockLyrics}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeSeek={handleSeek}
          />

          {/* Player Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(song.duration)}</span>
              </div>
              <div
                className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  handleSeek(percent * song.duration);
                }}
              >
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / song.duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={skipBackward}
                className="text-white hover:bg-white/10"
              >
                <SkipBack className="h-6 w-6" />
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

              <Button
                variant="ghost"
                size="lg"
                onClick={skipForward}
                className="text-white hover:bg-white/10"
              >
                <SkipForward className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setRepeat(!repeat)}
                className={cn(
                  'text-white hover:bg-white/10',
                  repeat && 'text-purple-400'
                )}
              >
                <Repeat className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/10"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-4 mt-6">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-12 text-right">
                {volume}%
              </span>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Voice Analyzer */}
          <VoiceAnalyzer
            stream={userStream}
            targetPitch={440 + (transpose * 100)} // Rough pitch target with transpose
          />

          {/* Transpose Control */}
          <TransposeControl
            transpose={transpose}
            onTransposeChange={setTranspose}
          />

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">Player Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Auto-repeat</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRepeat(!repeat)}
                    className={cn(
                      'text-white hover:bg-white/10',
                      repeat && 'text-purple-400'
                    )}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Show visualizer</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    On
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Voice feedback</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    On
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element for future audio playback */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          if (repeat) {
            setCurrentTime(0);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          } else {
            setIsPlaying(false);
          }
        }}
      />
    </div>
  );
}