import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
          <span className="text-white text-2xl font-bold">T</span>
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
            ${isDark ? 'bg-dark-card border-dark-border focus-within:border-primary' : 'bg-gray-50 border-light-border focus-within:border-primary'}`}>
            <HiMail className="text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
            ${isDark ? 'bg-dark-card border-dark-border focus-within:border-primary' : 'bg-gray-50 border-light-border focus-within:border-primary'}`}>
            <HiLockClosed className="text-gray-400" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
              {showPw ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className={`mt-4 p-3 rounded-xl text-xs text-center
        ${isDark ? 'bg-dark-card text-dark-text-secondary' : 'bg-gray-50 text-light-text-secondary'}`}>
        Demo: demo@traveloop.com / demo123
      </div>
    </div>
  );
}
