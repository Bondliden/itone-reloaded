/*
  # Platinum Integration System

  1. New Tables
    - `streaming_platforms` - Available streaming platforms
      - `id` (uuid, primary key)
      - `name` (text) - spotify, amazon_music, apple_music, youtube_music
      - `api_base_cost` (decimal) - Base cost per upload
      - `oauth_config` (jsonb) - OAuth configuration
      - `upload_requirements` (jsonb) - Technical requirements
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `user_platform_connections` - User OAuth connections
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `platform_id` (uuid, references streaming_platforms)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expires_at` (timestamp)
      - `platform_user_id` (text)
      - `platform_username` (text)
      - `connection_status` (text) - active, expired, revoked
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `platinum_subscriptions` - Enhanced Platinum subscription tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `stripe_subscription_id` (text, unique)
      - `base_subscription_cost` (decimal) - Monthly Platinum fee
      - `platform_access_cost` (decimal) - Estimated platform costs
      - `itone_margin` (decimal) - 20% profit margin
      - `total_monthly_cost` (decimal) - Total charged amount
      - `upload_credits_remaining` (integer) - Prepaid upload credits
      - `status` (text) - active, cancelled, expired, past_due
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `upload_jobs` - Track streaming platform uploads
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `recording_id` (uuid, references recordings)
      - `platform_id` (uuid, references streaming_platforms)
      - `upload_status` (text) - pending, processing, completed, failed
      - `platform_track_id` (text) - ID from streaming platform
      - `platform_url` (text) - Public URL on platform
      - `cost_used` (decimal) - Actual cost incurred
      - `metadata` (jsonb) - Upload metadata and response
      - `error_message` (text)
      - `created_at` (timestamp)
      - `completed_at` (timestamp)
    
    - `cost_tracking` - Monitor actual vs estimated costs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `month_year` (text) - Format: YYYY-MM
      - `estimated_costs` (decimal) - What user paid for
      - `actual_costs` (decimal) - What Itone actually spent
      - `profit_margin` (decimal) - Actual profit earned
      - `upload_count` (integer) - Number of uploads
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Encrypt sensitive OAuth tokens
    - Secure platform API credentials

  3. Sample Data
    - Insert streaming platforms with costs
    - Set up OAuth configurations
*/

-- Create streaming platforms table
CREATE TABLE IF NOT EXISTS streaming_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (name IN ('spotify', 'amazon_music', 'apple_music', 'youtube_music', 'deezer')),
  display_name text NOT NULL,
  api_base_cost decimal(10,2) NOT NULL,
  oauth_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  upload_requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user platform connections table
