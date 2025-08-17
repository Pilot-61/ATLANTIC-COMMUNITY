import React, { useState, useEffect } from 'react';
import { Plus, Megaphone, Users, TrendingUp, Pin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAnnouncements } from '../../lib/announcements';
import { type Announcement } from '../../lib/supabase';
import AnnouncementCard from './AnnouncementCard';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import AuthModal from '../auth/AuthModal';
import toast from 'react-hot-toast';

const AnnouncementsPage: React.FC = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateClick = () => {
    if (!profile) {
      setShowAuthModal(true);
      return;
    }
    if (!profile.is_admin) {
      toast.error('Only admins can create announcements');
      return;
    }
    setShowCreateModal(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingAnnouncement(null);
  };

  const stats = {
    totalAnnouncements: announcements.length,
    pinnedAnnouncements: announcements.filter(a => a.is_pinned).length,
    totalReactions: announcements.reduce((sum, a) => sum + (a._count?.reactions || 0), 0),
    totalComments: announcements.reduce((sum, a) => sum + (a._count?.comments || 0), 0),
  };

  if (loading) {
    return (
      <section className="relative py-24 min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-yellow-900/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Loading announcements...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-yellow-900/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(220,38,38,0.1),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.1),transparent)]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-2xl border border-red-500/30">
              <Megaphone className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
              Community Announcements
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Stay updated with the latest news, events, and important information from the Atlantic RP team
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto rounded-full"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              {stats.totalAnnouncements}
            </div>
            <div className="text-gray-400 text-sm">Total Posts</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              {stats.pinnedAnnouncements}
            </div>
            <div className="text-gray-400 text-sm">Pinned</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              {stats.totalReactions}
            </div>
            <div className="text-gray-400 text-sm">Reactions</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              {stats.totalComments}
            </div>
            <div className="text-gray-400 text-sm">Comments</div>
          </div>
        </div>

        {/* Create Button */}
        {profile?.is_admin && (
          <div className="mb-8">
            <button
              onClick={handleCreateClick}
              className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-red-500/30"
            >
              <Plus className="w-5 h-5" />
              <span>Create Announcement</span>
            </button>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-8">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onUpdate={loadAnnouncements}
                onEdit={handleEditAnnouncement}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50">
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">No Announcements Yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Be the first to know when the Atlantic RP team shares important updates and news.
                </p>
                {!profile && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In to Stay Updated
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={loadAnnouncements}
        editingAnnouncement={editingAnnouncement}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </section>
  );
};

export default AnnouncementsPage;