/**
 * Utility functions for streaming platform integrations
 */

export interface PlatformMetadata {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  releaseDate?: string;
}

export interface UploadProgress {
  platform: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export class PlatformUploader {
  private apiBaseUrl: string;
  private authToken: string;

  constructor(apiBaseUrl: string, authToken: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
  }

  async uploadToSpotify(audioBlob: Blob, metadata: PlatformMetadata): Promise<string> {
    // Note: Spotify doesn't allow direct uploads via their public API
    // This would typically go through Spotify for Artists or a distribution service
    
    const formData = new FormData();
    formData.append('audio', audioBlob, `${metadata.title}.mp3`);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.apiBaseUrl}/spotify/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Spotify upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.trackId;
  }

  async uploadToYouTube(videoBlob: Blob, metadata: PlatformMetadata): Promise<string> {
    const formData = new FormData();
    formData.append('video', videoBlob, `${metadata.title}.mp4`);
    formData.append('snippet', JSON.stringify({
      title: metadata.title,
      description: metadata.description || '',
      tags: metadata.tags || [],
      categoryId: '10' // Music category
    }));

    const response = await fetch(`${this.apiBaseUrl}/youtube/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`YouTube upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.videoId;
  }

  async uploadToAppleMusic(audioBlob: Blob, metadata: PlatformMetadata): Promise<string> {
    // Apple Music uploads require MusicKit and special agreements
    const formData = new FormData();
    formData.append('audio', audioBlob, `${metadata.title}.m4a`);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.apiBaseUrl}/apple-music/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Apple Music upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.trackId;
  }

  async uploadToAmazonMusic(audioBlob: Blob, metadata: PlatformMetadata): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, `${metadata.title}.mp3`);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.apiBaseUrl}/amazon-music/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Amazon Music upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.trackId;
  }

  async uploadToDeezer(audioBlob: Blob, metadata: PlatformMetadata): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, `${metadata.title}.mp3`);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.apiBaseUrl}/deezer/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Deezer upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.trackId;
  }
}

export function validateMetadata(metadata: PlatformMetadata): string[] {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!metadata.artist || metadata.artist.trim().length === 0) {
    errors.push('Artist name is required');
  }

  if (metadata.title && metadata.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }

  if (metadata.description && metadata.description.length > 5000) {
    errors.push('Description must be 5000 characters or less');
  }

  if (metadata.tags && metadata.tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  return errors;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase()
    .substring(0, 50); // Limit length
}

export function generateUploadFilename(metadata: PlatformMetadata, platform: string, extension: string): string {
  const title = sanitizeFilename(metadata.title);
  const artist = sanitizeFilename(metadata.artist);
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${artist}_${title}_${platform}_${timestamp}.${extension}`;
}

export function estimateUploadTime(fileSize: number, uploadSpeed: number = 1000000): number {
  // Estimate upload time in seconds based on file size and connection speed
  // Default upload speed: 1 Mbps
  return Math.ceil(fileSize / uploadSpeed);
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function getPlatformRequirements(platform: string): {
  maxFileSize: number;
  supportedFormats: string[];
  maxDuration: number;
  minDuration: number;
} {
  const requirements = {
    spotify: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      supportedFormats: ['mp3', 'wav', 'flac'],
      maxDuration: 600, // 10 minutes
      minDuration: 30 // 30 seconds
    },
    youtube: {
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
      supportedFormats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
      maxDuration: 43200, // 12 hours
      minDuration: 1 // 1 second
    },
    apple_music: {
      maxFileSize: 200 * 1024 * 1024, // 200MB
      supportedFormats: ['m4a', 'mp3', 'wav'],
      maxDuration: 600, // 10 minutes
      minDuration: 30 // 30 seconds
    },
    amazon_music: {
      maxFileSize: 150 * 1024 * 1024, // 150MB
      supportedFormats: ['mp3', 'wav', 'flac'],
      maxDuration: 480, // 8 minutes
      minDuration: 30 // 30 seconds
    },
    deezer: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      supportedFormats: ['mp3', 'wav'],
      maxDuration: 480, // 8 minutes
      minDuration: 30 // 30 seconds
    }
  };

  return requirements[platform as keyof typeof requirements] || requirements.spotify;
}