CREATE TABLE IF NOT EXISTS user_platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES streaming_platforms(id) ON DELETE CASCADE,
  access_token text, -- Will be encrypted
  refresh_token text, -- Will be encrypted
  token_expires_at timestamptz,
  platform_user_id text,
  platform_username text,
  connection_status text NOT NULL DEFAULT 'active' CHECK (connection_status IN ('active', 'expired', 'revoked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform_id)
);

-- Create enhanced Platinum subscriptions table
CREATE TABLE IF NOT EXISTS platinum_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  base_subscription_cost decimal(10,2) NOT NULL DEFAULT 29.99,
  platform_access_cost decimal(10,2) NOT NULL DEFAULT 15.00,
  itone_margin decimal(10,2) NOT NULL DEFAULT 9.00,
  total_monthly_cost decimal(10,2) NOT NULL DEFAULT 53.99,
  upload_credits_remaining integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create upload jobs table
CREATE TABLE IF NOT EXISTS upload_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  platform_id uuid NOT NULL REFERENCES streaming_platforms(id),
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
  platform_track_id text,
  platform_url text,
  cost_used decimal(10,2) NOT NULL DEFAULT 0.00,
  metadata jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create cost tracking table
CREATE TABLE IF NOT EXISTS cost_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  estimated_costs decimal(10,2) NOT NULL DEFAULT 0.00,
  actual_costs decimal(10,2) NOT NULL DEFAULT 0.00,
  profit_margin decimal(10,2) NOT NULL DEFAULT 0.00,
  upload_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Insert streaming platforms with integrated pricing
INSERT INTO streaming_platforms (name, display_name, api_base_cost, oauth_config, upload_requirements) VALUES
('spotify', 'Spotify', 4.99, '{"client_id": "", "scope": "user-read-email playlist-modify-public", "redirect_uri": "/auth/spotify/callback"}'::jsonb, '{"format": "mp3", "min_duration": 30, "max_duration": 600, "sample_rate": 44100}'::jsonb),
('amazon_music', 'Amazon Music', 3.99, '{"client_id": "", "scope": "music:write", "redirect_uri": "/auth/amazon/callback"}'::jsonb, '{"format": "mp3", "min_duration": 30, "max_duration": 480, "sample_rate": 44100}'::jsonb),
('apple_music', 'Apple Music', 5.99, '{"client_id": "", "scope": "music-library", "redirect_uri": "/auth/apple/callback"}'::jsonb, '{"format": "aac", "min_duration": 30, "max_duration": 600, "sample_rate": 44100}'::jsonb),
('youtube_music', 'YouTube Music', 2.99, '{"client_id": "", "scope": "https://www.googleapis.com/auth/youtube.upload", "redirect_uri": "/auth/youtube/callback"}'::jsonb, '{"format": "mp4", "min_duration": 30, "max_duration": 900, "sample_rate": 48000}'::jsonb),
('deezer', 'Deezer', 3.49, '{"client_id": "", "scope": "basic_access,manage_library", "redirect_uri": "/auth/deezer/callback"}'::jsonb, '{"format": "mp3", "min_duration": 30, "max_duration": 480, "sample_rate": 44100}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  api_base_cost = EXCLUDED.api_base_cost,
  oauth_config = EXCLUDED.oauth_config,
  upload_requirements = EXCLUDED.upload_requirements;

-- Enable Row Level Security
ALTER TABLE streaming_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE platinum_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for streaming_platforms (public read)
CREATE POLICY "Anyone can view streaming platforms"
  ON streaming_platforms FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_platform_connections
CREATE POLICY "Users can manage own platform connections"
  ON user_platform_connections FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for platinum_subscriptions
CREATE POLICY "Users can view own platinum subscription"
  ON platinum_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own platinum subscription"
  ON platinum_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for upload_jobs
CREATE POLICY "Users can view own upload jobs"
  ON upload_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own upload jobs"
  ON upload_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cost_tracking
CREATE POLICY "Users can view own cost tracking"
  ON cost_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_platform_connections_user_id ON user_platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_platform_connections_status ON user_platform_connections(connection_status) WHERE connection_status = 'active';
CREATE INDEX IF NOT EXISTS idx_platinum_subscriptions_user_id ON platinum_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_platinum_subscriptions_stripe ON platinum_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_user_id ON upload_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_status ON upload_jobs(upload_status);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_user_month ON cost_tracking(user_id, month_year);

-- Function to calculate Platinum pricing with platform costs
CREATE OR REPLACE FUNCTION calculate_platinum_pricing()
RETURNS TABLE(
  base_cost decimal,
  platform_costs decimal,
  itone_margin decimal,
  total_cost decimal
) AS $$
DECLARE
  base_subscription decimal := 29.99;
  total_platform_cost decimal;
  margin_amount decimal;
  final_total decimal;
BEGIN
  -- Calculate total platform access costs
  SELECT COALESCE(SUM(api_base_cost), 0) INTO total_platform_cost
  FROM streaming_platforms 
  WHERE is_active = true;
  
  -- Add 20% Itone margin
  margin_amount := total_platform_cost * 0.20;
  final_total := base_subscription + total_platform_cost + margin_amount;
  
  RETURN QUERY SELECT 
    base_subscription,
    total_platform_cost,
    margin_amount,
    final_total;
END;
$$ LANGUAGE plpgsql;

-- Function to update platform connection tokens
CREATE OR REPLACE FUNCTION update_platform_tokens()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for platform connections
CREATE TRIGGER update_platform_connections_updated_at
  BEFORE UPDATE ON user_platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_tokens();

-- Create trigger for platinum subscriptions
CREATE TRIGGER update_platinum_subscriptions_updated_at
  BEFORE UPDATE ON platinum_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();