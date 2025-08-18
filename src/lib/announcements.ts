import { supabase, type Announcement, type AnnouncementReaction, type AnnouncementComment } from './supabase';
import { getCurrentProfile } from './auth';

export const getAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(*),
      reactions:announcement_reactions(
        id,
        reaction_type,
        user:profiles!announcement_reactions_user_id_fkey(*)
      ),
      comments:announcement_comments(
        id,
        content,
        created_at,
        user:profiles!announcement_comments_user_id_fkey(*),
        replies:announcement_comments!parent_id(
          id,
          content,
          created_at,
          user:profiles!announcement_comments_user_id_fkey(*)
        )
      ),
      shares:announcement_shares(
        id,
        shared_at,
        user:profiles!announcement_shares_user_id_fkey(*)
      )
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Add counts
  const announcementsWithCounts = data?.map(announcement => ({
    ...announcement,
    _count: {
      reactions: announcement.reactions?.length || 0,
      comments: announcement.comments?.length || 0,
      shares: announcement.shares?.length || 0,
    }
  }));

  return announcementsWithCounts as Announcement[];
};

export const createAnnouncement = async (data: {
  title: string;
  content: string;
  image_url?: string;
  is_pinned?: boolean;
}) => {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) {
    throw new Error('Only admins can create announcements');
  }

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      ...data,
      author_id: profile.id,
    })
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return announcement;
};

export const updateAnnouncement = async (id: string, data: {
  title?: string;
  content?: string;
  image_url?: string;
  is_pinned?: boolean;
}) => {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) {
    throw new Error('Only admins can update announcements');
  }

  const { data: announcement, error } = await supabase
    .from('announcements')
    .update(data)
    .eq('id', id)
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return announcement;
};

export const deleteAnnouncement = async (id: string) => {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) {
    throw new Error('Only admins can delete announcements');
  }

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleReaction = async (announcementId: string, reactionType: AnnouncementReaction['reaction_type']) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  // Check if reaction already exists
  const { data: existingReaction } = await supabase
    .from('announcement_reactions')
    .select('*')
    .eq('announcement_id', announcementId)
    .eq('user_id', profile.id)
    .single();

  if (existingReaction) {
    if (existingReaction.reaction_type === reactionType) {
      // Remove reaction
      const { error } = await supabase
        .from('announcement_reactions')
        .delete()
        .eq('id', existingReaction.id);
      
      if (error) throw error;
      return null;
    } else {
      // Update reaction type
      const { data, error } = await supabase
        .from('announcement_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existingReaction.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } else {
    // Create new reaction
    const { data, error } = await supabase
      .from('announcement_reactions')
      .insert({
        announcement_id: announcementId,
        user_id: profile.id,
        reaction_type: reactionType,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const addComment = async (announcementId: string, content: string, parentId?: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('announcement_comments')
    .insert({
      announcement_id: announcementId,
      user_id: profile.id,
      content,
      parent_id: parentId,
    })
    .select(`
      *,
      user:profiles!announcement_comments_user_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updateComment = async (commentId: string, content: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('announcement_comments')
    .update({ content })
    .eq('id', commentId)
    .eq('user_id', profile.id)
    .select(`
      *,
      user:profiles!announcement_comments_user_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deleteComment = async (commentId: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  // Admins can delete any comment, users can delete their own
  const { error } = await supabase
    .from('announcement_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

export const shareAnnouncement = async (announcementId: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  // Check if already shared
  const { data: existingShare } = await supabase
    .from('announcement_shares')
    .select('*')
    .eq('announcement_id', announcementId)
    .eq('user_id', profile.id)
    .single();

  if (existingShare) {
    // Remove share
    const { error } = await supabase
      .from('announcement_shares')
      .delete()
      .eq('id', existingShare.id);
    
    if (error) throw error;
    return null;
  } else {
    // Create share
    const { data, error } = await supabase
      .from('announcement_shares')
      .insert({
        announcement_id: announcementId,
        user_id: profile.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};