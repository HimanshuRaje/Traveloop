import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiCalendar, HiEmojiHappy } from 'react-icons/hi';

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
    <div className="glass-card p-12 text-center">
      <p className="text-5xl mb-4">📔</p>
      <h2 className="text-xl font-bold mb-2">Select a trip first</h2>
    </div>
  );

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
    ${isDark ? 'bg-dark-card border-dark-border text-dark-text focus:border-primary focus:ring-1 focus:ring-primary/30' : 'bg-gray-50 border-light-border focus:border-primary focus:ring-1 focus:ring-primary/30'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trip Journal 📔</h1>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            {notes.length} entries
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
          <HiPlus /> New Entry
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="glass-card p-5 mb-6 overflow-hidden">
            <h3 className="font-bold mb-3">{editing ? 'Edit Entry' : 'New Journal Entry'}</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Title (optional)" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <textarea rows={4} placeholder="How was your day? What did you experience?" value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={`${inputClass} resize-none`} />
              <div className="flex flex-wrap gap-3">
                <input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`px-4 py-2 rounded-xl border text-sm outline-none
                    ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-gray-50 border-light-border'}`} />
                <div className="flex gap-1.5">
                  {moods.map(m => (
                    <button key={m.value} onClick={() => setForm({ ...form, mood: m.value })}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all
                        ${form.mood === m.value ? 'ring-2 ring-primary scale-110' : 'opacity-50 hover:opacity-100'}`}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowForm(false); setEditing(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}>
                  Cancel
                </button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={saveNote}
                  className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium">
                  {editing ? 'Update' : 'Save Entry'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {notes.map((note, i) => (
          <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moods.find(m => m.value === note.mood)?.emoji || '😐'}</span>
                <div>
                  {note.title && <h3 className="font-bold text-sm">{note.title}</h3>}
                  <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    <HiCalendar /> {formatDate(note.date || note.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editNote(note)}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition"><HiPencil className="text-sm" /></button>
                <button onClick={() => deleteNote(note._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-danger transition"><HiTrash className="text-sm" /></button>
              </div>
            </div>
            <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              {note.content}
            </p>
          </motion.div>
        ))}
      </div>

      {notes.length === 0 && !loading && (
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-3">✍️</p>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Start documenting your journey!
          </p>
        </div>
      )}
    </motion.div>
  );
}
