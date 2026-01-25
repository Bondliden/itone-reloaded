import React from 'react';
import { Crown, Check, Star, Users, Upload, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';

export function PlatinumUpgrade() {
  const { user } = useAuth();
  const isPlatinum = user?.subscriptionTier === 'platinum';

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'HD Quality Recordings',
      description: 'Record in 1080p with crystal clear audio',
      free: false
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Collaborative Sessions',
      description: 'Record with up to 4 friends simultaneously',
      free: false
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: 'Direct Platform Uploads',
      description: 'Upload directly to YouTube, Spotify, and more',
      free: false
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Advanced Audio Effects',
      description: 'Professional auto-tune, reverb, and mixing',
      free: false
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: 'Priority Support',
      description: '24/7 premium customer support',
      free: false
    }
  ];

  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    toast({
      title: "Redirecting to Payment",
      description: "You'll be redirected to complete your Platinum subscription.",
    });
  };

  if (isPlatinum) {
    return (
      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30">
        <div className="text-center">
          <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Platinum Member</h2>
          <p className="text-gray-300">
            You have access to all premium features. Enjoy your karaoke experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Platinum
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span>Upgrade to Platinum</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Pricing */}
          <div className="text-center bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-400/30">
            <div className="text-4xl font-bold text-white mb-2">$19.99</div>
            <div className="text-gray-300">per month</div>
            <div className="text-yellow-400 text-sm mt-1">+ 30% platform upload fees</div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Premium Features</h3>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-yellow-400 mt-1">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
                <Check className="h-5 w-5 text-green-400 mt-1" />
              </div>
            ))}
          </div>

          {/* Platform Integration Details */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Platform Upload Pricing</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">YouTube Upload</span>
                <span className="text-white">$2.99 + 30% iTone fee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Spotify Upload</span>
                <span className="text-white">$4.99 + 30% iTone fee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Multi-platform</span>
                <span className="text-white">$7.99 + 30% iTone fee</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 text-lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Start Platinum Subscription
          </Button>
          
          <p className="text-gray-400 text-xs text-center">
            Cancel anytime. No hidden fees. 7-day free trial included.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}