/*
  # Complete Karaoke Platform Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `bio` (text)
      - `github_repo` (text)
      - `avatar_url` (text)
      - `subscription_tier` (text, default 'free')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `songs` - Song library with metadata
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `duration` (integer, seconds)
      - `genre` (text)
      - `difficulty` (text)
      - `youtube_url` (text)
      - `spotify_id` (text, optional)
      - `created_at` (timestamp)
    
    - `user_songs` - User's saved songs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `song_id` (uuid, references songs)
      - `transpose_value` (integer, default 0)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `recordings` - User recordings
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `song_id` (uuid, references songs)
      - `title` (text)
      - `file_url` (text)
      - `duration` (integer)
      - `transpose_used` (integer)
      - `is_collaborative` (boolean)
      - `quality` (text, 'standard' or 'high')
      - `created_at` (timestamp)
    
    - `collaborative_sessions` - Live collaboration sessions
      - `id` (uuid, primary key)
      - `host_id` (uuid, references user_profiles)
      - `session_code` (text, unique)
      - `song_id` (uuid, references songs)
      - `max_participants` (integer, default 4)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `session_participants` - Session participants
      - `id` (uuid, primary key)
      - `session_id` (uuid, references collaborative_sessions)
      - `user_id` (uuid, references user_profiles)
      - `joined_at` (timestamp)
      - `is_muted` (boolean, default false)
      - `has_video` (boolean, default true)
    
    - `subscriptions` - Platinum subscriptions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `tier` (text, 'platinum')
      - `status` (text, 'active', 'cancelled', 'expired')
      - `stripe_subscription_id` (text)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for collaborative sessions and recordings

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for user songs and recordings queries
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text DEFAULT '',
  github_repo text DEFAULT '',
  avatar_url text DEFAULT '',
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'platinum')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  duration integer NOT NULL,
  genre text NOT NULL,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  youtube_url text NOT NULL,
  spotify_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_songs table (user's saved songs)
CREATE TABLE IF NOT EXISTS user_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  transpose_value integer DEFAULT 0 CHECK (transpose_value >= -12 AND transpose_value <= 12),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  duration integer NOT NULL,
  transpose_used integer DEFAULT 0,
  is_collaborative boolean DEFAULT false,
  quality text DEFAULT 'standard' CHECK (quality IN ('standard', 'high')),
  created_at timestamptz DEFAULT now()
);

-- Create collaborative sessions table
CREATE TABLE IF NOT EXISTS collaborative_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_code text UNIQUE NOT NULL,
  song_id uuid REFERENCES songs(id) ON DELETE SET NULL,
  max_participants integer DEFAULT 4 CHECK (max_participants >= 2 AND max_participants <= 4),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create session participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES collaborative_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_muted boolean DEFAULT false,
  has_video boolean DEFAULT true,
  UNIQUE(session_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'platinum' CHECK (tier = 'platinum'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id text UNIQUE,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  created_at timestamptz DEFAULT now()
);

-- Insert sample songs
INSERT INTO songs (title, artist, duration, genre, difficulty, youtube_url, spotify_id) VALUES
('Bohemian Rhapsody', 'Queen', 355, 'Rock', 'hard', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', '4u7EnebtmKWzUH433cf1Qv'),
('Shape of You', 'Ed Sheeran', 233, 'Pop', 'medium', 'https://www.youtube.com/watch?v=JGwWNGJdvx8', '7qiZfU4dY4WkLyMn4s5iuJ'),
('Imagine', 'John Lennon', 183, 'Classic', 'easy', 'https://www.youtube.com/watch?v=YkgkThdzX-8', '7pKfPomDiuM2OtqtWKpGRb'),
('Billie Jean', 'Michael Jackson', 294, 'Pop', 'medium', 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y', '5ChkMS8OtdzJeqyybCc9R5'),
('Hotel California', 'Eagles', 391, 'Rock', 'hard', 'https://www.youtube.com/watch?v=BciS5krYL80', '40riOy7x9W7GXjyGp4muvw'),
('Perfect', 'Ed Sheeran', 263, 'Pop', 'easy', 'https://www.youtube.com/watch?v=2Vv-BfVoq4g', '0tgVpDi06FyKpA1z0HClJV'),
('Don''t Stop Believin''', 'Journey', 251, 'Rock', 'medium', 'https://www.youtube.com/watch?v=1k8craCGpgs', '4bHsxqR3GMrXTxEPLuK5ue'),
('Someone Like You', 'Adele', 285, 'Pop', 'medium', 'https://www.youtube.com/watch?v=hLQl3WQQoQ0', '1zwMYTA5nlNjZxYrvBB2pV')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for songs (public read)
CREATE POLICY "Anyone can view songs"
  ON songs FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_songs
CREATE POLICY "Users can manage own saved songs"
  ON user_songs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recordings
CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recordings"
  ON recordings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON recordings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON recordings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collaborative_sessions
CREATE POLICY "Users can view active sessions"
  ON collaborative_sessions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create sessions"
  ON collaborative_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own sessions"
  ON collaborative_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- RLS Policies for session_participants
CREATE POLICY "Users can view session participants"
  ON session_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join sessions"
  ON session_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
  ON session_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_songs_user_id ON user_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON collaborative_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_code ON collaborative_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';

-- Function to generate session codes
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();