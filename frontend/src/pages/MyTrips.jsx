import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate, formatCurrency, travelStyles } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';
import {
  HiSearch, HiPlus, HiPencil, HiTrash, HiEye, HiCalendar,
  HiGlobe, HiFilter, HiBookmark, HiSortDescending
} from 'react-icons/hi';

export default function MyTrips() {
  const { isDark } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => { fetchTrips(); }, [search, styleFilter, sort]);

  const fetchTrips = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (styleFilter) params.append('style', styleFilter);
      params.append('sort', sort);
      const { data } = await api.get(`/trips?${params}`);
      setTrips(data.trips || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteTrip = async (id) => {
    if (!confirm('Delete this trip?')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter((t) => t._id !== id));
      toast.success('Trip deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const toggleBookmark = async (id) => {
    try {
      const { data } = await api.put(`/trips/${id}/bookmark`);
      setTrips(trips.map((t) => t._id === id ? { ...t, bookmarked: data.bookmarked } : t));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Trips 🗺️</h1>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
          </p>
        </div>
        <Link to="/create-trip">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
            <HiPlus /> New Trip
          </motion.button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border
          ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
          <HiSearch className="text-gray-400" />
          <input type="text" placeholder="Search trips..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm outline-none
            ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-light-border'}`}>
          <option value="">All Styles</option>
          {travelStyles.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm outline-none
            ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-light-border'}`}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">By Title</option>
          <option value="budget">By Budget</option>
        </select>
      </div>

      {/* Trip Grid */}
      {loading ? <CardSkeleton count={6} /> : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {trips.map((trip, i) => (
              <motion.div key={trip._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'}
                    alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button onClick={() => toggleBookmark(trip._id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition">
                    <HiBookmark className={trip.bookmarked ? 'text-warning' : ''} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/90 text-white text-xs font-medium">
                      {travelStyles.find(s => s.value === trip.travelStyle)?.icon} {trip.travelStyle}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${trip.status === 'completed' ? 'bg-success/90 text-white' :
                        trip.status === 'ongoing' ? 'bg-warning/90 text-white' : 'bg-white/20 backdrop-blur-sm text-white'}`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base mb-1 truncate">{trip.title}</h3>
                  {trip.description && (
                    <p className={`text-xs mb-2 line-clamp-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      {trip.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs mb-3">
                    <span className={`flex items-center gap-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      <HiCalendar /> {formatDate(trip.startDate)}
                    </span>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      <HiGlobe /> {trip.cityCount || 0} cities
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-inherit">
                    {trip.totalBudget > 0 && (
                      <span className="text-sm font-bold text-primary">{formatCurrency(trip.totalBudget)}</span>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <Link to={`/trips/${trip._id}`}>
                        <motion.button whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition"><HiEye /></motion.button>
                      </Link>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteTrip(trip._id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-danger transition"><HiTrash /></motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-bold mb-2">No trips yet</h3>
          <p className={`text-sm mb-5 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Create your first trip and start exploring the world!
          </p>
          <Link to="/create-trip">
            <motion.button whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary/25">
              Create First Trip
            </motion.button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
