import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate, formatCurrency, getDaysUntil, travelStyles } from '../utils/helpers';
import { StatSkeleton, CardSkeleton } from '../components/Skeletons';
import {
  HiMap, HiGlobe, HiCurrencyDollar, HiCalendar, HiPlus,
  HiArrowRight, HiStar, HiTrendingUp, HiLightningBolt,
  HiSun, HiLocationMarker
} from 'react-icons/hi';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const recommendedDestinations = [
  { city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', tag: 'Trending', price: '$800' },
  { city: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600', tag: 'Popular', price: '$1200' },
  { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', tag: 'Must Visit', price: '$1500' },
  { city: 'Marrakech', country: 'Morocco', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600', tag: 'Budget Friendly', price: '$450' },
  { city: 'Swiss Alps', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600', tag: 'Adventure', price: '$2000' },
  { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', tag: 'Luxury', price: '$1800' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await api.get('/trips?sort=newest');
      setTrips(data.trips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingTrips = trips.filter((t) => new Date(t.startDate) > new Date()).slice(0, 3);
  const totalBudget = trips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
  const totalCities = trips.reduce((sum, t) => sum + (t.cityCount || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
      {/* Hero welcome */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl gradient-hero text-white p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="text-primary-light text-sm font-medium mb-1">
              {greeting()}, {user?.name?.split(' ')[0]} ✨
            </motion.p>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Where to next?</h1>
            <p className="text-gray-300 text-sm max-w-md">
              Plan your next adventure with AI-powered recommendations and a beautiful itinerary builder.
            </p>
          </div>
          <Link to="/create-trip">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-dark-bg font-semibold text-sm shadow-xl hover:shadow-2xl transition-shadow">
              <HiPlus /> Plan New Trip
            </motion.button>
          </Link>
        </div>

        {/* Quick stats inline */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: HiMap, label: 'Total Trips', value: trips.length, color: 'from-primary to-primary-light' },
            { icon: HiGlobe, label: 'Cities Visited', value: totalCities, color: 'from-accent to-accent-light' },
            { icon: HiCurrencyDollar, label: 'Total Budget', value: formatCurrency(totalBudget), color: 'from-warning to-yellow-300' },
            { icon: HiCalendar, label: 'Upcoming', value: upcomingTrips.length, color: 'from-secondary to-secondary-light' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass rounded-xl p-3"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="text-white text-sm" />
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming trips */}
      <motion.section variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <HiCalendar className="text-primary" /> Upcoming Trips
          </h2>
          <Link to="/trips" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View all <HiArrowRight />
          </Link>
        </div>

        {loading ? <CardSkeleton count={3} /> : upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingTrips.map((trip, i) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/trips/${trip._id}`}>
                  <div className="glass-card overflow-hidden group cursor-pointer">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600`}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary/90 text-white text-xs font-medium">
                          {getDaysUntil(trip.startDate) > 0 ? `In ${getDaysUntil(trip.startDate)} days` : 'Today!'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1 truncate">{trip.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><HiCalendar />{formatDate(trip.startDate)}</span>
                        <span className="flex items-center gap-1"><HiGlobe />{trip.cityCount || 0} cities</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
                          {travelStyles.find(s => s.value === trip.travelStyle)?.icon} {trip.travelStyle}
                        </span>
                        {trip.totalBudget > 0 && (
                          <span className="text-sm font-semibold text-primary">{formatCurrency(trip.totalBudget)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`glass-card p-8 text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            <div className="text-5xl mb-3">🗺️</div>
            <h3 className="font-bold text-lg mb-1">No upcoming trips</h3>
            <p className="text-sm mb-4">Start planning your next adventure!</p>
            <Link to="/create-trip">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
                Plan a Trip
              </motion.button>
            </Link>
          </div>
        )}
      </motion.section>

      {/* AI Recommendations */}
      <motion.section variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <HiLightningBolt className="text-warning" /> AI Recommendations
          </h2>
          <Link to="/explore-cities" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            Explore all <HiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendedDestinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card overflow-hidden cursor-pointer group"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={dest.image} alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium">
                  {dest.tag}
                </span>
              </div>
              <div className="p-2.5">
                <h4 className="font-bold text-sm">{dest.city}</h4>
                <p className={`text-[11px] ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  {dest.country}
                </p>
                <p className="text-xs font-semibold text-primary mt-1">from {dest.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Weather & Quick Tools */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Weather Widget Placeholder */}
        <div className="glass-card-static p-5">
          <h3 className="font-bold flex items-center gap-2 mb-3">
            <HiSun className="text-warning" /> Weather
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">28°C</p>
              <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                Partly Cloudy
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                <HiLocationMarker className="inline" /> Your Location
              </p>
            </div>
            <div className="text-6xl">⛅</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card-static p-5">
          <h3 className="font-bold flex items-center gap-2 mb-3">
            <HiTrendingUp className="text-accent" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Create Trip', icon: '✈️', path: '/create-trip', color: 'bg-primary/10 text-primary' },
              { label: 'Explore', icon: '🌍', path: '/explore-cities', color: 'bg-accent/10 text-accent' },
              { label: 'Activities', icon: '🎯', path: '/activities', color: 'bg-secondary/10 text-secondary' },
              { label: 'My Trips', icon: '🗺️', path: '/trips', color: 'bg-warning/10 text-warning' },
            ].map((action, i) => (
              <Link key={i} to={action.path}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={`${action.color} rounded-xl p-3 text-center cursor-pointer transition-all`}>
                  <span className="text-xl block mb-1">{action.icon}</span>
                  <span className="text-xs font-medium">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
