import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { isDark } = useTheme();

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full ${sizes[size]} rounded-2xl shadow-2xl overflow-hidden
              ${isDark ? 'bg-dark-surface' : 'bg-white'}`}
          >
            {title && (
              <div className={`flex items-center justify-between p-5 border-b
                ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                <h3 className="text-lg font-bold">{title}</h3>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-lg transition-colors
                    ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
                >
                  <HiX className="text-lg" />
                </button>
              </div>
            )}
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
