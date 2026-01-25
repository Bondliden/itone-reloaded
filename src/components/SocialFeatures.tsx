import React, { useState } from 'react';
import { Users, Heart, Share2, MessageCircle, UserPlus, Trophy, Star, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { useAuth } from '../modules/auth';
import { toast } from './ui/toast';
import { cn } from '../lib/utils';

interface SocialUser {
  id: string;
  name: string;
  avatar?: string;
  isFollowing: boolean;
  followers: number;
  following: number;
  recordings: number;
  lastActive: string;
}

interface Recording {
  id: string;
  title: string;
  artist: string;
  user: SocialUser;
  likes: number;
  comments: number;
  shares: number;
  duration: number;
  thumbnail: string;
  isLiked: boolean;
  createdAt: string;
}

export function SocialFeatures() {
  const { state: { user } } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'discover'>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock social data
  const [friends] = useState<SocialUser[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      isFollowing: true,
      followers: 234,
      following: 189,
      recordings: 45,
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      isFollowing: true,
      followers: 567,
      following: 234,
      recordings: 78,
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      isFollowing: false,
      followers: 1234,
      following: 456,
      recordings: 156,
      lastActive: '3 hours ago'
    }
  ]);

  const [recordings] = useState<Recording[]>([
    {
      id: '1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      user: friends[0],
      likes: 89,
      comments: 12,
      shares: 5,
      duration: 355,
      thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      isLiked: false,
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      user: friends[1],
      likes: 156,
      comments: 23,
      shares: 8,
      duration: 233,
      thumbnail: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      isLiked: true,
      createdAt: '1 day ago'
    }
  ]);

  const toggleFollow = (userId: string) => {
    // Update friends list in localStorage
    const updatedFriends = friends.map(f => 
      f.id === userId ? { ...f, isFollowing: !f.isFollowing } : f
    );
    localStorage.setItem('itone-friends', JSON.stringify(updatedFriends));
    
    toast({
      title: "Friend Added!",
      description: "You can now collaborate and share playlists together.",
    });
  };

  const toggleLike = (recordingId: string) => {
    // Update recording likes in localStorage
    const storedRecordings = JSON.parse(localStorage.getItem('itone-social-recordings') || '[]');
    const updated = storedRecordings.map((r: any) => 
      r.id === recordingId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r
    );
    localStorage.setItem('itone-social-recordings', JSON.stringify(updated));
    
    toast({
      title: "Liked!",
      description: "You liked this performance.",
    });
  };

  const shareRecording = (recording: Recording) => {
    navigator.clipboard.writeText(`Check out this amazing karaoke performance: ${recording.title} by ${recording.user.name}`);
    toast({
      title: "Link Copied",
      description: "Recording link copied to clipboard.",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Social Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="h-6 w-6 mr-2 text-purple-400" />
            Social Hub
          </h2>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-48"
            />
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
          {[
            { id: 'feed', label: 'Feed', icon: Music },
            { id: 'friends', label: 'Friends', icon: Users },
            { id: 'discover', label: 'Discover', icon: Star }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12 border-2 border-purple-400">
                  <AvatarImage src={recording.user.avatar} />
                  <AvatarFallback>{recording.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-white font-medium">{recording.user.name}</h4>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{recording.createdAt}</span>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-lg font-bold text-white">{recording.title}</h5>
                        <p className="text-gray-300">{recording.artist}</p>
                        <p className="text-gray-400 text-sm">{formatDuration(recording.duration)}</p>
                      </div>
                      <div 
                        className="w-20 h-20 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: `url(${recording.thumbnail})` }}
                      />
                    </div>
                  </div>

                  {/* Interaction Buttons */}
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(recording.id)}
                      className={cn(
                        'flex items-center space-x-1',
                        recording.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', recording.isLiked && 'fill-current')} />
                      <span>{recording.likes}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-400 hover:text-blue-400"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{recording.comments}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareRecording(recording)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-green-400"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{recording.shares}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-purple-400">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xl font-bold text-white">{friend.name}</h4>
                    <p className="text-gray-400 text-sm">Last active: {friend.lastActive}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
                      <span>{friend.followers} followers</span>
                      <span>{friend.following} following</span>
                      <span>{friend.recordings} recordings</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => toggleFollow(friend.id)}
                    size="sm"
                    className={cn(
                      friend.isFollowing 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    )}
                  >
                    {friend.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Trending Performances */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
              Trending This Week
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {recordings.map((recording, index) => (
                <div key={recording.id} className="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{recording.title}</h4>
                      <p className="text-gray-400 text-sm">by {recording.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3 text-gray-400">
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {recording.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {recording.comments}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-purple-400 hover:bg-purple-500/20">
                      Listen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-blue-400" />
              Suggested for You
            </h3>
            <div className="space-y-3">
              {friends.filter(f => !f.isFollowing).map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-white font-medium">{user.name}</h4>
                      <p className="text-gray-400 text-sm">{user.recordings} recordings • {user.followers} followers</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleFollow(user.id)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}