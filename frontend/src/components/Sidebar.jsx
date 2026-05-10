import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  HiHome, HiMap, HiGlobe, HiCurrencyDollar, HiClipboardList,
  HiBookOpen, HiUser, HiCog, HiChevronLeft, HiChevronRight,
  HiLightningBolt, HiShieldCheck, HiX
} from 'react-icons/hi';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiHome },
  { path: '/trips', label: 'My Trips', icon: HiMap },
  { path: '/explore-cities', label: 'Explore Cities', icon: HiGlobe },
  { path: '/activities', label: 'Activities', icon: HiLightningBolt },
];

const tripMenuItems = [
  { path: '/itinerary', label: 'Itinerary', icon: HiClipboardList },
  { path: '/budget', label: 'Budget', icon: HiCurrencyDollar },
  { path: '/packing', label: 'Packing', icon: HiClipboardList },
  { path: '/journal', label: 'Journal', icon: HiBookOpen },
];

const bottomItems = [
  { path: '/profile', label: 'Profile', icon: HiUser },
  { path: '/settings', label: 'Settings', icon: HiCog },
];

export default function Sidebar({ collapsed = false, onToggleCollapse, isMobile = false, onCloseMobile }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const NavItem = ({ item }) => (
    <Link to={item.path} onClick={handleLinkClick} aria-label={item.label}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden
          ${isActive(item.path)
            ? isDark ? 'bg-primary/15 text-primary font-bold' : 'bg-primary/10 text-primary-dark font-bold'
            : isDark
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
      >
        <item.icon className={`text-xl flex-shrink-0 transition-colors ${isActive(item.path) ? 'text-primary' : ''}`} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-semibold whitespace-nowrap overflow-hidden tracking-wide"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive(item.path) && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-md shadow-[0_0_8px_rgba(108,99,255,0.6)]"
          />
        )}
      </motion.div>
    </Link>
  );

  return (
    <motion.aside
      animate={{ width: isMobile ? 280 : collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`${isMobile ? 'relative' : 'fixed left-0 top-0'} h-screen z-40 flex flex-col
        ${!isMobile ? 'border-r' : ''}
        ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">T</span>
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Traveloop
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
            aria-label="Close menu"
          >
            <HiX className="text-lg" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative" role="navigation" aria-label="Main navigation">
        {(!collapsed || isMobile) && (
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3
            ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Main
          </p>
        )}
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        <div className="my-4 border-t border-inherit" />

        {(!collapsed || isMobile) && (
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3
            ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Trip Tools
          </p>
        )}
        {tripMenuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="my-4 border-t border-inherit" />
            <NavItem item={{ path: '/admin', label: 'Admin Panel', icon: HiShieldCheck }} />
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-inherit space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center border shadow-md z-50 transition-colors
            ${isDark
              ? 'bg-dark-surface border-dark-border text-dark-text hover:bg-dark-card'
              : 'bg-white border-light-border text-light-text hover:bg-gray-50'
            }`}
        >
          {collapsed ? <HiChevronRight className="text-xs" /> : <HiChevronLeft className="text-xs" />}
        </button>
      )}
    </motion.aside>
  );
}
