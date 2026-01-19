import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useLocation } from 'wouter';
import { useAuth, AuthUserProfile } from '../modules/auth';
import { Header } from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User, Music, Clock, Video, Users, Globe, BarChart3, Wifi, Upload,
  ListMusic, Play, Crown, Heart, Loader2
} from 'lucide-react';
import { toast } from '../components/ui/toast';

// Lazy load components for token efficiency - only load when needed
const SongLibrary = lazy(() => import('../components/SongLibrary').then(module => ({ default: module.SongLibrary })));
const PlaylistManager = lazy(() => import('../components/PlaylistManager').then(module => ({ default: module.PlaylistManager })));
const Queue = lazy(() => import('../components/Queue').then(module => ({ default: module.Queue })));
const RecordingStudio = lazy(() => import('../components/RecordingStudio').then(module => ({ default: module.RecordingStudio })));
const CollaborativeSession = lazy(() => import('../components/CollaborativeSession').then(module => ({ default: module.CollaborativeSession })));
const SocialFeatures = lazy(() => import('../components/SocialFeatures').then(module => ({ default: module.SocialFeatures })));
const PlatformConnectionManager = lazy(() => import('../components/PlatformConnectionManager').then(module => ({ default: module.PlatformConnectionManager })));
const UploadDashboard = lazy(() => import('../components/UploadDashboard').then(module => ({ default: module.UploadDashboard })));
const LiveStreaming = lazy(() => import('../components/LiveStreaming').then(module => ({ default: module.LiveStreaming })));
const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const OfflineMode = lazy(() => import('../components/OfflineMode').then(module => ({ default: module.OfflineMode })));
const SmartRecommendations = lazy(() => import('../modules/genspark/components/SmartRecommendations').then(module => ({ default: module.SmartRecommendations })));

// Loading component for lazy-loaded modules
function ModuleLoader({ name }: { name: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
      <Loader2 className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
      <h3 className="text-xl font-bold text-white mb-2">Loading {name}...</h3>
      <p className="text-gray-300">Optimizing module for your experience</p>
    </div>
  );
}

export function DashboardPage() {
  const { state } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('library');
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set(['profile']));

  useEffect(() => {
    if (!state.loading && !state.isAuthenticated) {
      setLocation('/auth');
    }
  }, [state.loading, state.isAuthenticated, setLocation]);

  // Track which modules have been loaded for analytics
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    setLoadedModules(prev => new Set([...prev, tabValue]));
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'module_access', {
        module_name: tabValue,
        user_tier: state.user?.subscriptionTier || 'free'
      });
    }
  };

  // Check if user has valid membership for offline features
  const hasValidMembership = state.user?.subscriptionTier && 
    ['pro', 'platinum'].includes(state.user.subscriptionTier);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {state.user?.displayName}! 🎤
          </h1>
          <p className="text-gray-300 text-lg">
            Ready to explore your modular karaoke experience?
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-white/10 backdrop-blur-lg p-1 text-xs overflow-x-auto">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20 text-white">
              <User className="h-4 w-4 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-white/20 text-white">
              <Music className="h-4 w-4 mr-1" />
              Library
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-white/20 text-white">
              <ListMusic className="h-4 w-4 mr-1" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="queue" className="data-[state=active]:bg-white/20 text-white">
              <Clock className="h-4 w-4 mr-1" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="record" className="data-[state=active]:bg-white/20 text-white">
              <Video className="h-4 w-4 mr-1" />
              Record
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="data-[state=active]:bg-white/20 text-white">
              <Users className="h-4 w-4 mr-1" />
              Collaborate
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-white/20 text-white">
              <Heart className="h-4 w-4 mr-1" />
              Social
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:bg-white/20 text-white">
              <Globe className="h-4 w-4 mr-1" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="uploads" className="data-[state=active]:bg-white/20 text-white">
              <Upload className="h-4 w-4 mr-1" />
              Uploads
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-white/20 text-white">
              <Wifi className="h-4 w-4 mr-1" />
              Live
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
            {hasValidMembership && (
              <TabsTrigger value="offline" className="data-[state=active]:bg-white/20 text-white">
                <Wifi className="h-4 w-4 mr-1" />
                Offline
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <AuthUserProfile />
              
              {/* Quick Stats for Profile */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">🎯 Quick Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-sm text-gray-400">Recordings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-sm text-gray-400">Saved Songs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">Free</div>
                    <div className="text-sm text-gray-400">Current Plan</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab - Token efficient lazy loading */}
          <TabsContent value="library">
            <Suspense fallback={<ModuleLoader name="Song Library" />}>
              <SongLibrary />
            </Suspense>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            <Suspense fallback={<ModuleLoader name="Playlist Manager" />}>
              <PlaylistManager />
            </Suspense>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue">
            <Suspense fallback={<ModuleLoader name="Queue Manager" />}>
              <Queue />
            </Suspense>
          </TabsContent>

          {/* Record Tab - With YouTube URL field */}
          <TabsContent value="record">
            <Suspense fallback={<ModuleLoader name="Recording Studio" />}>
              <RecordingStudio />
            </Suspense>
          </TabsContent>

          {/* Collaborate Tab */}
          <TabsContent value="collaborate">
            <Suspense fallback={<ModuleLoader name="Collaborative Session" />}>
              <CollaborativeSession />
            </Suspense>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <Suspense fallback={<ModuleLoader name="Social Features" />}>
              <SocialFeatures />
            </Suspense>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms">
            <Suspense fallback={<ModuleLoader name="Platform Connections" />}>
              <PlatformConnectionManager />
            </Suspense>
          </TabsContent>

          {/* Uploads Tab */}
          <TabsContent value="uploads">
            <Suspense fallback={<ModuleLoader name="Upload Dashboard" />}>
              <UploadDashboard />
            </Suspense>
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live">
            <Suspense fallback={<ModuleLoader name="Live Streaming" />}>
              <LiveStreaming />
            </Suspense>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Suspense fallback={<ModuleLoader name="Analytics Dashboard" />}>
              <AnalyticsDashboard />
            </Suspense>
          </TabsContent>

          {/* Offline Tab - Only for valid membership */}
          {hasValidMembership && (
            <TabsContent value="offline">
              <Suspense fallback={<ModuleLoader name="Offline Mode" />}>
                <OfflineMode />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>

        {/* Module Loading Analytics */}
        <div className="mt-8 bg-black/20 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs">
            Modules loaded: {loadedModules.size}/10 • 
            Token-efficient: Only active module rendered • 
            AI-powered: {loadedModules.has('library') || loadedModules.has('record') ? 'Active' : 'Ready'}
          </p>
        </div>
      </main>
    </div>
  );
}