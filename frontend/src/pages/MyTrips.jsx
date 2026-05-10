import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate, formatCurrency, travelStyles } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import {
  HiSearch, HiPlus, HiTrash, HiEye, HiCalendar,
  HiGlobe, HiBookmark, HiMap
} from 'react-icons/hi';

export default function MyTrips() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
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

  const deleteTrip = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter((t) => t._id !== id));
      toast.success('Trip deleted successfully');
    } catch (err) { toast.error('Failed to delete trip'); }
  };

  const toggleBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.put(`/trips/${id}/bookmark`);
      setTrips(trips.map((t) => t._id === id ? { ...t, bookmarked: data.bookmarked } : t));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="My Trips" 
        subtitle={`${trips.length} trip${trips.length !== 1 ? 's' : ''} planned`}
        icon={HiMap}
        actionButton={
          <Link to="/create-trip">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/30 transition-all">
              <HiPlus className="text-lg" /> New Trip
            </motion.button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className={`flex items-center gap-3 flex-1 px-5 py-3.5 rounded-2xl border transition-all duration-300
          ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20' : 'bg-white border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm'}`}>
          <HiSearch className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input type="text" placeholder="Search your trips..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium" />
        </div>
        
        <div className="flex gap-4">
          <select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}
            className={`px-4 py-3.5 rounded-2xl border text-sm font-medium outline-none cursor-pointer appearance-none min-w-[140px]
              ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-gray-300 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}>
            <option value="">All Styles</option>
            {travelStyles.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className={`px-4 py-3.5 rounded-2xl border text-sm font-medium outline-none cursor-pointer appearance-none min-w-[140px]
              ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-gray-300 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
            <option value="budget">By Budget</option>
          </select>
        </div>
      </div>

      {/* Trip Grid */}
      {loading ? <CardSkeleton count={6} /> : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence>
            {trips.map((trip, i) => (
              <motion.div key={trip._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/trips/${trip._id}`)}
                className={`rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group flex flex-col
                  ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:shadow-primary/10 hover:border-primary/30' : 'bg-white border-gray-100 hover:shadow-xl hover:border-primary/20'}`}
              >
                <div className="relative h-52 overflow-hidden shrink-0">
                  <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                    alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  
                  <button onClick={(e) => toggleBookmark(trip._id, e)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 hover:scale-110 transition-all z-10 shadow-sm">
                    <HiBookmark className={`text-lg ${trip.bookmarked ? 'text-warning fill-warning' : ''}`} />
                  </button>
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border
                      ${trip.status === 'completed' ? 'bg-success/20 border-success/30 text-success-light backdrop-blur-md' :
                        trip.status === 'ongoing' ? 'bg-warning/20 border-warning/30 text-warning-light backdrop-blur-md' : 'bg-black/40 border-white/20 text-white backdrop-blur-md'}`}>
                      {trip.status}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-2.5 py-1 mb-2 rounded-lg bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {travelStyles.find(s => s.value === trip.travelStyle)?.icon} {trip.travelStyle}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-xl mb-1.5 truncate group-hover:text-primary transition-colors">{trip.title}</h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {trip.description || "No description provided."}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center gap-4 text-sm font-medium mb-4">
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <HiCalendar className="text-primary" /> {formatDate(trip.startDate)}
                      </span>
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <HiGlobe className="text-accent" /> {trip.cityCount || 0} cities
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-inherit">
                      <div>
                        {trip.totalBudget > 0 ? (
                          <>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Est. Budget</p>
                            <span className="text-base font-extrabold text-primary">{formatCurrency(trip.totalBudget)}</span>
                          </>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Budget Not Set</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip._id}`); }}
                          className={`p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors`}
                          aria-label="View Trip">
                          <HiEye className="text-lg" />
                        </button>
                        <button onClick={(e) => deleteTrip(trip._id, e)}
                          className={`p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-danger transition-colors`}
                          aria-label="Delete Trip">
                          <HiTrash className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState 
          icon="🌍"
          title="No trips found"
          description={search ? "We couldn't find any trips matching your search criteria." : "You haven't created any trips yet. Start planning your first adventure!"}
          action={
            <Link to="/create-trip">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/25">
                Create First Trip
              </motion.button>
            </Link>
          }
        />
      )}
    </motion.div>
  );
}
