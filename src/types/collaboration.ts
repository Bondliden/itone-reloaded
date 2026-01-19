export interface CollaborationRoom {
  id: string;
  name: string;
  hostId: string;
  sessionCode: string;
  maxParticipants: number;
  currentSong?: string;
  isRecording: boolean;
  isPublic: boolean;
  createdAt: Date;
  settings: RoomSettings;
}

export interface RoomSettings {
  allowSpectators: boolean;
  requireApproval: boolean;
  recordSeparateTracks: boolean;
  autoMixing: boolean;
  chatEnabled: boolean;
  videoEnabled: boolean;
  qualityLevel: 'standard' | 'high' | 'ultra';
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'host' | 'singer' | 'spectator';
  isOnline: boolean;
  isMuted: boolean;
  hasVideo: boolean;
  joinedAt: Date;
  permissions: ParticipantPermissions;
}

export interface ParticipantPermissions {
  canSing: boolean;
  canRecord: boolean;
  canControlPlayback: boolean;
  canInviteOthers: boolean;
  canKickParticipants: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'emoji' | 'reaction';
  replyTo?: string;
}

export interface VoiceActivity {
  userId: string;
  level: number; // 0-100
  isSpeaking: boolean;
  timestamp: Date;
}

export interface CollaborationEvent {
  id: string;
  type: 'user_joined' | 'user_left' | 'song_changed' | 'recording_started' | 'recording_stopped' | 'chat_message';
  userId: string;
  data: any;
  timestamp: Date;
}

export interface SingingTurn {
  userId: string;
  startTime: Date;
  endTime?: Date;
  songSection?: {
    startBar: number;
    endBar: number;
  };
}

export interface CollaborationSession {
  room: CollaborationRoom;
  participants: Participant[];
  currentTurn?: SingingTurn;
  turnQueue: string[]; // User IDs in order
  chatMessages: ChatMessage[];
  voiceActivity: VoiceActivity[];
  events: CollaborationEvent[];
}

export interface WebRTCConnection {
  participantId: string;
  peerConnection: RTCPeerConnection;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  dataChannel?: RTCDataChannel;
  connectionState: RTCPeerConnectionState;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'chat' | 'turn-change';
  from: string;
  to?: string;
  data: any;
  timestamp: Date;
}

export interface CollaborationStats {
  totalParticipants: number;
  activeSingers: number;
  recordingDuration: number;
  messagesCount: number;
  averageLatency: number;
}