import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiSearch, HiGlobe, HiTrendingUp, HiBookmark } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="Explore Cities" 
        subtitle="Discover amazing destinations around the world"
        icon={HiGlobe}
      />

      {/* Search */}
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 mb-6
        ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20' : 'bg-white border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm'}`}>
        <HiSearch className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <input type="text" placeholder="Search by city or country..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm font-medium" />
      </div>

      {/* Region filters */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {regions.map((r) => (
          <motion.button key={r} whileTap={{ scale: 0.95 }}
            onClick={() => setRegion(r)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
              ${region === r
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                : isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 shadow-sm'
              }`}>
            {r}
          </motion.button>
        ))}
      </div>

      {/* Cities grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`rounded-3xl overflow-hidden border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100'}`}>
              <div className="skeleton h-56" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {cities.map((city, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group flex flex-col
                  ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:shadow-primary/10 hover:border-primary/30' : 'bg-white border-gray-100 hover:shadow-xl hover:border-primary/20'}`}
            >
              <div className="relative h-56 overflow-hidden">
                <img src={city.image} alt={city.cityName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                
                <button onClick={(e) => { e.stopPropagation(); saveDestination(city); }}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 hover:scale-110 transition-all z-10 shadow-sm">
                  <HiBookmark className="text-lg" />
                </button>
                
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {city.costIndex}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-extrabold text-white text-xl leading-tight drop-shadow-md mb-1">{city.cityName}</h3>
                  <p className="text-sm text-white/90 font-medium truncate drop-shadow-md flex items-center gap-1.5">
                    <HiGlobe className="text-accent-light" /> {city.country}
                  </p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <HiTrendingUp className="text-primary text-lg" />
                  <span>{city.popularity}</span>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {city.region}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🔍"
          title="No cities found"
          description="Try a different search term or select a different region."
        />
      )}
    </motion.div>
  );
}
