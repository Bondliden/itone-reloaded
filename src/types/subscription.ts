export interface SubscriptionPlan {
  id: string;
<<<<<<< HEAD
  name: 'Silver' | 'Gold' | 'Platinum';
=======
  name: 'Silver' | 'Gold' | 'Pro' | 'Platinum';
>>>>>>> origin/main
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
  updated_at: string;
}

export interface UploadTransaction {
  id: string;
  user_id: string;
  recording_id?: string;
  platform: string;
  base_cost: number;
  itone_fee: number;
  total_cost: number;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}