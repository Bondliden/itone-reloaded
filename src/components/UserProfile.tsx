import { useState, useMemo } from 'react';
import { User, Music, Video, Trophy, Edit3, Crown, Download, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useUserSongs, useUserRecordings } from '../hooks/useSupabase';

export function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  });

  // Load user's saved songs and recordings
  const { data: userSongs = [] } = useUserSongs(user?.id);
  const { data: recordings = [] } = useUserRecordings(user?.id);

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  // Calculate stats using useMemo to avoid re-running Math.random() on every render
  const stats = useMemo(() => {
    // Pre-generate random values for each recording to avoid calling Math.random during render
    const viewCounts = recordings.map(() => Math.floor(Math.random() * 100));
    return {
      songsRecorded: recordings.length,
      savedSongs: userSongs.length,
      totalViews: viewCounts.reduce((acc, views) => acc + views, 0)
    };
  }, [recordings, userSongs]);

  const isPlatinum = user?.subscriptionTier === 'platinum';

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-purple-400">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {isPlatinum && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                {isPlatinum && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    PLATINUM
                  </span>
                )}
              </div>
              <p className="text-gray-300">{user?.email}</p>
              {user?.bio && (
                <p className="text-gray-400 text-sm mt-2 max-w-md">{user.bio}</p>
              )}
            </div>
          </div>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Bio</label>
                  <Input
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <Music className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.songsRecorded}</div>
            <div className="text-sm text-gray-400">Songs Recorded</div>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <Video className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.savedSongs}</div>
            <div className="text-sm text-gray-400">Saved Songs</div>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalViews}</div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
        </div>
      </div>

      {/* Saved Songs */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Music className="h-5 w-5 mr-2 text-purple-400" />
          My Saved Songs ({userSongs.length})
        </h3>

        {userSongs.length === 0 ? (
          <div className="text-center py-8">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No saved songs yet</p>
            <p className="text-gray-500 text-sm">Save songs from the library to see them here</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {userSongs.slice(0, 5).map((userSong) => (
              <div key={userSong.id} className="bg-black/30 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{userSong.song.title}</h4>
                  <p className="text-gray-400 text-sm">{userSong.song.artist}</p>
                  {userSong.transpose_value !== 0 && (
                    <span className="text-purple-400 text-xs">
                      Transpose: {userSong.transpose_value > 0 ? '+' : ''}{userSong.transpose_value}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {userSongs.length > 5 && (
              <p className="text-gray-400 text-sm text-center">
                +{userSongs.length - 5} more songs
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent Recordings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Video className="h-5 w-5 mr-2 text-blue-400" />
          Recent Recordings ({recordings.length})
        </h3>

        {recordings.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No recordings yet</p>
            <p className="text-gray-500 text-sm">Start recording to see your performances here</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {recordings.slice(0, 3).map((recording) => (
              <div key={recording.id} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{recording.title}</h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(recording.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      {recording.is_collaborative && (
                        <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded">
                          Collaborative
                        </span>
                      )}
                      {recording.quality === 'high' && (
                        <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-1 rounded">
                          HD Quality
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Status */}
      <div className={`rounded-2xl p-6 ${isPlatinum
        ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30'
        : 'bg-white/10 backdrop-blur-lg'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
              {isPlatinum ? (
                <>
                  <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                  Platinum Member
                </>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  Free Account
                </>
              )}
            </h3>
            <p className="text-gray-300 text-sm">
              {isPlatinum
                ? 'Enjoy unlimited HD recordings, collaborative sessions, and direct platform uploads'
                : 'Upgrade to Platinum for HD recordings, collaborative features, and platform integrations'
              }
            </p>
          </div>
          {!isPlatinum && (
            <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Platinum
            </Button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">Recorded "Bohemian Rhapsody" with transpose +2</span>
            <span className="text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Joined collaborative session "Rock Night"</span>
            <span className="text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Downloaded recording in HD quality</span>
            <span className="text-gray-500">3 days ago</span>
          </div>
          {isPlatinum && (
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-300">Published to Spotify and Apple Music</span>
              <span className="text-gray-500">5 days ago</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
