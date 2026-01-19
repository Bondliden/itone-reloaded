import React, { useState } from 'react';
import { Search, Play, Plus, Clock, Star, Music, Video, Music2, Heart, HeartOff, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RecordingStudio } from './RecordingStudio';
import { TransposeControl } from './TransposeControl';
import { toast } from './ui/toast';
import { useAuth } from '../contexts/AuthContext';
import { useSongs, useSaveSong, useRemoveSong, useUserSongs } from '../hooks/useSupabase';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  difficulty: string;
  youtube_url: string;
  spotify_id?: string;
}

export function SongLibrary() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showRecordingStudio, setShowRecordingStudio] = useState(false);
  const [showTranspose, setShowTranspose] = useState<string | null>(null);
  const [transposeValues, setTransposeValues] = useState<Record<string, number>>({});

  const { data: songs = [] } = useSongs(search, selectedGenre);
  const { data: userSongs = [] } = useUserSongs(user?.id);
  const saveSongMutation = useSaveSong();
  const removeSongMutation = useRemoveSong();

  const genres = ['Rock', 'Pop', 'Classic', 'Country', 'Hip Hop', 'R&B'];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSongSaved = (songId: string) => {
    return userSongs.some(us => us.song_id === songId);
  };

  const toggleSaveSong = async (song: Song) => {
    if (!user) return;

    if (isSongSaved(song.id)) {
      await removeSongMutation.mutateAsync({ userId: user.id, songId: song.id });
      toast({
        title: "Removed from library",
        description: `${song.title} has been removed from your library.`,
      });
    } else {
      const transposeValue = transposeValues[song.id] || 0;
      await saveSongMutation.mutateAsync({ 
        userId: user.id, 
        songId: song.id,
        transposeValue 
      });
      toast({
        title: "Added to library!",
        description: `${song.title} has been saved to your library.`,
      });
    }
  };

  const addToQueue = (song: Song) => {
    const transposeValue = transposeValues[song.id] || 0;
    toast({
      title: "Added to queue!",
      description: `${song.title}${transposeValue !== 0 ? ` (transpose ${transposeValue > 0 ? '+' : ''}${transposeValue})` : ''} has been added to the karaoke queue.`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const openRecordingStudio = (song: Song) => {
    setSelectedSong({
      ...song,
      youtube_url: song.youtube_url
    });
    setShowRecordingStudio(true);
  };

  // Mock songs data for demo
  const mockSongs = [
    {
      id: '1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      duration: 355,
      genre: 'Rock',
      difficulty: 'hard',
      youtube_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      spotify_id: '4u7EnebtmKWzUH433cf1Qv'
    },
    {
      id: '2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      duration: 233,
      genre: 'Pop',
      difficulty: 'medium',
      youtube_url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
      spotify_id: '7qiZfU4dY4WkLyMn4s5iuJ'
    },
    {
      id: '3',
      title: 'Imagine',
      artist: 'John Lennon',
      duration: 183,
      genre: 'Classic',
      difficulty: 'easy',
      youtube_url: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
      spotify_id: '7pKfPomDiuM2OtqtWKpGRb'
    },
    {
      id: '4',
      title: 'Billie Jean',
      artist: 'Michael Jackson',
      duration: 294,
      genre: 'Pop',
      difficulty: 'medium',
      youtube_url: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
      spotify_id: '5ChkMS8OtdzJeqyybCc9R5'
    }
  ];

  const displaySongs = songs.length > 0 ? songs : mockSongs;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search songs or artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 min-w-[120px]"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre} className="bg-gray-800">
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="grid gap-4">
        {displaySongs.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No songs found</p>
          </div>
        ) : (
          displaySongs.map((song: Song) => (
            <div
              key={song.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{song.title}</h3>
                    {isSongSaved(song.id) && (
                      <Heart className="h-4 w-4 text-red-400 fill-current" />
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">{song.artist}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(song.duration)}
                    </span>
                    <span className="text-purple-400">{song.genre}</span>
                    <span className={`flex items-center ${getDifficultyColor(song.difficulty)}`}>
                      <Star className="h-3 w-3 mr-1" />
                      {song.difficulty}
                    </span>
                    {transposeValues[song.id] !== undefined && transposeValues[song.id] !== 0 && (
                      <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-1 rounded">
                        Transpose: {transposeValues[song.id] > 0 ? '+' : ''}{transposeValues[song.id]}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Transpose Control */}
                  <Dialog open={showTranspose === song.id} onOpenChange={(open) => setShowTranspose(open ? song.id : null)}>
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
                        <DialogTitle>Transpose Settings - {song.title}</DialogTitle>
                      </DialogHeader>
                      <TransposeControl
                        transpose={transposeValues[song.id] || 0}
                        onTransposeChange={(value) => setTransposeValues(prev => ({ ...prev, [song.id]: value }))}
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Save/Unsave Song */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveSong(song)}
                    className={`${isSongSaved(song.id) ? 'text-red-400 hover:bg-red-500/20' : 'text-white hover:bg-white/10'}`}
                  >
                    {isSongSaved(song.id) ? (
                      <Heart className="h-4 w-4 fill-current" />
                    ) : (
                      <HeartOff className="h-4 w-4" />
                    )}
                  </Button>

                  {/* YouTube Link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(song.youtube_url, '_blank')}
                    className="text-white hover:bg-white/10"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    YouTube
                  </Button>

                  {/* Record Button */}
                  <Button
                    size="sm"
                    onClick={() => openRecordingStudio(song)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Record
                  </Button>

                  {/* Add to Queue */}
                  <Button
                    onClick={() => addToQueue(song)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Queue
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recording Studio Dialog */}
      <Dialog open={showRecordingStudio} onOpenChange={setShowRecordingStudio}>
        <DialogContent className="max-w-7xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Music2 className="h-5 w-5 text-purple-400" />
              <span>Recording Studio - {selectedSong?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedSong && (
            <RecordingStudio 
              song={selectedSong} 
              initialTranspose={transposeValues[selectedSong.id] || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}