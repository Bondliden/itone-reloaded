export interface AudioSettings {
  sampleRate: number;
  bitRate: number;
  channels: number;
  format: 'mp3' | 'wav' | 'ogg' | 'webm';
}

export interface AudioEffect {
  id: string;
  name: string;
  type: 'reverb' | 'echo' | 'chorus' | 'distortion' | 'compressor' | 'equalizer';
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface AudioTrack {
  id: string;
  name: string;
  userId: string;
  audioBlob: Blob;
  duration: number;
  volume: number;
  muted: boolean;
  effects: AudioEffect[];
  startTime: number; // Offset in milliseconds
}

export interface MixingSession {
  id: string;
  name: string;
  tracks: AudioTrack[];
  masterVolume: number;
  masterEffects: AudioEffect[];
  bpm?: number;
  key?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PitchDetectionResult {
  frequency: number;
  pitch: string; // Note name (e.g., "A4", "C#3")
  confidence: number; // 0-1
  cents: number; // Deviation from perfect pitch
}

export interface VocalAnalysis {
  pitch: PitchDetectionResult;
  volume: number;
  formants: number[]; // Vocal formant frequencies
  breathiness: number;
  vibrato: {
    rate: number; // Hz
    extent: number; // Cents
  };
}

export interface KaraokeScore {
  overall: number; // 0-100
  pitch: number; // 0-100
  timing: number; // 0-100
  volume: number; // 0-100
  expression: number; // 0-100
}

export interface LyricsLine {
  startTime: number; // Milliseconds
  endTime: number;
  text: string;
  words: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

export interface KaraokeTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  key: string;
  bpm: number;
  lyrics: LyricsLine[];
  instrumentalUrl: string;
  originalUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  genre: string;
  language: string;
}