<<<<<<< HEAD
import { useState, useRef, useEffect, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, Square, Play, Download, Users, Globe, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TransposeControl } from './TransposeControl';
import { IntegratedUploadStudio } from './IntegratedUploadStudio';
import { toast } from './ui/toast';
import { useAuth } from '../contexts/AuthContext';
import { useUserSubscription } from '../hooks/useSubscription';
import { usePlatinumSubscription } from '../hooks/usePlatinum';

interface RecordingStudioProps {
  song?: {
    id: string;
    title: string;
    artist: string;
    youtube_url: string;
=======
import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Square, Download, Upload, Music, Heart, Play, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { TransposeControl } from './TransposeControl';
import { toast } from './ui/toast';
import { useAuth } from '../modules/auth';
import { RealTimeCoaching } from '../modules/genspark';

interface RecordingStudioProps {
  song?: {
    id: number | string;
    title: string;
    artist: string;
    youtubeUrl: string;
    duration?: number;
>>>>>>> origin/main
  };
  initialTranspose?: number;
}

export function RecordingStudio({ song, initialTranspose = 0 }: RecordingStudioProps) {
<<<<<<< HEAD
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription(user?.id);
  const { data: platinumSubscription } = usePlatinumSubscription(user?.id);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [transpose, setTranspose] = useState(initialTranspose);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showUploadStudio, setShowUploadStudio] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [recordingQuality, setRecordingQuality] = useState<'standard' | 'high' | 'ultra'>('standard');
  const [includeYouTubeAudio, setIncludeYouTubeAudio] = useState(true);
  const [autoTune, setAutoTune] = useState(false);
  const [echoEffect, setEchoEffect] = useState(false);

=======
  const { state: { user } } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [transpose, setTranspose] = useState(initialTranspose);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedEffect, setSelectedEffect] = useState('studio');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [freeRecordingsUsed] = useState(2); // Mock data - in real app this would come from database
  const [currentAudioMetrics, setCurrentAudioMetrics] = useState<any>(null);
  
>>>>>>> origin/main
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

<<<<<<< HEAD
  const hasGoldOrHigher = subscription?.plan?.name === 'Gold' || subscription?.plan?.name === 'Platinum';
  const hasPlatinum = subscription?.plan?.name === 'Platinum';
  const hasIntegratedPlatinum = !!platinumSubscription;

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera and microphone access to record karaoke.",
        variant: "destructive",
      });
    }
  }, [isVideoEnabled, isAudioEnabled]);
=======
  // Sound effects - clearly defined
  const effects = [
    { id: 'studio', name: 'Studio', emoji: '🎙️', description: 'Clean professional sound' },
    { id: 'bathroom', name: 'Bathroom', emoji: '🚿', description: 'Intimate acoustics' },
    { id: 'arena', name: 'Arena', emoji: '🏟️', description: 'Large venue energy' },
    { id: 'cathedral', name: 'Cathedral', emoji: '⛪', description: 'Sacred reverb' },
    { id: 'stadium', name: 'Stadium', emoji: '🏟️', description: 'Massive concert sound' }
  ];

  const isFreeTier = !user?.subscriptionTier || user.subscriptionTier === 'free';
  const freeRecordingsRemaining = Math.max(0, 4 - freeRecordingsUsed);
>>>>>>> origin/main

  useEffect(() => {
    initializeCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
<<<<<<< HEAD
  }, [initializeCamera]);
=======
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      streamRef.current = stream;
      setPermissionStatus('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (error) {
      setPermissionStatus('denied');
    }
  };
>>>>>>> origin/main

  const toggleRecording = async () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
<<<<<<< HEAD
=======
    // Check free tier limits
    if (isFreeTier && freeRecordingsUsed >= 4) {
      toast({
        title: "Free Recording Limit Reached",
        description: "You've used all 4 free recordings. Upgrade to continue recording!",
        variant: "destructive",
      });
      return;
    }

