import React from 'react';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useUserSubscription } from '../hooks/useSubscription';

interface FeatureGateProps {
  feature: 'hd_recording' | 'collaboration' | 'platform_uploads' | 'ultra_hd' | 'advanced_effects';
  requiredPlan: 'Silver' | 'Gold' | 'Platinum';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, requiredPlan, children, fallback }: FeatureGateProps) {
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription(user?.id);

  const hasAccess = () => {
    if (!subscription || subscription.status !== 'active') return false;
    
    const planHierarchy = { 'Silver': 1, 'Gold': 2, 'Platinum': 3 };
    const userPlanLevel = planHierarchy[subscription.plan?.name as keyof typeof planHierarchy] || 0;
    const requiredLevel = planHierarchy[requiredPlan];
    
    return userPlanLevel >= requiredLevel;
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'hd_recording':
        return 'Record in high definition with crystal clear audio quality';
      case 'collaboration':
        return 'Collaborate with up to 4 people in real-time recording sessions';
      case 'platform_uploads':
        return 'Upload your recordings directly to YouTube, Spotify, and other platforms';
      case 'ultra_hd':
        return 'Record in Ultra HD with professional-grade audio processing';
      case 'advanced_effects':
        return 'Access professional audio effects like auto-tune, reverb, and mixing';
      default:
        return 'This premium feature requires a subscription';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Silver': return <Star className="h-6 w-6 text-gray-400" />;
      case 'Gold': return <Crown className="h-6 w-6 text-yellow-400" />;
<<<<<<< HEAD
=======
      case 'Pro': return <Zap className="h-6 w-6 text-blue-400" />;
>>>>>>> origin/main
      case 'Platinum': return <Zap className="h-6 w-6 text-purple-400" />;
      default: return <Lock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Silver': return 'from-gray-600 to-gray-500';
      case 'Gold': return 'from-yellow-600 to-orange-600';
<<<<<<< HEAD
=======
      case 'Pro': return 'from-blue-600 to-cyan-600';
>>>>>>> origin/main
      case 'Platinum': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
              <Lock className="h-8 w-8 text-white mx-auto mb-2" />
              <p className="text-white font-medium text-sm">
                {requiredPlan} Required
              </p>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getPlanIcon(requiredPlan)}
            <span>{requiredPlan} Feature</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Unlock This Feature</h3>
            <p className="text-gray-300">
              {getFeatureDescription()}
            </p>
          </div>

          <div className={`bg-gradient-to-r ${getPlanColor(requiredPlan)}/20 border border-current/30 rounded-xl p-6 text-center`}>
            <div className="flex items-center justify-center space-x-2 mb-3">
              {getPlanIcon(requiredPlan)}
              <span className="text-2xl font-bold text-white">{requiredPlan} Plan</span>
            </div>
            <p className="text-gray-300 mb-4">
              Get access to this feature and many more with {requiredPlan}
            </p>
            <Button className={`bg-gradient-to-r ${getPlanColor(requiredPlan)} hover:opacity-90 text-white font-semibold px-8 py-3`}>
              Upgrade to {requiredPlan}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              7-day free trial • Cancel anytime • Instant access
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}