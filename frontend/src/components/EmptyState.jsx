import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ 
  icon = "🗺️", 
  title = "No data found", 
  description = "There is nothing to display here yet.", 
  action 
}) {
  const { isDark } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl p-12 border border-dashed flex flex-col items-center justify-center text-center
        ${isDark ? 'bg-gray-800/20 border-gray-700' : 'bg-gray-50/50 border-gray-300'}`}
    >
      <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-5xl">
        {icon}
      </div>
      <h3 className="font-extrabold text-2xl mb-2">{title}</h3>
      <p className={`text-base max-w-md mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>
      {action}
    </motion.div>
  );
}
