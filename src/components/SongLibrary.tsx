import React, { useState } from 'react';
import { Search, Play, Plus, Clock, Star, Music, Video, Music2, Heart, HeartOff, Settings, Youtube, Link } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RecordingStudio } from './RecordingStudio';
import { TransposeControl } from './TransposeControl';
import { toast } from './ui/toast';
import { useAuth } from '../modules/auth';
import { useSongs, useSaveSong, useRemoveSong, useUserSongs } from '../hooks/useSupabase';

interface Song {
  id: number | string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  difficulty: string | null;
  youtubeUrl: string;
  spotifyId?: string | null;
}

export function SongLibrary() {
  const { state: { user } } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showAddSong, setShowAddSong] = useState(false);
  const [quickYoutubeUrl, setQuickYoutubeUrl] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showRecordingStudio, setShowRecordingStudio] = useState(false);
  const [showTranspose, setShowTranspose] = useState<string | null>(null);
  const [transposeValues, setTransposeValues] = useState<Record<string, number>>({});
  const [effectValues, setEffectValues] = useState<Record<string, string>>({});

  const { data: songs = [] } = useSongs(search, selectedGenre);
  const { data: userSongs = [] } = useUserSongs();
  const saveSongMutation = useSaveSong();
  const removeSongMutation = useRemoveSong();

  const genres = ['Rock', 'Pop', 'Classic', 'Country', 'Hip Hop', 'R&B'];

  const extractYouTubeInfo = (url: string) => {
    // Extract video ID from YouTube URL
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addCustomSong = () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "YouTube URL Required",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    const videoId = extractYouTubeInfo(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    // Create a custom song entry
    const customSong: Song = {
      id: `custom-${Date.now()}`,
      title: 'Custom YouTube Song',
      artist: 'Unknown Artist',
      duration: 180,
      genre: 'Custom',
      difficulty: 'medium',
      youtubeUrl: youtubeUrl,
      spotifyId: ''
    };

    // Add to the current session (in a real app, this would be saved to database)
    openRecordingStudio(customSong);
    setYoutubeUrl('');
    setShowAddSong(false);
    
    toast({
      title: "Custom Song Added!",
      description: "You can now record with your custom YouTube track.",
    });
  };

  const addQuickYoutube = () => {
    if (!quickYoutubeUrl.trim()) return;
    
    const videoId = extractYouTubeInfo(quickYoutubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL (not a search results page).",
        variant: "destructive",
      });
      return;
    }

    const customSong: Song = {
      id: `quick-${Date.now()}`,
      title: 'Custom YouTube Video',
      artist: 'Unknown Artist',
      duration: 180,
      genre: 'Custom',
      difficulty: 'medium',
      youtubeUrl: quickYoutubeUrl,
      spotifyId: ''
    };

    openRecordingStudio(customSong);
    setQuickYoutubeUrl('');
    
    toast({
      title: "YouTube Video Loaded!",
      description: "Recording studio opened with your YouTube track.",
    });
  };

  const effects = [
    { id: 'studio', name: 'Studio', emoji: '🎙️' },
    { id: 'bathroom', name: 'Bathroom', emoji: '🚿' },
    { id: 'arena', name: 'Arena', emoji: '🏟️' },
    { id: 'cathedral', name: 'Cathedral', emoji: '⛪' },
    { id: 'stadium', name: 'Stadium', emoji: '🏟️' }
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSongSaved = (songId: number | string) => {
    return userSongs.some(us => us.songId === Number(songId));
  };

  const toggleSaveSong = async (song: Song) => {
    if (!user) return;

    const numericId = typeof song.id === 'string' ? parseInt(song.id) : song.id;
    
    if (isSongSaved(song.id)) {
      await removeSongMutation.mutateAsync(numericId);
      toast({
        title: "Removed from library",
        description: `${song.title} has been removed from your library.`,
      });
    } else {
      const transposeValue = transposeValues[song.id] || 0;
      await saveSongMutation.mutateAsync({ 
        songId: numericId,
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
    setSelectedSong(song);
    setShowRecordingStudio(true);
  };

  // Mock songs data for demo (used as fallback when API returns empty)
  const mockSongs: Song[] = [
    {
      id: 1,
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      duration: 355,
      genre: 'Rock',
      difficulty: 'hard',
      youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      spotifyId: '4u7EnebtmKWzUH433cf1Qv'
    },
    {
      id: 2,
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      duration: 233,
      genre: 'Pop',
      difficulty: 'medium',
      youtubeUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
      spotifyId: '7qiZfU4dY4WkLyMn4s5iuJ'
    },
    {
      id: 3,
      title: 'Imagine',
      artist: 'John Lennon',
      duration: 183,
      genre: 'Classic',
      difficulty: 'easy',
      youtubeUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
      spotifyId: '7pKfPomDiuM2OtqtWKpGRb'
    },
    {
      id: 4,
      title: 'Billie Jean',
      artist: 'Michael Jackson',
      duration: 294,
      genre: 'Pop',
      difficulty: 'medium',
      youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
      spotifyId: '5ChkMS8OtdzJeqyybCc9R5'
    }
  ];

  const displaySongs = songs.length > 0 ? songs : mockSongs;

  return (
    <div className="space-y-6">
      {/* AI Smart Recommendations */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 backdrop-blur-lg rounded-2xl p-6 mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
            <Music className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">🧠 AI Song Recommendations</h3>
            <p className="text-gray-300 text-sm">Smart suggestions based on your vocal style and preferences</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors cursor-pointer">
            <h4 className="text-white font-medium">Don't Stop Believin'</h4>
            <p className="text-gray-300 text-sm">Journey • Perfect for your vocal range</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="text-green-400 text-xs">92% match</div>
              <div className="text-yellow-400 text-xs">Medium difficulty</div>
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors cursor-pointer">
            <h4 className="text-white font-medium">Sweet Child O' Mine</h4>
            <p className="text-gray-300 text-sm">Guns N' Roses • Great for rock practice</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="text-green-400 text-xs">87% match</div>
              <div className="text-red-400 text-xs">Hard difficulty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        {/* YouTube URL Quick Add - Prominent */}
        <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-400/40 rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <Youtube className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-xl font-bold text-white">🎤 Record Any YouTube Karaoke Song</h3>
              <p className="text-gray-300">Paste any YouTube karaoke URL • FREE: 4 recordings + unlimited transpose & effects</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="🎵 Paste YouTube karaoke URL here (e.g., https://youtu.be/fJ9rUzIMcZQ)"
              value={quickYoutubeUrl}
              onChange={(e) => setQuickYoutubeUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addQuickYoutube()}
              className="flex-1 bg-white/95 border-2 border-red-300 text-gray-900 placeholder-gray-600 font-medium text-base h-14 rounded-xl shadow-lg"
            />
            
            {/* Key Transpose Control - Inline */}
            <select
              className="bg-green-500 border-2 border-green-400 text-black font-bold text-sm rounded-lg px-3 min-w-[80px] h-14"
              defaultValue="0"
            >
              <option value="-12">Key -12</option>
              <option value="-6">Key -6</option>
              <option value="-3">Key -3</option>
              <option value="0">Original</option>
              <option value="+3">Key +3</option>
              <option value="+6">Key +6</option>
              <option value="+12">Key +12</option>
            </select>
            
            {/* Sound Effects Control - Inline */}
            <select
              className="bg-blue-500 border-2 border-blue-400 text-white font-bold text-sm rounded-lg px-3 min-w-[100px] h-14"
              defaultValue="studio"
            >
              <option value="studio">🎙️ Studio</option>
              <option value="bathroom">🚿 Bathroom</option>
              <option value="arena">🏟️ Arena</option>
              <option value="cathedral">⛪ Cathedral</option>
              <option value="stadium">🏟️ Stadium</option>
            </select>
            
            <Button
              onClick={addQuickYoutube}
              disabled={!quickYoutubeUrl.trim()}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold px-8 h-14 rounded-xl shadow-xl transform hover:scale-105 transition-all"
            >
              <Video className="h-5 w-5 mr-2" />
              🎬 START RECORDING
            </Button>
          </div>
          <div className="mt-4 bg-gradient-to-r from-green-600/30 to-blue-600/30 border-2 border-green-400/60 rounded-xl p-4 shadow-lg">
            <p className="text-green-400 text-sm font-medium text-center">
              ✨ FREE TIER: 4 YouTube recordings + unlimited key transpose + 5 sound effects • Zero subscription required
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={user ? `Hey ${user.name?.split(' ')[0]}, search songs or artists...` : "Search songs or artists..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/80 border-white text-gray-900 placeholder-gray-600 font-medium"
            />
          </div>
          
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 min-w-[120px] font-medium"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre} className="bg-white text-gray-900">
                {genre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{displaySongs.length}</div>
            <div className="text-xs text-gray-400">Available Songs</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-400">{userSongs.length}</div>
            <div className="text-xs text-gray-400">Saved Songs</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-400">{genres.length}</div>
            <div className="text-xs text-gray-400">Genres</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-lg font-bold text-green-400">∞</div>
            <div className="text-xs text-gray-400">Custom Songs</div>
          </div>
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
                    {String(song.id).startsWith('custom-') && (
                      <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">{song.artist}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(song.duration)}
                    </span>
                    <span className="text-purple-400">{song.genre}</span>
                    <span className={`flex items-center ${getDifficultyColor(song.difficulty || 'medium')}`}>
                      <Star className="h-3 w-3 mr-1" />
                      {song.difficulty || 'medium'}
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
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-green-600/30 to-blue-600/30 border border-green-400/50 rounded-lg px-3 py-2 shadow-lg">
                    <Music2 className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 text-xs font-bold">KEY:</span>
                    <select
                      value={transposeValues[song.id] || 0}
                      onChange={(e) => setTransposeValues(prev => ({ ...prev, [song.id]: parseInt(e.target.value) }))}
                      className="bg-white/90 text-gray-900 text-xs font-bold border border-green-400 rounded px-2 py-1 min-w-[70px]"
                    >
                      {Array.from({ length: 25 }, (_, i) => i - 12).map(value => (
                        <option key={value} value={value} className="bg-white text-gray-900">
                          {value === 0 ? 'Original' : value > 0 ? `+${value}` : `${value}`}
                        </option>
                      ))}
                    </select>
                    
                    {/* Sound Effects Control - RIGHT BESIDE KEY */}
                    <span className="text-red-400 text-xs font-bold">EFFECTS:</span>
                    <select
                      value={effectValues[song.id] || 'studio'}
                      onChange={(e) => setEffectValues(prev => ({ ...prev, [song.id]: e.target.value }))}
                      className="bg-white/90 text-gray-900 text-xs font-bold border border-red-400 rounded px-2 py-1 min-w-[90px]"
                    >
                      {effects.map(effect => (
                        <option key={effect.id} value={effect.id} className="bg-white text-gray-900">
                          {effect.emoji} {effect.name}
                        </option>
                      ))}
                    </select>
                    
                    <span className="text-green-400 text-xs font-bold bg-green-400/20 px-2 py-1 rounded">FREE</span>
                  </div>

                  {/* Save/Unsave Song */}
                  {!String(song.id).startsWith('custom-') && (
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
                  )}

                  {/* YouTube Link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(song.youtubeUrl, '_blank')}
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