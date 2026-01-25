export interface SubscriptionPlan {
  id: string;
  name: 'Silver' | 'Gold' | 'Pro' | 'Platinum';
  price_monthly: number;
  features: string[];
  max_collaborators: number;
  download_quality: 'standard' | 'high' | 'ultra';
  platform_uploads: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface PlatformUploadCost {
  id: string;
  platform: 'youtube' | 'spotify' | 'deezer' | 'apple_music';
  base_cost: number;
  itone_margin_percent: number;
}
