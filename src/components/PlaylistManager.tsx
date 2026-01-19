import React, { useState } from 'react';
import { Music, Plus, Play, Trash2, Edit3, Share2, Lock, Globe, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './ui/toast';

// Add missing React import for useEffect
import { useEffect } from 'react';

interface Playlist {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    duration: number;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
}

export function PlaylistManager() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([
  ]);

  // Load playlists from localStorage with auto-scalable memory
  useEffect(() => {
    const loadPlaylists = () => {
      const stored = localStorage.getItem('itone-playlists');
      if (stored) {
        setPlaylists(JSON.parse(stored));
      } else {
        // Initialize with sample playlists
        const defaultPlaylists = [
          {
            id: '1',
            name: 'My Favorites',
            description: 'Songs I love to sing',
            isPublic: false,
            songs: [
              { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', duration: 355, addedAt: '2 days ago' },
              { id: '2', title: 'Shape of You', artist: 'Ed Sheeran', duration: 233, addedAt: '1 week ago' }
            ],
            createdAt: '1 month ago',
            updatedAt: '2 days ago',
            likes: 0,
            isLiked: false
          },
          {
            id: '2',
            name: 'Rock Classics',
            description: 'The best rock songs for karaoke',
            isPublic: true,
            songs: [
              { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', duration: 355, addedAt: '1 week ago' },
              { id: '4', title: 'Billie Jean', artist: 'Michael Jackson', duration: 294, addedAt: '3 days ago' }
            ],
            createdAt: '2 weeks ago',
            updatedAt: '3 days ago',
            likes: 23,
            isLiked: true
          }
        ];
        setPlaylists(defaultPlaylists);
        localStorage.setItem('itone-playlists', JSON.stringify(defaultPlaylists));
      }
    };
    
    loadPlaylists();
  }, []);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  const createPlaylist = () => {
    if (!newPlaylist.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a playlist name.",
        variant: "destructive",
      });
      return;
    }

    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylist.name,
      description: newPlaylist.description,
      isPublic: newPlaylist.isPublic,
      songs: [],
      createdAt: 'Just now',
      updatedAt: 'Just now',
      likes: 0,
      isLiked: false
    };

    const updated = [playlist, ...playlists];
    setPlaylists(updated);
    localStorage.setItem('itone-playlists', JSON.stringify(updated));
    
    setNewPlaylist({ name: '', description: '', isPublic: false });
    setShowCreateDialog(false);

    toast({
      title: "Playlist Created!",
      description: `"${playlist.name}" has been created successfully.`,
    });
  };

  const deletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    const updated = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updated);
    localStorage.setItem('itone-playlists', JSON.stringify(updated));
    
    toast({
      title: "Playlist Deleted",
      description: `"${playlist?.name}" has been deleted.`,
    });
  };

  const togglePlaylistPrivacy = (playlistId: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, isPublic: !p.isPublic } : p
    ));
  };

  const sharePlaylist = (playlist: Playlist) => {
    const shareText = `Check out my "${playlist.name}" karaoke playlist on iTone!`;
    navigator.clipboard.writeText(shareText);
    
    toast({
      title: "Playlist Shared",
      description: "Playlist link copied to clipboard.",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = (songs: any[]) => {
    return songs.reduce((total, song) => total + song.duration, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">My Playlists</h2>
            <p className="text-gray-300">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} • 
              {playlists.reduce((total, p) => total + p.songs.length, 0)} total songs
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Playlist Name</label>
                  <Input
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                    placeholder="Enter playlist name..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Description (Optional)</label>
                  <Input
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                    placeholder="Describe your playlist..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Make playlist public</span>
                  <Switch
                    checked={newPlaylist.isPublic}
                    onCheckedChange={(checked) => setNewPlaylist({...newPlaylist, isPublic: checked})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPlaylist} className="bg-purple-600 hover:bg-purple-700">
                    Create Playlist
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{playlist.name}</h3>
                  {playlist.isPublic ? (
                    <Globe className="h-4 w-4 text-green-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-2">{playlist.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{playlist.songs.length} songs</span>
                  <span>{formatDuration(getTotalDuration(playlist.songs))}</span>
                  <span>Updated {playlist.updatedAt}</span>
                  {playlist.isPublic && (
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {playlist.likes}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPlaylist(playlist)}
                  className="text-white hover:bg-white/10"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sharePlaylist(playlist)}
                  className="text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePlaylist(playlist.id)}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Songs Preview */}
            <div className="space-y-2 mb-4">
              {playlist.songs.slice(0, 3).map((song) => (
                <div key={song.id} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                  <div>
                    <h4 className="text-white font-medium text-sm">{song.title}</h4>
                    <p className="text-gray-400 text-xs">{song.artist}</p>
                  </div>
                  <span className="text-gray-400 text-xs">{formatDuration(song.duration)}</span>
                </div>
              ))}
              {playlist.songs.length > 3 && (
                <p className="text-gray-400 text-xs text-center">
                  +{playlist.songs.length - 3} more songs
                </p>
              )}
            </div>

            {/* Playlist Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Play All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePlaylistPrivacy(playlist.id)}
                className="text-white hover:bg-white/10"
              >
                {playlist.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}