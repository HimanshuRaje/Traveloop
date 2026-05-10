import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  actionButton 
}) {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-1">
          {Icon && <Icon className="text-primary" />}
          {title}
        </h1>
        {subtitle && (
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </motion.div>
      
      {actionButton && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="shrink-0"
        >
          {actionButton}
        </motion.div>
      )}
    </div>
  );
}
