import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  image_url?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  reactions?: AnnouncementReaction[];
  comments?: AnnouncementComment[];
  shares?: AnnouncementShare[];
  _count?: {
    reactions: number;
    comments: number;
    shares: number;
  };
}

export interface AnnouncementReaction {
  id: string;
  announcement_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
  created_at: string;
  user?: Profile;
}

export interface AnnouncementComment {
  id: string;
  announcement_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: AnnouncementComment[];
}

export interface AnnouncementShare {
  id: string;
  announcement_id: string;
  user_id: string;
  shared_at: string;
  user?: Profile;
}