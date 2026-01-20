import React, { useState } from 'react';
import { Mic, MessageCircle, Settings, Crown, Globe, Copy, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './ui/toast';
import { cn } from '../lib/utils';

interface LiveSessionProps {
  sessionId?: string;
  isHost?: boolean;
  className?: string;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  hasVideo: boolean;
  isCurrentSinger: boolean;
  voiceLevel: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export function LiveSession({ sessionId: _sessionId, isHost = false, className, onRecordingStart, onRecordingStop }: LiveSessionProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<SessionParticipant[]>([
    {
      id: user?.id || '1',
      name: user?.name || 'You',
      avatar: user?.avatar,
      isHost: true,
      isMuted: false,
      hasVideo: true,
      isCurrentSinger: true,
      voiceLevel: 0
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'System',
      message: 'Welcome to the live karaoke session!',
      timestamp: new Date(),
      type: 'system'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [sessionCode] = useState('LIVE2025');
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    allowSpectators: true,
    requireApproval: false,
    recordSeparateTracks: true,
    autoMixing: true,
    chatEnabled: true,
    videoEnabled: true
  });

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        userName: user?.name || 'Anonymous',
        message: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    toast({
      title: "Session Code Copied",
      description: "Share this code with friends to join the session.",
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      onRecordingStart?.();
      addSystemMessage('Recording started');
    } else {
      onRecordingStop?.();
      addSystemMessage('Recording stopped');
    }
  };

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const nextSinger = () => {
    const currentIndex = participants.findIndex(p => p.isCurrentSinger);
    const nextIndex = (currentIndex + 1) % participants.length;

    setParticipants(prev => prev.map((p, index) => ({
      ...p,
      isCurrentSinger: index === nextIndex
    })));

    addSystemMessage(`It's now ${participants[nextIndex].name}'s turn to sing!`);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Session Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <div>
              <h2 className="text-xl font-bold text-white">Live Karaoke Session</h2>
              <p className="text-gray-300 text-sm">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} •
                Session #{sessionCode}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={copySessionCode}
              className="text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-1" />
              {sessionCode}
            </Button>

            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>

            {isHost && (
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Session Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Allow spectators</span>
                      <Switch
                        checked={sessionSettings.allowSpectators}
                        onCheckedChange={(checked) =>
                          setSessionSettings(prev => ({ ...prev, allowSpectators: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Require approval to join</span>
                      <Switch
                        checked={sessionSettings.requireApproval}
                        onCheckedChange={(checked) =>
                          setSessionSettings(prev => ({ ...prev, requireApproval: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Record separate tracks</span>
                      <Switch
                        checked={sessionSettings.recordSeparateTracks}
                        onCheckedChange={(checked) =>
                          setSessionSettings(prev => ({ ...prev, recordSeparateTracks: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto-mixing</span>
                      <Switch
                        checked={sessionSettings.autoMixing}
                        onCheckedChange={(checked) =>
                          setSessionSettings(prev => ({ ...prev, autoMixing: checked }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Participants Video Grid */}
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={cn(
                  'bg-black rounded-xl overflow-hidden relative aspect-video border-2 transition-all duration-300',
                  participant.isCurrentSinger ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-transparent'
                )}
              >
                {/* Video/Avatar Display */}
                {participant.hasVideo ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-white">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-lg">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-white text-sm">Camera Active</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-lg">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-400 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}

                {/* Current Singer Badge */}
                {participant.isCurrentSinger && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    SINGING NOW
                  </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-3 right-3 bg-red-600 px-2 py-1 rounded-full text-xs font-bold text-white flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>REC</span>
                  </div>
                )}

                {/* Host Badge */}
                {participant.isHost && (
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 px-2 py-1 rounded-full text-xs font-bold text-white flex items-center space-x-1">
                    <Crown className="h-3 w-3" />
                    <span>HOST</span>
                  </div>
                )}

                {/* Participant Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">
                      {participant.name}
                    </span>

                    {/* Voice Level Indicator */}
                    <div className="flex items-center space-x-2">
                      {participant.voiceLevel > 0 && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-1 h-3 rounded-full transition-all duration-100',
                                i < Math.floor(participant.voiceLevel / 20)
                                  ? 'bg-green-400'
                                  : 'bg-gray-600'
                              )}
                            />
                          ))}
                        </div>
                      )}

                      {participant.isMuted && (
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <Mic className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Participant Slot */}
            {participants.length < 4 && (
              <div className="bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Waiting for participant</p>
                  <p className="text-gray-500 text-xs">Share: {sessionCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Session Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={toggleRecording}
                  className={cn(
                    'font-semibold',
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  )}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>

                {isHost && (
                  <Button
                    onClick={nextSinger}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Next Singer
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Globe className="h-4 w-4" />
                <span>{participants.length}/4 participants</span>
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
            <span className="text-xs text-gray-400">
              {messages.length} messages
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'text-xs font-medium',
                    msg.type === 'system' ? 'text-blue-400' : 'text-purple-400'
                  )}>
                    {msg.userName}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                <p className={cn(
                  'text-sm rounded-lg px-3 py-2',
                  msg.type === 'system'
                    ? 'bg-blue-600/20 text-blue-300 italic'
                    : 'bg-black/30 text-gray-300'
                )}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {sessionSettings.chatEnabled && (
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
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
    </div>
  );
}