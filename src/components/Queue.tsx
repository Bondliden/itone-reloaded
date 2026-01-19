import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, User, Trash2, Play } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { useLocation } from 'wouter';

interface QueueItem {
  id: string;
  songId: string;
  userId: string;
  userName: string;
  timestamp: number;
  song: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    genre: string;
    difficulty: string;
  };
}

export function Queue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => {
      // Auto-scalable memory queue - Load from localStorage with real-time sync
      const stored = JSON.parse(localStorage.getItem('itone-karaoke-queue') || '[]');
      return stored.map((item: any, index: number) => ({
        ...item,
        position: index + 1,
        estimated_start: new Date(Date.now() + (index * 4 * 60 * 1000)), // 4 min per song
        user: item.user || { name: 'Unknown User', avatar: null }
      }));
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const removeFromQueue = async (queueId: string) => {
    try {
      // Remove from localStorage queue
      const stored = JSON.parse(localStorage.getItem('itone-karaoke-queue') || '[]');
      const filtered = stored.filter((item: any) => item.id !== queueId);
      localStorage.setItem('itone-karaoke-queue', JSON.stringify(filtered));

      queryClient.invalidateQueries({ queryKey: ['queue'] });
      toast({
        title: "Removed from queue",
        description: "Song has been removed from the queue.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove song from queue.",
        variant: "destructive",
      });
    }
  };

  const playNext = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('itone-karaoke-queue') || '[]');
      
      if (stored.length === 0) {
        toast({
          title: "Queue is empty",
          description: "Add some songs to the queue first.",
          variant: "destructive",
        });
        return;
      }

      // Get first song and remove from queue
      const nextSong = stored[0];
      const remaining = stored.slice(1);
      localStorage.setItem('itone-karaoke-queue', JSON.stringify(remaining));
      
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      
      toast({
        title: "🎤 Starting Karaoke!",
        description: `Now playing: ${nextSong.song?.title || nextSong.title}`,
      });
      
      setLocation('/karaoke');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start karaoke session.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Karaoke Queue</h2>
            <p className="text-gray-300">
              {queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue
            </p>
          </div>
          {queue.length > 0 && (
            <Button
              onClick={playNext}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-full font-semibold"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Karaoke
            </Button>
          )}
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {queue.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Queue is Empty</h3>
            <p className="text-gray-300">
              Add some songs from the library to get started!
            </p>
          </div>
        ) : (
          queue.map((item: QueueItem, index: number) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">
                      {item.song.title}
                    </h4>
                    <p className="text-gray-300">{item.song.artist}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {item.userName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(item.song.duration)}
                      </span>
                      <span className="text-purple-400">{item.song.genre}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {index === 0 && (
                    <Button
                      onClick={playNext}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromQueue(item.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}