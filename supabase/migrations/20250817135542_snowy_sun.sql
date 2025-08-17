/*
  # Community Announcements System

  1. New Tables
    - `profiles` - User profiles with avatar and display name
    - `announcements` - Admin posts/announcements
    - `announcement_reactions` - User reactions to announcements
    - `announcement_comments` - User comments on announcements
    - `announcement_shares` - Track announcement shares

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for announcements management
    - User policies for profiles, reactions, comments
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create announcement reactions table
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Create announcement comments table
CREATE TABLE IF NOT EXISTS announcement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES announcement_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create announcement shares table
CREATE TABLE IF NOT EXISTS announcement_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Announcements policies
CREATE POLICY "Everyone can read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Reactions policies
CREATE POLICY "Users can read all reactions"
  ON announcement_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON announcement_reactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = announcement_reactions.user_id
    )
  );

-- Comments policies
CREATE POLICY "Users can read all comments"
  ON announcement_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON announcement_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = announcement_comments.user_id
    )
  );

CREATE POLICY "Users can update own comments"
  ON announcement_comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = announcement_comments.user_id
    )
  );

CREATE POLICY "Users can delete own comments or admins can delete any"
  ON announcement_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND (
        profiles.id = announcement_comments.user_id 
        OR profiles.is_admin = true
      )
    )
  );

-- Shares policies
CREATE POLICY "Users can read all shares"
  ON announcement_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own shares"
  ON announcement_shares FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = announcement_shares.user_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_announcement_id ON announcement_reactions(announcement_id);
CREATE INDEX IF NOT EXISTS idx_comments_announcement_id ON announcement_comments(announcement_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON announcement_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_shares_announcement_id ON announcement_shares(announcement_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON announcement_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();