/**
 * Video utility functions for karaoke recording
 */

export interface VideoConstraints {
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: 'user' | 'environment';
}

export interface RecordingOptions {
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  mimeType?: string;
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: BlobPart[] = [];
  private stream: MediaStream | null = null;

  async initializeCamera(constraints: VideoConstraints = {}): Promise<MediaStream> {
    const defaultConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: constraints.width || 1280 },
        height: { ideal: constraints.height || 720 },
        frameRate: { ideal: constraints.frameRate || 30 },
        facingMode: constraints.facingMode || 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      return this.stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Camera access denied or not available');
    }
  }

  startRecording(options: RecordingOptions = {}): void {
    if (!this.stream) {
      throw new Error('No media stream available. Initialize camera first.');
    }

    const defaultOptions = {
      videoBitsPerSecond: options.videoBitsPerSecond || 2500000, // 2.5 Mbps
      audioBitsPerSecond: options.audioBitsPerSecond || 128000,  // 128 kbps
      mimeType: options.mimeType || 'video/webm;codecs=vp9,opus'
    };

    // Fallback to supported mime type
    let mimeType = defaultOptions.mimeType;
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: defaultOptions.videoBitsPerSecond,
      audioBitsPerSecond: defaultOptions.audioBitsPerSecond
    });

    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || 'video/webm'
        });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  getRecordingState(): RecordingState {
    return this.mediaRecorder?.state || 'inactive';
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  toggleTrack(kind: 'audio' | 'video', enabled: boolean): void {
    if (!this.stream) return;

    const tracks = kind === 'audio'
      ? this.stream.getAudioTracks()
      : this.stream.getVideoTracks();

    tracks.forEach(track => {
      track.enabled = enabled;
    });
  }

  async switchCamera(): Promise<MediaStream> {
    const currentConstraints = this.stream?.getVideoTracks()[0]?.getSettings();
    const newFacingMode = currentConstraints?.facingMode === 'user' ? 'environment' : 'user';

    this.stopCamera();
    return this.initializeCamera({ facingMode: newFacingMode });
  }

  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput' || device.kind === 'audioinput');
  }

  async switchToDevice(deviceId: string, kind: 'audio' | 'video'): Promise<void> {
    if (!this.stream) return;

    const constraints: MediaStreamConstraints = {};

    if (kind === 'video') {
      constraints.video = { deviceId: { exact: deviceId } };
      constraints.audio = true; // Keep existing audio
    } else {
      constraints.audio = { deviceId: { exact: deviceId } };
      constraints.video = true; // Keep existing video
    }

    const newStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Replace tracks in existing stream
    if (kind === 'video') {
      const videoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = this.stream.getVideoTracks()[0];
      if (oldVideoTrack) {
        this.stream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      this.stream.addTrack(videoTrack);
    } else {
      const audioTrack = newStream.getAudioTracks()[0];
      const oldAudioTrack = this.stream.getAudioTracks()[0];
      if (oldAudioTrack) {
        this.stream.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }
      this.stream.addTrack(audioTrack);
    }
  }
}

export function createVideoThumbnail(videoBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      video.currentTime = Math.min(5, video.duration / 2); // Seek to middle or 5 seconds
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);

      // Cleanup
      video.remove();
      canvas.remove();
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };

    video.src = URL.createObjectURL(videoBlob);
    video.load();
  });
}

export function compressVideo(videoBlob: Blob, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const qualitySettings = {
      low: { width: 640, height: 360, bitrate: 500000 },
      medium: { width: 1280, height: 720, bitrate: 1500000 },
      high: { width: 1920, height: 1080, bitrate: 3000000 }
    };

    const settings = qualitySettings[quality];

    video.onloadedmetadata = () => {
      canvas.width = settings.width;
      canvas.height = settings.height;

      // This is a simplified compression example
      // In a real application, you'd use WebCodecs API or similar
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: settings.bitrate
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        resolve(compressedBlob);
      };

      // Start compression process
      recorder.start();

      // Draw frames (simplified - in reality you'd process the entire video)
      const drawFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (!video.ended) {
          requestAnimationFrame(drawFrame);
        } else {
          recorder.stop();
        }
      };

      video.play();
      drawFrame();
    };

    video.src = URL.createObjectURL(videoBlob);
    video.load();
  });
}

export async function mergeAudioVideo(videoBlob: Blob, _audioBlob: Blob): Promise<Blob> {
  // This is a complex operation that typically requires server-side processing
  // or advanced browser APIs like WebCodecs
  // For now, return the video blob as-is
  console.warn('Audio-video merging not implemented in browser. Consider server-side processing.');
  return videoBlob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}