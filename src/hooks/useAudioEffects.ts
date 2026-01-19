import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioEffectsConfig {
  autoTune: boolean;
  reverb: number; // 0-100
  echo: number; // 0-100
  pitch: number; // -12 to +12 semitones
  volume: number; // 0-100
}

export function useAudioEffects() {
  const [config, setConfig] = useState<AudioEffectsConfig>({
    autoTune: false,
    reverb: 0,
    echo: 0,
    pitch: 0,
    volume: 80
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const pitchShifterRef = useRef<ScriptProcessorNode | null>(null);

  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const createReverbImpulse = useCallback((audioContext: AudioContext, duration: number, decay: number) => {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = length - i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      }
    }

    return impulse;
  }, []);

  const applyEffects = useCallback(async (inputStream: MediaStream): Promise<MediaStream> => {
    const audioContext = await initializeAudioContext();
    
    // Create audio nodes
    const sourceNode = audioContext.createMediaStreamSource(inputStream);
    const gainNode = audioContext.createGain();
    const reverbNode = audioContext.createConvolver();
    const delayNode = audioContext.createDelay(1.0);
    const delayGainNode = audioContext.createGain();
    const outputNode = audioContext.createMediaStreamDestination();

    // Store references
    sourceNodeRef.current = sourceNode;
    gainNodeRef.current = gainNode;
    reverbNodeRef.current = reverbNode;
    delayNodeRef.current = delayNode;

    // Configure gain (volume)
    gainNode.gain.value = config.volume / 100;

    // Configure reverb
    if (config.reverb > 0) {
      const reverbImpulse = createReverbImpulse(audioContext, 2, 2);
      reverbNode.buffer = reverbImpulse;
      
      const reverbGainNode = audioContext.createGain();
      reverbGainNode.gain.value = config.reverb / 100;
      
      sourceNode.connect(reverbNode);
      reverbNode.connect(reverbGainNode);
      reverbGainNode.connect(outputNode);
    }

    // Configure echo/delay
    if (config.echo > 0) {
      delayNode.delayTime.value = 0.3; // 300ms delay
      delayGainNode.gain.value = config.echo / 100;
      
      sourceNode.connect(delayNode);
      delayNode.connect(delayGainNode);
      delayGainNode.connect(outputNode);
    }

    // Connect main audio path
    sourceNode.connect(gainNode);
    gainNode.connect(outputNode);

    return outputNode.stream;
  }, [config, initializeAudioContext, createReverbImpulse]);

  const updateConfig = useCallback((newConfig: Partial<AudioEffectsConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, volume }));
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, []);

  const updateReverb = useCallback((reverb: number) => {
    setConfig(prev => ({ ...prev, reverb }));
    // Reverb changes require reconnecting the audio graph
  }, []);

  const updateEcho = useCallback((echo: number) => {
    setConfig(prev => ({ ...prev, echo }));
    // Echo changes require reconnecting the audio graph
  }, []);

  const updatePitch = useCallback((pitch: number) => {
    setConfig(prev => ({ ...prev, pitch }));
    // Pitch shifting is complex and would require additional libraries
    // For now, this is a placeholder for future implementation
  }, []);

  const toggleAutoTune = useCallback(() => {
    setConfig(prev => ({ ...prev, autoTune: !prev.autoTune }));
    // Auto-tune implementation would require pitch detection and correction
  }, []);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    sourceNodeRef.current = null;
    gainNodeRef.current = null;
    reverbNodeRef.current = null;
    delayNodeRef.current = null;
    pitchShifterRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    config,
    updateConfig,
    updateVolume,
    updateReverb,
    updateEcho,
    updatePitch,
    toggleAutoTune,
    applyEffects,
    cleanup
  };
}