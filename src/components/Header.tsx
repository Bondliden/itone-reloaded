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
      ]
    }
  ];

  const handleUpgrade = (planName: string, price: number) => {
    toast({
      title: "Subscription Upgrade",
      description: `Starting ${planName} plan checkout for $${price}/month...`,
    });
  };

  if (!state.isAuthenticated || !state.user) {
    return (
      <header className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Mic className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">iTone.studio</span>
            </div>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Sign In
            </Button>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentTier[0].toUpperCase()}
            </div>
            <span className="text-2xl font-bold text-white">iTone.studio</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-purple-400">
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-black/90 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`relative bg-gradient-to-br ${plan.color} backdrop-blur-lg rounded-xl p-6 border ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black font-bold">
                          Most Popular
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        {plan.icon}
                        {plan.current && (
                          <Badge variant="secondary" className="bg-white/10 text-white">Current</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-2xl font-bold text-white mb-4">${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-400" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade(plan.name, plan.price)}
                        disabled={plan.current}
                        className="w-full"
                      >
                        {plan.current ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-lg">
                <Avatar className="h-8 w-8 border-2 border-purple-400">
                  <AvatarImage src={state.user.avatar} alt={state.user.name} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {state.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <div className="text-white font-medium text-sm">{state.user.name}</div>
                  <div className="text-gray-400 text-xs">{state.user.email}</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-purple-400">
                    <AvatarImage src={state.user.avatar} alt={state.user.name} />
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {state.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-white">{state.user.name}</h3>
                    <p className="text-gray-300">{state.user.email}</p>
                    {state.user.bio && <p className="text-gray-400 text-sm mt-1">{state.user.bio}</p>}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => actions.logout()}
                  className="w-full text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
