import { useState, useRef, useCallback, useEffect } from 'react';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
}

export function useWebRTC(config?: WebRTCConfig) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const defaultConfig: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const rtcConfig = config || defaultConfig;

  const initializeLocalStream = useCallback(async (constraints: MediaStreamConstraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback((participantId: string) => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, stream: remoteStream }
          : p
      ));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      setIsConnected(peerConnection.connectionState === 'connected');
    };

    return peerConnection;
  }, [localStream, rtcConfig]);

  const addParticipant = useCallback((participant: Omit<Participant, 'peerConnection'>) => {
    const peerConnection = createPeerConnection(participant.id);
    
    setParticipants(prev => [...prev, {
      ...participant,
      peerConnection
    }]);
  }, [createPeerConnection]);

  const removeParticipant = useCallback((participantId: string) => {
    setParticipants(prev => {
      const participant = prev.find(p => p.id === participantId);
      if (participant?.peerConnection) {
        participant.peerConnection.close();
      }
      return prev.filter(p => p.id !== participantId);
    });
  }, []);

  const createOffer = useCallback(async (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant?.peerConnection) return null;

    try {
      const offer = await participant.peerConnection.createOffer();
      await participant.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }, [participants]);

  const createAnswer = useCallback(async (participantId: string, offer: RTCSessionDescriptionInit) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant?.peerConnection) return null;

    try {
      await participant.peerConnection.setRemoteDescription(offer);
      const answer = await participant.peerConnection.createAnswer();
      await participant.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }, [participants]);

  const addIceCandidate = useCallback(async (participantId: string, candidate: RTCIceCandidateInit) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant?.peerConnection) return;

    try {
      await participant.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, [participants]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const cleanup = useCallback(() => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    participants.forEach(participant => {
      if (participant.peerConnection) {
        participant.peerConnection.close();
      }
    });
    
    setParticipants([]);
    setIsConnected(false);
  }, [localStream, participants]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    localStream,
    participants,
    isConnected,
    localVideoRef,
    initializeLocalStream,
    addParticipant,
    removeParticipant,
    createOffer,
    createAnswer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanup
  };
}