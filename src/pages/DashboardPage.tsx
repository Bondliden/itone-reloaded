import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { SongLibrary } from '../components/SongLibrary';
import { Queue } from '../components/Queue';
import { UserProfile } from '../components/UserProfile';
import { RecordingStudio } from '../components/RecordingStudio';
import { CollaborativeSession } from '../components/CollaborativeSession';
import { PlatformConnectionManager } from '../components/PlatformConnectionManager';
import { UploadDashboard } from '../components/UploadDashboard';
import { FeatureGate } from '../components/FeatureGate';
import { Header } from '../components/Header';
import { useUserSubscription } from '../hooks/useSubscription';
import { usePlatinumSubscription } from '../hooks/usePlatinum';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Music, Clock, Mic, User, Video, Users, Crown, CreditCard, Upload, Link2, Star } from 'lucide-react';
import { Link } from 'wouter';

export function DashboardPage() {
  const { user, loading } = useAuth();
  const { data: subscription } = useUserSubscription(user?.id);
  const { data: _platinumSubscription } = usePlatinumSubscription(user?.id);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                Welcome back, {user.name?.split(' ')[0]}! 🎤
                {subscription?.plan?.name === 'Platinum' && (
                  <Crown className="h-8 w-8 text-yellow-400 ml-3" />
                )}
              </h1>
              <p className="text-gray-300 text-lg">
                Ready to show off your vocal skills?
              </p>
            </div>
            {!subscription && (
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscription ? (
          <div className={`backdrop-blur-lg rounded-2xl p-4 mb-6 border ${subscription.plan?.name === 'Silver' ? 'bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-400/30' :
            subscription.plan?.name === 'Gold' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-400/30' :
              'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {subscription.plan?.name === 'Silver' && <Star className="h-6 w-6 text-gray-400" />}
                {subscription.plan?.name === 'Gold' && <Crown className="h-6 w-6 text-yellow-400" />}
                {subscription.plan?.name === 'Platinum' && <Crown className="h-6 w-6 text-purple-400" />}
                <div>
                  <h3 className="text-white font-semibold">{subscription.plan?.name} Member</h3>
                  <p className="text-gray-300 text-sm">
                    {subscription.status === 'trialing' ? 'Free trial active' : 'Subscription active'} •
                    Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link href="/billing">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-purple-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-purple-400" />
                <div>
                  <h3 className="text-white font-semibold">Unlock Premium Features</h3>
                  <p className="text-gray-300 text-sm">HD recording, collaboration, and platform uploads</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        )}

        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white/10 backdrop-blur-lg p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-white/20">
              <Music className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="queue" className="data-[state=active]:bg-white/20">
              <Clock className="h-4 w-4 mr-2" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="record" className="data-[state=active]:bg-white/20">
              <Video className="h-4 w-4 mr-2" />
              Record
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Collaborate
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:bg-white/20">
              <Link2 className="h-4 w-4 mr-2" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="uploads" className="data-[state=active]:bg-white/20">
              <Upload className="h-4 w-4 mr-2" />
              Uploads
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-white/20">
              <Mic className="h-4 w-4 mr-2" />
              Live
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          <TabsContent value="library">
            <SongLibrary />
          </TabsContent>

          <TabsContent value="queue">
            <Queue />
          </TabsContent>

          <TabsContent value="record">
            <FeatureGate feature="hd_recording" requiredPlan="Silver">
              <RecordingStudio />
            </FeatureGate>
          </TabsContent>

          <TabsContent value="collaborate">
            <FeatureGate feature="collaboration" requiredPlan="Gold">
              <CollaborativeSession />
            </FeatureGate>
          </TabsContent>

          <TabsContent value="platforms">
            <FeatureGate
              feature="platform_uploads"
              requiredPlan="Platinum"
              fallback={
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                  <Crown className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Platform Integration</h3>
                  <p className="text-gray-300 mb-6">
                    Connect your streaming platform accounts and upload directly from iTone.
                    All platform access costs are included in your Platinum subscription.
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Platinum
                    </Button>
                  </Link>
                </div>
              }
            >
              <PlatformConnectionManager />
            </FeatureGate>
          </TabsContent>

          <TabsContent value="uploads">
            <FeatureGate
              feature="platform_uploads"
              requiredPlan="Platinum"
              fallback={
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                  <Upload className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Upload Dashboard</h3>
                  <p className="text-gray-300 mb-6">
                    Track your uploads to streaming platforms and monitor your monthly usage.
                    Get 10 uploads per month included with Platinum.
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Platinum
                    </Button>
                  </Link>
                </div>
              }
            >
              <UploadDashboard />
            </FeatureGate>
          </TabsContent>
          <TabsContent value="live">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
              <Mic className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Live Karaoke Session</h3>
              <p className="text-gray-300 mb-6">
                Join or start a live karaoke session with other singers
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105">
                  Start Session
                </Button>
                <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-6 py-3 rounded-full font-semibold transition-all duration-200">
                  Join Session
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}