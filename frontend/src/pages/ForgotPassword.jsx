import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiMail, HiArrowLeft } from 'react-icons/hi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setSent(true);
    toast.success('Reset link sent! Check your email.');
  };

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/30">
          <HiMail className="text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold">{sent ? 'Check your email' : 'Forgot password?'}</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          {sent ? 'We sent a password reset link to your email' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
            ${isDark ? 'bg-dark-card border-dark-border focus-within:border-primary' : 'bg-gray-50 border-light-border focus-within:border-primary'}`}>
            <HiMail className="text-gray-400" />
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25">
            Send Reset Link
          </motion.button>
        </form>
      ) : (
        <div className="text-center">
          <p className={`text-sm mb-4 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Didn't receive the email? Check your spam folder.
          </p>
          <button onClick={() => setSent(false)} className="text-primary text-sm font-semibold hover:underline">
            Try another email
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
          <HiArrowLeft /> Back to login
        </Link>
      </div>
    </div>
  );
}
