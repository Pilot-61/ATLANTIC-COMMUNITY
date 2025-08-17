import React, { useState } from 'react';
import { Send, Reply, Edit, Trash2, MoreHorizontal, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type AnnouncementComment } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { addComment, updateComment, deleteComment } from '../../lib/announcements';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  announcementId: string;
  comments: AnnouncementComment[];
  onUpdate: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ announcementId, comments, onUpdate }) => {
  const { profile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async (parentId?: string) => {
    if (!profile) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(announcementId, newComment.trim(), parentId);
      setNewComment('');
      setReplyTo(null);
      onUpdate();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      await updateComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      onUpdate();
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      await deleteComment(commentId);
      onUpdate();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const renderComment = (comment: AnnouncementComment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''}`}>
      <div className="flex items-start space-x-3 py-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center overflow-hidden flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {comment.user?.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-white text-sm">{comment.user?.display_name}</span>
            <span className="text-gray-500 text-xs">@{comment.user?.username}</span>
            {comment.user?.is_admin && (
              <span className="bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                ADMIN
              </span>
            )}
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(comment.created_at))} ago
            </span>
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm resize-none"
                rows={2}
                placeholder="Edit your comment..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={loading || !editContent.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1 rounded text-white text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="text-gray-400 hover:text-white px-3 py-1 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>

              <div className="flex items-center space-x-4 mt-2">
                {!isReply && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="text-gray-400 hover:text-blue-400 text-xs flex items-center space-x-1 transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                )}

                {profile?.id === comment.user?.id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-gray-400 hover:text-yellow-400 text-xs flex items-center space-x-1 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-400 text-xs flex items-center space-x-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {replyTo === comment.id && (
        <div className="ml-11 mt-2">
          <div className="flex space-x-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm resize-none"
              rows={2}
              placeholder={`Reply to ${comment.user?.display_name}...`}
            />
            <button
              onClick={() => handleAddComment(comment.id)}
              disabled={loading || !newComment.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-2 rounded-lg text-white transition-colors flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Render replies */}
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  );

  // Filter top-level comments (no parent_id)
  const topLevelComments = comments.filter(comment => !comment.parent_id);

  return (
    <div className="p-6">
      {/* Add Comment Form */}
      {profile && (
        <div className="mb-6">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white resize-none"
                rows={3}
                placeholder="Write a comment..."
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleAddComment()}
                  disabled={loading || !newComment.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {topLevelComments.length > 0 ? (
          topLevelComments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;