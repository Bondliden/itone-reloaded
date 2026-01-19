import React, { useState } from 'react';
import { User, Edit3, Save, X, Camera, Globe, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { useAuth } from '../hooks/useAuth';

export function UserProfile() {
  const { state, actions } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: state.user?.displayName || '',
    username: state.user?.username || ''
  });
  const [error, setError] = useState('');

  if (!state.user) return null;

  const handleSave = async () => {
    setError('');
    
    if (!editForm.displayName.trim() || !editForm.username.trim()) {
      setError('Name and username are required');
      return;
    }

    try {
      await actions.updateProfile({
        displayName: editForm.displayName,
        username: editForm.username
      });
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleCancel = () => {
    setEditForm({
      displayName: state.user?.displayName || '',
      username: state.user?.username || ''
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <User className="h-5 w-5 mr-2 text-purple-400" />
          My Profile
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-white hover:bg-white/10"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="flex items-start space-x-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-purple-400">
            <AvatarImage src={state.user.avatar} alt={state.user.displayName} />
            <AvatarFallback className="bg-purple-600 text-white text-2xl">
              {state.user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-8 h-8 p-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4">
          {error && (
            <div className="bg-red-600/20 border border-red-400/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Display Name</label>
                <Input
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Username</label>
                <Input
                  value={editForm.username}
                  onChange={(e) => {
                    const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setEditForm({ ...editForm, username });
                  }}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="unique_username"
                />
                <p className="text-gray-400 text-xs mt-1">Only lowercase letters, numbers, and underscores</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={state.loading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <h4 className="text-2xl font-bold text-white">{state.user.displayName}</h4>
                <p className="text-gray-300">@{state.user.username}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {state.user.email}
                </span>
                <span className="flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {state.user.country}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Member since {new Date(state.user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-400">Recordings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-400">Friends</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-400">Playlists</div>
        </div>
      </div>
    </div>
  );
}