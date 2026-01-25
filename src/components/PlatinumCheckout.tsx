<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Crown, Shield, Check, Loader2, Star, Users, Upload, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { usePlatinumPricing } from '../hooks/usePlatinum';
import { createCheckoutSession, redirectToCheckout } from '../lib/stripe';
import { toast } from './ui/toast';


interface PlatinumCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatinumCheckout({ isOpen, onClose }: PlatinumCheckoutProps) {
  const { user } = useAuth();

  const { data: pricing } = usePlatinumPricing();
=======
import React, { useState, useEffect } from 'react';
import { Crown, CreditCard, Shield, Check, Loader2, Star, Users, Upload, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../modules/auth';
import { useUserSubscription } from '../hooks/useSubscription';
import { createCheckoutSession, redirectToCheckout } from '../lib/stripe';
import { toast } from './ui/toast';
import { useLocation } from 'wouter';

interface PremiumCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  planName: 'Silver' | 'Gold' | 'Premium';
  planPrice: number;
}

export function PremiumCheckout({ isOpen, onClose, planName, planPrice }: PremiumCheckoutProps) {
  const { state: { user } } = useAuth();
  const [, setLocation] = useLocation();
  const { data: subscription } = useUserSubscription(user?.id);
>>>>>>> origin/main
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for successful Spotify connection on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify_connected') === 'true') {
      toast({
        title: "Spotify Connected!",
        description: "Your Spotify account has been successfully linked to iTone.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubscribe = async () => {
<<<<<<< HEAD
    if (!user || !pricing) return;

    setIsProcessing(true);
    try {
      // Create Stripe checkout session with integrated pricing
      const sessionId = await createCheckoutSession(
        'price_platinum_integrated', // Special price ID for integrated Platinum
        undefined, // Let Stripe create customer
        {
          metadata: {
            plan_type: 'platinum_integrated',
            user_id: user.id,
            base_cost: pricing.base_cost.toString(),
            platform_costs: pricing.platform_costs.toString(),
            itone_margin: pricing.itone_margin.toString(),
            total_cost: pricing.total_cost.toString()
=======
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create Stripe checkout session
      const sessionId = await createCheckoutSession(
        `price_${planName.toLowerCase()}`, // Price ID for selected plan
        undefined, // Let Stripe create customer
        {
          metadata: {
            plan_type: planName.toLowerCase(),
            user_id: user.id,
            plan_price: planPrice.toString()
>>>>>>> origin/main
          }
        }
      );

      // Redirect to Stripe Checkout
      await redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: <Zap className="h-5 w-5 text-purple-400" />,
      title: 'Ultra HD Recording',
      description: 'Professional-grade 4K video with lossless audio'
    },
    {
      icon: <Users className="h-5 w-5 text-blue-400" />,
      title: '4-Person Collaboration',
      description: 'Record with up to 4 friends simultaneously'
    },
    {
      icon: <Upload className="h-5 w-5 text-green-400" />,
      title: 'Integrated Platform Access',
      description: 'Direct uploads to Spotify, Apple Music, Amazon Music & more'
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-400" />,
      title: 'Professional Audio Suite',
      description: 'Auto-tune, reverb, mixing, and mastering tools'
    },
    {
      icon: <Shield className="h-5 w-5 text-cyan-400" />,
      title: '24/7 Priority Support',
      description: 'Dedicated support team and priority assistance'
    }
  ];

  if (!pricing) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
<<<<<<< HEAD
              <Crown className="h-6 w-6 text-purple-400" />
              <span>Platinum Subscription</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Integrated Pricing Breakdown */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-400/30">
            <h3 className="text-lg font-bold text-white mb-4 text-center">All-Inclusive Monthly Plan</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Platinum Subscription</span>
                <span className="text-white font-medium">${pricing.base_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Streaming Platform APIs</span>
                <span className="text-white font-medium">${pricing.platform_costs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">iTone Service Fee (20%)</span>
                <span className="text-white font-medium">${pricing.itone_margin.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/20 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Total Monthly</span>
                  <span className="text-2xl font-bold text-purple-400">${pricing.total_cost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-3">
              <p className="text-green-400 text-sm font-medium text-center">
                ✨ Includes 10 platform uploads per month • OAuth setup managed by iTone
=======
              {planName === 'Silver' ? <Star className="h-6 w-6 text-gray-400" /> :
               planName === 'Gold' ? <Crown className="h-6 w-6 text-yellow-400" /> :
               <Zap className="h-6 w-6 text-purple-400" />}
              <span>{planName} Subscription</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Plan Pricing */}
          <div className={`rounded-xl p-6 border ${
            planName === 'Silver' ? 'bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-400/30' :
            planName === 'Gold' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-400/30' :
            'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-4 text-center">{planName} Monthly Plan</h3>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-white mb-2">
                ${planPrice.toFixed(2)}
                <span className="text-lg text-gray-300 font-normal">/month</span>
              </div>
            </div>

            <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
              <p className="text-green-400 text-sm font-medium text-center">
                ✨ 7-day free trial included • Cancel anytime
>>>>>>> origin/main
              </p>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Everything Included</h3>
<<<<<<< HEAD
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1">
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
            <h4 className="text-white font-medium mb-3">Integrated Platform Access</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-300">Spotify</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
                <span className="text-gray-300">Amazon Music</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-800 rounded"></div>
                <span className="text-gray-300">Apple Music</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-gray-300">YouTube Music</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              No separate payments • No API setup required • Managed by iTone
            </p>
          </div>
=======
            <div className="space-y-3">
              {planName === 'Silver' && (
                <>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Unlimited recordings</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">2-person collaboration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">HD quality recording</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">MP3/MP4 downloads</span>
                  </div>
                </>
              )}
              {planName === 'Gold' && (
                <>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Everything in Silver</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">5-person collaboration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Super high quality recording</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Advanced audio effects</span>
                  </div>
                </>
              )}
              {planName === 'Premium' && (
                <>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Everything in Gold</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Platform upload capability</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Extra high-quality formats</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Professional audio suite</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">24/7 priority support</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Platform Upload Costs (Premium only) */}
          {planName === 'Premium' && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Platform Upload Pricing</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="text-gray-300">Spotify</span>
                  </div>
                  <span className="text-green-400 font-medium">$5.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-800 rounded"></div>
                    <span className="text-gray-300">Apple Music</span>
                  </div>
                  <span className="text-green-400 font-medium">$7.19</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                    <span className="text-gray-300">Amazon Music</span>
                  </div>
                  <span className="text-green-400 font-medium">$4.79</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-gray-300">YouTube Music</span>
                  </div>
                  <span className="text-green-400 font-medium">$3.59</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span className="text-gray-300">Deezer</span>
                  </div>
                  <span className="text-green-400 font-medium">$4.79</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-2 mt-2">
                  <span className="text-purple-400 font-bold">All Platforms</span>
                  <span className="text-purple-400 font-bold">$26.35</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">
                Upload costs are separate from subscription • Charged per song • Managed by Itone.studio
              </p>
            </div>
          )}
>>>>>>> origin/main

          {/* Security & Trial Info */}
          <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Secure & Risk-Free</span>
            </div>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• 7-day free trial included</li>
              <li>• Cancel anytime, no hidden fees</li>
              <li>• Secure payment processing via Stripe</li>
              <li>• Your platform accounts remain private</li>
            </ul>
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={isProcessing}
<<<<<<< HEAD
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-full"
=======
            className={`w-full font-bold py-4 text-lg rounded-full ${
              planName === 'Silver' ? 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600' :
              planName === 'Gold' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' :
              'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            } text-white`}
>>>>>>> origin/main
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
<<<<<<< HEAD
                <Crown className="h-5 w-5 mr-2" />
                Start 7-Day Free Trial
              </>
            )}
          </Button>

=======
                {planName === 'Silver' ? <Star className="h-5 w-5 mr-2" /> :
                 planName === 'Gold' ? <Crown className="h-5 w-5 mr-2" /> :
                 <Zap className="h-5 w-5 mr-2" />}
                Start {planName} Trial
              </>
            )}
          </Button>
          
>>>>>>> origin/main
          <p className="text-gray-400 text-xs text-center">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Your trial starts immediately with full access to all features.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}