import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDate, formatCurrency, travelStyles } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiLocationMarker, HiCalendar, HiEye, HiDuplicate, HiShare } from 'react-icons/hi';

export default function SharedTrip() {
  const { slug } = useParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [cityStops, setCityStops] = useState([]);
  const [budget, setBudget] = useState(null);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShared(); }, [slug]);

  const fetchShared = async () => {
    try {
      const { data } = await api.get(`/trips/shared/${slug}`);
      setTrip(data.trip);
      setCityStops(data.cityStops || []);
      setBudget(data.budget);
      setViews(data.views);
    } catch (err) { toast.error('Trip not found'); }
    finally { setLoading(false); }
  };

  const copyTrip = async () => {
    if (!user) { toast.error('Login to copy this trip'); navigate('/login'); return; }
    try {
      const { data } = await api.post(`/trips/copy/${slug}`);
      toast.success('Trip copied! 🎉');
      navigate(`/trips/${data.trip._id}`);
    } catch (err) { toast.error('Failed to copy'); }
  };

  const shareUrl = window.location.href;
  const shareToTwitter = () => window.open(`https://twitter.com/intent/tweet?text=Check out this trip on Traveloop!&url=${shareUrl}`, '_blank');
  const shareToWhatsApp = () => window.open(`https://wa.me/?text=Check out this trip: ${shareUrl}`, '_blank');
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-5xl mb-4">🔍</p><h2 className="text-xl font-bold">Trip not found</h2></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
            <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'}
              alt={trip.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-1">{trip.title}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><HiCalendar /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                <span className="flex items-center gap-1"><HiEye /> {views} views</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <motion.button whileHover={{ scale: 1.03 }} onClick={copyTrip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
              <HiDuplicate /> Copy This Trip
            </motion.button>
            <button onClick={shareToTwitter} className="px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium">𝕏 Twitter</button>
            <button onClick={shareToWhatsApp} className="px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium">WhatsApp</button>
            <button onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
                ${isDark ? 'border-dark-border hover:bg-dark-card' : 'border-light-border hover:bg-gray-50'}`}>
              <HiShare /> Copy Link
            </button>
          </div>

          {trip.description && (
            <div className="glass-card p-5 mb-6">
              <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{trip.description}</p>
            </div>
          )}

          {/* Itinerary Timeline */}
          <div className="glass-card p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <HiLocationMarker className="text-primary" /> Itinerary
            </h2>
            <div className="space-y-4">
              {cityStops.map((stop, i) => (
                <div key={stop._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                    {i < cityStops.length - 1 && <div className="flex-1 w-0.5 bg-primary/30 my-1" />}
                  </div>
                  <div className={`flex-1 p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      {stop.image && <img src={stop.image} alt={stop.cityName} className="w-12 h-12 rounded-lg object-cover" />}
                      <div>
                        <h3 className="font-bold">{stop.cityName}</h3>
                        <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                          {stop.country} {stop.startDate && `• ${formatDate(stop.startDate)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared by */}
          <div className="mt-6 text-center">
            <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Shared on Traveloop • Powered by ✈️
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
