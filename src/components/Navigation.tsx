import React from 'react';
import { Crown, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import AuthModal from './auth/AuthModal';
import ProfileModal from './profile/ProfileModal';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'rules', label: 'Rules' },
  { id: 'community', label: 'Community' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'connect', label: 'Connect' },
];

interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  scrollY: number;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  scrollY,
  currentPage,
  setCurrentPage,
}) => {
  const { user, profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setShowUserMenu(false);
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrollY > 100 
        ? 'bg-black/90 backdrop-blur-md border-b border-red-500/20 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and nav links */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
            tabIndex={0}
            aria-label="Go to Home"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-r from-red-600 to-yellow-500">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Atlantic RP Logo" className="w-10 h-10 object-cover" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
              ATLANTIC RP
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`relative text-white font-medium transition-colors duration-300 px-3 py-2 rounded-lg
                    ${currentPage === link.id ? 'after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-yellow-500 after:rounded-full after:transition-all after:duration-300 text-yellow-400' : 'hover:text-yellow-400'}
                  `}
                  style={{ minWidth: 48, minHeight: 48 }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!user || !profile ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors border border-gray-600/50 hover:border-red-500/50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center overflow-hidden">
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
                  <span className="text-white font-medium">{profile.display_name}</span>
                  {profile.is_admin && (
                    <span className="bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ADMIN
                    </span>
                  )}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[200px] z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-white font-medium">{profile.display_name}</p>
                      <p className="text-gray-400 text-sm">@{profile.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center text-white hover:text-yellow-400 transition-colors duration-300 rounded-lg hover:bg-red-500/10"
            style={{ minWidth: 48, minHeight: 48, width: 48, height: 48 }}
            aria-label="Toggle menu"
            type="button"
          >
            {isMenuOpen
              ? <X className="w-7 h-7 pointer-events-none" />
              : <Menu className="w-7 h-7 pointer-events-none" />}
          </button>
        </div>
      </div>
      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-red-500/20 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentPage(link.id);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-3 text-white font-medium rounded-lg transition-all duration-300
                  ${currentPage === link.id ? 'border-l-4 border-yellow-400 text-yellow-400 bg-black/70' : 'hover:text-yellow-400 hover:bg-black/60'}
                `}
                style={{ minWidth: 48, minHeight: 48 }}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-700 pt-3 mt-3">
              {!user || !profile ? (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 text-gray-300 hover:text-white hover:bg-black/60 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 text-red-400 hover:text-red-300 hover:bg-black/60 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;