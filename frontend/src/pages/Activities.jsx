import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { activityCategories } from '../utils/helpers';
import Modal from '../components/Modal';
import { HiSearch, HiStar, HiClock, HiCurrencyDollar, HiLightningBolt } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const sampleActivities = [
  { name: 'Eiffel Tower Visit', category: 'sightseeing', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=400', cost: 25, duration: '2-3 hours', rating: 4.8, location: 'Paris' },
  { name: 'Scuba Diving', category: 'adventure', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', cost: 80, duration: '3-4 hours', rating: 4.7, location: 'Bali' },
  { name: 'Street Food Tour', category: 'food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', cost: 30, duration: '2-3 hours', rating: 4.9, location: 'Bangkok' },
  { name: 'Rooftop Bar Hopping', category: 'nightlife', image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400', cost: 50, duration: '3-4 hours', rating: 4.5, location: 'Dubai' },
  { name: 'Colosseum Tour', category: 'culture', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', cost: 20, duration: '2-3 hours', rating: 4.8, location: 'Rome' },
  { name: 'Hiking Trail', category: 'nature', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', cost: 0, duration: '4-6 hours', rating: 4.6, location: 'Swiss Alps' },
  { name: 'Spa & Wellness', category: 'wellness', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', cost: 60, duration: '2-3 hours', rating: 4.7, location: 'Bali' },
  { name: 'Shopping at Souks', category: 'shopping', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400', cost: 0, duration: '2-3 hours', rating: 4.3, location: 'Marrakech' },
  { name: 'Surfing Lesson', category: 'adventure', image: 'https://images.unsplash.com/photo-1502680390548-bdbac40e4ce3?w=400', cost: 45, duration: '2-3 hours', rating: 4.5, location: 'Bali' },
  { name: 'Wine Tasting', category: 'food', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', cost: 40, duration: '2-3 hours', rating: 4.6, location: 'Santorini' },
  { name: 'Temple Visit', category: 'sightseeing', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', cost: 5, duration: '1-2 hours', rating: 4.7, location: 'Kyoto' },
  { name: 'Desert Safari', category: 'adventure', image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400', cost: 70, duration: '4-6 hours', rating: 4.8, location: 'Dubai' },
];

export default function Activities() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const filtered = sampleActivities.filter((a) => {
    const matchCategory = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="Activity Explorer" 
        subtitle="Discover amazing things to do around the world"
        icon={HiLightningBolt}
      />

      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 mb-6
        ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20' : 'bg-white border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm'}`}>
        <HiSearch className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <input type="text" placeholder="Search activities or locations..." value={search}
          onChange={(e) => setSearch(e.target.value)} 
          className="flex-1 bg-transparent outline-none text-sm font-medium" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
            ${activeCategory === 'all' 
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
              : isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 shadow-sm'}`}>
          🌟 All
        </motion.button>
        {activityCategories.map((cat) => (
          <motion.button key={cat.value} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat.value)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
              ${activeCategory === cat.value 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                : isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 shadow-sm'}`}>
            {cat.icon} {cat.label}
          </motion.button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filtered.map((activity, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedActivity(activity)}
              className={`rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group flex flex-col
                  ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:shadow-primary/10 hover:border-primary/30' : 'bg-white border-gray-100 hover:shadow-xl hover:border-primary/20'}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={activity.image} alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {activityCategories.find(c => c.value === activity.category)?.icon} {activity.category}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-lg mb-1 group-hover:text-primary transition-colors truncate">{activity.name}</h3>
                <p className={`text-sm mb-4 font-medium flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="text-accent">📍</span> {activity.location}
                </p>
                <div className="mt-auto flex items-center justify-between text-sm font-bold pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-1.5"><HiStar className="text-warning text-lg" /> {activity.rating}</span>
                  <span className="flex items-center gap-1.5"><HiClock className="text-accent-light text-lg" /> {activity.duration}</span>
                  <span className="font-extrabold text-primary text-base">
                    {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🎯"
          title="No activities found"
          description="We couldn't find any activities matching your search or category."
        />
      )}

      <Modal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.name} size="md">
        {selectedActivity && (
          <div>
            <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg">
              <img src={selectedActivity.image} alt={selectedActivity.name}
                className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <p className="text-white font-medium flex items-center gap-1.5">
                  📍 {selectedActivity.location}
                </p>
                <span className="px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {activityCategories.find(c => c.value === selectedActivity.category)?.icon} {selectedActivity.category}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className={`p-4 rounded-2xl text-center border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <HiStar className="text-warning mx-auto mb-2 text-2xl" />
                <p className="text-base font-extrabold">{selectedActivity.rating}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Rating</p>
              </div>
              <div className={`p-4 rounded-2xl text-center border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <HiClock className="text-accent-light mx-auto mb-2 text-2xl" />
                <p className="text-base font-extrabold">{selectedActivity.duration}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Duration</p>
              </div>
              <div className={`p-4 rounded-2xl text-center border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <HiCurrencyDollar className="text-primary mx-auto mb-2 text-2xl" />
                <p className="text-base font-extrabold">{selectedActivity.cost > 0 ? `$${selectedActivity.cost}` : 'Free'}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Cost</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
