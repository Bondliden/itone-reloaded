import React, { useState, useRef, useEffect } from 'react';
import { Radio, Users, Eye, Heart, MessageCircle, Share2, Settings, Mic, Video, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../modules/auth';
import { toast } from './ui/toast';

interface LiveStreamProps {
  className?: string;
}

interface StreamViewer {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
}

interface StreamMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'tip' | 'follow';
}

export function LiveStreaming({ className }: LiveStreamProps) {
  const { user } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState<StreamViewer[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [streamSettings, setStreamSettings] = useState({
    isPublic: true,
    allowChat: true,
    allowTips: true,
    recordStream: true,
    quality: 'high' as 'standard' | 'high' | 'ultra'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: StreamMessage = {
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        userName: user?.name || 'Streamer',
        message: newMessage,
        timestamp: new Date(),
        type: 'chat'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  useEffect(() => {
    if (isStreaming) {
      // Simulate viewer activity
      const interval = setInterval(() => {
        setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
        
        // Add random chat messages
        if (Math.random() < 0.3) {
          const randomMessages = [
            'Amazing voice! 🎤',
            'Love this song!',
            'Can you sing my request next?',
            'Incredible performance! 👏',
            'Following you now!',
            'This is my favorite song!'
          ];
          
          const message: StreamMessage = {
            id: Date.now().toString(),
            userId: `viewer_${Math.random().toString(36).substr(2, 9)}`,
            userName: `Viewer${Math.floor(Math.random() * 1000)}`,
            message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
            timestamp: new Date(),
            type: 'chat'
          };
          
          setMessages(prev => [...prev.slice(-49), message]);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  const startStream = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: "Stream Title Required",
        description: "Please enter a title for your live stream.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsStreaming(true);
      setViewerCount(Math.floor(Math.random() * 50) + 10);
      
      toast({
        title: "Live Stream Started!",
        description: "Your karaoke stream is now live. Share the link with friends!",
      });

      // Add welcome message
      const welcomeMessage: StreamMessage = {
        id: 'welcome',
        userId: 'system',
        userName: 'iTone',
        message: `${user?.name} is now live! Welcome to the stream! 🎤`,
        timestamp: new Date(),
        type: 'chat'
      };
      setMessages([welcomeMessage]);

    } catch (error) {
      toast({
        title: "Stream Failed",
        description: "Could not access camera/microphone for streaming.",
        variant: "destructive",
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsStreaming(false);
    setViewerCount(0);
    setMessages([]);
    
    toast({
      title: "Stream Ended",
      description: "Your live stream has ended. Thanks for performing!",
    });
  };

  const shareStream = () => {
    const streamUrl = `${window.location.origin}/stream/${user?.id}`;
    navigator.clipboard.writeText(streamUrl);
    toast({
      title: "Stream Link Copied",
      description: "Share this link so others can watch your performance!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stream Setup */}
      {!isStreaming && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Radio className="h-6 w-6 mr-2 text-red-400" />
            Start Live Stream
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Stream Title</label>
              <Input
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="What are you singing today?"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Public Stream</span>
                <Switch
                  checked={streamSettings.isPublic}
                  onCheckedChange={(checked) => setStreamSettings(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Allow Chat</span>
                <Switch
                  checked={streamSettings.allowChat}
                  onCheckedChange={(checked) => setStreamSettings(prev => ({ ...prev, allowChat: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Record Stream</span>
                <Switch
                  checked={streamSettings.recordStream}
                  onCheckedChange={(checked) => setStreamSettings(prev => ({ ...prev, recordStream: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Accept Tips</span>
                <Switch
                  checked={streamSettings.allowTips}
                  onCheckedChange={(checked) => setStreamSettings(prev => ({ ...prev, allowTips: checked }))}
                />
              </div>
            </div>

            <Button
              onClick={startStream}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3"
            >
              <Radio className="h-4 w-4 mr-2" />
              Go Live
            </Button>
          </div>
        </div>
      )}

      {/* Live Stream Interface */}
      {isStreaming && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Stream Video */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-2xl overflow-hidden relative aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Live Indicator */}
              <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-bold">LIVE</span>
              </div>

              {/* Viewer Count */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-white" />
                  <span className="text-white text-sm font-medium">{viewerCount}</span>
                </div>
              </div>

              {/* Stream Title */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                <h3 className="text-white font-medium">{streamTitle}</h3>
                <p className="text-gray-300 text-sm">{user?.name}</p>
              </div>

              {/* Stream Controls */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareStream}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={stopStream}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  End Stream
                </Button>
              </div>
            </div>

            {/* Stream Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mt-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{viewerCount}</div>
                  <div className="text-sm text-gray-400">Viewers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{messages.filter(m => m.type === 'follow').length}</div>
                  <div className="text-sm text-gray-400">New Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{messages.filter(m => m.type === 'tip').length}</div>
                  <div className="text-sm text-gray-400">Tips</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{messages.length}</div>
                  <div className="text-sm text-gray-400">Messages</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex flex-col h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </h3>
              <span className="text-xs text-gray-400">{viewerCount} watching</span>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${
                      msg.type === 'tip' ? 'text-green-400' :
                      msg.type === 'follow' ? 'text-blue-400' :
                      msg.userId === user?.id ? 'text-purple-400' : 'text-gray-400'
                    }`}>
                      {msg.userName}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {msg.timestamp.toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className={`text-sm rounded-lg px-3 py-2 ${
                    msg.type === 'tip' ? 'bg-green-600/20 text-green-300' :
                    msg.type === 'follow' ? 'bg-blue-600/20 text-blue-300' :
                    'bg-black/30 text-gray-300'
                  }`}>
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            {streamSettings.allowChat && (
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Chat with viewers..."
                  className="bg-black/30 border-white/20 text-white placeholder-gray-400 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}