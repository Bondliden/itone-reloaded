import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, Volume2, Music2, Target } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

interface VoiceAnalyzerProps {
  stream?: MediaStream;
  targetPitch?: number;
  className?: string;
  onAnalysis?: (analysis: VoiceAnalysis) => void;
}

interface VoiceAnalysis {
  pitch: number;
  volume: number;
  stability: number;
  inTune: boolean;
  confidence: number;
}

export function VoiceAnalyzer({ stream, targetPitch, className, onAnalysis }: VoiceAnalyzerProps) {
  const [analysis, setAnalysis] = useState<VoiceAnalysis>({
    pitch: 0,
    volume: 0,
    stability: 0,
    inTune: false,
    confidence: 0
  });

  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const animationRef = useRef<number>();
  const pitchHistoryRef = useRef<number[]>([]);

<<<<<<< HEAD
  const detectPitch = (frequencyData: Float32Array, sampleRate: number): number => {
    // Simplified pitch detection using peak frequency
    let maxIndex = 0;
    let maxValue = -Infinity;

    // Focus on vocal range (80Hz - 1000Hz)
    const minIndex = Math.floor((80 / sampleRate) * frequencyData.length * 2);
    const maxIndexRange = Math.floor((1000 / sampleRate) * frequencyData.length * 2);

    for (let i = minIndex; i < Math.min(maxIndexRange, frequencyData.length); i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }

    const frequency = (maxIndex * sampleRate) / (frequencyData.length * 2);

    // Convert frequency to cents (relative to A4 = 440Hz)
    if (frequency > 0) {
      return 1200 * Math.log2(frequency / 440);
    }

    return 0;
  };

  const calculateStability = (pitchHistory: number[]): number => {
    if (pitchHistory.length < 2) return 0;

    let variance = 0;
    const mean = pitchHistory.reduce((sum, pitch) => sum + pitch, 0) / pitchHistory.length;

    for (const pitch of pitchHistory) {
      variance += Math.pow(pitch - mean, 2);
    }

    variance /= pitchHistory.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to stability percentage (lower deviation = higher stability)
    return Math.max(0, 100 - (standardDeviation / 10));
  };

  const startAnalysis = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const analyze = () => {
      analyser.getFloatFrequencyData(dataArray);

      // Calculate volume (RMS)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = Math.pow(10, dataArray[i] / 20); // Convert dB to linear
        sum += value * value;
      }
      const volume = Math.sqrt(sum / dataArray.length) * 100;

      // Simple pitch detection using autocorrelation
      const pitch = detectPitch(dataArray, audioContext.sampleRate);

      // Update pitch history for stability calculation
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > 10) {
        pitchHistoryRef.current.shift();
      }

      // Calculate pitch stability
      const stability = calculateStability(pitchHistoryRef.current);

      // Check if in tune (within 50 cents of target)
      const inTune = targetPitch ? Math.abs(pitch - targetPitch) < 50 : false;

      // Calculate confidence based on volume and stability
      const confidence = Math.min(100, (volume / 50) * (stability / 100) * 100);

      const newAnalysis = {
        pitch,
        volume: Math.min(100, volume),
        stability,
        inTune,
        confidence
      };

      setAnalysis(newAnalysis);
      onAnalysis?.(newAnalysis);

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

