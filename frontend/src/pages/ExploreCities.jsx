import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiSearch, HiGlobe, HiStar, HiTrendingUp, HiBookmark } from 'react-icons/hi';

const regions = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Middle East', 'Oceania'];

export default function ExploreCities() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [region, setRegion] = useState('All');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCities(); }, [search, region]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (region !== 'All') params.append('region', region);
      const { data } = await api.get(`/cities/search?${params}`);
      setCities(data.cities || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveDestination = async (city) => {
    try {
      await api.post('/auth/destinations', {
        cityName: city.cityName, country: city.country, image: city.image,
      });
      toast.success(`${city.cityName} saved! ❤️`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already saved');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Explore Cities 🌍</h1>
        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Discover amazing destinations around the world
        </p>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4
        ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
        <HiSearch className="text-gray-400" />
        <input type="text" placeholder="Search by city or country..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm" />
      </div>

      {/* Region filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {regions.map((r) => (
          <motion.button key={r} whileTap={{ scale: 0.95 }}
            onClick={() => setRegion(r)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${region === r
                ? 'gradient-primary text-white shadow-lg shadow-primary/25'
                : isDark ? 'bg-dark-card text-dark-text-secondary hover:text-dark-text' : 'bg-gray-100 text-light-text-secondary hover:text-light-text'
              }`}>
            {r}
          </motion.button>
        ))}
      </div>

      {/* Cities grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="skeleton h-48" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cities.map((city, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-card overflow-hidden group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img src={city.image} alt={city.cityName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={(e) => { e.stopPropagation(); saveDestination(city); }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition">
                  <HiBookmark />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                    {city.costIndex}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base">{city.cityName}</h3>
                <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  <HiGlobe /> {city.country}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-xs">
                    <HiTrendingUp className="text-primary" />
                    <span className="font-medium">Popularity: {city.popularity}</span>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    {city.region}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && cities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-lg font-bold">No cities found</h3>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Try a different search term or region
          </p>
        </div>
      )}
    </motion.div>
  );
}
