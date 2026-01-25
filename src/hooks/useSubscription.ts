import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SubscriptionPlan, UserSubscription, PlatformUploadCost } from '../types/subscription';

// Mock data for demo
const mockPlans = [
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
    platform_uploads: false,
    created_at: new Date().toISOString()
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
    platform_uploads: false,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
<<<<<<< HEAD
=======
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
    platform_uploads: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
>>>>>>> origin/main
    name: 'Platinum',
    price_monthly: 29.99,
    features: [
      'Ultra HD recording',
      'Lossless downloads',
      '4-person collaboration',
      'Professional audio suite',
<<<<<<< HEAD
      'Platform uploads',
      '24/7 support',
      'Analytics dashboard'
=======
      'Unlimited platform uploads',
      '24/7 support',
      'Advanced analytics',
      'API access'
>>>>>>> origin/main
    ],
    max_collaborators: 4,
    download_quality: 'ultra',
    platform_uploads: true,
    created_at: new Date().toISOString()
  }
];

// Subscription Plans Hooks
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      if (!supabase) return mockPlans as SubscriptionPlan[];
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    }
  });
}

// User Subscription Hooks
export function useUserSubscription(userId?: string) {
  return useQuery({
    queryKey: ['userSubscription', userId],
    queryFn: async () => {
      if (!userId || !supabase) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
<<<<<<< HEAD
        .single();
=======
        .maybeSingle();
>>>>>>> origin/main
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription | null;
    },
    enabled: !!userId
  });
}

// Platform Upload Costs
export function usePlatformUploadCosts() {
  return useQuery({
    queryKey: ['platformUploadCosts'],
    queryFn: async () => {
      if (!supabase) {
        return [
          { id: '1', platform: 'youtube', base_cost: 2.99, itone_margin_percent: 20, updated_at: new Date().toISOString() },
          { id: '2', platform: 'spotify', base_cost: 4.99, itone_margin_percent: 20, updated_at: new Date().toISOString() },
          { id: '3', platform: 'deezer', base_cost: 3.99, itone_margin_percent: 20, updated_at: new Date().toISOString() },
          { id: '4', platform: 'apple_music', base_cost: 5.99, itone_margin_percent: 20, updated_at: new Date().toISOString() }
        ] as PlatformUploadCost[];
      }
      
      const { data, error } = await supabase
        .from('platform_upload_costs')
        .select('*')
        .order('platform');
      
      if (error) throw error;
      return data as PlatformUploadCost[];
    }
  });
}

// Create Subscription
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      planId, 
      stripeSubscriptionId, 
      stripeCustomerId 
    }: {
      userId: string;
      planId: string;
      stripeSubscriptionId: string;
      stripeCustomerId: string;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId,
          status: 'trialing',
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days trial
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userSubscription', variables.userId] });
    }
  });
}

// Update Subscription
export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      updates 
    }: {
      subscriptionId: string;
      updates: Partial<UserSubscription>;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userSubscription', data.user_id] });
    }
  });
}

// Calculate Upload Cost
export function useCalculateUploadCost() {
  return useMutation({
    mutationFn: async ({ platform }: { platform: string }) => {
      if (!supabase) {
        // Mock calculation
        const baseCosts = { youtube: 2.99, spotify: 4.99, deezer: 3.99, apple_music: 5.99 };
        const baseCost = baseCosts[platform as keyof typeof baseCosts] || 3.99;
        const marginPercent = 20;
        const itoneFee = baseCost * (marginPercent / 100);
        const totalCost = baseCost + itoneFee;
        
        return { platform, baseCost, itoneFee, totalCost, marginPercent };
      }
      
      const { data, error } = await supabase
        .from('platform_upload_costs')
        .select('*')
        .eq('platform', platform)
        .single();
      
      if (error) throw error;
      
      const baseCost = data.base_cost;
      const marginPercent = data.itone_margin_percent;
      const itoneFee = baseCost * (marginPercent / 100);
      const totalCost = baseCost + itoneFee;
      
      return {
        platform,
        baseCost,
        itoneFee,
        totalCost,
        marginPercent
      };
    }
  });
}