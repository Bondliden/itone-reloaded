import React, { useState, useEffect } from 'react';
import { 
  Music, Wand2, Mic, Volume2, Zap, Star, Crown, Palette, Settings, 
  Play, Pause, SkipForward, SkipBack, Save, Share2, Download, 
  Smartphone, Headphones, Heart, Sparkles 
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { toast } from './ui/toast';

interface VocalStyle {
  id: string;
  name: string;
  emoji: string;
  category: 'classic' | 'modern' | 'ai_powered' | 'character' | 'professional';
  description: string;
  parameters: {
    reverb: number;
    echo: number;
    autoTune: number;
    pitch: number;
    formant: number;
    distortion: number;
    brightness: number;
    warmth: number;
    compression: number;
    breathiness: number;
  };
  isAI?: boolean;
  isPremium?: boolean;
}

interface SongSegment {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  styleId: string;
  customParams?: Partial<VocalStyle['parameters']>;
}

interface AdvancedVocalStyleStudioProps {
  currentTime: number;
  isRecording: boolean;
  stream?: MediaStream;
  onStyleChange?: (style: VocalStyle, segment?: SongSegment) => void;
  className?: string;
}

export function AdvancedVocalStyleStudio({ 
  currentTime, 
  isRecording, 
  stream, 
  onStyleChange,
  className 
}: AdvancedVocalStyleStudioProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('natural');
  const [currentSegment, setCurrentSegment] = useState<string>('verse');
  const [isSegmentMode, setIsSegmentMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [headphonesConnected, setHeadphonesConnected] = useState(false);
  const [customStyles, setCustomStyles] = useState<VocalStyle[]>([]);
  const [showStyleCreator, setShowStyleCreator] = useState(false);
  
  const [songSegments, setSongSegments] = useState<SongSegment[]>([
    { id: 'intro', name: '🎵 Intro', startTime: 0, endTime: 15, styleId: 'natural' },
    { id: 'verse1', name: '📝 Verse 1', startTime: 15, endTime: 45, styleId: 'natural' },
    { id: 'chorus1', name: '🎤 Chorus 1', startTime: 45, endTime: 75, styleId: 'arena' },
    { id: 'verse2', name: '📝 Verse 2', startTime: 75, endTime: 105, styleId: 'natural' },
    { id: 'chorus2', name: '🎤 Chorus 2', startTime: 105, endTime: 135, styleId: 'arena' },
    { id: 'bridge', name: '🌉 Bridge', startTime: 135, endTime: 165, styleId: 'cathedral' },
    { id: 'outro', name: '🎵 Outro', startTime: 165, endTime: 200, styleId: 'stadium' }
  ]);

  const vocalStyles: VocalStyle[] = [
    // Natural & Clean
    {
      id: 'natural',
      name: 'Natural',
      emoji: '🎙️',
      category: 'classic',
      description: 'Pure, unprocessed voice',
      parameters: { reverb: 0, echo: 0, autoTune: 0, pitch: 0, formant: 0, distortion: 0, brightness: 0, warmth: 0, compression: 10, breathiness: 0 }
    },
    {
      id: 'studio',
      name: 'Pro Studio',
      emoji: '🎚️',
      category: 'professional',
      description: 'Professional studio sound',
      parameters: { reverb: 15, echo: 5, autoTune: 20, pitch: 0, formant: 0, distortion: 0, brightness: 10, warmth: 5, compression: 30, breathiness: 0 }
    },

    // Atmospheric
    {
      id: 'arena',
      name: 'Arena',
      emoji: '🏟️',
      category: 'classic',
      description: 'Large venue with crowd energy',
      parameters: { reverb: 70, echo: 40, autoTune: 15, pitch: 0, formant: 0, distortion: 0, brightness: 15, warmth: 0, compression: 40, breathiness: 0 }
    },
    {
      id: 'stadium',
      name: 'Stadium',
      emoji: '🏟️',
      category: 'classic',
      description: 'Massive outdoor concert venue',
      parameters: { reverb: 85, echo: 60, autoTune: 10, pitch: 0, formant: 5, distortion: 0, brightness: 20, warmth: -5, compression: 50, breathiness: 0 }
    },
    {
      id: 'cathedral',
      name: 'Cathedral',
      emoji: '⛪',
      category: 'classic',
      description: 'Sacred, ethereal reverb',
      parameters: { reverb: 90, echo: 30, autoTune: 25, pitch: 0, formant: -10, distortion: 0, brightness: -10, warmth: 15, compression: 20, breathiness: 5 }
    },
    {
      id: 'bathroom',
      name: 'Bathroom',
      emoji: '🚿',
      category: 'classic',
      description: 'Intimate, close acoustics',
      parameters: { reverb: 45, echo: 20, autoTune: 20, pitch: 0, formant: 0, distortion: 0, brightness: 5, warmth: 10, compression: 35, breathiness: 0 }
    },
    {
      id: 'concert_hall',
      name: 'Concert Hall',
      emoji: '🎭',
      category: 'professional',
      description: 'Elegant classical venue',
      parameters: { reverb: 60, echo: 25, autoTune: 15, pitch: 0, formant: 0, distortion: 0, brightness: 8, warmth: 12, compression: 25, breathiness: 0 }
    },

    // Genre-specific
    {
      id: 'grunge',
      name: 'Grunge',
      emoji: '🎸',
      category: 'modern',
      description: 'Raw, distorted rock sound',
      parameters: { reverb: 25, echo: 15, autoTune: 5, pitch: -2, formant: 5, distortion: 40, brightness: -5, warmth: -10, compression: 60, breathiness: 10 }
    },
    {
      id: 'super_pop',
      name: 'Super Pop',
      emoji: '✨',
      category: 'modern',
      description: 'Bright, polished pop sound',
      parameters: { reverb: 30, echo: 20, autoTune: 60, pitch: 1, formant: 10, distortion: 0, brightness: 25, warmth: 5, compression: 45, breathiness: 0 }
    },
    {
      id: 'indie',
      name: 'Indie',
      emoji: '🌙',
      category: 'modern',
      description: 'Alternative, dreamy sound',
      parameters: { reverb: 55, echo: 35, autoTune: 30, pitch: 0, formant: -5, distortion: 10, brightness: -5, warmth: 20, compression: 30, breathiness: 15 }
    },
    {
      id: 'opera',
      name: 'Opera',
      emoji: '🎭',
      category: 'classic',
      description: 'Classical, powerful vocals',
      parameters: { reverb: 75, echo: 20, autoTune: 10, pitch: 0, formant: -15, distortion: 0, brightness: 10, warmth: 25, compression: 15, breathiness: 0 }
    },
    {
      id: 'old_soul',
      name: 'Old Soul',
      emoji: '📻',
      category: 'classic',
      description: 'Vintage, warm character',
      parameters: { reverb: 40, echo: 25, autoTune: 20, pitch: -1, formant: -8, distortion: 15, brightness: -15, warmth: 30, compression: 40, breathiness: 8 }
    },

    // AI-Powered Effects
    {
      id: 'alchemist',
      name: 'Alchemist',
      emoji: '🧪',
      category: 'ai_powered',
      description: 'AI-enhanced mystical transformation',
      parameters: { reverb: 60, echo: 45, autoTune: 40, pitch: 2, formant: 15, distortion: 20, brightness: 10, warmth: 0, compression: 35, breathiness: 12 },
      isAI: true,
      isPremium: true
    },
    {
      id: 'vibravox',
      name: 'VibraVox',
      emoji: '🌊',
      category: 'ai_powered',
      description: 'AI vocal modulation with vibrato',
      parameters: { reverb: 50, echo: 30, autoTune: 55, pitch: 1, formant: 8, distortion: 5, brightness: 15, warmth: 5, compression: 40, breathiness: 5 },
      isAI: true,
      isPremium: true
    },
    {
      id: 'new_wave',
      name: 'New Wave',
      emoji: '🌈',
      category: 'ai_powered',
      description: 'Retro-futuristic AI processing',
      parameters: { reverb: 45, echo: 50, autoTune: 45, pitch: 3, formant: 12, distortion: 25, brightness: 20, warmth: -10, compression: 50, breathiness: 0 },
      isAI: true,
      isPremium: true
    },

    // Character Voices
    {
      id: 'anime_girl',
      name: 'Anime Girl',
      emoji: '👧',
      category: 'character',
      description: 'High-pitched anime character',
      parameters: { reverb: 30, echo: 15, autoTune: 70, pitch: 8, formant: 25, distortion: 0, brightness: 30, warmth: -5, compression: 45, breathiness: 3 },
      isAI: true,
      isPremium: true
    },
    {
      id: 'robot',
      name: 'Robot',
      emoji: '🤖',
      category: 'character',
      description: 'Synthetic robotic voice',
      parameters: { reverb: 10, echo: 25, autoTune: 85, pitch: 0, formant: 0, distortion: 60, brightness: 5, warmth: -20, compression: 70, breathiness: 0 },
      isAI: true,
      isPremium: true
    },
    {
      id: 'demon',
      name: 'Demon',
      emoji: '👹',
      category: 'character',
      description: 'Dark, menacing voice',
      parameters: { reverb: 80, echo: 40, autoTune: 30, pitch: -6, formant: -20, distortion: 45, brightness: -25, warmth: -15, compression: 60, breathiness: 20 },
      isAI: true,
      isPremium: true
    },

    // Additional Modern Styles
    {
      id: 'trap',
      name: 'Trap',
      emoji: '🎵',
      category: 'modern',
      description: 'Hip-hop trap sound',
      parameters: { reverb: 20, echo: 35, autoTune: 75, pitch: 0, formant: 5, distortion: 15, brightness: 10, warmth: -5, compression: 65, breathiness: 0 }
    },
    {
      id: 'country',
      name: 'Country',
      emoji: '🤠',
      category: 'classic',
      description: 'Warm, country twang',
      parameters: { reverb: 35, echo: 15, autoTune: 15, pitch: -1, formant: -5, distortion: 8, brightness: -8, warmth: 25, compression: 30, breathiness: 8 }
    },
    {
      id: 'jazz_club',
      name: 'Jazz Club',
      emoji: '🎷',
      category: 'professional',
      description: 'Intimate jazz venue',
      parameters: { reverb: 40, echo: 10, autoTune: 10, pitch: 0, formant: -3, distortion: 5, brightness: -5, warmth: 20, compression: 25, breathiness: 12 }
    },
    {
      id: 'gospel',
      name: 'Gospel',
      emoji: '🙏',
      category: 'classic',
      description: 'Soulful, powerful vocals',
      parameters: { reverb: 65, echo: 25, autoTune: 25, pitch: 0, formant: -8, distortion: 0, brightness: 15, warmth: 20, compression: 35, breathiness: 5 }
    }
  ];

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const checkHeadphones = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        setHeadphonesConnected(audioOutputs.length > 1);
      } catch (error) {
        console.error('Error checking audio devices:', error);
      }
    };

    checkMobile();
    checkHeadphones();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCurrentStyle = () => {
    return vocalStyles.find(style => style.id === selectedStyle) || vocalStyles[0];
  };

  const getCurrentSegment = () => {
    if (!isSegmentMode) return null;
    return songSegments.find(segment => 
      currentTime >= segment.startTime && currentTime <= segment.endTime
    );
  };

  const applyStyle = (styleId: string, segmentId?: string) => {
    const style = vocalStyles.find(s => s.id === styleId);
    if (!style) return;

    if (segmentId && isSegmentMode) {
      setSongSegments(prev => prev.map(seg => 
        seg.id === segmentId ? { ...seg, styleId } : seg
      ));
      toast({
        title: `${style.emoji} ${style.name} Applied`,
        description: `Style applied to ${songSegments.find(s => s.id === segmentId)?.name}`,
      });
    } else {
      setSelectedStyle(styleId);
      toast({
        title: `${style.emoji} ${style.name} Applied`,
        description: style.description,
      });
    }

    onStyleChange?.(style, segmentId ? songSegments.find(s => s.id === segmentId) : undefined);
  };

  const createCustomStyle = () => {
    const currentStyle = getCurrentStyle();
    const customStyle: VocalStyle = {
      id: `custom-${Date.now()}`,
      name: 'My Custom Style',
      emoji: '🎨',
      category: 'professional',
      description: 'Custom vocal style',
      parameters: { ...currentStyle.parameters }
    };
    
    setCustomStyles(prev => [...prev, customStyle]);
    setSelectedStyle(customStyle.id);
    setShowStyleCreator(false);
    
    toast({
      title: "Custom Style Created!",
      description: "Your custom vocal style has been saved.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'classic': return 'from-blue-600/20 to-cyan-600/20 border-blue-400/30';
      case 'modern': return 'from-purple-600/20 to-pink-600/20 border-purple-400/30';
      case 'ai_powered': return 'from-green-600/20 to-emerald-600/20 border-green-400/30';
      case 'character': return 'from-yellow-600/20 to-orange-600/20 border-yellow-400/30';
      case 'professional': return 'from-gray-600/20 to-slate-600/20 border-gray-400/30';
      default: return 'from-gray-600/20 to-gray-500/20 border-gray-400/30';
    }
  };

  const groupedStyles = vocalStyles.reduce((groups, style) => {
    const category = style.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(style);
    return groups;
  }, {} as Record<string, VocalStyle[]>);

  return (
    <div className={cn('bg-white/10 backdrop-blur-lg rounded-2xl p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Wand2 className="h-5 w-5 mr-2 text-purple-400" />
          Vocal Style Studio
        </h3>
        
        <div className="flex items-center space-x-2">
          {isMobile && (
            <div className="flex items-center space-x-1">
              <Smartphone className="h-4 w-4 text-blue-400" />
              {headphonesConnected && <Headphones className="h-4 w-4 text-green-400" />}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSegmentMode(!isSegmentMode)}
            className={cn(
              'text-white hover:bg-white/10 text-xs',
              isSegmentMode && 'bg-purple-600/30'
            )}
          >
            Segment Mode
          </Button>
        </div>
      </div>

      {/* Mobile/Headphones Optimization */}
      {isMobile && (
        <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Smartphone className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Mobile Optimized</span>
          </div>
          <div className="space-y-1 text-xs text-gray-300">
            <p>• {headphonesConnected ? '🎧 Headphones detected' : '📱 Use headphones for best quality'}</p>
            <p>• Touch and hold to fine-tune effects</p>
            <p>• Voice and video recording enabled</p>
          </div>
        </div>
      )}

      {/* Song Segmentation Timeline */}
      {isSegmentMode && (
        <div className="bg-black/30 rounded-lg p-3 mb-4">
          <h4 className="text-white font-medium text-sm mb-3">Song Structure</h4>
          <div className="space-y-2">
            {songSegments.map((segment) => {
              const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
              const segmentStyle = vocalStyles.find(s => s.id === segment.styleId);
              
              return (
                <div
                  key={segment.id}
                  className={cn(
                    'p-2 rounded-lg border transition-all duration-200 cursor-pointer',
                    isActive 
                      ? 'bg-purple-600/30 border-purple-400' 
                      : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  )}
                  onClick={() => setCurrentSegment(segment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-xs font-medium">
                        {segment.name}
                      </span>
                      <Badge className="text-xs bg-black/30">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{segmentStyle?.emoji}</span>
                      <span className="text-gray-300 text-xs">{segmentStyle?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Style Categories */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {Object.entries(groupedStyles).map(([category, styles]) => (
          <div key={category} className={`bg-gradient-to-r ${getCategoryColor(category)} rounded-lg p-3`}>
            <h4 className="text-white font-medium text-sm mb-3 capitalize">
              {category.replace('_', ' ')} Styles
              {category === 'ai_powered' && <Sparkles className="inline h-4 w-4 ml-1 text-green-400" />}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {styles.map((style) => {
                const isSelected = selectedStyle === style.id || 
                  (isSegmentMode && songSegments.find(s => s.id === currentSegment)?.styleId === style.id);
                
                return (
                  <button
                    key={style.id}
                    onClick={() => applyStyle(style.id, isSegmentMode ? currentSegment : undefined)}
                    className={cn(
                      'p-2 rounded-lg text-left transition-all duration-200 border',
                      isSelected 
                        ? 'bg-white/20 border-white/40' 
                        : 'bg-black/30 border-transparent hover:bg-black/50 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{style.emoji}</span>
                      <span className="text-white font-medium text-xs">{style.name}</span>
                      {style.isAI && <Sparkles className="h-3 w-3 text-green-400" />}
                      {style.isPremium && <Crown className="h-3 w-3 text-yellow-400" />}
                    </div>
                    <p className="text-gray-400 text-xs leading-tight">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Styles */}
        {customStyles.length > 0 && (
          <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-400/30 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-3">My Custom Styles</h4>
            <div className="grid grid-cols-2 gap-2">
              {customStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => applyStyle(style.id)}
                  className={cn(
                    'p-2 rounded-lg text-left transition-all duration-200 border',
                    selectedStyle === style.id 
                      ? 'bg-white/20 border-white/40' 
                      : 'bg-black/30 border-transparent hover:bg-black/50'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{style.emoji}</span>
                    <span className="text-white font-medium text-xs">{style.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Style Parameters (Advanced) */}
      <div className="mt-4 bg-black/30 rounded-lg p-3">
        <h4 className="text-white font-medium text-sm mb-3">Fine-tune Current Style</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {getCurrentStyle() && Object.entries(getCurrentStyle().parameters).map(([param, value]) => (
            <div key={param} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300 capitalize">{param.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-white">{value > 0 && param !== 'reverb' && param !== 'echo' && param !== 'compression' && param !== 'autoTune' && param !== 'brightness' && param !== 'warmth' && param !== 'breathiness' ? '+' : ''}{value}{param.includes('Tune') || param.includes('reverb') || param.includes('echo') || param.includes('compression') || param.includes('breathiness') ? '%' : param.includes('pitch') ? ' st' : ''}</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={(values) => {
                  const style = getCurrentStyle();
                  if (style) {
                    const updatedStyle = {
                      ...style,
                      parameters: { ...style.parameters, [param]: values[0] }
                    };
                    onStyleChange?.(updatedStyle);
                  }
                }}
                min={param === 'pitch' || param === 'formant' ? -12 : param.includes('brightness') || param.includes('warmth') ? -30 : 0}
                max={param === 'pitch' || param === 'formant' ? 12 : param.includes('brightness') || param.includes('warmth') ? 30 : 100}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        <Dialog open={showStyleCreator} onOpenChange={setShowStyleCreator}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              <Palette className="h-4 w-4 mr-1" />
              Create Style
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Create Custom Vocal Style</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-300">
                Create a custom vocal style based on your current settings.
              </p>
              <Button onClick={createCustomStyle} className="w-full bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Save as Custom Style
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </div>

      {/* Current Active Style Display */}
      <div className="mt-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCurrentStyle()?.emoji}</span>
            <div>
              <span className="text-white font-medium text-sm">{getCurrentStyle()?.name}</span>
              {getCurrentStyle()?.isAI && (
                <div className="flex items-center space-x-1 mt-1">
                  <Sparkles className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs">AI Enhanced</span>
                </div>
              )}
            </div>
          </div>
          {isSegmentMode && getCurrentSegment() && (
            <Badge className="bg-blue-600/30 text-blue-400 text-xs">
              {getCurrentSegment()?.name}
            </Badge>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-2">{getCurrentStyle()?.description}</p>
      </div>

      {/* Recording Quality for Mobile */}
      {isMobile && (
        <div className="mt-4 bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Video className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Mobile Recording</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Voice + Video Recording</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Headphone Monitoring</span>
              <Switch checked={headphonesConnected} disabled />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Auto-optimize for Mobile</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}