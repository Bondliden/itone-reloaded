import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Square, Play, Download, Users, Globe, Upload, Youtube, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TransposeControl } from './TransposeControl';
import { FeatureGate } from './FeatureGate';
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
  };
  initialTranspose?: number;
}

export function RecordingStudio({ song, initialTranspose = 0 }: RecordingStudioProps) {
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
  const [recordingQuality, setRecordingQuality] = useState<'standard' | 'high'>('standard');
  const [includeYouTubeAudio, setIncludeYouTubeAudio] = useState(true);
  const [autoTune, setAutoTune] = useState(false);
  const [echoEffect, setEchoEffect] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const hasGoldOrHigher = subscription?.plan?.name === 'Gold' || subscription?.plan?.name === 'Platinum';
  const hasPlatinum = subscription?.plan?.name === 'Platinum';
  const hasIntegratedPlatinum = !!platinumSubscription;
  const maxQuality = subscription?.plan?.download_quality || 'standard';

  useEffect(() => {
    initializeCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera and microphone access to record karaoke.",
        variant: "destructive",
      });
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await initializeCamera();
    }

    if (streamRef.current) {
      const options = {
        mimeType: recordingQuality === 'high' && hasGoldOrHigher ? 'video/webm;codecs=vp9' : 'video/webm'
      };
      
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      
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
          description: `Your karaoke performance has been saved${recordingQuality === 'high' ? ' in HD quality' : ''}.`,
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      if (isCollaborative) {
        toast({
          title: "Live Collaboration Started",
          description: `Up to ${subscription?.plan?.max_collaborators || 1} users can join your session!`,
        });
      }
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
      const quality = recordingQuality === 'ultra' ? 'UHD' : recordingQuality === 'high' ? 'HD' : 'SD';
      const transpose = transpose !== 0 ? `_transpose${transpose > 0 ? '+' : ''}${transpose}` : '';
      a.download = `karaoke-${song?.title || 'recording'}${transpose}_${quality}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Your ${quality} recording is being downloaded.`,
      });
    }
  };

  const uploadToPlatform = async (platform: 'youtube' | 'spotify') => {
    if (!hasPlatinum) {
      toast({
        title: "Platinum Required",
        description: "Upgrade to Platinum to upload directly to external platforms.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Uploading to ${platform === 'youtube' ? 'YouTube' : 'Spotify'}`,
      description: "Your recording is being uploaded. This may take a few minutes.",
    });

    // Simulate upload
    setTimeout(() => {
      toast({
        title: "Upload Successful!",
        description: `Your recording has been uploaded to ${platform === 'youtube' ? 'YouTube' : 'Spotify'}.`,
      });
    }, 3000);
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
    });
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
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
          </div>
        )}
      </div>

      {/* Video Preview and Controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Camera Preview */}
          <div className="bg-black rounded-2xl overflow-hidden relative aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
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
                </span>
              </div>
            )}

            {/* Camera Controls Overlay */}
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
                className={`rounded-full w-16 h-16 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
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
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
}