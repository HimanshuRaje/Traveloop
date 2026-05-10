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

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

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
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-12 pb-10">
      {/* Hero welcome with overlapping stats */}
      <motion.div variants={fadeUp} className="relative">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-accent text-white p-8 lg:p-12 pb-24 lg:pb-28 shadow-2xl relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 mix-blend-overlay" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase mb-5 shadow-sm">
                  {greeting()}, {user?.name?.split(' ')[0]} 👋
                </span>
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                Where to next?
              </h1>
              <p className="text-white/80 text-base lg:text-lg font-medium max-w-xl leading-relaxed">
                Plan your next incredible adventure with AI-powered recommendations and a beautiful, intuitive itinerary builder.
              </p>
            </div>
            <Link to="/create-trip" className="shrink-0 mt-4 md:mt-0">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary-dark font-bold text-base shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
                <HiPlus className="text-xl" /> Plan New Trip
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Quick stats overlapping the hero */}
        <div className="relative z-20 px-4 lg:px-8 -mt-16 lg:-mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: HiMap, label: 'Total Trips', value: trips.length, color: 'text-primary', bg: 'bg-primary/10' },
              { icon: HiGlobe, label: 'Cities Visited', value: totalCities, color: 'text-accent', bg: 'bg-accent/10' },
              { icon: HiCurrencyDollar, label: 'Total Budget', value: formatCurrency(totalBudget), color: 'text-warning', bg: 'bg-warning/10' },
              { icon: HiCalendar, label: 'Upcoming', value: upcomingTrips.length, color: 'text-secondary', bg: 'bg-secondary/10' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                className={`rounded-2xl p-5 lg:p-6 shadow-xl border backdrop-blur-xl ${isDark ? 'bg-gray-900/80 border-gray-700 shadow-black/20' : 'bg-white/90 border-white/40 shadow-gray-200/50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`text-2xl lg:text-3xl ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-extrabold">{stat.value}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Upcoming trips */}
      <motion.section variants={fadeUp} className="px-2">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <HiCalendar className="text-primary" /> Upcoming Trips
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your next adventures await</p>
          </div>
          <Link to="/trips">
            <motion.div whileHover={{ x: 4 }} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
              View all <HiArrowRight />
            </motion.div>
          </Link>
        </div>

        {loading ? <CardSkeleton count={3} /> : upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {upcomingTrips.map((trip, i) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/trips/${trip._id}`}>
                  <div className={`rounded-3xl overflow-hidden group cursor-pointer border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:shadow-primary/10 hover:border-primary/30' : 'bg-white border-gray-100 hover:shadow-xl hover:border-primary/20'}`}>
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800`}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                      
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-sm">
                          {getDaysUntil(trip.startDate) > 0 ? `In ${getDaysUntil(trip.startDate)} days` : 'Happening Now!'}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-extrabold text-white text-xl mb-2 truncate drop-shadow-md">{trip.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/90 font-medium">
                          <span className="flex items-center gap-1.5"><HiCalendar className="text-primary-light" />{formatDate(trip.startDate)}</span>
                          <span className="flex items-center gap-1.5"><HiGlobe className="text-accent-light" />{trip.cityCount || 0} cities</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2
                        ${isDark ? 'bg-gray-900/80 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                        {travelStyles.find(s => s.value === trip.travelStyle)?.icon} {trip.travelStyle}
                      </span>
                      {trip.totalBudget > 0 && (
                        <div className="text-right">
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Est. Budget</p>
                          <span className="text-base font-extrabold text-primary">{formatCurrency(trip.totalBudget)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`rounded-3xl p-12 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-800/20' : 'bg-gray-50/50'}`}>
            <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-5xl">🗺️</div>
            <h3 className="font-extrabold text-2xl mb-2">No upcoming trips yet</h3>
            <p className={`text-base max-w-md mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your itinerary is looking a bit empty. It's time to start dreaming up your next grand adventure!</p>
            <Link to="/create-trip">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-base font-bold shadow-lg shadow-primary/30 transition-all">
                Start Planning Now
              </motion.button>
            </Link>
          </div>
        )}
      </motion.section>

      {/* AI Recommendations */}
      <motion.section variants={fadeUp} className="px-2">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <HiLightningBolt className="text-warning" /> AI Travel Inspiration
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Trending destinations curated for you</p>
          </div>
          <Link to="/explore-cities">
            <motion.div whileHover={{ x: 4 }} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
              Explore all <HiArrowRight />
            </motion.div>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {recommendedDestinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`rounded-2xl overflow-hidden cursor-pointer group border transition-all duration-300 hover:shadow-xl ${isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-white'}`}
            >
              <div className="relative h-44 overflow-hidden">
                <img src={dest.image} alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {dest.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="font-extrabold text-white text-base leading-tight drop-shadow-md">{dest.city}</h4>
                  <p className="text-xs text-white/80 font-medium truncate drop-shadow-md">
                    {dest.country}
                  </p>
                </div>
              </div>
              <div className="p-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Est. Price</span>
                <span className="text-sm font-extrabold text-primary">{dest.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Weather & Quick Tools */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 px-2">
        {/* Weather Widget */}
        <div className={`rounded-3xl p-6 lg:p-8 border shadow-sm relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-warning/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <h3 className="font-bold flex items-center gap-2 mb-6 text-lg relative z-10">
            <HiSun className="text-warning text-xl" /> Current Conditions
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-5xl font-black">28°</p>
                <span className={`text-xl font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>C</span>
              </div>
              <p className="text-lg font-bold mb-2">Partly Cloudy</p>
              <p className={`text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <HiLocationMarker className="text-primary" /> Your Location
              </p>
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl drop-shadow-xl"
            >
              ⛅
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-3xl p-6 lg:p-8 border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100'}`}>
          <h3 className="font-bold flex items-center gap-2 mb-6 text-lg">
            <HiTrendingUp className="text-accent text-xl" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {[
              { label: 'Create Trip', desc: 'Start planning', icon: '✈️', path: '/create-trip', bg: 'bg-primary/10', text: 'text-primary', hoverBorder: 'hover:border-primary/30' },
              { label: 'Explore', desc: 'Find destinations', icon: '🌍', path: '/explore-cities', bg: 'bg-accent/10', text: 'text-accent', hoverBorder: 'hover:border-accent/30' },
              { label: 'Activities', desc: 'Book tours', icon: '🎯', path: '/activities', bg: 'bg-secondary/10', text: 'text-secondary', hoverBorder: 'hover:border-secondary/30' },
              { label: 'My Trips', desc: 'View itineraries', icon: '🗺️', path: '/trips', bg: 'bg-warning/10', text: 'text-warning', hoverBorder: 'hover:border-warning/30' },
            ].map((action, i) => (
              <Link key={i} to={action.path}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={`rounded-2xl p-4 cursor-pointer transition-all border border-transparent ${action.hoverBorder} ${isDark ? 'bg-gray-900/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-white hover:shadow-md'} flex items-center gap-4 h-full`}>
                  <div className={`w-12 h-12 rounded-xl ${action.bg} ${action.text} flex items-center justify-center text-2xl shrink-0`}>
                    {action.icon}
                  </div>
                  <div>
                    <span className="font-bold text-sm block mb-0.5">{action.label}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{action.desc}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
