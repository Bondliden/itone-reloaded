import React, { useState } from 'react';
import { Users, Globe, Mic, Video, MessageCircle, UserPlus, Crown, MicOff, VideoOff, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './ui/toast';
import { Switch } from './ui/switch';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  hasVideo: boolean;
  isCurrentUser?: boolean;
}

export function CollaborativeSession() {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: user?.id || '1',
      name: user?.name || 'You',
      avatar: user?.avatar,
      isHost: true,
      isMuted: false,
      hasVideo: true,
      isCurrentUser: true
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      isHost: false,
      isMuted: true,
      hasVideo: true
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      isHost: false,
      isMuted: false,
      hasVideo: false
    }
  ]);

  const [messages, setMessages] = useState([
    { id: '1', user: 'Sarah Johnson', message: '¡Excelente canción! 🎤', timestamp: Date.now() - 30000 },
    { id: '2', user: 'Mike Chen', message: 'Me encanta esta colaboración', timestamp: Date.now() - 15000 },
    { id: '3', user: 'System', message: 'Recording started - everyone ready?', timestamp: Date.now() - 5000 }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [sessionCode] = useState('ROCK2025');
  const [currentSinger, setCurrentSinger] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const isPlatinum = user?.subscriptionTier === 'platinum';

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        user: user?.name || 'You',
        message: newMessage,
        timestamp: Date.now()
      };
      setMessages([...messages, message]);
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

  const toggleMute = (participantId: string) => {
    setParticipants(prev => prev.map(p =>
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ));
  };

  const toggleVideo = (participantId: string) => {
    setParticipants(prev => prev.map(p =>
      p.id === participantId ? { ...p, hasVideo: !p.hasVideo } : p
    ));
  };

  const nextSinger = () => {
    setCurrentSinger((prev) => (prev + 1) % participants.length);
    const nextParticipant = participants[(currentSinger + 1) % participants.length];
    toast({
      title: "Turn Changed",
      description: `It's now ${nextParticipant.name}'s turn to sing!`,
    });
  };

  const startCollaborativeRecording = () => {
    if (!isPlatinum) {
      toast({
        title: "Platinum Required",
        description: "Upgrade to Platinum to start collaborative recording sessions.",
        variant: "destructive",
      });
      return;
    }

    setIsRecording(true);
    toast({
      title: "Collaborative Recording Started",
      description: "All participants are now being recorded!",
    });
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    return `${minutes}m ago`;
  };

  if (!isPlatinum) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">Collaborative Recording</h3>
        <p className="text-gray-300 mb-6">
          Join live karaoke sessions with up to 4 singers worldwide. Record together,
          share the experience, and create amazing collaborative performances.
        </p>
        <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold px-8 py-3">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Platinum
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-white">Live Collaborative Session</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-black/30 px-3 py-1 rounded-lg flex items-center space-x-2">
              <span className="text-green-400 font-mono text-sm">#{sessionCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copySessionCode}
                className="text-gray-400 hover:text-white p-1"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-300">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {participants.length}/4 participants
            </span>
            <span className="flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              Global session
            </span>
            <span>Current singer: {participants[currentSinger]?.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={nextSinger}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next Singer
            </Button>
            <Button
              onClick={startCollaborativeRecording}
              size="sm"
              className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Participants Grid */}
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`bg-black rounded-xl overflow-hidden relative aspect-video group border-2 ${index === currentSinger ? 'border-yellow-400' : 'border-transparent'
                  }`}
              >
                {participant.hasVideo ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-white">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-white text-sm">
                        {participant.isCurrentUser ? 'Your Camera' : 'Live Camera'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-gray-400 text-sm">Camera off</p>
                    </div>
                  </div>
                )}

                {/* Current Singer Indicator */}
                {index === currentSinger && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    SINGING
                  </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded-full text-xs font-bold text-white flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>REC</span>
                  </div>
                )}

                {/* Participant Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {participant.isHost && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className="text-white font-medium text-sm">
                        {participant.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {participant.isCurrentUser && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMute(participant.id)}
                            className="w-6 h-6 p-0"
                          >
                            {participant.isMuted ? (
                              <MicOff className="h-3 w-3 text-red-400" />
                            ) : (
                              <Mic className="h-3 w-3 text-white" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVideo(participant.id)}
                            className="w-6 h-6 p-0"
                          >
                            {participant.hasVideo ? (
                              <Video className="h-3 w-3 text-white" />
                            ) : (
                              <VideoOff className="h-3 w-3 text-red-400" />
                            )}
                          </Button>
                        </div>
                      )}
                      {participant.isMuted && !participant.isCurrentUser && (
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <MicOff className="h-3 w-3 text-white" />
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
                  <p className="text-gray-500 text-xs">Share session code: {sessionCode}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex flex-col h-96">
          <h3 className="text-white font-medium mb-4 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Live Chat
          </h3>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${msg.user === 'System' ? 'text-blue-400' : 'text-purple-400'
                    }`}>
                    {msg.user}
                  </span>
                  <span className="text-gray-500 text-xs">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-gray-300 text-sm bg-black/30 rounded-lg px-3 py-2">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Message Input */}
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
        </div>
      </div>

      {/* Session Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Session Controls</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-white font-medium">Recording Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Record All Participants</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Separate Audio Tracks</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Auto-sync Audio</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Session Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Allow New Participants</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Public Session</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Turn-based Singing</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}