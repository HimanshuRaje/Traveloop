import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { activityCategories } from '../utils/helpers';
import Modal from '../components/Modal';
import { HiSearch, HiStar, HiClock, HiCurrencyDollar, HiFilter } from 'react-icons/hi';

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Explorer 🎯</h1>
        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Discover amazing things to do
        </p>
      </div>

      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4
        ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
        <HiSearch className="text-gray-400" />
        <input type="text" placeholder="Search activities..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
            ${activeCategory === 'all' ? 'gradient-primary text-white' : isDark ? 'bg-dark-card text-dark-text-secondary' : 'bg-gray-100 text-light-text-secondary'}`}>
          🌟 All
        </motion.button>
        {activityCategories.map((cat) => (
          <motion.button key={cat.value} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${activeCategory === cat.value ? 'gradient-primary text-white' : isDark ? 'bg-dark-card text-dark-text-secondary' : 'bg-gray-100 text-light-text-secondary'}`}>
            {cat.icon} {cat.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((activity, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
            onClick={() => setSelectedActivity(activity)}
            className="glass-card overflow-hidden cursor-pointer group">
            <div className="relative h-40 overflow-hidden">
              <img src={activity.image} alt={activity.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                {activityCategories.find(c => c.value === activity.category)?.icon} {activity.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm mb-1">{activity.name}</h3>
              <p className={`text-xs mb-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                📍 {activity.location}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><HiStar className="text-warning" /> {activity.rating}</span>
                <span className="flex items-center gap-1"><HiClock className="text-accent" /> {activity.duration}</span>
                <span className="font-semibold text-primary">
                  {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.name} size="md">
        {selectedActivity && (
          <div>
            <img src={selectedActivity.image} alt={selectedActivity.name}
              className="w-full h-48 object-cover rounded-xl mb-4" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                <HiStar className="text-warning mx-auto mb-1" />
                <p className="text-sm font-bold">{selectedActivity.rating}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                <HiClock className="text-accent mx-auto mb-1" />
                <p className="text-sm font-bold">{selectedActivity.duration}</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                <HiCurrencyDollar className="text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{selectedActivity.cost > 0 ? `$${selectedActivity.cost}` : 'Free'}</p>
                <p className="text-xs text-gray-500">Cost</p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              📍 {selectedActivity.location} • {activityCategories.find(c => c.value === selectedActivity.category)?.icon} {selectedActivity.category}
            </p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
