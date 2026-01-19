/*
  # Subscription System Implementation

  1. New Tables
    - `subscription_plans` - Available subscription tiers
      - `id` (uuid, primary key)
      - `name` (text) - Silver, Gold, Platinum
      - `price_monthly` (decimal)
      - `features` (jsonb)
      - `max_collaborators` (integer)
      - `download_quality` (text)
      - `platform_uploads` (boolean)
      - `created_at` (timestamp)
    
    - `user_subscriptions` - User subscription records
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `plan_id` (uuid, references subscription_plans)
      - `stripe_subscription_id` (text)
      - `stripe_customer_id` (text)
      - `status` (text) - active, cancelled, expired, past_due
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `cancel_at_period_end` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `platform_upload_costs` - Dynamic pricing for platform uploads
      - `id` (uuid, primary key)
      - `platform` (text) - youtube, spotify, deezer
      - `base_cost` (decimal)
      - `itone_margin_percent` (decimal, default 20)
      - `updated_at` (timestamp)
    
    - `upload_transactions` - Track platform upload costs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `recording_id` (uuid, references recordings)
      - `platform` (text)
      - `base_cost` (decimal)
      - `itone_fee` (decimal)
      - `total_cost` (decimal)
      - `stripe_payment_intent_id` (text)
      - `status` (text) - pending, completed, failed
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for subscription management
    - Secure access to billing information

  3. Sample Data
    - Insert subscription plans with features
    - Insert platform upload costs
*/

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_monthly decimal(10,2) NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_collaborators integer NOT NULL DEFAULT 1,
  download_quality text NOT NULL DEFAULT 'standard' CHECK (download_quality IN ('standard', 'high', 'ultra')),
  platform_uploads boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create platform upload costs table
CREATE TABLE IF NOT EXISTS platform_upload_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE CHECK (platform IN ('youtube', 'spotify', 'deezer', 'apple_music')),
  base_cost decimal(10,2) NOT NULL,
  itone_margin_percent decimal(5,2) NOT NULL DEFAULT 20.00,
  updated_at timestamptz DEFAULT now()
);

-- Create upload transactions table
CREATE TABLE IF NOT EXISTS upload_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  platform text NOT NULL,
  base_cost decimal(10,2) NOT NULL,
  itone_fee decimal(10,2) NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Insert subscription plans
INSERT INTO subscription_plans (name, price_monthly, features, max_collaborators, download_quality, platform_uploads) VALUES
('Silver', 9.99, '["Basic recording", "MP3/MP4 downloads", "2-person collaboration", "Standard quality", "Email support"]'::jsonb, 2, 'standard', false),
('Gold', 19.99, '["HD recording", "High-quality downloads", "4-person collaboration", "Advanced audio effects", "Priority support", "Cloud storage"]'::jsonb, 4, 'high', false),
('Platinum', 29.99, '["Ultra HD recording", "Lossless downloads", "4-person collaboration", "Professional audio suite", "Platform uploads", "24/7 support", "Analytics dashboard"]'::jsonb, 4, 'ultra', true)
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  max_collaborators = EXCLUDED.max_collaborators,
  download_quality = EXCLUDED.download_quality,
  platform_uploads = EXCLUDED.platform_uploads;

-- Insert platform upload costs
INSERT INTO platform_upload_costs (platform, base_cost, itone_margin_percent) VALUES
('youtube', 2.99, 20.00),
('spotify', 4.99, 20.00),
('deezer', 3.99, 20.00),
('apple_music', 5.99, 20.00)
ON CONFLICT (platform) DO UPDATE SET
  base_cost = EXCLUDED.base_cost,
  itone_margin_percent = EXCLUDED.itone_margin_percent,
  updated_at = now();

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_upload_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for platform_upload_costs (public read)
CREATE POLICY "Anyone can view upload costs"
  ON platform_upload_costs FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for upload_transactions
CREATE POLICY "Users can view own transactions"
  ON upload_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON upload_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_upload_transactions_user_id ON upload_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_transactions_status ON upload_transactions(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();