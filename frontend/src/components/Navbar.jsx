import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  HiSearch, HiBell, HiSun, HiMoon, HiMenu, HiX,
  HiLogout, HiUser, HiPlus
} from 'react-icons/hi';

export default function Navbar({ onMobileMenuToggle, mobileMenuOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProfile]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowProfile(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore-cities?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-xl
        ${isDark
          ? 'bg-dark-surface/80 border-dark-border'
          : 'bg-white/80 border-light-border'
        }`}
      role="banner"
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className={`md:hidden p-2 rounded-lg transition-colors
            ${isDark ? 'hover:bg-dark-card active:bg-dark-border' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
        </button>

        {/* Mobile Logo */}
        <Link to="/dashboard" className="md:hidden flex items-center gap-2" aria-label="Traveloop home">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="font-bold text-primary">Traveloop</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md" role="search">
          <div className={`flex items-center gap-2 w-full px-4 py-2 rounded-xl border transition-all
            ${isDark
              ? 'bg-dark-card border-dark-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30'
              : 'bg-gray-50 border-light-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30'
            }`}
          >
            <HiSearch className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search destinations, trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm min-w-0"
              aria-label="Search destinations and trips"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/create-trip" aria-label="Create new trip">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25"
            >
              <HiPlus /> New Trip
            </motion.button>
          </Link>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2.5 rounded-xl transition-colors
              ${isDark ? 'hover:bg-dark-card text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {isDark ? <HiSun className="text-lg" /> : <HiMoon className="text-lg" />}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="View notifications"
            className={`p-2.5 rounded-xl relative transition-colors
              ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
          >
            <HiBell className="text-lg" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" aria-hidden="true" />
          </motion.button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              aria-label="User menu"
              aria-expanded={showProfile}
              aria-haspopup="true"
              className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors
                ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
            >
              <div className="w-8 h-8 rounded-full gradient-cool flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">
                {user?.name || 'User'}
              </span>
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className={`absolute right-0 top-12 w-56 rounded-xl shadow-xl border overflow-hidden
                    ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'}`}
                >
                  <div className={`p-3 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <p className="font-semibold text-sm truncate">{user?.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfile(false)}
                      role="menuitem"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                        ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-50'}`}
                    >
                      <HiUser /> Profile
                    </Link>
                    <button
                      onClick={() => { logout(); setShowProfile(false); }}
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-left text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiLogout /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
