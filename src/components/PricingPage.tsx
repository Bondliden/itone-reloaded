import React, { useState } from 'react';
import { Check, Crown, Star, Zap, Users, Upload, Music, Video, Headphones, Shield, Globe, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PlatinumCheckout } from './PlatinumCheckout';
import { useAuth } from '../modules/auth';
import { useSubscriptionPlans, useUserSubscription } from '../hooks/useSubscription';
import { usePlatinumPricing } from '../hooks/usePlatinum';
import { toast } from './ui/toast';

export function PricingPage() {
  const { state: { user } } = useAuth();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: userSubscription } = useUserSubscription(user?.id);
  const { data: platinumPricing } = usePlatinumPricing();
  const [showPlatinumCheckout, setShowPlatinumCheckout] = useState(false);

  // Mock plans for demo
  const mockPlans = [
    {
      id: '0',
      name: 'Free',
      price_monthly: 0,
      features: [
        '4 YouTube recordings per month',
        'Key transpose (-12 to +12)',
        'Basic sound effects',
        'Standard quality downloads',
        'Community support'
      ],
      max_collaborators: 1,
      download_quality: 'standard',
      platform_uploads: false
    },
    {
      id: '1',
      name: 'Silver',
      price_monthly: 9.99,
      features: [
        'Basic recording',
        'MP3/MP4 downloads',
        '2-person collaboration',
        'Standard quality',
        'Email support'
      ],
      max_collaborators: 2,
      download_quality: 'standard',
      platform_uploads: false
    },
    {
      id: '2',
      name: 'Gold',
      price_monthly: 19.99,
      features: [
        'HD recording',
        'High-quality downloads',
        '4-person collaboration',
        'Advanced audio effects',
        'Priority support',
        'Cloud storage'
      ],
      max_collaborators: 4,
      download_quality: 'high',
      platform_uploads: false
    },
    {
      id: '3',
      name: 'Pro',
      price_monthly: 24.99,
      features: [
        'HD recording',
        'High-quality downloads',
        '4-person collaboration',
        'Advanced audio effects',
        'Basic platform uploads',
        'Priority support',
        'Cloud storage',
        'Analytics dashboard'
      ],
      max_collaborators: 4,
      download_quality: 'high',
      platform_uploads: true
    },
    {
      id: '4',
      name: 'Platinum',
      price_monthly: 29.99,
      features: [
        'Ultra HD recording',
        'Lossless downloads',
        '4-person collaboration',
        'Professional audio suite',
        'Unlimited platform uploads',
        '24/7 support',
        'Advanced analytics',
        'API access'
      ],
      max_collaborators: 4,
      download_quality: 'ultra',
      platform_uploads: true
    }
  ];

  const displayPlans = plans.length > 0 ? plans : mockPlans;

  const handleSubscribe = async (planName: string) => {
    if (planName === 'Platinum') {
      setShowPlatinumCheckout(true);
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would integrate with Stripe
    toast({
      title: "Redirecting to Payment",
      description: `Setting up your ${planName} subscription...`,
    });

    // Simulate Stripe checkout
    setTimeout(() => {
      toast({
        title: "Subscription Activated!",
        description: `Welcome to ${planName}! Your 7-day free trial has started.`,
      });
    }, 2000);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Silver': return <Star className="h-8 w-8 text-gray-400" />;
      case 'Gold': return <Crown className="h-8 w-8 text-yellow-400" />;
      case 'Pro': return <Zap className="h-8 w-8 text-blue-400" />;
      case 'Platinum': return <Zap className="h-8 w-8 text-purple-400" />;
      default: return <Music className="h-8 w-8 text-gray-400" />;
    }
  };

  const getPlanGradient = (planName: string) => {
    switch (planName) {
      case 'Silver': return 'from-gray-600/20 to-gray-500/20 border-gray-400/30';
      case 'Gold': return 'from-yellow-600/20 to-orange-600/20 border-yellow-400/30';
      case 'Pro': return 'from-blue-600/20 to-cyan-600/20 border-blue-400/30';
      case 'Platinum': return 'from-purple-600/20 to-pink-600/20 border-purple-400/30';
      default: return 'from-gray-600/20 to-gray-500/20 border-gray-400/30';
    }
  };

  const getCollaborationText = (planName: string) => {
    switch (planName) {
      case 'Silver': return 'Sing with 1 friend (2 people total)';
      case 'Gold': return 'Sing with up to 3 friends (4 people total)';
      case 'Platinum': return 'Sing with up to 3 friends (4 people total)';
      default: return 'Solo recording only';
    }
  };

  const getQualityText = (planName: string) => {
    switch (planName) {
      case 'Silver': return 'Standard quality recording';
      case 'Gold': return 'HD quality recording';
      case 'Platinum': return 'Ultra HD quality recording';
      default: return 'Basic quality';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return userSubscription?.plan?.name === planName;
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('recording') || feature.includes('HD') || feature.includes('Ultra')) {
      return <Video className="h-4 w-4 text-blue-400" />;
    }
    if (feature.includes('collaboration') || feature.includes('person')) {
      return <Users className="h-4 w-4 text-green-400" />;
    }
    if (feature.includes('upload') || feature.includes('Platform')) {
      return <Upload className="h-4 w-4 text-purple-400" />;
    }
    if (feature.includes('audio') || feature.includes('effects')) {
      return <Headphones className="h-4 w-4 text-pink-400" />;
    }
    return <Check className="h-4 w-4 text-green-400" />;
  };
  const getPlatinumPrice = () => {
    return platinumPricing?.total_cost || 53.99;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Unlock the full potential of iTone with our subscription plans. 
          Start with a 7-day free trial on any plan.
        </p>
      </div>

      {/* Current Subscription Status */}
      {userSubscription && (
        <div className={`bg-gradient-to-r ${getPlanGradient(userSubscription.plan?.name || '')} backdrop-blur-lg rounded-2xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPlanIcon(userSubscription.plan?.name || '')}
              <div>
                <h3 className="text-xl font-bold text-white">
                  Current Plan: {userSubscription.plan?.name}
                </h3>
                <p className="text-gray-300">
                  {userSubscription.status === 'trialing' ? 'Free trial' : 'Active subscription'} • 
                  Renews {new Date(userSubscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Manage Subscription
            </Button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-gradient-to-b ${getPlanGradient(plan.name)} backdrop-blur-lg rounded-2xl p-8 border relative ${
              plan.name === 'Pro' ? 'transform scale-105 shadow-2xl' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.name === 'Pro' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
              </div>
            )}

            {/* Integrated Badge for Platinum */}
            {plan.name === 'Platinum' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  ALL-INCLUSIVE
                </div>
              </div>
            )}
            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.name)}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-white mb-1">
                ${plan.name === 'Platinum' ? getPlatinumPrice().toFixed(2) : plan.price_monthly}
                <span className="text-lg text-gray-300 font-normal">/month</span>
              </div>
              <p className="text-gray-300 text-sm">
                {plan.name === 'Platinum' ? 'Includes platform access • 7-day free trial' : '7-day free trial included'}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  {getFeatureIcon(feature)}
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
              
              {/* Key Feature Highlights */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                {/* Transpose Feature */}
                <div className="flex items-center space-x-3">
                  <Music className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm">
                    Key transpose (-12 to +12 semitones)
                  </span>
                </div>
                
                {/* Collaboration Feature */}
                <div className="flex items-center space-x-3">
                  <UserPlus className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">
                    {getCollaborationText(plan.name)}
                  </span>
                </div>
                
                {/* Recording Quality */}
                <div className="flex items-center space-x-3">
                  <Video className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">
                    {getQualityText(plan.name)}
                  </span>
                </div>
                
                {/* Platform Publishing */}
                {plan.platform_uploads && (
                  <div className="flex items-center space-x-3">
                    <Upload className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">Publish to Spotify, Apple Music & more</span>
                  </div>
                )}
                {!plan.platform_uploads && (
                  <div className="flex items-center space-x-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500 text-sm line-through">Platform publishing</span>
                  </div>
                )}
              </div>

              {/* Platinum Integration Details */}
              {plan.name === 'Platinum' && platinumPricing && (
                <div className="pt-3 border-t border-white/10">
                  <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg p-3">
                    <h4 className="text-green-400 font-medium text-sm mb-2">Integrated Platform Access</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Platform bundle:</span>
                        <span>${platinumPricing.platform_costs.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>10 uploads/month:</span>
                        <span className="text-green-400">Included</span>
                      </div>
                      <div className="flex justify-between font-medium text-white">
                        <span>Total value:</span>
                        <span>${(platinumPricing.platform_costs + 50).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => handleSubscribe(plan.name)}
              disabled={isCurrentPlan(plan.name)}
              className={`w-full py-3 font-semibold text-lg rounded-full transition-all duration-200 transform hover:scale-105 ${
                isCurrentPlan(plan.name)
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : plan.name === 'Silver'
                  ? 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white'
                  : plan.name === 'Gold'
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {isCurrentPlan(plan.name) ? 'Current Plan' : `Start ${plan.name} Trial`}
            </Button>

          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white font-medium py-3">Features</th>
                <th className="text-center text-gray-400 font-medium py-3">Silver</th>
                <th className="text-center text-yellow-400 font-medium py-3">Gold</th>
                <th className="text-center text-purple-400 font-medium py-3">Platinum</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/10">
                <td className="text-gray-300 py-3">Key Transpose</td>
                <td className="text-center py-3">
                  <CheckCircle className="h-4 w-4 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3">
                  <CheckCircle className="h-4 w-4 text-green-400 mx-auto" />
                </td>
                <td className="text-center py-3">
                  <CheckCircle className="h-4 w-4 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="text-gray-300 py-3">Recording Quality</td>
                <td className="text-center py-3">
                  <span className="text-gray-400">Standard</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-yellow-400">HD</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-purple-400">Ultra HD</span>
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="text-gray-300 py-3">Collaboration</td>
                <td className="text-center py-3">
                  <span className="text-gray-400">2 people total</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-yellow-400">4 people total</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-purple-400">4 people total</span>
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="text-gray-300 py-3">Platform Publishing</td>
                <td className="text-center py-3">
                  <span className="text-red-400">✗</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-red-400">✗</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-blue-400">✓ 5 uploads/month</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-green-400">✓ Spotify, Apple Music, etc.</span>
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="text-gray-300 py-3">Audio Effects</td>
                <td className="text-center py-3">
                  <span className="text-gray-400">Basic</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-yellow-400">Advanced</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-purple-400">Professional</span>
                </td>
              </tr>
              <tr>
                <td className="text-gray-300 py-3">Support</td>
                <td className="text-center py-3">
                  <span className="text-gray-400">Email</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-yellow-400">Priority</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-purple-400">24/7</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-300 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">What happens to my recordings?</h3>
              <p className="text-gray-300 text-sm">
                All your recordings are permanently saved. Downgrading only affects future recording quality.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">How do platform uploads work?</h3>
              <p className="text-gray-300 text-sm">
                Platinum users can upload directly to YouTube, Spotify, and more. Each upload has a separate fee.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Is there a free trial?</h3>
              <p className="text-gray-300 text-sm">
                Yes! All plans include a 7-day free trial. Cancel anytime during the trial period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platinum Checkout Dialog */}
      <PlatinumCheckout 
        isOpen={showPlatinumCheckout} 
        onClose={() => setShowPlatinumCheckout(false)} 
      />
    </div>
  );
}