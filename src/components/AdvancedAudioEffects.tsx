import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, Volume2, Waves, Zap, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { cn } from '../lib/utils';

interface AudioEffectsProps {
  stream?: MediaStream;
  onEffectsChange?: (effects: AudioEffectsState) => void;
  className?: string;
}

interface AudioEffectsState {
  autoTune: {
    enabled: boolean;
    strength: number;
    key: string;
  };
  reverb: {
    enabled: boolean;
    roomSize: number;
    damping: number;
    wetLevel: number;
  };
  echo: {
    enabled: boolean;
    delay: number;
    feedback: number;
    wetLevel: number;
  };
  compressor: {
    enabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  equalizer: {
    enabled: boolean;
    bass: number;
    mid: number;
    treble: number;
  };
  masterVolume: number;
}

export function AdvancedAudioEffects({ stream, onEffectsChange, className }: AudioEffectsProps) {
  const [effects, setEffects] = useState<AudioEffectsState>({
    autoTune: {
      enabled: false,
      strength: 50,
      key: 'C'
    },
    reverb: {
      enabled: false,
      roomSize: 50,
      damping: 50,
      wetLevel: 30
    },
    echo: {
      enabled: false,
      delay: 300,
      feedback: 25,
      wetLevel: 20
    },
    compressor: {
      enabled: false,
      threshold: -20,
      ratio: 4,
      attack: 3,
      release: 100
    },
    equalizer: {
      enabled: false,
      bass: 0,
      mid: 0,
      treble: 0
    },
    masterVolume: 80
  });

  const [activeTab, setActiveTab] = useState<'autotune' | 'reverb' | 'echo' | 'compressor' | 'eq'>('autotune');

  useEffect(() => {
    onEffectsChange?.(effects);
  }, [effects, onEffectsChange]);

  const updateEffect = (category: keyof AudioEffectsState, property: string, value: any) => {
    setEffects(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value
      }
    }));
  };

  const resetAllEffects = () => {
    setEffects({
      autoTune: { enabled: false, strength: 50, key: 'C' },
      reverb: { enabled: false, roomSize: 50, damping: 50, wetLevel: 30 },
      echo: { enabled: false, delay: 300, feedback: 25, wetLevel: 20 },
      compressor: { enabled: false, threshold: -20, ratio: 4, attack: 3, release: 100 },
      equalizer: { enabled: false, bass: 0, mid: 0, treble: 0 },
      masterVolume: 80
    });
  };

  const presets = {
    'Studio Vocal': {
      autoTune: { enabled: true, strength: 30, key: 'C' },
      reverb: { enabled: true, roomSize: 40, damping: 60, wetLevel: 25 },
      compressor: { enabled: true, threshold: -18, ratio: 3, attack: 2, release: 80 },
      equalizer: { enabled: true, bass: 2, mid: 3, treble: 4 }
    },
    'Live Performance': {
      autoTune: { enabled: true, strength: 60, key: 'C' },
      reverb: { enabled: true, roomSize: 70, damping: 40, wetLevel: 40 },
      echo: { enabled: true, delay: 250, feedback: 20, wetLevel: 15 },
      compressor: { enabled: true, threshold: -16, ratio: 6, attack: 1, release: 60 }
    },
    'Intimate Acoustic': {
      reverb: { enabled: true, roomSize: 20, damping: 80, wetLevel: 15 },
      compressor: { enabled: true, threshold: -22, ratio: 2, attack: 5, release: 120 },
      equalizer: { enabled: true, bass: -1, mid: 2, treble: 1 }
    }
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setEffects(prev => ({
      ...prev,
      ...preset,
      echo: preset.echo || prev.echo,
      autoTune: preset.autoTune || prev.autoTune,
      equalizer: preset.equalizer || prev.equalizer
    }));
  };

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Sliders className="h-5 w-5 mr-2 text-purple-400" />
          Audio Effects Suite
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAllEffects}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Quick Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(presets).map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              onClick={() => applyPreset(preset as keyof typeof presets)}
              className="bg-black/30 text-white hover:bg-black/50 text-xs"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Master Volume */}
      <div className="mb-6 bg-black/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Master Volume
          </span>
          <span className="text-white text-sm">{effects.masterVolume}%</span>
        </div>
        <Slider
          value={[effects.masterVolume]}
          onValueChange={(values) => setEffects(prev => ({ ...prev, masterVolume: values[0] }))}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Effect Tabs */}
      <div className="mb-4">
        <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
          {[
            { id: 'autotune', label: 'Auto-Tune', icon: Zap },
            { id: 'reverb', label: 'Reverb', icon: Waves },
            { id: 'echo', label: 'Echo', icon: Volume2 },
            { id: 'compressor', label: 'Compress', icon: Sliders },
            { id: 'eq', label: 'EQ', icon: Music }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-xs font-medium transition-colors',
                activeTab === id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Effect Controls */}
      <div className="bg-black/30 rounded-xl p-4">
        {activeTab === 'autotune' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Auto-Tune</span>
              <Switch
                checked={effects.autoTune.enabled}
                onCheckedChange={(enabled) => updateEffect('autoTune', 'enabled', enabled)}
              />
            </div>
            {effects.autoTune.enabled && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Strength</span>
                    <span className="text-white text-sm">{effects.autoTune.strength}%</span>
                  </div>
                  <Slider
                    value={[effects.autoTune.strength]}
                    onValueChange={(values) => updateEffect('autoTune', 'strength', values[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <span className="text-gray-300 text-sm mb-2 block">Key</span>
                  <select
                    value={effects.autoTune.key}
                    onChange={(e) => updateEffect('autoTune', 'key', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                  >
                    {keys.map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'reverb' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Reverb</span>
              <Switch
                checked={effects.reverb.enabled}
                onCheckedChange={(enabled) => updateEffect('reverb', 'enabled', enabled)}
              />
            </div>
            {effects.reverb.enabled && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Room Size</span>
                    <span className="text-white text-sm">{effects.reverb.roomSize}%</span>
                  </div>
                  <Slider
                    value={[effects.reverb.roomSize]}
                    onValueChange={(values) => updateEffect('reverb', 'roomSize', values[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Damping</span>
                    <span className="text-white text-sm">{effects.reverb.damping}%</span>
                  </div>
                  <Slider
                    value={[effects.reverb.damping]}
                    onValueChange={(values) => updateEffect('reverb', 'damping', values[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Wet Level</span>
                    <span className="text-white text-sm">{effects.reverb.wetLevel}%</span>
                  </div>
                  <Slider
                    value={[effects.reverb.wetLevel]}
                    onValueChange={(values) => updateEffect('reverb', 'wetLevel', values[0])}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'echo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Echo</span>
              <Switch
                checked={effects.echo.enabled}
                onCheckedChange={(enabled) => updateEffect('echo', 'enabled', enabled)}
              />
            </div>
            {effects.echo.enabled && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Delay</span>
                    <span className="text-white text-sm">{effects.echo.delay}ms</span>
                  </div>
                  <Slider
                    value={[effects.echo.delay]}
                    onValueChange={(values) => updateEffect('echo', 'delay', values[0])}
                    min={50}
                    max={1000}
                    step={10}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Feedback</span>
                    <span className="text-white text-sm">{effects.echo.feedback}%</span>
                  </div>
                  <Slider
                    value={[effects.echo.feedback]}
                    onValueChange={(values) => updateEffect('echo', 'feedback', values[0])}
                    max={80}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Wet Level</span>
                    <span className="text-white text-sm">{effects.echo.wetLevel}%</span>
                  </div>
                  <Slider
                    value={[effects.echo.wetLevel]}
                    onValueChange={(values) => updateEffect('echo', 'wetLevel', values[0])}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'compressor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Compressor</span>
              <Switch
                checked={effects.compressor.enabled}
                onCheckedChange={(enabled) => updateEffect('compressor', 'enabled', enabled)}
              />
            </div>
            {effects.compressor.enabled && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Threshold</span>
                    <span className="text-white text-sm">{effects.compressor.threshold}dB</span>
                  </div>
                  <Slider
                    value={[effects.compressor.threshold]}
                    onValueChange={(values) => updateEffect('compressor', 'threshold', values[0])}
                    min={-40}
                    max={0}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Ratio</span>
                    <span className="text-white text-sm">{effects.compressor.ratio}:1</span>
                  </div>
                  <Slider
                    value={[effects.compressor.ratio]}
                    onValueChange={(values) => updateEffect('compressor', 'ratio', values[0])}
                    min={1}
                    max={20}
                    step={0.5}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'eq' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">3-Band EQ</span>
              <Switch
                checked={effects.equalizer.enabled}
                onCheckedChange={(enabled) => updateEffect('equalizer', 'enabled', enabled)}
              />
            </div>
            {effects.equalizer.enabled && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Bass</span>
                    <span className="text-white text-sm">{effects.equalizer.bass > 0 ? '+' : ''}{effects.equalizer.bass}dB</span>
                  </div>
                  <Slider
                    value={[effects.equalizer.bass]}
                    onValueChange={(values) => updateEffect('equalizer', 'bass', values[0])}
                    min={-12}
                    max={12}
                    step={0.5}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Mid</span>
                    <span className="text-white text-sm">{effects.equalizer.mid > 0 ? '+' : ''}{effects.equalizer.mid}dB</span>
                  </div>
                  <Slider
                    value={[effects.equalizer.mid]}
                    onValueChange={(values) => updateEffect('equalizer', 'mid', values[0])}
                    min={-12}
                    max={12}
                    step={0.5}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Treble</span>
                    <span className="text-white text-sm">{effects.equalizer.treble > 0 ? '+' : ''}{effects.equalizer.treble}dB</span>
                  </div>
                  <Slider
                    value={[effects.equalizer.treble]}
                    onValueChange={(values) => updateEffect('equalizer', 'treble', values[0])}
                    min={-12}
                    max={12}
                    step={0.5}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Active Effects Summary */}
      <div className="mt-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-lg p-3">
        <h4 className="text-purple-400 font-medium text-sm mb-2">Active Effects</h4>
        <div className="flex flex-wrap gap-2">
          {effects.autoTune.enabled && (
            <span className="bg-blue-600/30 text-blue-400 px-2 py-1 rounded-full text-xs">
              Auto-Tune ({effects.autoTune.strength}%)
            </span>
          )}
          {effects.reverb.enabled && (
            <span className="bg-green-600/30 text-green-400 px-2 py-1 rounded-full text-xs">
              Reverb ({effects.reverb.wetLevel}%)
            </span>
          )}
          {effects.echo.enabled && (
            <span className="bg-yellow-600/30 text-yellow-400 px-2 py-1 rounded-full text-xs">
              Echo ({effects.echo.delay}ms)
            </span>
          )}
          {effects.compressor.enabled && (
            <span className="bg-red-600/30 text-red-400 px-2 py-1 rounded-full text-xs">
              Compressor ({effects.compressor.ratio}:1)
            </span>
          )}
          {effects.equalizer.enabled && (
            <span className="bg-purple-600/30 text-purple-400 px-2 py-1 rounded-full text-xs">
              EQ Active
            </span>
          )}
          {!Object.values(effects).some((effect: any) => effect.enabled) && (
            <span className="text-gray-400 text-xs">No effects active</span>
          )}
        </div>
      </div>
    </div>
  );
}