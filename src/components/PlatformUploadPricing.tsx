import React from 'react';
import { Calculator, Upload, Info } from 'lucide-react';
import { Button } from './ui/button';
import { usePlatformUploadCosts } from '../hooks/useSubscription';

interface PlatformUploadPricingProps {
  onUpload?: (platform: string, cost: number) => void;
  className?: string;
}

export function PlatformUploadPricing({ onUpload, className }: PlatformUploadPricingProps) {
<<<<<<< HEAD
=======
  const { user } = useAuth();
  const { data: platinumSubscription } = usePlatinumSubscription(user?.id);
>>>>>>> origin/main
  const { data: uploadCosts = [] } = usePlatformUploadCosts();

  // Mock data for demo
  const mockCosts = [
    { id: '1', platform: 'youtube', base_cost: 2.99, itone_margin_percent: 20 },
    { id: '2', platform: 'spotify', base_cost: 4.99, itone_margin_percent: 20 },
    { id: '3', platform: 'deezer', base_cost: 3.99, itone_margin_percent: 20 },
    { id: '4', platform: 'apple_music', base_cost: 5.99, itone_margin_percent: 20 }
  ];

  const displayCosts = uploadCosts.length > 0 ? uploadCosts : mockCosts;

  const calculateTotalCost = (baseCost: number, marginPercent: number) => {
    const itoneFee = baseCost * (marginPercent / 100);
    return baseCost + itoneFee;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return (
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">YT</span>
          </div>
        );
      case 'spotify':
        return (
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">SP</span>
          </div>
        );
      case 'deezer':
        return (
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">DZ</span>
          </div>
        );
      case 'apple_music':
        return (
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">AM</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            <Upload className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  const formatPlatformName = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'YouTube';
      case 'spotify': return 'Spotify';
      case 'deezer': return 'Deezer';
      case 'apple_music': return 'Apple Music';
      default: return platform;
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="h-5 w-5 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Platform Upload Pricing</h3>
      </div>

      {/* Pricing Explanation */}
      <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="h-4 w-4 text-blue-400" />
          <span className="text-blue-400 font-medium">How Pricing Works</span>
        </div>
        <p className="text-gray-300 text-sm">
          Each platform has a base upload cost + 20% iTone service fee.
          Costs are charged per upload and billed separately from your subscription.
        </p>
      </div>

      {/* Platform Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {displayCosts.map((cost) => {
          const totalCost = calculateTotalCost(cost.base_cost, cost.itone_margin_percent);
          const itoneFee = totalCost - cost.base_cost;

          return (
            <div key={cost.id} className="bg-black/30 rounded-xl p-4 hover:bg-black/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(cost.platform)}
                  <span className="text-white font-medium">
                    {formatPlatformName(cost.platform)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    ${totalCost.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-xs">per upload</div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Platform fee:</span>
                  <span>${cost.base_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>iTone fee ({cost.itone_margin_percent}%):</span>
                  <span>${itoneFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-medium border-t border-white/10 pt-1">
                  <span>Total:</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>

              {onUpload && (
                <Button
                  onClick={() => onUpload(cost.platform, totalCost)}
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to {formatPlatformName(cost.platform)}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-platform Bundle */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium mb-1">Multi-Platform Bundle</h4>
            <p className="text-gray-300 text-sm">Upload to all platforms at once</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              ${displayCosts.reduce((total, cost) =>
                total + calculateTotalCost(cost.base_cost, cost.itone_margin_percent), 0
              ).toFixed(2)}
            </div>
            <div className="text-green-400 text-xs">Save 15%</div>
          </div>
        </div>
        {onUpload && (
          <Button
            onClick={() => onUpload('all', displayCosts.reduce((total, cost) =>
              total + calculateTotalCost(cost.base_cost, cost.itone_margin_percent), 0
            ) * 0.85)}
            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload to All Platforms
          </Button>
        )}
      </div>
    </div>
  );
}