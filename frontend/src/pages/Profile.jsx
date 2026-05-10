import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiTrash, HiCamera, HiGlobe, HiBookmark } from 'react-icons/hi';

export default function Profile() {
  const { isDark } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name, email, language });
      updateUser(data.user);
      toast.success('Profile updated! ✨');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return toast.error('Fill both fields');
    if (newPw.length < 6) return toast.error('Min 6 characters');
    try {
      await api.put('/auth/password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw('');
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch (err) { toast.error('Failed'); }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      toast.success('Account deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const removeDestination = async (index) => {
    try {
      const { data } = await api.delete(`/auth/destinations/${index}`);
      updateUser({ ...user, savedDestinations: data.savedDestinations });
      toast.success('Removed');
    } catch (err) { toast.error('Failed'); }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
    ${isDark ? 'bg-dark-card border-dark-border text-dark-text focus:border-primary focus:ring-1 focus:ring-primary/30' : 'bg-gray-50 border-light-border focus:border-primary focus:ring-1 focus:ring-primary/30'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings ⚙️</h1>

      {/* Avatar & Name */}
      <div className="glass-card-static p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-cool flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-lg">
              <HiCamera className="text-white text-xs" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="font-bold text-lg">{user?.name}</h2>
            <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-3.5 text-gray-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <HiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Language</label>
            <div className="relative">
              <HiGlobe className="absolute left-3 top-3.5 text-gray-400" />
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`${inputClass} pl-10`}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleUpdateProfile}
            disabled={saving}
            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Saved Destinations */}
      <div className="glass-card-static p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><HiBookmark className="text-warning" /> Saved Destinations</h3>
        {user?.savedDestinations?.length > 0 ? (
          <div className="space-y-2">
            {user.savedDestinations.map((dest, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
                {dest.image && <img src={dest.image} alt={dest.cityName} className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="font-medium text-sm">{dest.cityName}</p>
                  <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{dest.country}</p>
                </div>
                <button onClick={() => removeDestination(i)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-danger">
                  <HiTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>No saved destinations</p>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-card-static p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><HiLockClosed className="text-primary" /> Change Password</h3>
        <div className="space-y-3">
          <input type="password" placeholder="Current password" value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)} className={inputClass} />
          <input type="password" placeholder="New password (min 6 chars)" value={newPw}
            onChange={(e) => setNewPw(e.target.value)} className={inputClass} />
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleChangePassword}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium border
              ${isDark ? 'border-dark-border hover:bg-dark-card' : 'border-light-border hover:bg-gray-50'}`}>
            Update Password
          </motion.button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card-static p-6 border-2 border-danger/20">
        <h3 className="font-bold mb-2 text-danger flex items-center gap-2"><HiTrash /> Danger Zone</h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Permanently delete your account and all data.
        </p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            className="px-4 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition">
            Delete Account
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-danger text-white text-sm font-medium">
              Confirm Delete
            </button>
            <button onClick={() => setShowDelete(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
