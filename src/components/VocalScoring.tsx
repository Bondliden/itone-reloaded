import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Volume2, Music2, Star } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

interface VocalScoringProps {
  stream?: MediaStream;
  targetPitch?: number;
  isRecording?: boolean;
  onScoreUpdate?: (score: VocalScore) => void;
  className?: string;
}

interface VocalScore {
  overall: number;
  pitch: number;
  timing: number;
  volume: number;
  expression: number;
  stability: number;
}

interface PitchData {
  frequency: number;
  note: string;
  cents: number;
  confidence: number;
}

export function VocalScoring({ stream, targetPitch, isRecording, onScoreUpdate, className }: VocalScoringProps) {
  const [currentScore, setCurrentScore] = useState<VocalScore>({
    overall: 0,
    pitch: 0,
    timing: 0,
    volume: 0,
    expression: 0,
    stability: 0
  });

  const [pitchHistory, setPitchHistory] = useState<number[]>([]);
  const [volumeHistory, setVolumeHistory] = useState<number[]>([]);
  const [currentPitch, setCurrentPitch] = useState<PitchData>({
    frequency: 0,
    note: 'A4',
    cents: 0,
    confidence: 0
  });

  useEffect(() => {
    if (!stream || !isRecording) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    const analyze = () => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatFrequencyData(dataArray);

      // Calculate volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = Math.pow(10, dataArray[i] / 20);
        sum += value * value;
      }
      const volume = Math.sqrt(sum / dataArray.length) * 100;

      // Detect pitch
      const pitch = detectPitch(dataArray, audioContext.sampleRate);
      const pitchData = frequencyToPitchData(pitch);

      // Update histories
      setPitchHistory(prev => [...prev.slice(-19), pitch]); // Keep last 20 values
      setVolumeHistory(prev => [...prev.slice(-19), volume]);
      setCurrentPitch(pitchData);

      // Calculate scores
      const scores = calculateScores(pitch, volume, pitchHistory, volumeHistory, targetPitch);
      setCurrentScore(scores);
      onScoreUpdate?.(scores);
    };

    const interval = setInterval(analyze, 100); // Analyze every 100ms

    return () => {
      clearInterval(interval);
      audioContext.close();
    };
  }, [stream, isRecording, targetPitch, onScoreUpdate]);

  const detectPitch = (frequencyData: Float32Array, sampleRate: number): number => {
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

    return (maxIndex * sampleRate) / (frequencyData.length * 2);
  };

  const frequencyToPitchData = (frequency: number): PitchData => {
    if (frequency <= 0) {
      return { frequency: 0, note: 'A4', cents: 0, confidence: 0 };
    }

    const A4 = 440;
    const cents = 1200 * Math.log2(frequency / A4);
    const noteNumber = Math.round(cents / 100);
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor((noteNumber + 9) / 12) + 4;
    const noteIndex = ((noteNumber % 12) + 12) % 12;
    const note = `${noteNames[noteIndex]}${octave}`;

    return {
      frequency,
      note,
      cents: cents - (noteNumber * 100),
      confidence: Math.min(100, Math.max(0, (frequency / 1000) * 100))
    };
  };

  const calculateScores = (
    pitch: number, 
    volume: number, 
    pitchHist: number[], 
    volumeHist: number[], 
    target?: number
  ): VocalScore => {
    // Pitch accuracy (0-100)
    let pitchScore = 50;
    if (target && pitch > 0) {
      const difference = Math.abs(pitch - target);
      pitchScore = Math.max(0, 100 - (difference / 50) * 100);
    }

    // Volume consistency (0-100)
    const avgVolume = volumeHist.reduce((sum, v) => sum + v, 0) / volumeHist.length || 0;
    const volumeScore = Math.min(100, Math.max(0, avgVolume));

    // Pitch stability (0-100)
    let stabilityScore = 50;
    if (pitchHist.length > 5) {
      const variance = pitchHist.reduce((sum, p) => {
        const avg = pitchHist.reduce((s, v) => s + v, 0) / pitchHist.length;
        return sum + Math.pow(p - avg, 2);
      }, 0) / pitchHist.length;
      const standardDeviation = Math.sqrt(variance);
      stabilityScore = Math.max(0, 100 - (standardDeviation / 10));
    }

    // Expression (based on volume variation)
    let expressionScore = 50;
    if (volumeHist.length > 5) {
      const volumeVariation = Math.max(...volumeHist) - Math.min(...volumeHist);
      expressionScore = Math.min(100, volumeVariation * 2);
    }

    // Timing score (placeholder - would need lyrics timing data)
    const timingScore = 75;

    // Overall score (weighted average)
    const overall = (
      pitchScore * 0.3 +
      timingScore * 0.25 +
      volumeScore * 0.2 +
      stabilityScore * 0.15 +
      expressionScore * 0.1
    );

    return {
      overall: Math.round(overall),
      pitch: Math.round(pitchScore),
      timing: Math.round(timingScore),
      volume: Math.round(volumeScore),
      expression: Math.round(expressionScore),
      stability: Math.round(stabilityScore)
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-400" />
          Vocal Performance Score
        </h3>
        <div className={`text-3xl font-bold ${getScoreColor(currentScore.overall)}`}>
          {currentScore.overall}/100
        </div>
      </div>

      {/* Overall Grade */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getScoreColor(currentScore.overall)} mb-2`}>
          {getScoreGrade(currentScore.overall)}
        </div>
        <p className="text-gray-300">Current Performance Grade</p>
      </div>

      {/* Detailed Scores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Pitch Accuracy</span>
          </div>
          <div className="flex items-center space-x-3">
            <Progress value={currentScore.pitch} className="w-20 h-2" />
            <span className={`text-sm font-medium w-8 ${getScoreColor(currentScore.pitch)}`}>
              {currentScore.pitch}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music2 className="h-4 w-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Timing</span>
          </div>
          <div className="flex items-center space-x-3">
            <Progress value={currentScore.timing} className="w-20 h-2" />
            <span className={`text-sm font-medium w-8 ${getScoreColor(currentScore.timing)}`}>
              {currentScore.timing}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-green-400" />
            <span className="text-gray-300 text-sm">Volume Control</span>
          </div>
          <div className="flex items-center space-x-3">
            <Progress value={currentScore.volume} className="w-20 h-2" />
            <span className={`text-sm font-medium w-8 ${getScoreColor(currentScore.volume)}`}>
              {currentScore.volume}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span className="text-gray-300 text-sm">Stability</span>
          </div>
          <div className="flex items-center space-x-3">
            <Progress value={currentScore.stability} className="w-20 h-2" />
            <span className={`text-sm font-medium w-8 ${getScoreColor(currentScore.stability)}`}>
              {currentScore.stability}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-pink-400" />
            <span className="text-gray-300 text-sm">Expression</span>
          </div>
          <div className="flex items-center space-x-3">
            <Progress value={currentScore.expression} className="w-20 h-2" />
            <span className={`text-sm font-medium w-8 ${getScoreColor(currentScore.expression)}`}>
              {currentScore.expression}
            </span>
          </div>
        </div>
      </div>

      {/* Current Pitch Display */}
      <div className="mt-6 bg-black/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm">Current Note</span>
          <span className="text-white font-mono text-lg">
            {currentPitch.note}
          </span>
        </div>
        
        {/* Pitch Accuracy Indicator */}
        <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              'absolute top-0 h-full w-1 transition-all duration-200',
              currentScore.pitch >= 80 ? 'bg-green-500' :
              currentScore.pitch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ 
              left: `${Math.max(0, Math.min(100, 50 + (currentPitch.cents / 50) * 25))}%` 
            }}
          />
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white opacity-50" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Flat</span>
          <span>Perfect</span>
          <span>Sharp</span>
        </div>
      </div>

      {/* Performance Tips */}
      {isRecording && (
        <div className="mt-4 bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
          <h4 className="text-blue-400 font-medium text-sm mb-2">Performance Tips</h4>
          <div className="text-xs text-gray-300 space-y-1">
            {currentScore.pitch < 70 && (
              <p>• Try to match the target pitch more closely</p>
            )}
            {currentScore.volume < 60 && (
              <p>• Sing with more consistent volume</p>
            )}
            {currentScore.stability < 70 && (
              <p>• Focus on steady, controlled breathing</p>
            )}
            {currentScore.expression < 60 && (
              <p>• Add more dynamic expression to your performance</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}