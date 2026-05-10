import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { travelStyles } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiPhotograph, HiCalendar, HiPencil, HiArrowRight, HiArrowLeft } from 'react-icons/hi';

export default function CreateTrip() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', travelStyle: 'budget', coverImage: null,
  });
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, coverImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.endDate) return toast.error('Please fill required fields');
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date must be after start date');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      const { data } = await api.post('/trips', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Trip created! 🎉');
      navigate(`/trips/${data.trip._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm
    ${isDark ? 'bg-dark-card border-dark-border focus:border-primary focus:ring-1 focus:ring-primary/30 text-dark-text' : 'bg-gray-50 border-light-border focus:border-primary focus:ring-1 focus:ring-primary/30'}`;

  const steps = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Style' },
    { num: 3, label: 'Cover' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Create New Trip ✈️</h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Let's plan your next adventure
        </p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                ${step >= s.num ? 'gradient-primary text-white shadow-md shadow-primary/20' : isDark ? 'bg-dark-card text-dark-text-secondary border border-dark-border' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-primary' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > s.num ? 'bg-primary' : isDark ? 'bg-dark-border' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card-static p-5 sm:p-6">
          {/* Step 1: Basics */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Trip Title <span className="text-danger">*</span></label>
                <div className="relative">
                  <HiPencil className="absolute left-3 top-3.5 text-gray-400" />
                  <input type="text" placeholder="e.g., European Summer Adventure" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea placeholder="What's this trip about?" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none`} />
              </div>
              {/* Responsive date grid: stacks on very small screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Start Date <span className="text-danger">*</span></label>
                  <div className="relative">
                    <HiCalendar className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                    <input type="date" value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">End Date <span className="text-danger">*</span></label>
                  <div className="relative">
                    <HiCalendar className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                    <input type="date" value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      min={form.startDate || undefined}
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Travel Style */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-sm font-medium mb-4">Select your travel style</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {travelStyles.map((style) => (
                  <motion.button key={style.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setForm({ ...form, travelStyle: style.value })}
                    aria-pressed={form.travelStyle === style.value}
                    className={`p-4 rounded-xl border-2 transition-all text-center
                      ${form.travelStyle === style.value
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                        : isDark ? 'border-dark-border hover:border-primary/50' : 'border-light-border hover:border-primary/50'
                      }`}>
                    <span className="text-2xl block mb-1">{style.icon}</span>
                    <span className="text-sm font-medium">{style.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Cover Image */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <div className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all cursor-pointer
                ${preview ? 'border-primary' : isDark ? 'border-dark-border hover:border-primary/50' : 'border-light-border hover:border-primary/50'}`}
                onClick={() => document.getElementById('coverUpload').click()}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('coverUpload').click()}
                tabIndex={0}
                role="button"
                aria-label="Upload cover image"
              >
                {preview ? (
                  <img src={preview} alt="Cover preview" className="w-full h-48 object-cover rounded-xl" />
                ) : (
                  <div>
                    <HiPhotograph className="text-4xl mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium">Click to upload cover image</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      JPG, PNG up to 5MB (optional)
                    </p>
                  </div>
                )}
                <input id="coverUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              {preview && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setForm({ ...form, coverImage: null }); }}
                  className="mt-3 text-sm text-danger hover:underline"
                >
                  Remove image
                </button>
              )}
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-inherit">
            {step > 1 ? (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep(step - 1)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isDark ? 'bg-dark-card hover:bg-dark-border' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <HiArrowLeft /> Back
              </motion.button>
            ) : <div />}

            {step < 3 ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step === 1 && (!form.title || !form.startDate || !form.endDate)) return toast.error('Fill required fields');
                  setStep(step + 1);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
                Next <HiArrowRight />
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Create Trip 🚀
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
