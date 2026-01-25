import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  StreamingPlatform, 
  UserPlatformConnection, 
  PlatinumSubscription, 
  UploadJob,
  PlatinumPricing 
} from '../types/platinum';

// Streaming Platforms
export function useStreamingPlatforms() {
  return useQuery({
    queryKey: ['streamingPlatforms'],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured()) {
        // Return mock data when Supabase is not configured
        return [
          {
            id: '1',
            name: 'spotify',
            display_name: 'Spotify',
            api_base_cost: 4.99,
            oauth_config: {},
            upload_requirements: {},
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'amazon_music',
            display_name: 'Amazon Music',
            api_base_cost: 3.99,
            oauth_config: {},
            upload_requirements: {},
            is_active: true,
            created_at: new Date().toISOString()
          }
        ] as StreamingPlatform[];
      }
      const { data, error } = await supabase
        .from('streaming_platforms')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      
      if (error) throw error;
      return data as StreamingPlatform[];
    }
  });
}

// User Platform Connections
export function useUserPlatformConnections(userId?: string) {
  return useQuery({
    queryKey: ['userPlatformConnections', userId],
    queryFn: async () => {
      if (!userId || !supabase || !isSupabaseConfigured()) return [];
      
      const { data, error } = await supabase
        .from('user_platform_connections')
        .select(`
          *,
          platform:streaming_platforms(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserPlatformConnection[];
    },
    enabled: !!userId
  });
}

// Platinum Subscription
export function usePlatinumSubscription(userId?: string) {
  return useQuery({
    queryKey: ['platinumSubscription', userId],
    queryFn: async () => {
      if (!userId || !supabase || !isSupabaseConfigured()) return null;
      
      const { data, error } = await supabase
        .from('platinum_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as PlatinumSubscription | null;
    },
    enabled: !!userId
  });
}

// Calculate Platinum Pricing
export function usePlatinumPricing() {
  return useQuery({
    queryKey: ['platinumPricing'],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured()) {
        // Return mock pricing when Supabase is not configured
        return {
          base_cost: 29.99,
          platform_costs: 15.00,
          itone_margin: 9.00,
          total_cost: 53.99
        } as PlatinumPricing;
      }
      const { data, error } = await supabase
        .rpc('calculate_platinum_pricing');
      
      if (error) throw error;
      return data[0] as PlatinumPricing;
    }
  });
}

// Connect Platform
export function useConnectPlatform() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      platformId, 
      accessToken, 
      refreshToken, 
      expiresAt,
      platformUserId,
      platformUsername 
    }: {
      userId: string;
      platformId: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      platformUserId: string;
      platformUsername: string;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('user_platform_connections')
        .upsert({
          user_id: userId,
          platform_id: platformId,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          connection_status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPlatformConnections', variables.userId] });
    }
  });
}

// Create Upload Job
export function useCreateUploadJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      recordingId, 
      platformIds,
      metadata 
    }: {
      userId: string;
      recordingId: string;
      platformIds: string[];
      metadata: Record<string, any>;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const jobs = platformIds.map(platformId => ({
        user_id: userId,
        recording_id: recordingId,
        platform_id: platformId,
        metadata
      }));
      const { data, error } = await supabase
        .from('upload_jobs')
        .insert(jobs)
        .select(`
          *,
          platform:streaming_platforms(*)
        `);
      
      if (error) throw error;
      return data as UploadJob[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['uploadJobs', variables.userId] });
    }
  });
}

// Get Upload Jobs
export function useUploadJobs(userId?: string) {
  return useQuery({
    queryKey: ['uploadJobs', userId],
    queryFn: async () => {
      if (!userId || !supabase) return [];
      
      const { data, error } = await supabase
        .from('upload_jobs')
        .select(`
          *,
          platform:streaming_platforms(*),
          recording:recordings(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UploadJob[];
    },
    enabled: !!userId
  });
}

// Create Platinum Subscription
export function useCreatePlatinumSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      stripeSubscriptionId,
      pricing 
    }: {
      userId: string;
      stripeSubscriptionId: string;
      pricing: PlatinumPricing;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('platinum_subscriptions')
        .insert({
          user_id: userId,
          stripe_subscription_id: stripeSubscriptionId,
          base_subscription_cost: pricing.base_cost,
          platform_access_cost: pricing.platform_costs,
          itone_margin: pricing.itone_margin,
          total_monthly_cost: pricing.total_cost,
          upload_credits_remaining: 10, // 10 uploads per month included
          status: 'trialing'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platinumSubscription', variables.userId] });
    }
  });
}
