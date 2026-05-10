import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiCalendar, HiBookOpen } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const moods = [
  { value: 'happy', emoji: '😊' }, { value: 'excited', emoji: '🤩' },
  { value: 'relaxed', emoji: '😌' }, { value: 'tired', emoji: '😴' },
  { value: 'adventurous', emoji: '🤠' }, { value: 'neutral', emoji: '😐' },
];

export default function TripJournal() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] });

  useEffect(() => { if (tripId) fetchNotes(); }, [tripId]);

  const fetchNotes = async () => {
    try {
      const { data } = await api.get(`/journal/${tripId}`);
      setNotes(data.notes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveNote = async () => {
    if (!form.content.trim()) return toast.error('Write something!');
    try {
      if (editing) {
        const { data } = await api.put(`/journal/note/${editing}`, form);
        setNotes(notes.map(n => n._id === editing ? data.note : n));
        toast.success('Note updated!');
      } else {
        const { data } = await api.post(`/journal/${tripId}`, form);
        setNotes([data.note, ...notes]);
        toast.success('Note added! ✍️');
      }
      setForm({ title: '', content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      setEditing(null);
    } catch (err) { toast.error('Failed to save'); }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/journal/note/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const editNote = (note) => {
    setForm({ title: note.title || '', content: note.content, mood: note.mood, date: note.date?.split('T')[0] || '' });
    setEditing(note._id);
    setShowForm(true);
  };

  if (!tripId) return (
    <EmptyState 
      icon="📔"
      title="Select a trip first"
      description="Go to My Trips and select a trip to view or add journal entries"
    />
  );

  const inputClass = `w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300
    ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-white focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Trip Journal" 
        subtitle={`${notes.length} entries for this trip`}
        icon={HiBookOpen}
        actionButton={
          <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] }); }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
            <HiPlus className="text-lg" /> New Entry
          </motion.button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }} className="mb-8 overflow-hidden">
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
                <HiPencil className="text-primary text-xl" /> {editing ? 'Edit Entry' : 'New Journal Entry'}
              </h3>
              <div className="space-y-5">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Title</label>
                  <input type="text" placeholder="A memorable moment (optional)" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Entry Details</label>
                  <textarea rows={5} placeholder="How was your day? What did you experience?" value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className={`${inputClass} resize-none`} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date</label>
                      <input type="date" value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium outline-none cursor-pointer appearance-none transition-all
                          ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-white border-gray-200 focus:border-primary'}`} />
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 sm:mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mood</label>
                    <div className="flex gap-2">
                      {moods.map(m => (
                        <button key={m.value} onClick={() => setForm({ ...form, mood: m.value })}
                          title={m.value}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300
                            ${form.mood === m.value ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105 opacity-60 hover:opacity-100'}`}>
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => { setShowForm(false); setEditing(null); }}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-colors
                      ${isDark ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'}`}>
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveNote}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
                    {editing ? 'Update Entry' : 'Save Entry'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {notes.map((note, i) => (
          <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} 
            className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-lg
              ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-2xl shadow-inner">
                  {moods.find(m => m.value === note.mood)?.emoji || '😐'}
                </div>
                <div>
                  {note.title ? (
                    <h3 className="font-extrabold text-lg">{note.title}</h3>
                  ) : (
                    <h3 className={`font-bold italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Journal Entry</h3>
                  )}
                  <p className={`text-xs font-medium flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <HiCalendar className="text-primary/70" /> {formatDate(note.date || note.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editNote(note)}
                  className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-primary' : 'hover:bg-primary/10 text-gray-500 hover:text-primary'}`}>
                  <HiPencil className="text-lg" />
                </button>
                <button onClick={() => deleteNote(note._id)}
                  className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-red-900/30 text-gray-400 hover:text-danger' : 'hover:bg-red-50 text-gray-500 hover:text-danger'}`}>
                  <HiTrash className="text-lg" />
                </button>
              </div>
            </div>
            <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert text-gray-300' : 'text-gray-600'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {notes.length === 0 && !loading && (
        <EmptyState 
          icon="✍️"
          title="Start documenting your journey"
          description="Your journal is empty. Add your first entry to remember the best moments of your trip!"
        />
      )}
    </motion.div>
  );
}
