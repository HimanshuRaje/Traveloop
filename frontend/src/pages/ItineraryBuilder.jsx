import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiSearch, HiLocationMarker, HiMenu, HiClipboardList } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

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
    <EmptyState 
      icon="📋"
      title="Select a trip first"
      description="Go to My Trips and select a trip to build its itinerary"
    />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="Itinerary Builder" 
        subtitle={`${trip?.title} • Drag to reorder stops`}
        icon={HiClipboardList}
        actionButton={
          <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddCity(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/30 transition-all">
            <HiPlus className="text-lg" /> Add City
          </motion.button>
        }
      />

      {/* Timeline */}
      {cityStops.length > 0 ? (
        <Reorder.Group axis="y" values={cityStops} onReorder={handleReorder} className="space-y-6">
          {cityStops.map((stop, i) => (
            <Reorder.Item key={stop._id} value={stop}>
              <motion.div layout className={`rounded-3xl overflow-hidden border transition-shadow duration-300 hover:shadow-xl
                  ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:shadow-primary/10 hover:border-primary/30' : 'bg-white border-gray-100 hover:border-primary/20'}`}>
                <div className="flex items-stretch">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center px-6 py-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-extrabold text-lg shadow-md flex-shrink-0 cursor-grab active:cursor-grabbing">
                      {i + 1}
                    </div>
                    {i < cityStops.length - 1 && <div className="flex-1 w-1 bg-primary/20 my-3 rounded-full" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-6 pr-6 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      {stop.image && (
                        <img src={stop.image} alt={stop.cityName}
                          className="w-full sm:w-24 h-40 sm:h-24 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
                      )}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-extrabold text-xl truncate">{stop.cityName}</h3>
                          <div className="flex items-center gap-2">
                            <button className="p-2 cursor-grab active:cursor-grabbing rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                              <HiMenu className="text-lg" />
                            </button>
                            <button onClick={() => removeCity(stop._id)}
                              className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-danger hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                              <HiTrash className="text-lg" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm font-medium flex items-center gap-1.5 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <HiLocationMarker className="text-accent" /> {stop.country}
                          {stop.costIndex && <span className="ml-2 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider">{stop.costIndex}</span>}
                        </p>

                        {/* Activities */}
                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200/60'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Planned Activities</span>
                            <button onClick={() => setShowActivityModal(stop._id)}
                              className="text-xs font-bold text-primary hover:text-primary-light flex items-center gap-1 bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors">
                              <HiPlus /> Add Activity
                            </button>
                          </div>
                          {(activities[stop._id] || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {(activities[stop._id] || []).map((act) => (
                                <span key={act._id}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border
                                    ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}>
                                  {act.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              No activities planned yet
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
        <EmptyState 
          icon="🏙️"
          title="No cities added"
          description="Start building your itinerary by adding destinations."
          action={
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddCity(true)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/25 mt-4">
              Add First City
            </motion.button>
          }
        />
      )}

      {/* Add City Modal */}
      <Modal isOpen={showAddCity} onClose={() => setShowAddCity(false)} title="Add City" size="lg">
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border mb-6 transition-all duration-300
          ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20' : 'bg-gray-50 border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
          <HiSearch className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input type="text" placeholder="Search cities..." value={citySearch}
            onChange={(e) => searchCities(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium" />
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {searchLoading && <p className="text-sm font-medium text-center py-8">Searching destinations...</p>}
          {cityResults.map((city, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md
                ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-primary/50' : 'bg-white border-gray-200 hover:border-primary/30'}`}
              onClick={() => addCity(city)}>
              <img src={city.image} alt={city.cityName} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-base truncate mb-0.5">{city.cityName}</p>
                <p className={`text-xs font-medium truncate flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <HiLocationMarker className="text-accent" /> {city.country} 
                  <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase ml-1">{city.costIndex}</span>
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pop: <span className="text-primary">{city.popularity}</span></div>
                <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors">+ Add</button>
              </div>
            </motion.div>
          ))}
          {citySearch.length >= 2 && !searchLoading && cityResults.length === 0 && (
            <p className="text-sm font-medium text-center py-8 text-gray-500">No destinations found matching "{citySearch}"</p>
          )}
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={!!showActivityModal} onClose={() => setShowActivityModal(null)} title="Add Activity">
        <div className="space-y-4 pt-2">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Activity Name</label>
            <input type="text" placeholder="e.g. Visit Eiffel Tower" value={activityForm.name}
              onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
              className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300
                ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`} />
          </div>
          
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</label>
            <select value={activityForm.category}
              onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
              className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none cursor-pointer appearance-none transition-all duration-300
                ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}>
              {['sightseeing','adventure','food','nightlife','shopping','culture','nature','wellness'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Estimated Cost ($)</label>
            <input type="number" placeholder="0" value={activityForm.cost}
              onChange={(e) => setActivityForm({ ...activityForm, cost: Number(e.target.value) })}
              className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300
                ${isDark ? 'bg-gray-900/50 border-gray-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`} />
          </div>
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => addActivity(showActivityModal)}
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
            Save Activity
          </motion.button>
        </div>
      </Modal>
    </motion.div>
  );
}
