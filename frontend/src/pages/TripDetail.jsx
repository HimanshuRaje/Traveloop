import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate, formatCurrency, getTripDuration, travelStyles } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiCalendar, HiGlobe, HiCurrencyDollar, HiLocationMarker,
  HiShare, HiArrowLeft, HiClipboardList, HiBookOpen,
  HiClipboardCheck, HiExternalLink
} from 'react-icons/hi';
import EmptyState from '../components/EmptyState';

export default function TripDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [cityStops, setCityStops] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrip(); }, [id]);

  const fetchTrip = async () => {
    try {
      const { data } = await api.get(`/trips/${id}`);
      setTrip(data.trip);
      setCityStops(data.cityStops || []);
      setBudget(data.budget);
    } catch (err) { toast.error('Trip not found'); navigate('/trips'); }
    finally { setLoading(false); }
  };

  const handleShare = async () => {
    try {
      const { data } = await api.post(`/trips/${id}/share`);
      navigator.clipboard.writeText(window.location.origin + data.url);
      toast.success('Share link copied! 🔗');
    } catch (err) { toast.error('Failed to share'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!trip) return null;

  const duration = getTripDuration(trip.startDate, trip.endDate);
  const style = travelStyles.find(s => s.value === trip.travelStyle);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Header with cover */}
      <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10">
        <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'}
          alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <button onClick={() => navigate('/trips')}
            className="p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 hover:-translate-x-1 transition-all shadow-lg">
            <HiArrowLeft className="text-lg" />
          </button>
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="px-3 py-1.5 rounded-full bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {style?.icon} {trip.travelStyle}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border
              ${trip.status === 'completed' ? 'bg-success/20 border-success/30 text-success-light backdrop-blur-md' :
                trip.status === 'ongoing' ? 'bg-warning/20 border-warning/30 text-warning-light backdrop-blur-md' : 'bg-black/40 border-white/20 text-white backdrop-blur-md'}`}>
              {trip.status}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{trip.title}</h1>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: HiCalendar, label: 'Duration', value: `${duration} days`, color: 'text-primary' },
          { icon: HiGlobe, label: 'Cities', value: cityStops.length, color: 'text-accent' },
          { icon: HiCurrencyDollar, label: 'Budget', value: formatCurrency(budget?.totalEstimated || 0), color: 'text-warning' },
          { icon: HiCalendar, label: 'Dates', value: `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`, color: 'text-secondary' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
            ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
            <p className="text-2xl font-extrabold mb-1">{stat.value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {trip.description && (
        <div className={`rounded-3xl p-6 mb-8 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-3">About this trip</h3>
          <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{trip.description}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { label: 'Itinerary', icon: HiClipboardList, path: `/itinerary?trip=${id}`, color: 'from-primary to-primary-light' },
          { label: 'Budget', icon: HiCurrencyDollar, path: `/budget?trip=${id}`, color: 'from-amber-500 to-orange-400' },
          { label: 'Packing', icon: HiClipboardCheck, path: `/packing?trip=${id}`, color: 'from-teal-500 to-emerald-400' },
          { label: 'Journal', icon: HiBookOpen, path: `/journal?trip=${id}`, color: 'from-indigo-500 to-purple-500' },
        ].map((btn, i) => (
          <Link key={i} to={btn.path} className="flex-1 min-w-[140px]">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className={`w-full flex flex-col items-center justify-center gap-2 p-5 rounded-3xl bg-gradient-to-br ${btn.color} text-white font-bold shadow-lg opacity-90 hover:opacity-100 transition-all`}>
              <btn.icon className="text-3xl mb-1" /> 
              <span className="text-sm tracking-wide">{btn.label}</span>
            </motion.button>
          </Link>
        ))}
        <motion.button whileHover={{ scale: 1.03, y: -2 }} onClick={handleShare}
          className={`flex-1 min-w-[140px] flex flex-col items-center justify-center gap-2 p-5 rounded-3xl font-bold border transition-all duration-300
            ${isDark ? 'border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:border-gray-600 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl'}`}>
          <HiShare className="text-3xl text-accent mb-1" /> 
          <span className="text-sm tracking-wide">Share</span>
        </motion.button>
      </div>

      {/* City stops preview */}
      <div className={`rounded-3xl p-6 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-xl flex items-center gap-2"><HiLocationMarker className="text-primary" /> Route & Stops</h3>
          <Link to={`/itinerary?trip=${id}`} className="text-sm font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg">
            Edit Route <HiExternalLink />
          </Link>
        </div>
        {cityStops.length > 0 ? (
          <div className="space-y-4">
            {cityStops.map((stop, i) => (
              <div key={stop._id} className="flex gap-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {i + 1}
                  </div>
                  {i < cityStops.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 my-2 rounded-full" />}
                </div>
                <div className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border transition-colors hover:border-primary/30
                  ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                  {stop.image ? (
                    <img src={stop.image} alt={stop.cityName} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <HiGlobe className="text-gray-400 text-2xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-extrabold text-base mb-1">{stop.cityName}</p>
                    <p className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <HiGlobe className="text-accent" /> {stop.country}
                      {stop.startDate && (
                        <>
                          <span className="mx-1">•</span>
                          <HiCalendar className="text-primary" /> {formatDate(stop.startDate)}
                        </>
                      )}
                    </p>
                  </div>
                  {stop.estimatedCost > 0 && (
                    <div className="text-right">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Est. Cost</p>
                      <span className="text-sm font-extrabold text-primary">{formatCurrency(stop.estimatedCost)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon="🗺️"
            title="No cities added"
            description="You haven't added any destinations to this trip yet."
            action={
              <Link to={`/itinerary?trip=${id}`}>
                <motion.button whileHover={{ scale: 1.05 }}
                  className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-lg shadow-primary/25">
                  Build Itinerary
                </motion.button>
              </Link>
            }
          />
        )}
      </div>
    </motion.div>
  );
}
