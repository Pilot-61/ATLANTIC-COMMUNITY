import { supabase } from './supabase';
import { getCurrentProfile } from './auth';

export const uploadAnnouncementImage = async (file: File) => {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) throw new Error('Only admins can upload announcement images');

  const fileExt = file.name.split('.').pop();
  const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from('announcements')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('announcements')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
