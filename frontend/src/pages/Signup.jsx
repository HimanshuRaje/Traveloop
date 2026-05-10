import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPw) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
    ${isDark ? 'bg-dark-card border-dark-border focus-within:border-primary' : 'bg-gray-50 border-light-border focus-within:border-primary'}`;

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
          <span className="text-white text-2xl font-bold">T</span>
        </div>
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Start planning your dream trips
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <div className={inputClass}>
            <HiUser className="text-gray-400" />
            <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <div className={inputClass}>
            <HiMail className="text-gray-400" />
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <div className={inputClass}>
            <HiLockClosed className="text-gray-400" />
            <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={password}
              onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400">
              {showPw ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
          <div className={inputClass}>
            <HiLockClosed className="text-gray-400" />
            <input type="password" placeholder="Repeat password" value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 disabled:opacity-60">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...
            </span>
          ) : 'Create Account'}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
