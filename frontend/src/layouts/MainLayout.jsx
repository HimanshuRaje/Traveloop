import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiMap, HiGlobe, HiUser, HiPlus } from 'react-icons/hi';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { isDark } = useTheme();
  const location = useLocation();

  // Track screen size for sidebar margin
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const mobileNavItems = [
    { path: '/dashboard', icon: HiHome, label: 'Home' },
    { path: '/trips', icon: HiMap, label: 'Trips' },
    { path: '/create-trip', icon: HiPlus, label: 'Create', special: true },
    { path: '/explore-cities', icon: HiGlobe, label: 'Explore' },
    { path: '/profile', icon: HiUser, label: 'Profile' },
  ];

  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 72 : 256) : 0;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar only */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed left-0 top-0 h-full w-[280px] z-50 md:hidden shadow-2xl
                  ${isDark ? 'bg-dark-surface' : 'bg-white'}`}
              >
                <Sidebar collapsed={false} onToggleCollapse={() => {}} isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 md:hidden border-t backdrop-blur-xl pb-safe
          ${isDark ? 'bg-dark-surface/90 border-dark-border' : 'bg-white/90 border-light-border'}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around py-2 px-1">
          {mobileNavItems.map((item) => {
            const active = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {item.special ? (
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center -mt-5 shadow-lg shadow-primary/30 ring-4 ring-white dark:ring-dark-bg">
                    <item.icon className="text-white text-xl" />
                  </div>
                ) : (
                  <item.icon className={`text-xl transition-colors ${active ? 'text-primary' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                )}
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
