import React, { useState, useRef } from 'react';
import { X, Camera, Save, User, AtSign, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, uploadAvatar, updateProfileSchema, type UpdateProfileData } from '../../lib/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: profile?.username || '',
      displayName: profile?.display_name || '',
      bio: profile?.bio || '',
    },
  });

  React.useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await refreshProfile();
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: UpdateProfileData) => {
    setLoading(true);
    try {
      await updateProfile(data);
      await refreshProfile();
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 w-full max-w-md mx-4 border border-red-500/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 p-2 rounded-full text-white transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            {uploadingAvatar && (
              <p className="text-sm text-gray-400 mt-2">Uploading avatar...</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('username')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                placeholder="Enter username"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('displayName')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                placeholder="Enter display name"
              />
            </div>
            {errors.displayName && (
              <p className="text-red-400 text-sm mt-1">{errors.displayName.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            {errors.bio && (
              <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Admin Badge */}
          {profile.is_admin && (
            <div className="bg-gradient-to-r from-red-500/20 to-yellow-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ADMIN
                </span>
                <span className="text-gray-300 text-sm">Administrator privileges enabled</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;