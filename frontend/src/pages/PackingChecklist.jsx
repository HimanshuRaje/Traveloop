import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { packingCategories } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiCheck, HiRefresh, HiArchive } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function PackingChecklist() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('other');

  useEffect(() => { if (tripId) fetchItems(); }, [tripId]);

  const fetchItems = async () => {
    try {
      const { data } = await api.get(`/packing/${tripId}`);
      setItems(data.items || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const { data } = await api.post(`/packing/${tripId}`, { name: newItem, category: newCategory });
      setItems([...items, data.item]);
      setNewItem('');
      toast.success('Item added!');
    } catch (err) { toast.error('Failed'); }
  };

  const toggleItem = async (id) => {
    try {
      const { data } = await api.put(`/packing/item/${id}`);
      setItems(items.map(i => i._id === id ? data.item : i));
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/packing/item/${id}`);
      setItems(items.filter(i => i._id !== id));
    } catch (err) { toast.error('Failed'); }
  };

  const resetAll = async () => {
    try {
      const { data } = await api.put(`/packing/${tripId}/reset`);
      setItems(data.items || []);
      toast.success('Checklist reset!');
    } catch (err) { toast.error('Failed'); }
  };

  const packed = items.filter(i => i.isPacked).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;

  if (!tripId) return (
    <EmptyState 
      icon="🧳"
      title="Select a trip first"
      description="Go to My Trips and select a trip to manage your packing list"
    />
  );

  const grouped = packingCategories.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="Packing Checklist" 
        subtitle={`${packed}/${total} items packed for your trip`}
        icon={HiArchive}
        actionButton={
          <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={resetAll}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border transition-all shadow-sm hover:shadow-md
              ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <HiRefresh className="text-lg" /> Reset All
          </motion.button>
        }
      />

      {/* Progress bar */}
      <div className={`rounded-3xl p-6 mb-8 border transition-all duration-300 hover:shadow-lg
        ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-extrabold flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">🎒</span>
            Packing Progress
          </span>
          <span className="text-lg font-extrabold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Add item */}
      <div className={`rounded-3xl p-4 sm:p-6 mb-8 border transition-all duration-300
        ${isDark ? 'bg-gray-800/50 border-gray-700/50 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5' : 'bg-white border-gray-100 shadow-sm focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Add an item to pack..." value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className={`flex-1 px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300
              ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-white focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`} />
          
          <div className="flex gap-3">
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className={`flex-1 sm:w-48 px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none cursor-pointer appearance-none transition-all duration-300
                ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-white focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}>
              {packingCategories.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addItem}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex-shrink-0">
              <HiPlus className="text-xl" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Grouped items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grouped.map((group) => (
          <div key={group.value} className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl
            ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'}`}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
              <h3 className="font-extrabold text-base flex items-center gap-2.5">
                <span className="text-xl">{group.icon}</span> {group.label}
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${isDark ? 'bg-gray-900/80 text-primary' : 'bg-primary/10 text-primary'}`}>
                {group.items.filter(i => i.isPacked).length}/{group.items.length}
              </span>
            </div>
            
            <div className="space-y-2.5">
              <AnimatePresence>
                {group.items.map((item) => (
                  <motion.div key={item._id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all group border cursor-pointer
                      ${isDark 
                        ? item.isPacked ? 'bg-gray-900/30 border-transparent opacity-60' : 'bg-gray-900/50 border-gray-800 hover:border-gray-600' 
                        : item.isPacked ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md'}`}
                    onClick={() => toggleItem(item._id)}>
                    <button
                      aria-label={item.isPacked ? `Unpack ${item.name}` : `Pack ${item.name}`}
                      className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${item.isPacked ? 'bg-success border-success' : isDark ? 'border-gray-600 group-hover:border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                      {item.isPacked && <HiCheck className="text-white text-sm" />}
                    </button>
                    <span className={`flex-1 text-sm font-bold transition-all ${item.isPacked ? 'line-through text-gray-500' : isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item._id); }}
                      aria-label={`Delete ${item.name}`}
                      className="p-2 text-gray-400 hover:text-danger transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                      <HiTrash className="text-sm" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <EmptyState 
          icon="📦"
          title="No items to pack"
          description="Your packing list is empty. Add your first item above!"
        />
      )}
    </motion.div>
  );
}
