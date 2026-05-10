import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { packingCategories } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiCheck, HiRefresh } from 'react-icons/hi';

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
    <div className="glass-card p-12 text-center">
      <p className="text-5xl mb-4">🧳</p>
      <h2 className="text-xl font-bold mb-2">Select a trip first</h2>
    </div>
  );

  const grouped = packingCategories.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Packing Checklist 🧳</h1>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            {packed}/{total} items packed
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={resetAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border
            ${isDark ? 'border-dark-border hover:bg-dark-card' : 'border-light-border hover:bg-gray-50'}`}>
          <HiRefresh /> Reset
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Packing Progress</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full gradient-primary" />
        </div>
      </div>

      {/* Add item */}
      <div className="glass-card p-4 mb-6">
        <div className="flex gap-2">
          <input type="text" placeholder="Add item..." value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none
              ${isDark ? 'bg-dark-card border-dark-border text-dark-text focus:border-primary' : 'bg-gray-50 border-light-border focus:border-primary'}`} />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-sm outline-none
              ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-gray-50 border-light-border'}`}>
            {packingCategories.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
          <motion.button whileTap={{ scale: 0.9 }} onClick={addItem}
            className="px-4 py-2.5 rounded-xl gradient-primary text-white">
            <HiPlus />
          </motion.button>
        </div>
      </div>

      {/* Grouped items */}
      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.value} className="glass-card p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              {group.icon} {group.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
                {group.items.filter(i => i.isPacked).length}/{group.items.length}
              </span>
            </h3>
            <div className="space-y-1.5">
              <AnimatePresence>
                {group.items.map((item) => (
                  <motion.div key={item._id} layout
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all group
                      ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-50'}`}>
                    <button onClick={() => toggleItem(item._id)}
                      aria-label={item.isPacked ? `Unpack ${item.name}` : `Pack ${item.name}`}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${item.isPacked ? 'bg-success border-success' : isDark ? 'border-dark-border hover:border-primary' : 'border-gray-300 hover:border-primary'}`}>
                      {item.isPacked && <HiCheck className="text-white text-xs" />}
                    </button>
                    <span className={`flex-1 text-sm transition-all ${item.isPacked ? 'line-through opacity-50' : ''}`}>
                      {item.name}
                    </span>
                    <button onClick={() => deleteItem(item._id)}
                      aria-label={`Delete ${item.name}`}
                      className="p-1.5 text-gray-400 hover:text-danger transition-all sm:opacity-0 sm:group-hover:opacity-100 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
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
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            No items yet. Add your first packing item above!
          </p>
        </div>
      )}
    </motion.div>
  );
}