=======
>>>>>>> origin/main
  useEffect(() => {
    if (!stream) return;

    const setupAnalysis = async () => {
<<<<<<< HEAD
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
=======
>>>>>>> origin/main
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      startAnalysis();
    };

    setupAnalysis();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
<<<<<<< HEAD
  }, [stream, startAnalysis]);

  const getPitchIndicatorColor = () => {
    if (!targetPitch) return 'bg-blue-500';

=======
  }, [stream]);

  const startAnalysis = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const analyze = () => {
      analyser.getFloatFrequencyData(dataArray);

      // Calculate volume (RMS)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = Math.pow(10, dataArray[i] / 20); // Convert dB to linear
        sum += value * value;
      }
      const volume = Math.sqrt(sum / dataArray.length) * 100;

      // Simple pitch detection using autocorrelation
      const pitch = detectPitch(dataArray, audioContext.sampleRate);
      
      // Update pitch history for stability calculation
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > 10) {
        pitchHistoryRef.current.shift();
      }

      // Calculate pitch stability
      const stability = calculateStability(pitchHistoryRef.current);
      
      // Check if in tune (within 50 cents of target)
      const inTune = targetPitch ? Math.abs(pitch - targetPitch) < 50 : false;
      
      // Calculate confidence based on volume and stability
      const confidence = Math.min(100, (volume / 50) * (stability / 100) * 100);

      const newAnalysis = {
        pitch,
        volume: Math.min(100, volume),
        stability,
        inTune,
        confidence
      };

      setAnalysis(newAnalysis);
      onAnalysis?.(newAnalysis);

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const detectPitch = (frequencyData: Float32Array, sampleRate: number): number => {
    // Simplified pitch detection using peak frequency
    let maxIndex = 0;
    let maxValue = -Infinity;

    // Focus on vocal range (80Hz - 1000Hz)
    const minIndex = Math.floor((80 / sampleRate) * frequencyData.length * 2);
    const maxIndexRange = Math.floor((1000 / sampleRate) * frequencyData.length * 2);

    for (let i = minIndex; i < Math.min(maxIndexRange, frequencyData.length); i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }

    const frequency = (maxIndex * sampleRate) / (frequencyData.length * 2);
    
    // Convert frequency to cents (relative to A4 = 440Hz)
    if (frequency > 0) {
      return 1200 * Math.log2(frequency / 440);
    }
    
    return 0;
  };

  const calculateStability = (pitchHistory: number[]): number => {
    if (pitchHistory.length < 2) return 0;

    let variance = 0;
    const mean = pitchHistory.reduce((sum, pitch) => sum + pitch, 0) / pitchHistory.length;

    for (const pitch of pitchHistory) {
      variance += Math.pow(pitch - mean, 2);
    }

    variance /= pitchHistory.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to stability percentage (lower deviation = higher stability)
    return Math.max(0, 100 - (standardDeviation / 10));
  };

  const getPitchIndicatorColor = () => {
    if (!targetPitch) return 'bg-blue-500';
    
>>>>>>> origin/main
    const difference = Math.abs(analysis.pitch - targetPitch);
    if (difference < 25) return 'bg-green-500';
    if (difference < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatPitch = (cents: number) => {
    if (cents === 0) return 'A4';
<<<<<<< HEAD

=======
    
>>>>>>> origin/main
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4Cents = 0; // A4 = 0 cents
    const totalCents = A4Cents + cents;
    const octave = Math.floor(totalCents / 1200) + 4;
    const noteIndex = Math.floor((totalCents % 1200) / 100);
<<<<<<< HEAD

=======
    
>>>>>>> origin/main
    return `${noteNames[noteIndex]}${octave}`;
  };

  return (
    <div className={cn(
      'bg-white/10 backdrop-blur-lg rounded-2xl p-6',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
          Voice Analysis
        </h3>
        <div className={cn(
          'w-3 h-3 rounded-full',
          analysis.volume > 10 ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
        )} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Volume Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center">
              <Volume2 className="h-4 w-4 mr-1" />
              Volume
            </span>
            <span className="text-sm text-white font-medium">
              {Math.round(analysis.volume)}%
            </span>
          </div>
<<<<<<< HEAD
          <Progress
            value={analysis.volume}
=======
          <Progress 
            value={analysis.volume} 
>>>>>>> origin/main
            className="h-2 bg-gray-700"
          />
        </div>

        {/* Pitch Stability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Stability
            </span>
            <span className="text-sm text-white font-medium">
              {Math.round(analysis.stability)}%
            </span>
          </div>
<<<<<<< HEAD
          <Progress
            value={analysis.stability}
=======
          <Progress 
            value={analysis.stability} 
>>>>>>> origin/main
            className="h-2 bg-gray-700"
          />
        </div>
      </div>

      {/* Pitch Display */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300 flex items-center">
            <Music2 className="h-4 w-4 mr-1" />
            Current Pitch
          </span>
          <span className={cn(
            'text-sm font-medium px-2 py-1 rounded-full',
            analysis.inTune ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'
          )}>
            {analysis.inTune ? 'In Tune' : 'Off Pitch'}
          </span>
        </div>
<<<<<<< HEAD

=======
        
>>>>>>> origin/main
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {formatPitch(analysis.pitch)}
          </div>
<<<<<<< HEAD

          {/* Pitch Indicator */}
          <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
=======
          
          {/* Pitch Indicator */}
          <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
>>>>>>> origin/main
              className={cn(
                'absolute top-0 h-full w-1 transition-all duration-200',
                getPitchIndicatorColor()
              )}
<<<<<<< HEAD
              style={{
                left: `${Math.max(0, Math.min(100, 50 + (analysis.pitch / 100)))}%`
              }}
            />
            {targetPitch && (
              <div
                className="absolute top-0 h-full w-0.5 bg-white"
                style={{
                  left: `${Math.max(0, Math.min(100, 50 + (targetPitch / 100)))}%`
=======
              style={{ 
                left: `${Math.max(0, Math.min(100, 50 + (analysis.pitch / 100)))}%` 
              }}
            />
            {targetPitch && (
              <div 
                className="absolute top-0 h-full w-0.5 bg-white"
                style={{ 
                  left: `${Math.max(0, Math.min(100, 50 + (targetPitch / 100)))}%` 
>>>>>>> origin/main
                }}
              />
            )}
          </div>
<<<<<<< HEAD

=======
          
>>>>>>> origin/main
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Low</span>
            <span>Target</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-black/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Performance Score</span>
          <span className="text-lg font-bold text-white">
            {Math.round(analysis.confidence)}/100
          </span>
        </div>
<<<<<<< HEAD
        <Progress
          value={analysis.confidence}
=======
        <Progress 
          value={analysis.confidence} 
>>>>>>> origin/main
          className="h-3 bg-gray-700"
        />
        <p className="text-xs text-gray-400 mt-2">
          Based on pitch accuracy, volume consistency, and vocal stability
        </p>
      </div>
    </div>
  );
}