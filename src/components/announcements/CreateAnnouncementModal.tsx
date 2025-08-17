import React, { useState, useEffect } from 'react';
import { X, Image, Pin, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createAnnouncement, updateAnnouncement } from '../../lib/announcements';
import { type Announcement } from '../../lib/supabase';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAnnouncement?: Announcement | null;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  image_url?: string;
  is_pinned: boolean;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingAnnouncement
}) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnnouncementFormData>();

  useEffect(() => {
    if (editingAnnouncement) {
      reset({
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        image_url: editingAnnouncement.image_url || '',
        is_pinned: editingAnnouncement.is_pinned,
      });
    } else {
      reset({
        title: '',
        content: '',
        image_url: '',
        is_pinned: false,
      });
    }
  }, [editingAnnouncement, reset]);

  const onSubmit = async (data: AnnouncementFormData) => {
    setLoading(true);
    try {
      const announcementData = {
        title: data.title,
        content: data.content,
        image_url: data.image_url || undefined,
        is_pinned: data.is_pinned,
      };

      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, announcementData);
        toast.success('Announcement updated successfully!');
      } else {
        await createAnnouncement(announcementData);
        toast.success('Announcement created successfully!');
      }

      onSuccess();
      onClose();
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 w-full max-w-2xl mx-4 border border-red-500/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
              placeholder="Enter announcement title..."
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={8}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white resize-none"
              placeholder="Write your announcement content..."
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image URL (Optional)
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('image_url')}
                type="url"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('is_pinned')}
              type="checkbox"
              id="is_pinned"
              className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
            />
            <label htmlFor="is_pinned" className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <Pin className="w-4 h-4 text-yellow-500" />
              <span>Pin this announcement</span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;