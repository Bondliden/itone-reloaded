import React, { useState } from 'react';
import { 
  Search, Play, Plus, Clock, Star, Music, Video, Music2, 
  Heart, HeartOff, Settings, Youtube, Link 
} from 'lucide-react';
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
  difficulty: string;
  youtube_url?: string;
  youtubeUrl?: string;
  spotify_id?: string;
  spotifyId?: string;
}

export function SongLibrary() {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const { state: authState } = useAuth();
  const { data: songs = [], isLoading } = useSongs();
  const { data: userSongs = [] } = useUserSongs(authState?.user?.id);
  const saveSong = useSaveSong();
  const removeSong = useRemoveSong();

  const genres = Array.from(new Set(songs.map(s => s.genre)));

  const mockSongs: Song[] = [
    {
      id: '1',
      title: 'Stay With Me',
      artist: 'Sam Smith',
      duration: 172,
      genre: 'Pop',
      difficulty: 'medium',
      youtubeUrl: 'https://www.youtube.com/watch?v=pB-5XG-DbAA',
      spotifyId: '5ChkMS8OtdzJeqyybCc9R5'
    }
  ];

  const displaySongs = songs.length > 0 ? songs : mockSongs;
  const filteredSongs = displaySongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase()) || 
                         song.artist.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = !selectedGenre || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

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
            <option value="" className="bg-gray-800">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre} className="bg-gray-800">{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map((song) => {
          const isSaved = userSongs.some(us => us.id === song.id);
          return (
            <div key={song.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group hover:border-green-400/50 transition-all">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => isSaved ? removeSong.mutate(song.id) : saveSong.mutate(song)}
                    className={isSaved ? "text-green-400" : "text-gray-400"}
                  >
                    <Star className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <span>{song.genre}</span>
                  <span className="capitalize">{song.difficulty}</span>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold">
                        <Play className="h-4 w-4 mr-2" />
                        Sing Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-black border-white/10">
                      <DialogHeader>
                        <DialogTitle>{song.title} - {song.artist}</DialogTitle>
                      </DialogHeader>
                      <RecordingStudio song={song} />
                    </DialogContent>
                  </Dialog>
                  <TransposeControl />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
