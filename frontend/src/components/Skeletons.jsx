import { useTheme } from '../context/ThemeContext';

export function CardSkeleton({ count = 3 }) {
  const { isDark } = useTheme();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
          <div className="skeleton h-48 w-full" />
          <div className="p-4 space-y-3">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="flex gap-2">
              <div className="skeleton h-8 w-20 rounded-full" />
              <div className="skeleton h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LineSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="skeleton h-10 w-10 rounded-xl mb-3" />
          <div className="skeleton h-8 w-20 mb-2" />
          <div className="skeleton h-4 w-28" />
        </div>
      ))}
    </div>
  );
}
