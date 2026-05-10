import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiTrash, HiCamera, HiGlobe, HiBookmark, HiCog } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';

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

  const inputClass = `w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300
    ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-white focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <PageHeader 
        title="Profile & Settings" 
        subtitle="Manage your account preferences and personal information"
        icon={HiCog}
      />

      <div className="space-y-8">
        {/* Avatar & Name */}
        <div className={`rounded-3xl p-6 sm:p-8 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-extrabold overflow-hidden shadow-lg shadow-primary/20 ring-4 ring-white dark:ring-gray-800 transition-transform duration-300 group-hover:scale-105">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-gray-700 text-primary flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <HiCamera className="text-lg" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left mt-2">
              <h2 className="font-extrabold text-2xl mb-1">{user?.name}</h2>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
                <div className="relative">
                  <HiUser className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-11`} />
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
                <div className="relative">
                  <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-11`} />
                </div>
              </div>
            </div>
            
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Language Preference</label>
              <div className="relative">
                <HiGlobe className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`${inputClass} pl-11 appearance-none cursor-pointer`}>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/25 disabled:opacity-60 transition-all">
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Saved Destinations */}
        <div className={`rounded-3xl p-6 sm:p-8 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
            <HiBookmark className="text-warning text-xl" /> Saved Destinations
          </h3>
          {user?.savedDestinations?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.savedDestinations.map((dest, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md group
                  ${isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-600' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}>
                  {dest.image ? (
                    <img src={dest.image} alt={dest.cityName} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <HiGlobe className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm truncate">{dest.cityName}</p>
                    <p className={`text-xs font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{dest.country}</p>
                  </div>
                  <button onClick={() => removeDestination(i)} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-danger transition-all">
                    <HiTrash className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 rounded-2xl text-center border border-dashed ${isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-300 bg-gray-50'}`}>
              <HiBookmark className="text-3xl text-gray-400 mx-auto mb-2" />
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No saved destinations yet</p>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className={`rounded-3xl p-6 sm:p-8 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
            <HiLockClosed className="text-primary text-xl" /> Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Password</label>
              <input type="password" placeholder="••••••••" value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>New Password (Min 6 chars)</label>
              <input type="password" placeholder="••••••••" value={newPw}
                onChange={(e) => setNewPw(e.target.value)} className={inputClass} />
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleChangePassword}
            className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all
              ${isDark ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
            Update Password
          </motion.button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl p-6 sm:p-8 border-2 border-danger/20 bg-danger/5">
          <h3 className="font-extrabold text-lg mb-2 text-danger flex items-center gap-2">
            <HiTrash className="text-xl" /> Danger Zone
          </h3>
          <p className="text-sm font-medium text-danger/80 mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              className="px-6 py-3 rounded-2xl bg-danger/10 text-danger text-sm font-bold hover:bg-danger/20 transition-colors">
              Delete Account
            </button>
          ) : (
            <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-danger/10 border border-danger/20">
              <p className="w-full text-sm font-bold text-danger mb-1">Are you absolutely sure?</p>
              <button onClick={handleDeleteAccount}
                className="px-6 py-2.5 rounded-xl bg-danger text-white text-sm font-bold shadow-md hover:bg-red-600 transition-colors">
                Yes, Delete My Account
              </button>
              <button onClick={() => setShowDelete(false)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors
                  ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-white bg-gray-50'}`}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
