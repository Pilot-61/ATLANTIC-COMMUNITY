import React, { useState } from 'react';
import { Heart, MessageCircle, Pin, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Announcement } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toggleReaction, deleteAnnouncement } from '../../lib/announcements';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';

interface AnnouncementCardProps {
  announcement: Announcement;
  onUpdate: () => void;
  onEdit?: (announcement: Announcement) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, onUpdate, onEdit }) => {
  const { profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const userReaction = announcement.reactions?.find(r => r.user?.id === profile?.id);


  const handleReaction = async () => {
    if (!profile) {
      toast.error('Please sign in to react');
      return;
    }

    setLoading(true);
    try {
      await toggleReaction(announcement.id, 'like');
      onUpdate();
      toast.success(userReaction ? 'Reaction removed' : 'Reaction added');
    } catch (error) {
      toast.error('Failed to update reaction');
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    setLoading(true);
    try {
      await deleteAnnouncement(announcement.id);
      onUpdate();
      toast.success('Announcement deleted');
    } catch (error) {
      toast.error('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center overflow-hidden">
              {announcement.author?.avatar_url ? (
                <img
                  src={announcement.author.avatar_url}
                  alt={announcement.author.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {announcement.author?.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white">{announcement.author?.display_name}</h3>
                {announcement.author?.is_admin && (
                  <span className="bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    ADMIN
                  </span>
                )}
                {announcement.is_pinned && (
                  <Pin className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="text-gray-400 text-sm">
                @{announcement.author?.username} • {formatDistanceToNow(new Date(announcement.created_at))} ago
              </p>
            </div>
          </div>

          {profile?.is_admin && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[150px] z-10">
                  <button
                    onClick={() => {
                      onEdit?.(announcement);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h2 className="text-xl font-bold text-white mb-3">{announcement.title}</h2>
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {announcement.content}
        </div>

        {announcement.image_url && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img
              src={announcement.image_url}
              alt="Announcement"
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleReaction}
              disabled={loading || !profile}
              className={`flex items-center space-x-2 transition-colors ${
                userReaction
                  ? 'text-red-500 hover:text-red-400'
                  : 'text-gray-400 hover:text-red-500'
              } disabled:opacity-50`}
            >
              <Heart className={`w-5 h-5 ${userReaction ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{announcement._count?.reactions || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{announcement._count?.comments || 0}</span>
            </button>


          </div>

          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>Public</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-700/50">
          <CommentSection
            announcementId={announcement.id}
            comments={announcement.comments || []}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;