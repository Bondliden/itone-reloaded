import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Music, Clock, Star, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface SearchFilters {
  query: string;
  genre: string;
  difficulty: string;
  durationMin: number;
  durationMax: number;
  hasLyrics: boolean;
  language: string;
  decade: string;
  sortBy: 'title' | 'artist' | 'duration' | 'difficulty' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function AdvancedSearch({ onFiltersChange, className }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genre: '',
    difficulty: '',
    durationMin: 0,
    durationMax: 600,
    hasLyrics: false,
    language: '',
    decade: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      genre: '',
      difficulty: '',
      durationMin: 0,
      durationMax: 600,
      hasLyrics: false,
      language: '',
      decade: '',
      sortBy: 'title',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const genres = ['Rock', 'Pop', 'Classic', 'Country', 'Hip Hop', 'R&B', 'Jazz', 'Blues', 'Electronic', 'Folk'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Korean'];
  const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search songs, artists, or albums..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
          />
        </div>

        {/* Quick Filters */}
        <Select value={filters.genre} onValueChange={(value) => updateFilter('genre', value)}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="">All Genres</SelectItem>
            {genres.map(genre => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.difficulty} onValueChange={(value) => updateFilter('difficulty', value)}>
          <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="">All Levels</SelectItem>
            {difficulties.map(diff => (
              <SelectItem key={diff} value={diff.toLowerCase()}>{diff}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Dialog */}
        <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-purple-400" />
                <span>Advanced Search Filters</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Duration Range */}
              <div>
                <h4 className="text-white font-medium mb-3">Duration Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{formatDuration(filters.durationMin)}</span>
                    <span>{formatDuration(filters.durationMax)}</span>
                  </div>
                  <Slider
                    value={[filters.durationMin, filters.durationMax]}
                    onValueChange={(values) => {
                      updateFilter('durationMin', values[0]);
                      updateFilter('durationMax', values[1]);
                    }}
                    max={600}
                    step={30}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Language</label>
                  <Select value={filters.language} onValueChange={(value) => updateFilter('language', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Any Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="">Any Language</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Decade</label>
                  <Select value={filters.decade} onValueChange={(value) => updateFilter('decade', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Any Decade" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="">Any Decade</SelectItem>
                      {decades.map(decade => (
                        <SelectItem key={decade} value={decade}>{decade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sorting */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="artist">Artist</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Order</label>
                  <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Has Lyrics</span>
                  <Switch
                    checked={filters.hasLyrics}
                    onCheckedChange={(checked) => updateFilter('hasLyrics', checked)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="ghost" onClick={resetFilters}>
                  Reset All
                </Button>
                <Button onClick={() => setShowAdvanced(false)} className="bg-purple-600 hover:bg-purple-700">
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters Display */}
      {(filters.genre || filters.difficulty || filters.language || filters.decade || filters.hasLyrics) && (
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-gray-400 text-sm">Active filters:</span>
          {filters.genre && (
            <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full text-xs">
              {filters.genre}
            </span>
          )}
          {filters.difficulty && (
            <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
              {filters.difficulty}
            </span>
          )}
          {filters.language && (
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs">
              {filters.language}
            </span>
          )}
          {filters.decade && (
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs">
              {filters.decade}
            </span>
          )}
          {filters.hasLyrics && (
            <span className="bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded-full text-xs">
              Has Lyrics
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}