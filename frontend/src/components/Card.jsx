import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Card({ 
  children, 
  className = '', 
  isStatic = false, 
  hoverEffect = false,
  onClick,
  ...props 
}) {
  const { isDark } = useTheme();
  
  const baseClasses = `rounded-2xl border transition-all duration-300 ${
    isDark 
      ? 'bg-gray-900/50 border-gray-700/50 shadow-black/20' 
      : 'bg-white border-gray-100 shadow-gray-200/50'
  } backdrop-blur-xl shadow-xl`;

  const hoverClasses = hoverEffect 
    ? (isDark ? 'hover:bg-gray-800/80 hover:shadow-2xl' : 'hover:shadow-2xl hover:-translate-y-1') 
    : '';
    
  const interactiveClasses = onClick ? 'cursor-pointer' : '';

  if (isStatic) {
    return (
      <div 
        className={`${baseClasses} ${hoverClasses} ${interactiveClasses} ${className}`} 
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4 } : {}}
      className={`${baseClasses} ${hoverClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
