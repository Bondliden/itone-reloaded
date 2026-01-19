import React from 'react';
import { Link } from 'wouter';
import { Mic, LogOut, User, Crown, Star, Zap, CreditCard, Check, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { useAuth } from '../modules/auth';
import { LanguageSelector } from '../modules/i18n';
import { toast } from './ui/toast';

export function Header() {
  const { state, actions } = useAuth();

  const currentTier = state.user?.subscriptionTier || 'free';

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      current: currentTier === 'free',
      color: 'from-gray-600/20 to-gray-500/20 border-gray-400/30',
      icon: <User className="h-6 w-6 text-gray-400" />,
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
      icon: <Star className="h-6 w-6 text-gray-400" />,
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
      icon: <Crown className="h-6 w-6 text-yellow-400" />,
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
      icon: <Zap className="h-6 w-6 text-purple-400" />,
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

  const handleUpgrade = (planName: string, price: number) => {
    toast({
      title: "Subscription Upgrade",
      description: `Starting ${planName} plan checkout for $${price}/month...`,
    });
  };

  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  return (
    <header className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            </div>
            <span className="text-2xl font-bold text-white">Itone.studio</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-purple-400"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-black/90 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Subscription Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-gradient-to-br ${plan.color} backdrop-blur-lg rounded-xl p-6 border ${
                        plan.popular ? 'ring-2 ring-yellow-400' : ''
                      }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black font-bold">
                          Most Popular
                        </Badge>
                      )}
                      
                      <div className="text-center mb-6">
                        <div className="flex justify-center mb-3">{plan.icon}</div>
                        <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-white mb-1">
                          ${plan.price}
                          {plan.price > 0 && <span className="text-sm text-gray-400">/month</span>}
                        </div>
                        {plan.price === 0 && <div className="text-gray-400 text-sm">Forever</div>}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleUpgrade(plan.name, plan.price)}
                        disabled={plan.current}
                        className={`w-full ${
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
                <div className="bg-black/30 rounded-xl p-6">
                  <h3 className="text-white font-bold text-xl mb-4 text-center">Complete Feature Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white font-medium py-3">Features</th>
                          <th className="text-center text-gray-400 font-medium py-3">Free</th>
                          <th className="text-center text-gray-400 font-medium py-3">Silver</th>
                          <th className="text-center text-yellow-400 font-medium py-3">Gold</th>
                          <th className="text-center text-purple-400 font-medium py-3">Premium</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="text-gray-300 py-2 font-medium">Monthly Recordings</td>
                          <td className="text-center py-2 text-yellow-400">4 YouTube</td>
                          <td className="text-center py-2 text-green-400">Unlimited</td>
                          <td className="text-center py-2 text-green-400">Unlimited</td>
                          <td className="text-center py-2 text-green-400">Unlimited</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="text-gray-300 py-2 font-medium">Recording Quality</td>
                          <td className="text-center py-2 text-gray-400">Standard</td>
                          <td className="text-center py-2 text-yellow-400">HD</td>
                          <td className="text-center py-2 text-yellow-400">Super HD</td>
                          <td className="text-center py-2 text-purple-400">Extra High + FLAC</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="text-gray-300 py-2 font-medium">Collaboration</td>
                          <td className="text-center py-2 text-red-400">Solo only</td>
                          <td className="text-center py-2 text-yellow-400">2 people total</td>
                          <td className="text-center py-2 text-green-400">5 people total</td>
                          <td className="text-center py-2 text-green-400">5 people total</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="text-gray-300 py-2 font-medium">Key Transpose</td>
                          <td className="text-center py-2 text-green-400">✓ Full range</td>
                          <td className="text-center py-2 text-green-400">✓ Full range</td>
                          <td className="text-center py-2 text-green-400">✓ Full range</td>
                          <td className="text-center py-2 text-green-400">✓ Full range</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="text-gray-300 py-2 font-medium">Sound Effects</td>
                          <td className="text-center py-2 text-green-400">5 professional</td>
                          <td className="text-center py-2 text-green-400">5 professional</td>
                          <td className="text-center py-2 text-yellow-400">Advanced suite</td>
                          <td className="text-center py-2 text-purple-400">Professional suite</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="text-gray-300 py-2 font-medium">Platform Uploads</td>
                          <td className="text-center py-2 text-red-400">✗</td>
                          <td className="text-center py-2 text-red-400">✗</td>
                          <td className="text-center py-2 text-red-400">✗</td>
                          <td className="text-center py-2 text-green-400">✓ Available</td>
                        </tr>
                        <tr>
                          <td className="text-gray-300 py-2 font-medium">Support</td>
                          <td className="text-center py-2 text-gray-400">Community</td>
                          <td className="text-center py-2 text-yellow-400">Email</td>
                          <td className="text-center py-2 text-yellow-400">Priority</td>
                          <td className="text-center py-2 text-purple-400">24/7</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Platform Upload Costs */}
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-6">
                  <h3 className="text-purple-400 font-bold text-xl mb-4 text-center">🎵 Platform Upload Costs (Premium Only)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <span className="text-white font-medium">Spotify</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">$5.99</div>
                      <div className="text-gray-400 text-xs">per song</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        <span className="text-white font-medium">Apple Music</span>
                      </div>
                      <div className="text-2xl font-bold text-white">$7.19</div>
                      <div className="text-gray-400 text-xs">per song</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-orange-600 rounded"></div>
                        <span className="text-white font-medium">Amazon Music</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-400">$4.79</div>
                      <div className="text-gray-400 text-xs">per song</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                        <span className="text-white font-medium">YouTube Music</span>
                      </div>
                      <div className="text-2xl font-bold text-red-400">$3.59</div>
                      <div className="text-gray-400 text-xs">per song</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-purple-600 rounded"></div>
                        <span className="text-white font-medium">Deezer</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">$4.79</div>
                      <div className="text-gray-400 text-xs">per song</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">All Platforms</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">$26.35</div>
                      <div className="text-yellow-400 text-xs">bundle price</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">What's Included in Premium</span>
                    </div>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Direct API integration with all streaming platforms</li>
                      <li>• Automatic metadata and artwork inclusion</li>
                      <li>• OAuth authentication handled by Itone.studio</li>
                      <li>• Upload failure protection and retry logic</li>
                      <li>• No separate platform accounts or billing needed</li>
                      <li>• Upload costs are separate from your monthly subscription</li>
                    </ul>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-purple-400">
              <AvatarImage src={state.user.avatar} alt={state.user.displayName} />
              <AvatarFallback className="bg-purple-600 text-white">
                {state.user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className="text-white font-medium text-sm">{state.user.displayName}</div>
              <div className="text-gray-400 text-xs">@{state.user.username}</div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={actions.logout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}