import React, { useState } from 'react';
import { Link2, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, Unlink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../modules/auth';
import { useStreamingPlatforms, useUserPlatformConnections, useConnectPlatform } from '../hooks/usePlatinum';
import { toast } from './ui/toast';

export function PlatformConnectionManager() {
  const { state: { user } } = useAuth();
  const { data: platforms = [] } = useStreamingPlatforms();
  const { data: connections = [] } = useUserPlatformConnections(user?.id);
  const connectPlatform = useConnectPlatform();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const isConnected = (platformId: string) => {
    return connections.some(conn => 
      conn.platform_id === platformId && conn.connection_status === 'active'
    );
  };

  const getConnection = (platformId: string) => {
    return connections.find(conn => conn.platform_id === platformId);
  };

  const handleConnect = async (platform: any) => {
    if (!user) return;

    setConnectingPlatform(platform.id);
    
    try {
      // Redirect to OAuth flow based on platform
      if (platform.name === 'spotify') {
        const authUrl = `https://itone.rocks?spotify_auth=true&user_id=${user.id}`;
        window.location.href = authUrl;
      } else {
        // For other platforms, use mock OAuth for demo
        const mockOAuthResponse = {
          access_token: `mock_token_${platform.name}_${Date.now()}`,
          refresh_token: `mock_refresh_${platform.name}_${Date.now()}`,
          expires_in: 3600,
          platform_user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
          platform_username: `${user.name?.toLowerCase().replace(' ', '_')}_${platform.name}`
        };

        await connectPlatform.mutateAsync({
          userId: user.id,
          platformId: platform.id,
          accessToken: mockOAuthResponse.access_token,
          refreshToken: mockOAuthResponse.refresh_token,
          expiresAt: new Date(Date.now() + mockOAuthResponse.expires_in * 1000).toISOString(),
          platformUserId: mockOAuthResponse.platform_user_id,
          platformUsername: mockOAuthResponse.platform_username
        });

        toast({
          title: "Platform Connected!",
          description: `Successfully connected to ${platform.display_name}. You can now upload directly to this platform.`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platform.display_name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    // In a real app, this would revoke the OAuth token
    toast({
      title: "Platform Disconnected",
      description: "Platform has been disconnected from your account.",
    });
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'spotify':
        return <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">SP</div>;
      case 'amazon_music':
        return <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">AM</div>;
      case 'apple_music':
        return <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-xs">AP</div>;
      case 'youtube_music':
        return <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">YT</div>;
      case 'deezer':
        return <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">DZ</div>;
      default:
        return <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">??</div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'expired': return 'text-yellow-400';
      case 'revoked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Link2 className="h-5 w-5 mr-2 text-purple-400" />
          Platform Connections
        </h3>
        <div className="text-sm text-gray-300">
          {connections.filter(c => c.connection_status === 'active').length} of {platforms.length} connected
        </div>
      </div>

      <div className="space-y-4">
        {platforms.map((platform) => {
          const connection = getConnection(platform.id);
          const connected = isConnected(platform.id);

          return (
            <div key={platform.id} className="bg-black/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getPlatformIcon(platform.name)}
                  <div>
                    <h4 className="text-white font-medium">{platform.display_name}</h4>
                    <p className="text-gray-400 text-sm">
                      Upload cost: ${platform.api_base_cost.toFixed(2)} (included in subscription)
                    </p>
                    {connected && connection && (
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span className={`text-xs ${getStatusColor(connection.connection_status)}`}>
                          Connected as @{connection.platform_username}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {connected ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform)}
                      disabled={connectingPlatform === platform.id}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {connectingPlatform === platform.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Benefits */}
      <div className="mt-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Why Connect Platforms?</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• One-click uploads directly from iTone</li>
          <li>• Automatic metadata and artwork inclusion</li>
          <li>• No separate billing or API setup required</li>
          <li>• Upload history and analytics tracking</li>
          <li>• Bulk upload to multiple platforms simultaneously</li>
        </ul>
      </div>
    </div>
  );
}