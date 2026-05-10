import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiSearch, HiLocationMarker, HiCalendar, HiMenu } from 'react-icons/hi';

export default function ItineraryBuilder() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip');
  const [trip, setTrip] = useState(null);
  const [cityStops, setCityStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCity, setShowAddCity] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(null);
  const [activityForm, setActivityForm] = useState({ name: '', category: 'sightseeing', cost: 0, duration: '1-2 hours' });
  const [activities, setActivities] = useState({});

  useEffect(() => {
    if (tripId) { fetchData(); }
  }, [tripId]);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/trips/${tripId}`);
      setTrip(data.trip);
      setCityStops(data.cityStops || []);
      for (const stop of (data.cityStops || [])) {
        const actData = await api.get(`/cities/${stop._id}/activities`);
        setActivities(prev => ({ ...prev, [stop._id]: actData.data.activities || [] }));
      }
    } catch (err) { toast.error('Failed to load itinerary'); }
    finally { setLoading(false); }
  };

  const searchCities = async (q) => {
    setCitySearch(q);
    if (q.length < 2) { setCityResults([]); return; }
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/cities/search?q=${q}`);
      setCityResults(data.cities || []);
    } catch (err) { console.error(err); }
    finally { setSearchLoading(false); }
  };

  const addCity = async (city) => {
    try {
      const { data } = await api.post(`/trips/${tripId}/cities`, {
        cityName: city.cityName, country: city.country,
        image: city.image, estimatedCost: 0,
        popularity: city.popularity, costIndex: city.costIndex,
      });
      setCityStops([...cityStops, data.cityStop]);
      setShowAddCity(false);
      setCitySearch('');
      toast.success(`${city.cityName} added!`);
    } catch (err) { toast.error('Failed to add city'); }
  };

  const removeCity = async (id) => {
    try {
      await api.delete(`/cities/${id}`);
      setCityStops(cityStops.filter(s => s._id !== id));
      toast.success('City removed');
    } catch (err) { toast.error('Failed to remove'); }
  };

  const addActivity = async (cityStopId) => {
    if (!activityForm.name) return toast.error('Activity name required');
    try {
      const { data } = await api.post(`/cities/${cityStopId}/activities`, activityForm);
      setActivities(prev => ({
        ...prev,
        [cityStopId]: [...(prev[cityStopId] || []), data.activity],
      }));
      setActivityForm({ name: '', category: 'sightseeing', cost: 0, duration: '1-2 hours' });
      setShowActivityModal(null);
      toast.success('Activity added!');
    } catch (err) { toast.error('Failed to add activity'); }
  };

  const handleReorder = async (newOrder) => {
    setCityStops(newOrder);
    try {
      await api.put(`/trips/${tripId}/cities/reorder`, {
        orderedIds: newOrder.map(s => s._id),
      });
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!tripId) return (
    <div className="glass-card p-12 text-center">
      <p className="text-5xl mb-4">📋</p>
      <h2 className="text-xl font-bold mb-2">Select a trip first</h2>
      <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
        Go to My Trips and select a trip to build its itinerary
      </p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Itinerary Builder 📋</h1>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            {trip?.title} • Drag to reorder stops
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddCity(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
          <HiPlus /> Add City
        </motion.button>
      </div>

      {/* Timeline */}
      {cityStops.length > 0 ? (
        <Reorder.Group axis="y" values={cityStops} onReorder={handleReorder} className="space-y-4">
          {cityStops.map((stop, i) => (
            <Reorder.Item key={stop._id} value={stop}>
              <motion.div layout className="glass-card overflow-hidden">
                <div className="flex items-stretch">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center px-4 py-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < cityStops.length - 1 && <div className="flex-1 w-0.5 bg-primary/30 my-2" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-4 pr-4">
                    <div className="flex items-start gap-3">
                      {stop.image && (
                        <img src={stop.image} alt={stop.cityName}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base">{stop.cityName}</h3>
                          <div className="flex items-center gap-1">
                            <button className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                              <HiMenu />
                            </button>
                            <button onClick={() => removeCity(stop._id)}
                              className="p-1 text-gray-400 hover:text-danger transition">
                              <HiTrash />
                            </button>
                          </div>
                        </div>
                        <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                          <HiLocationMarker /> {stop.country}
                          {stop.costIndex && <span className="ml-2">{stop.costIndex}</span>}
                        </p>

                        {/* Activities */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Activities</span>
                            <button onClick={() => setShowActivityModal(stop._id)}
                              className="text-xs text-primary hover:underline flex items-center gap-1">
                              <HiPlus className="text-[10px]" /> Add
                            </button>
                          </div>
                          {(activities[stop._id] || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {(activities[stop._id] || []).map((act) => (
                                <span key={act._id}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium
                                    ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
                                  {act.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                              No activities added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-4">🏙️</p>
          <h3 className="text-lg font-bold mb-2">No cities added</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Start building your itinerary by adding cities
          </p>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAddCity(true)}
            className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
            Add First City
          </motion.button>
        </div>
      )}

      {/* Add City Modal */}
      <Modal isOpen={showAddCity} onClose={() => setShowAddCity(false)} title="Add City" size="lg">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4
          ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-50 border-light-border'}`}>
          <HiSearch className="text-gray-400" />
          <input type="text" placeholder="Search cities..." value={citySearch}
            onChange={(e) => searchCities(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {searchLoading && <p className="text-sm text-center py-4">Searching...</p>}
          {cityResults.map((city, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-50'}`}
              onClick={() => addCity(city)}>
              <img src={city.image} alt={city.cityName} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm">{city.cityName}</p>
                <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  {city.country} • {city.costIndex}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary font-semibold">Pop: {city.popularity}</div>
                <button className="text-xs text-primary hover:underline">+ Add</button>
              </div>
            </motion.div>
          ))}
          {citySearch.length >= 2 && !searchLoading && cityResults.length === 0 && (
            <p className="text-sm text-center py-4 text-gray-500">No cities found</p>
          )}
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={!!showActivityModal} onClose={() => setShowActivityModal(null)} title="Add Activity">
        <div className="space-y-3">
          <input type="text" placeholder="Activity name" value={activityForm.name}
            onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
              ${isDark ? 'bg-dark-card border-dark-border text-dark-text focus:border-primary focus:ring-1 focus:ring-primary/30' : 'bg-gray-50 border-light-border focus:border-primary focus:ring-1 focus:ring-primary/30'}`} />
          <select value={activityForm.category}
            onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none
              ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-gray-50 border-light-border'}`}>
            {['sightseeing','adventure','food','nightlife','shopping','culture','nature','wellness'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <input type="number" placeholder="Cost ($)" value={activityForm.cost}
            onChange={(e) => setActivityForm({ ...activityForm, cost: Number(e.target.value) })}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
              ${isDark ? 'bg-dark-card border-dark-border text-dark-text focus:border-primary focus:ring-1 focus:ring-primary/30' : 'bg-gray-50 border-light-border focus:border-primary focus:ring-1 focus:ring-primary/30'}`} />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => addActivity(showActivityModal)}
            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm">
            Add Activity
          </motion.button>
        </div>
      </Modal>
    </motion.div>
  );
}
