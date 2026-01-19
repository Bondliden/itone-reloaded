import React, { useState } from 'react';
import { TrendingUp, Users, Music, Calendar, Download, Eye, Heart, Share2, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useAuth } from '../modules/auth';
import { useUserRecordings, useUserSongs } from '../hooks/useSupabase';

export function AnalyticsDashboard() {
  const { state: { user } } = useAuth();
  // Mock data for demo
  const recordings = [];
  const userSongs = [];
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock analytics data
  const analytics = {
    totalRecordings: recordings.length,
    totalViews: recordings.reduce((acc, rec) => acc + Math.floor(Math.random() * 100), 0),
    totalLikes: recordings.reduce((acc, rec) => acc + Math.floor(Math.random() * 50), 0),
    averageScore: Math.floor(Math.random() * 30) + 70,
    recordingTime: recordings.reduce((acc, rec) => acc + rec.duration, 0),
    favoriteGenre: 'Pop',
    streakDays: 7,
    topSongs: [
      { title: 'Bohemian Rhapsody', plays: 23, score: 89 },
      { title: 'Shape of You', plays: 18, score: 92 },
      { title: 'Imagine', plays: 15, score: 87 }
    ],
    monthlyStats: [
      { month: 'Jan', recordings: 12, views: 340, likes: 89 },
      { month: 'Feb', recordings: 18, views: 520, likes: 156 },
      { month: 'Mar', recordings: 15, views: 480, likes: 134 },
      { month: 'Apr', recordings: 22, views: 680, likes: 203 }
    ]
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Music className="h-4 w-4 mr-2 text-purple-400" />
              Total Recordings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalRecordings}</div>
            <p className="text-xs text-gray-400">+3 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Eye className="h-4 w-4 mr-2 text-blue-400" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalViews}</div>
            <p className="text-xs text-gray-400">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              Total Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalLikes}</div>
            <p className="text-xs text-gray-400">+8% engagement rate</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Award className="h-4 w-4 mr-2 text-yellow-400" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.averageScore}/100</div>
            <p className="text-xs text-gray-400">+5 points this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recording Activity */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recording Activity</CardTitle>
                <CardDescription className="text-gray-400">Your karaoke activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{stat.month}</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={(stat.recordings / 25) * 100} className="w-20 h-2" />
                        <span className="text-white text-sm w-8">{stat.recordings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Songs */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Top Performances</CardTitle>
                <CardDescription className="text-gray-400">Your most played songs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topSongs.map((song, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{song.title}</p>
                          <p className="text-gray-400 text-xs">{song.plays} plays</p>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-sm font-medium">
                        {song.score}/100
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-xl p-4 text-center">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{formatDuration(analytics.recordingTime)}</div>
              <div className="text-sm text-gray-400">Total Recording Time</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 text-center">
              <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{analytics.favoriteGenre}</div>
              <div className="text-sm text-gray-400">Favorite Genre</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 text-center">
              <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{analytics.streakDays}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 text-center">
              <Share2 className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{userSongs.length}</div>
              <div className="text-sm text-gray-400">Saved Songs</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
              <CardDescription className="text-gray-400">Track your vocal improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Pitch Accuracy</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={85} className="w-20 h-2" />
                          <span className="text-white text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Timing</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={78} className="w-20 h-2" />
                          <span className="text-white text-sm">78%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Volume Control</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={92} className="w-20 h-2" />
                          <span className="text-white text-sm">92%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-3">Improvement Areas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-3">
                        <p className="text-yellow-400 font-medium">Timing</p>
                        <p className="text-gray-300">Practice with metronome to improve rhythm</p>
                      </div>
                      <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-3">
                        <p className="text-green-400 font-medium">Volume Control</p>
                        <p className="text-gray-300">Excellent consistency!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Social Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Profile Views</span>
                    <span className="text-white font-bold">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Followers Gained</span>
                    <span className="text-green-400 font-bold">+23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Shares Received</span>
                    <span className="text-blue-400 font-bold">45</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">8.7%</div>
                  <p className="text-gray-300 text-sm">Above average engagement</p>
                  <Progress value={87} className="mt-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Insights</CardTitle>
              <CardDescription className="text-gray-400">Personalized recommendations to improve your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">🎯 Vocal Improvement</h4>
                  <p className="text-gray-300 text-sm">
                    Your pitch accuracy has improved 15% this month! Try practicing with songs in the key of C major to continue this trend.
                  </p>
                </div>
                <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">📈 Trending Content</h4>
                  <p className="text-gray-300 text-sm">
                    Your rock covers are getting 40% more engagement. Consider adding more classic rock songs to your repertoire.
                  </p>
                </div>
                <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">🎵 Song Recommendations</h4>
                  <p className="text-gray-300 text-sm">
                    Based on your vocal range and style, we recommend trying "Don't Stop Believin'" and "Sweet Child O' Mine".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}