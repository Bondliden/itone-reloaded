/*
  # Add Pro Subscription Tier

  1. Updates
    - Add Pro tier to subscription plans
    - Update user_profiles subscription_tier enum
    - Add Pro tier features and pricing

  2. Features
    - Pro tier positioned between Gold and Platinum
    - 5 platform uploads per month included
    - HD recording quality
    - 4-person collaboration
    - Basic platform uploads

  3. Pricing
    - $24.99/month
    - Includes limited platform uploads
    - Bridge between Gold and Platinum
*/

-- Add Pro subscription plan
INSERT INTO subscription_plans (name, price_monthly, features, max_collaborators, download_quality, platform_uploads) VALUES
('Pro', 24.99, '["HD recording", "High-quality downloads", "4-person collaboration", "Advanced audio effects", "Basic platform uploads", "Priority support", "Cloud storage", "Analytics dashboard"]'::jsonb, 4, 'high', true)
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  max_collaborators = EXCLUDED.max_collaborators,
  download_quality = EXCLUDED.download_quality,
  platform_uploads = EXCLUDED.platform_uploads;

-- Update Platinum plan to differentiate from Pro
UPDATE subscription_plans 
SET features = '["Ultra HD recording", "Lossless downloads", "4-person collaboration", "Professional audio suite", "Unlimited platform uploads", "24/7 support", "Advanced analytics", "API access"]'::jsonb
WHERE name = 'Platinum';

-- Update user_profiles table to support Pro tier
DO $$
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_subscription_tier_check' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_subscription_tier_check;
  END IF;
  
  -- Add new constraint with Pro tier
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'pro', 'platinum'));
END $$;