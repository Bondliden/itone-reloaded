export interface StreamingPlatform {
  id: string;
  name: 'spotify' | 'amazon_music' | 'apple_music' | 'youtube_music' | 'deezer';
  display_name: string;
  api_base_cost: number;
  oauth_config: {
    client_id: string;
    scope: string;
    redirect_uri: string;
  };
  upload_requirements: {
    format: string;
    min_duration: number;
    max_duration: number;
    sample_rate: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface UserPlatformConnection {
  id: string;
  user_id: string;
  platform_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  platform_user_id: string;
  platform_username: string;
  connection_status: 'active' | 'expired' | 'revoked';
  created_at: string;
  updated_at: string;
  platform?: StreamingPlatform;
}

export interface PlatinumSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  base_subscription_cost: number;
  platform_access_cost: number;
  itone_margin: number;
  total_monthly_cost: number;
  upload_credits_remaining: number;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface UploadJob {
  id: string;
  user_id: string;
  recording_id?: string;
  platform_id: string;
  upload_status: 'pending' | 'processing' | 'completed' | 'failed';
  platform_track_id?: string;
  platform_url?: string;
  cost_used: number;
  metadata: Record<string, any>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  platform?: StreamingPlatform;
}

export interface CostTracking {
  id: string;
  user_id: string;
  month_year: string;
  estimated_costs: number;
  actual_costs: number;
  profit_margin: number;
  upload_count: number;
  created_at: string;
}

export interface PlatinumPricing {
  base_cost: number;
  platform_costs: number;
  itone_margin: number;
  total_cost: number;
}