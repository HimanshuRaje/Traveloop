import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate, formatCurrency, getTripDuration, travelStyles } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiCalendar, HiGlobe, HiCurrencyDollar, HiLocationMarker,
  HiShare, HiPencil, HiArrowLeft, HiClipboardList, HiBookOpen,
  HiClipboardCheck, HiExternalLink
} from 'react-icons/hi';

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header with cover */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
        <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'}
          alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/trips')}
            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition">
            <HiArrowLeft />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/90 text-white text-xs font-medium">
              {style?.icon} {trip.travelStyle}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium
              ${trip.status === 'completed' ? 'bg-success text-white' : 'bg-white/20 backdrop-blur-sm text-white'}`}>
              {trip.status}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{trip.title}</h1>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: HiCalendar, label: 'Duration', value: `${duration} days`, color: 'text-primary' },
          { icon: HiGlobe, label: 'Cities', value: cityStops.length, color: 'text-accent' },
          { icon: HiCurrencyDollar, label: 'Budget', value: formatCurrency(budget?.totalEstimated || 0), color: 'text-warning' },
          { icon: HiCalendar, label: 'Dates', value: `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`, color: 'text-secondary' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <stat.icon className={`text-xl mb-1 ${stat.color}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {trip.description && (
        <div className="glass-card p-5 mb-6">
          <h3 className="font-bold mb-2">About this trip</h3>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{trip.description}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Itinerary', icon: HiClipboardList, path: `/itinerary?trip=${id}`, color: 'gradient-primary' },
          { label: 'Budget', icon: HiCurrencyDollar, path: `/budget?trip=${id}`, color: 'gradient-warm' },
          { label: 'Packing', icon: HiClipboardCheck, path: `/packing?trip=${id}`, color: 'bg-accent' },
          { label: 'Journal', icon: HiBookOpen, path: `/journal?trip=${id}`, color: 'bg-primary-dark' },
        ].map((btn, i) => (
          <Link key={i} to={btn.path}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${btn.color} text-white text-sm font-medium shadow-lg`}>
              <btn.icon /> {btn.label}
            </motion.button>
          </Link>
        ))}
        <motion.button whileHover={{ scale: 1.03 }} onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border
            ${isDark ? 'border-dark-border hover:bg-dark-card' : 'border-light-border hover:bg-gray-50'}`}>
          <HiShare /> Share
        </motion.button>
      </div>

      {/* City stops preview */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><HiLocationMarker className="text-primary" /> Itinerary</h3>
          <Link to={`/itinerary?trip=${id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
            Edit <HiExternalLink />
          </Link>
        </div>
        {cityStops.length > 0 ? (
          <div className="space-y-3">
            {cityStops.map((stop, i) => (
              <div key={stop._id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  {i < cityStops.length - 1 && <div className="w-0.5 h-8 bg-primary/30 my-1" />}
                </div>
                <div className={`flex-1 flex items-center gap-3 p-3 rounded-xl
                  ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                  {stop.image && (
                    <img src={stop.image} alt={stop.cityName} className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stop.cityName}</p>
                    <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      {stop.country} {stop.startDate && `• ${formatDate(stop.startDate)}`}
                    </p>
                  </div>
                  {stop.estimatedCost > 0 && (
                    <span className="text-xs font-semibold text-primary">{formatCurrency(stop.estimatedCost)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              No cities added yet
            </p>
            <Link to={`/itinerary?trip=${id}`}>
              <motion.button whileHover={{ scale: 1.05 }}
                className="mt-3 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium">
                Build Itinerary
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