>>>>>>> origin/main
    if (!streamRef.current) {
      await initializeCamera();
    }

    if (streamRef.current) {
<<<<<<< HEAD
      const options = {
        mimeType: recordingQuality === 'high' && hasGoldOrHigher ? 'video/webm;codecs=vp9' : 'video/webm'
      };

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

=======
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
>>>>>>> origin/main
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        toast({
          title: "Recording Complete!",
<<<<<<< HEAD
          description: `Your karaoke performance has been saved${recordingQuality === 'high' ? ' in HD quality' : ''}.`,
=======
          description: `Your karaoke performance has been saved with ${effects.find(e => e.id === selectedEffect)?.name} effect!`,
>>>>>>> origin/main
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
<<<<<<< HEAD

      if (isCollaborative) {
        toast({
          title: "Live Collaboration Started",
          description: `Up to ${subscription?.plan?.max_collaborators || 1} users can join your session!`,
        });
      }
=======
      
      toast({
        title: `🎤 Recording Started!`,
        description: `Using ${effects.find(e => e.id === selectedEffect)?.emoji} ${effects.find(e => e.id === selectedEffect)?.name} effect with transpose ${transpose > 0 ? '+' : ''}${transpose}`,
      });
>>>>>>> origin/main
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
<<<<<<< HEAD
      const quality = recordingQuality === 'ultra' ? 'UHD' : recordingQuality === 'high' ? 'HD' : 'SD';
      const transposeValue = transpose !== 0 ? `_transpose${transpose > 0 ? '+' : ''}${transpose}` : '';
      a.download = `karaoke-${song?.title || 'recording'}${transposeValue}_${quality}-${Date.now()}.webm`;
=======
      const transposeStr = transpose !== 0 ? `_transpose${transpose > 0 ? '+' : ''}${transpose}` : '';
      const effectStr = selectedEffect !== 'studio' ? `_${selectedEffect}` : '';
      a.download = `karaoke-${song?.title || 'recording'}${transposeStr}${effectStr}-${Date.now()}.webm`;
>>>>>>> origin/main
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
<<<<<<< HEAD

      toast({
        title: "Download Started",
        description: `Your ${quality} recording is being downloaded.`,
=======
      
      toast({
        title: "Download Started",
        description: "Your recording is being downloaded.",
>>>>>>> origin/main
      });
    }
  };

  const toggleCamera = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleMicrophone = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

<<<<<<< HEAD
  const startCollaborativeSession = () => {
    if (!hasGoldOrHigher) {
      toast({
        title: "Gold or Platinum Required",
        description: "Upgrade to Gold or Platinum to access collaborative recording features.",
        variant: "destructive",
      });
      return;
    }

    setIsCollaborative(true);
    setConnectedUsers(Math.min(Math.floor(Math.random() * 3) + 2, subscription?.plan?.max_collaborators || 2));
    toast({
      title: "Collaborative Session Started",
      description: "Other users can now join your recording session!",
=======
  const applyEffect = (effectId: string) => {
    setSelectedEffect(effectId);
    const effect = effects.find(e => e.id === effectId);
    toast({
      title: `${effect?.emoji} ${effect?.name} Applied!`,
      description: effect?.description,
>>>>>>> origin/main
    });
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
<<<<<<< HEAD
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Recording Studio</h2>
          <div className="flex items-center space-x-4">
            {isCollaborative && (
              <div className="flex items-center space-x-2 bg-green-600/20 px-3 py-1 rounded-full">
                <Globe className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {connectedUsers} connected
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Quality:</span>
              <Select value={recordingQuality} onValueChange={(value: 'standard' | 'high') => setRecordingQuality(value)}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="high" disabled={!hasGoldOrHigher}>
                    HD {!hasGoldOrHigher && '(Gold+)'}
                  </SelectItem>
                  <SelectItem value="ultra" disabled={!hasPlatinum}>
                    Ultra HD {!hasPlatinum && '(Platinum)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {song && (
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-white">{song.title}</h3>
            <p className="text-gray-300">{song.artist}</p>
=======
        <h2 className="text-2xl font-bold text-white mb-4">Recording Studio</h2>

        {song && (
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{song.title}</h3>
                <p className="text-gray-300">{song.artist}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  size="sm" 
                  onClick={() => window.open(song.youtubeUrl, '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  YouTube
                </Button>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-gray-300'
                }`}>
                  {isRecording ? '🔴 RECORDING' : '⏸️ READY'}
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Heart className="h-4 w-4 mr-1" />
                  Save Song
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Free Tier Recording Limit Info */}
        {isFreeTier && (
          <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-400/60 rounded-xl p-6 mb-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">🎬 FREE: 4 YouTube Karaoke Recordings</h3>
                <p className="text-gray-300 text-sm">
                  <span className="text-green-400 font-bold">{freeRecordingsRemaining} recordings remaining</span> • 
                  Unlimited key transpose • 5 sound effects • No subscription required
                </p>
              </div>
            </div>
>>>>>>> origin/main
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Video Preview and Controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Camera Preview */}
          <div className="bg-black rounded-2xl overflow-hidden relative aspect-video">
=======
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Recording Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Camera Preview */}
          <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
            {permissionStatus === 'denied' && (
              <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-400 font-medium mb-2">Camera Access Needed</div>
                  <Button onClick={initializeCamera} className="bg-red-600 hover:bg-red-700 text-white">
                    Enable Camera
                  </Button>
                </div>
              </div>
            )}
            
>>>>>>> origin/main
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
<<<<<<< HEAD
              className="w-full h-full object-cover"
            />

=======
              className={`w-full h-full object-cover ${permissionStatus !== 'granted' ? 'hidden' : ''}`}
            />
            
>>>>>>> origin/main
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
<<<<<<< HEAD
                <span className="text-white text-sm font-medium">
                  REC {recordingQuality === 'high' ? 'HD' : 'SD'}
                </span>
              </div>
            )}

            {/* Collaborative Viewers */}
            {isCollaborative && (
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-white text-sm">{connectedUsers}</span>
                </div>
              </div>
            )}

            {/* Transpose Indicator */}
            {transpose !== 0 && (
              <div className="absolute bottom-4 right-4 bg-purple-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  Transpose: {transpose > 0 ? '+' : ''}{transpose}
=======
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}

            {/* Current Effect Display */}
            <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {effects.find(e => e.id === selectedEffect)?.emoji} {effects.find(e => e.id === selectedEffect)?.name}
              </span>
            </div>

            {/* Transpose Indicator */}
            {transpose !== 0 && (
              <div className="absolute bottom-4 right-4 bg-green-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  Key: {transpose > 0 ? '+' : ''}{transpose}
>>>>>>> origin/main
                </span>
              </div>
            )}

<<<<<<< HEAD
            {/* Camera Controls Overlay */}
=======
>>>>>>> origin/main
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCamera}
                className={`rounded-full w-12 h-12 ${isVideoEnabled ? 'bg-white/20' : 'bg-red-600'}`}
              >
                {isVideoEnabled ? (
                  <Video className="h-5 w-5 text-white" />
                ) : (
                  <VideoOff className="h-5 w-5 text-white" />
                )}
              </Button>

              <Button
                onClick={toggleRecording}
                size="lg"
<<<<<<< HEAD
                className={`rounded-full w-16 h-16 ${isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
=======
                disabled={isFreeTier && freeRecordingsUsed >= 4}
                className={`rounded-full w-16 h-16 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
>>>>>>> origin/main
              >
                {isRecording ? (
                  <Square className="h-6 w-6 text-white" />
                ) : (
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMicrophone}
                className={`rounded-full w-12 h-12 ${isAudioEnabled ? 'bg-white/20' : 'bg-red-600'}`}
              >
                {isAudioEnabled ? (
                  <Mic className="h-5 w-5 text-white" />
                ) : (
                  <MicOff className="h-5 w-5 text-white" />
                )}
              </Button>
            </div>
          </div>

<<<<<<< HEAD
          {/* YouTube Integration */}
          {song && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">YouTube Playback</h4>
                  <p className="text-gray-400 text-sm">Play along with the original track</p>
                </div>
                <Button
                  onClick={() => window.open(song.youtube_url, '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Open YouTube
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Transpose Control */}
          <TransposeControl
            transpose={transpose}
            onTransposeChange={setTranspose}
          />

          {/* Recording Options */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <h4 className="text-white font-medium mb-4">Recording Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Include YouTube Audio</span>
                <Switch
                  checked={includeYouTubeAudio}
                  onCheckedChange={setIncludeYouTubeAudio}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Auto-tune</span>
                <Switch
                  checked={autoTune}
                  onCheckedChange={setAutoTune}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Echo Effect</span>
                <Switch
                  checked={echoEffect}
                  onCheckedChange={setEchoEffect}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Enhanced Quality</span>
                <Switch
                  checked={recordingQuality !== 'standard'}
                  onCheckedChange={(checked) => setRecordingQuality(checked ? (hasPlatinum ? 'ultra' : 'high') : 'standard')}
                  disabled={!hasGoldOrHigher}
                />
              </div>
              {!hasGoldOrHigher && recordingQuality !== 'standard' && (
                <p className="text-yellow-400 text-xs">Enhanced recording requires Gold or Platinum subscription</p>
              )}
            </div>
          </div>

          {/* Collaborative Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Collaborative Recording</h4>
              <Switch
                checked={isCollaborative}
                onCheckedChange={hasGoldOrHigher ? setIsCollaborative : () => {
                  toast({
                    title: "Gold or Platinum Required",
                    description: "Upgrade to Gold or Platinum for collaborative recording.",
                    variant: "destructive",
                  });
                }}
                disabled={!hasGoldOrHigher}
              />
            </div>

            {!hasGoldOrHigher && (
              <p className="text-yellow-400 text-xs mb-3">
                Collaborative recording requires Gold or Platinum subscription
              </p>
            )}

            {isCollaborative && hasGoldOrHigher && (
              <div className="space-y-3">
                <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm font-medium mb-2">Session Active</p>
                  <p className="text-gray-300 text-xs">
                    Session Code: <span className="font-mono bg-black/30 px-2 py-1 rounded">LIVE2025</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  className={`w-full bg-green-600 hover:bg-green-700 text-white`}
                  onClick={startCollaborativeSession}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Friends (Max {subscription?.plan?.max_collaborators || 2})
                </Button>
              </div>
            )}
          </div>

          {/* Download and Upload Options */}
          {recordedBlob && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">Export Recording</h4>
              <div className="space-y-3">
                <Button
                  onClick={downloadRecording}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {recordingQuality === 'ultra' ? 'UHD' : recordingQuality === 'high' ? 'HD' : 'SD'} Recording
                </Button>

                {/* Integrated Platform Uploads (Platinum Only) */}
                {hasIntegratedPlatinum && (
                  <Button
                    onClick={() => setShowUploadStudio(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to Streaming Platforms
                  </Button>
                )}
=======
          {recordedBlob && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">Recording Complete</h4>
              <div className="flex space-x-2">
                <Button
                  onClick={downloadRecording}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
>>>>>>> origin/main
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD
      </div>

      {/* Integrated Upload Studio */}
      {recordedBlob && (
        <IntegratedUploadStudio
          recording={{
            id: `temp-${Date.now()}`,
            title: `Karaoke Recording - ${song?.title || 'Untitled'}`,
            file_url: URL.createObjectURL(recordedBlob),
            song: song || { title: 'Untitled', artist: 'Unknown' }
          }}
          isOpen={showUploadStudio}
          onClose={() => setShowUploadStudio(false)}
        />
      )}
=======

        {/* RIGHT SIDE PANEL - THIS IS WHERE THE CONTROLS ARE */}
        <div className="space-y-4">
          {/* TRANSPOSE AND SOUND EFFECTS SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT: TRANSPOSE CONTROL */}
            <TransposeControl
              transpose={transpose}
              onTransposeChange={setTranspose}
            />

            {/* RIGHT: SOUND EFFECTS - BESIDE TRANSPOSE */}
            <div className="bg-gradient-to-r from-red-600/40 to-orange-600/40 border-4 border-red-400 backdrop-blur-lg rounded-xl p-4 shadow-2xl">
              <h4 className="text-white font-bold mb-4 flex items-center text-lg bg-red-600/50 rounded-lg p-2 border-2 border-yellow-400">
                <Music className="h-6 w-6 mr-2 text-yellow-400" />
                🎚️ EFFECTS
              </h4>
              
              <div className="space-y-2">
                {effects.map((effect) => (
                  <Button
                    key={effect.id}
                    onClick={() => applyEffect(effect.id)}
                    className={`w-full text-left justify-start font-bold text-sm p-3 h-14 transition-all duration-200 border-2 ${
                      selectedEffect === effect.id 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-yellow-300 shadow-xl transform scale-105' 
                        : 'bg-white/90 text-black hover:bg-white border-white shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="text-lg font-black">{effect.emoji} {effect.name}</div>
                      <div className="text-xs font-semibold opacity-90">{effect.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* ACTIVE EFFECT DISPLAY */}
              <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 border-2 border-yellow-600 rounded-lg p-3 shadow-xl">
                <div className="text-black font-black text-sm mb-1 flex items-center">
                  <Music className="h-4 w-4 mr-2" />
                  🔊 ACTIVE EFFECT: {effects.find(e => e.id === selectedEffect)?.emoji} {effects.find(e => e.id === selectedEffect)?.name}
                </div>
                <div className="text-black text-xs font-bold">
                  {effects.find(e => e.id === selectedEffect)?.description}
                </div>
              </div>
            </div>
          </div>

          {/* RECORDING SETTINGS - BOTTOM */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <h4 className="text-white font-medium mb-4">Recording Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Enable Video</span>
                <Switch checked={isVideoEnabled} onCheckedChange={setIsVideoEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Enable Audio</span>
                <Switch checked={isAudioEnabled} onCheckedChange={setIsAudioEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Monitor Audio</span>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Free Tier Recording Counter */}
            {isFreeTier && (
              <div className="mt-4 bg-gradient-to-r from-green-600/30 to-blue-600/30 border-2 border-green-400/60 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-bold text-sm">🎬 Free Recordings</span>
                  <span className="text-white font-bold">{freeRecordingsRemaining}/4 remaining</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(freeRecordingsRemaining / 4) * 100}%` }}
                  ></div>
                </div>
                <p className="text-green-400 text-xs mt-2 font-medium">
                  ✨ COMPLETELY FREE: YouTube karaoke + key transpose + 5 effects + HD quality
                </p>
              </div>
            )}
          </div>

          {/* AI Real-time Coaching */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 backdrop-blur-lg rounded-xl p-4">
            <h4 className="text-cyan-400 font-bold mb-3 flex items-center">
              <Video className="h-5 w-5 mr-2" />
              🧠 AI Vocal Coach
            </h4>
            {isRecording ? (
              <div className="space-y-3">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-white text-sm mb-1">Live Analysis:</div>
                  <div className="text-cyan-400 text-sm">✨ Great pitch control! Keep it steady.</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-green-400 font-bold">82%</div>
                    <div className="text-gray-400">Pitch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">75%</div>
                    <div className="text-gray-400">Timing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">88%</div>
                    <div className="text-gray-400">Volume</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-400 text-sm">Start recording to get AI coaching feedback</div>
              </div>
            )}
          </div>
        </div>
      </div>
>>>>>>> origin/main
    </div>
  );
}