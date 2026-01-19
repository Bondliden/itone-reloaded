import React, { useState } from 'react';
import { Upload, Music, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useUserPlatformConnections, useCreateUploadJob } from '../hooks/usePlatinum';
import { toast } from './ui/toast';

interface IntegratedUploadStudioProps {
  recording: {
    id: string;
    title: string;
    file_url: string;
    song: {
      title: string;
      artist: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function IntegratedUploadStudio({ recording, isOpen, onClose }: IntegratedUploadStudioProps) {
  const { user } = useAuth();
  const { data: connections = [] } = useUserPlatformConnections(user?.id);
  const createUploadJob = useCreateUploadJob();

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: recording.song.title,
    artist: recording.song.artist,
    album: 'iTone Karaoke Recordings',
    genre: 'Karaoke',
    description: `Karaoke performance of "${recording.song.title}" recorded on iTone`,
    tags: ['karaoke', 'cover', 'singing'],
    isPublic: true
  });
  const [isUploading, setIsUploading] = useState(false);

  const activeConnections = connections.filter(conn => conn.connection_status === 'active');

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleUpload = async () => {
    if (!user || selectedPlatforms.length === 0) return;

    setIsUploading(true);
    try {
      const uploadJobs = await createUploadJob.mutateAsync({
        userId: user.id,
        recordingId: recording.id,
        platformIds: selectedPlatforms,
        metadata: uploadMetadata
      });

      // Trigger actual upload processing for each job
      for (const job of uploadJobs) {
        if (job.platform?.name === 'spotify') {
          // Trigger Spotify upload via edge function
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uploadJobId: job.id })
          }).catch(console.error); // Fire and forget
        } else {
          // Trigger other platform uploads via general platform-upload function
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platform-upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uploadJobId: job.id })
          }).catch(console.error); // Fire and forget
        }
      }

      toast({
        title: "Upload Started!",
        description: `Your recording is being uploaded to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}. You'll be notified when complete.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to start upload process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'spotify':
        return <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">SP</div>;
      case 'amazon_music':
        return <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xs">AM</div>;
      case 'apple_music':
        return <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-white font-bold text-xs">AP</div>;
      case 'youtube_music':
        return <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">YT</div>;
      case 'deezer':
        return <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">DZ</div>;
      default:
        return <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white font-bold text-xs">??</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-purple-400" />
            <span>Upload to Streaming Platforms</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recording Info */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="text-white font-medium">{recording.title}</h3>
                <p className="text-gray-400 text-sm">{recording.song.artist} - {recording.song.title}</p>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <h3 className="text-white font-medium mb-4">Select Platforms</h3>
            {activeConnections.length === 0 ? (
              <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">No Platforms Connected</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Connect to streaming platforms first to enable uploads.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {activeConnections.map((connection) => (
                  <div
                    key={connection.id}
                    onClick={() => togglePlatform(connection.platform_id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlatforms.includes(connection.platform_id)
                      ? 'border-purple-400 bg-purple-600/20'
                      : 'border-gray-600 bg-black/30 hover:border-gray-500'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(connection.platform?.name || '')}
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {connection.platform?.display_name}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          @{connection.platform_username}
                        </p>
                      </div>
                      {selectedPlatforms.includes(connection.platform_id) && (
                        <CheckCircle className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Metadata */}
          {selectedPlatforms.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-medium">Upload Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Track Title</label>
                  <Input
                    value={uploadMetadata.title}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, title: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Artist Name</label>
                  <Input
                    value={uploadMetadata.artist}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, artist: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Album</label>
                  <Input
                    value={uploadMetadata.album}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, album: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Genre</label>
                  <Input
                    value={uploadMetadata.genre}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, genre: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">Description</label>
                <textarea
                  value={uploadMetadata.description}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Upload Summary */}
          {selectedPlatforms.length > 0 && (
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Upload Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Platforms selected:</span>
                  <span className="text-white">{selectedPlatforms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Upload cost:</span>
                  <span className="text-green-400 font-medium">Included in subscription</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Processing time:</span>
                  <span className="text-white">5-15 minutes per platform</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedPlatforms.length === 0 || isUploading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to {selectedPlatforms.length} Platform{selectedPlatforms.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}