/**
 * Audio utility functions for karaoke application
 */

export interface AudioAnalysis {
  pitch: number;
  volume: number;
  frequency: number;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async initialize(stream: MediaStream): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaStreamSource(stream);
    
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.source.connect(this.analyser);
  }

  getAudioAnalysis(): AudioAnalysis {
    if (!this.analyser || !this.dataArray) {
      return { pitch: 0, volume: 0, frequency: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length) / 255;

    // Find dominant frequency (simplified pitch detection)
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }

    const frequency = (maxIndex * this.audioContext!.sampleRate) / (this.analyser.fftSize * 2);
    const pitch = this.frequencyToPitch(frequency);

    return { pitch, volume, frequency };
  }

  private frequencyToPitch(frequency: number): number {
    // Convert frequency to MIDI note number
    if (frequency <= 0) return 0;
    return 12 * Math.log2(frequency / 440) + 69;
  }

  cleanup(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function semitoneToFrequencyRatio(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

export function createAudioBuffer(audioContext: AudioContext, duration: number): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  return audioContext.createBuffer(1, frameCount, sampleRate);
}

export function applyFadeIn(audioBuffer: AudioBuffer, fadeTime: number): void {
  const sampleRate = audioBuffer.sampleRate;
  const fadeSamples = Math.floor(fadeTime * sampleRate);
  
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < fadeSamples && i < channelData.length; i++) {
      channelData[i] *= i / fadeSamples;
    }
  }
}

export function applyFadeOut(audioBuffer: AudioBuffer, fadeTime: number): void {
  const sampleRate = audioBuffer.sampleRate;
  const fadeSamples = Math.floor(fadeTime * sampleRate);
  const startSample = audioBuffer.length - fadeSamples;
  
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < fadeSamples && startSample + i < channelData.length; i++) {
      channelData[startSample + i] *= (fadeSamples - i) / fadeSamples;
    }
  }
}

export class PitchShifter {
  private audioContext: AudioContext;
  private scriptProcessor: ScriptProcessorNode;
  private pitchRatio: number = 1.0;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    this.setupProcessor();
  }

  private setupProcessor(): void {
    this.scriptProcessor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const outputBuffer = event.outputBuffer;
      
      // Simple pitch shifting using time-domain approach
      // Note: This is a basic implementation. Professional pitch shifting
      // would use more sophisticated algorithms like PSOLA or phase vocoder
      
      const inputData = inputBuffer.getChannelData(0);
      const outputData = outputBuffer.getChannelData(0);
      
      for (let i = 0; i < outputData.length; i++) {
        const sourceIndex = Math.floor(i / this.pitchRatio);
        if (sourceIndex < inputData.length) {
          outputData[i] = inputData[sourceIndex];
        } else {
          outputData[i] = 0;
        }
      }
    };
  }

  setPitchRatio(ratio: number): void {
    this.pitchRatio = Math.max(0.5, Math.min(2.0, ratio));
  }

  setPitchSemitones(semitones: number): void {
    this.pitchRatio = semitoneToFrequencyRatio(semitones);
  }

  connect(destination: AudioNode): void {
    this.scriptProcessor.connect(destination);
  }

  disconnect(): void {
    this.scriptProcessor.disconnect();
  }

  getNode(): ScriptProcessorNode {
    return this.scriptProcessor;
  }
}