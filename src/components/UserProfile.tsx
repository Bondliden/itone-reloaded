import React, { useState } from 'react';
import { User, Edit3, Save, X, Camera, Globe, Mail, Crown, Star, Check, Zap, CreditCard, Shield, Users, Upload, Music, Video, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useAuth } from '../modules/auth';
import { toast } from './ui/toast';

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
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
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

  const currentTier = state.user?.subscriptionTier || 'free';

  const handleUpgrade = (planName: string, price: number) => {
    toast({
      title: "Subscription Upgrade",
      description: `Starting ${planName} plan checkout for $${price}/month...`,
    });
  };

  // Subscription plans data
  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      current: currentTier === 'free',
      color: 'from-gray-600/20 to-gray-500/20 border-gray-400/30',
      icon: <User className="h-8 w-8 text-gray-400" />,
      features: [
        '4 YouTube recordings per month',
        'MP3/MP4 downloads',
        'Key transpose (-12 to +12 semitones)',
        '5 professional sound effects',
        'Solo recording only',
        'Community support'
      ]
    },
    {
      id: 'silver',
      name: 'Silver',
      price: 9.99,
      current: currentTier === 'silver',
      color: 'from-gray-600/20 to-gray-500/20 border-gray-400/30',
      icon: <Star className="h-8 w-8 text-gray-400" />,
      features: [
        'Unlimited recordings',
        'Sing with 1 other user (2 people total)',
        'HD quality recording',
        'MP3/MP4 downloads',
        'All Free tier features',
        'Email support'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 14.99,
      current: currentTier === 'gold',
      color: 'from-yellow-600/20 to-orange-600/20 border-yellow-400/30',
      icon: <Crown className="h-8 w-8 text-yellow-400" />,
      features: [
        'Everything in Silver',
        'Sing with up to 4 other users (5 people total)',
        'Super high quality recording',
        'Advanced audio effects suite',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      current: currentTier === 'premium',
      color: 'from-purple-600/20 to-pink-600/20 border-purple-400/30',
      icon: <Zap className="h-8 w-8 text-purple-400" />,
      features: [
        'Everything in Gold',
        'Platform upload capability',
        'Extra high-quality music formats (FLAC, WAV)',
        'Professional audio suite',
        '24/7 priority support'
      ],
      platformCosts: {
        'Spotify': 5.99,
        'Apple Music': 7.19,
        'Amazon Music': 4.79,
        'YouTube Music': 3.59,
        'Deezer': 4.79
      }
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white/20 text-white">
            <User className="h-4 w-4 mr-2" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-white/20 text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription Plans
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
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
                <div className="text-sm text-gray-400">Saved Songs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Playlists</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Subscription Plans Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan Status */}
          <div className={`bg-gradient-to-r ${subscriptionPlans.find(p => p.current)?.color} backdrop-blur-lg rounded-2xl p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {subscriptionPlans.find(p => p.current)?.icon}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Current Plan: {subscriptionPlans.find(p => p.current)?.name}
                  </h2>
                  <p className="text-gray-300">
                    {subscriptionPlans.find(p => p.current)?.price === 0 
                      ? 'Free forever - No credit card required' 
                      : `$${subscriptionPlans.find(p => p.current)?.price}/month • 7-day free trial`}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600/30 text-green-400 px-4 py-2 text-sm font-bold">
                ACTIVE
              </Badge>
            </div>
          </div>

          {/* All Subscription Plans */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Itone.studio Subscription Plans
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-gradient-to-b ${plan.color} backdrop-blur-lg rounded-2xl p-6 border relative ${
                    plan.popular ? 'transform scale-105 shadow-2xl' : ''
                  } ${plan.current ? 'ring-2 ring-green-400' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {plan.current && (
                    <div className="absolute -top-4 right-4">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        CURRENT
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-1">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      {plan.price > 0 && <span className="text-lg text-gray-300 font-normal">/month</span>}
                    </div>
                    <p className="text-gray-300 text-sm">
                      {plan.price > 0 ? '7-day free trial included' : 'No credit card required'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Platform Upload Costs for Premium */}
                  {plan.name === 'Premium' && plan.platformCosts && (
                    <div className="mb-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold text-sm mb-3">🎵 Platform Upload Costs (Per Song):</h4>
                      <div className="space-y-2 text-xs">
                        {Object.entries(plan.platformCosts).map(([platform, cost]) => (
                          <div key={platform} className="flex justify-between">
                            <span className="text-gray-300">{platform}:</span>
                            <span className="text-white font-bold">${cost}</span>
                          </div>
                        ))}
                        <div className="border-t border-green-400/30 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-green-400 font-semibold">All Platforms:</span>
                            <span className="text-green-400 font-bold">$26.35</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Upload costs are separate from subscription • Charged per song upload
                      </p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(plan.name, plan.price)}
                    disabled={plan.current}
                    className={`w-full py-3 font-semibold text-lg rounded-full transition-all duration-200 transform hover:scale-105 ${
                      plan.current
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : plan.name === 'Silver'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white'
                        : plan.name === 'Gold'
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {plan.current ? 'Current Plan' : plan.price === 0 ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              ))}
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete Feature Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-medium py-3">Features</th>
                      <th className="text-center text-gray-400 font-medium py-3">Free</th>
                      <th className="text-center text-gray-400 font-medium py-3">Silver</th>
                      <th className="text-center text-yellow-400 font-medium py-3">Gold</th>
                      <th className="text-center text-purple-400 font-medium py-3">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Monthly Recordings</td>
                      <td className="text-center py-3 text-yellow-400">4 YouTube videos</td>
                      <td className="text-center py-3 text-green-400">Unlimited</td>
                      <td className="text-center py-3 text-green-400">Unlimited</td>
                      <td className="text-center py-3 text-green-400">Unlimited</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Recording Quality</td>
                      <td className="text-center py-3 text-gray-400">Standard</td>
                      <td className="text-center py-3 text-yellow-400">HD</td>
                      <td className="text-center py-3 text-yellow-400">Super HD</td>
                      <td className="text-center py-3 text-purple-400">Extra High + FLAC/WAV</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Collaboration</td>
                      <td className="text-center py-3 text-red-400">Solo only</td>
                      <td className="text-center py-3 text-yellow-400">2 people total</td>
                      <td className="text-center py-3 text-green-400">5 people total</td>
                      <td className="text-center py-3 text-green-400">5 people total</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Key Transpose</td>
                      <td className="text-center py-3 text-green-400">✓ Full range (-12 to +12)</td>
                      <td className="text-center py-3 text-green-400">✓ Full range</td>
                      <td className="text-center py-3 text-green-400">✓ Full range</td>
                      <td className="text-center py-3 text-green-400">✓ Full range</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Sound Effects</td>
                      <td className="text-center py-3 text-green-400">5 professional</td>
                      <td className="text-center py-3 text-green-400">5 professional</td>
                      <td className="text-center py-3 text-yellow-400">Advanced suite</td>
                      <td className="text-center py-3 text-purple-400">Professional suite</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Platform Uploads</td>
                      <td className="text-center py-3 text-red-400">✗</td>
                      <td className="text-center py-3 text-red-400">✗</td>
                      <td className="text-center py-3 text-red-400">✗</td>
                      <td className="text-center py-3 text-green-400">✓ Available</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-gray-300 py-3 font-medium">Support</td>
                      <td className="text-center py-3 text-gray-400">Community</td>
                      <td className="text-center py-3 text-yellow-400">Email</td>
                      <td className="text-center py-3 text-yellow-400">Priority</td>
                      <td className="text-center py-3 text-purple-400">24/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Token Efficiency Info */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-400/30 rounded-2xl p-6">
              <h3 className="text-cyan-400 font-bold text-lg mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Token Usage Efficiency Architecture
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Smart Resource Management:</h4>
                  <ul className="text-cyan-300 text-sm space-y-2">
                    <li>• <strong>Modular Loading:</strong> Only your plan's features are loaded</li>
                    <li>• <strong>Lazy Components:</strong> Modules load on-demand</li>
                    <li>• <strong>Smart Caching:</strong> Reduced API calls by 60%</li>
                    <li>• <strong>Progressive Enhancement:</strong> Features unlock smoothly</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-3">Performance Benefits:</h4>
                  <ul className="text-cyan-300 text-sm space-y-2">
                    <li>• <strong>Faster Load Times:</strong> 40% reduction in initial bundle</li>
                    <li>• <strong>Lower Memory Usage:</strong> Only active modules in memory</li>
                    <li>• <strong>Better UX:</strong> Instant access to available features</li>
                    <li>• <strong>Cost Optimization:</strong> Pay only for what you use</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Platform Upload Pricing Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Platform Upload Pricing</h2>
              <p className="text-gray-300 text-center mb-6">
                Available for Premium subscribers • Costs are separate from subscription plans
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4">Individual Platform Costs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <span className="text-gray-300">Spotify</span>
                      </div>
                      <span className="text-white font-bold">$5.99</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        <span className="text-gray-300">Apple Music</span>
                      </div>
                      <span className="text-white font-bold">$7.19</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-600 rounded"></div>
                        <span className="text-gray-300">Amazon Music</span>
                      </div>
                      <span className="text-white font-bold">$4.79</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                        <span className="text-gray-300">YouTube Music</span>
                      </div>
                      <span className="text-white font-bold">$3.59</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-600 rounded"></div>
                        <span className="text-gray-300">Deezer</span>
                      </div>
                      <span className="text-white font-bold">$4.79</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-4">
                  <h3 className="text-purple-400 font-medium mb-4">Multi-Platform Bundle</h3>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white">$26.35</div>
                    <div className="text-purple-400 text-sm">All 5 platforms</div>
                  </div>
                  <p className="text-gray-300 text-xs mb-4">
                    Upload to all streaming platforms simultaneously with one payment
                  </p>
                  <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-2">
                    <p className="text-green-400 text-xs text-center font-medium">
                      Save $1.40 vs individual uploads
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">What's Included</span>
                </div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Direct API integration with all platforms</li>
                  <li>• Automatic metadata and artwork inclusion</li>
                  <li>• OAuth authentication handled by Itone.studio</li>
                  <li>• Upload failure protection and retry logic</li>
                  <li>• No separate platform accounts or billing needed</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
</parameter>