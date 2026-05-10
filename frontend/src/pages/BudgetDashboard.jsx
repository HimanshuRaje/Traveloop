import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiCurrencyDollar, HiExclamation, HiSave } from 'react-icons/hi';

const COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFB347', '#9CA3AF'];

export default function BudgetDashboard() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip');
  const [budget, setBudget] = useState({ transport: 0, hotels: 0, food: 0, activities: 0, miscellaneous: 0, totalBudget: 0, currency: 'USD' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (tripId) fetchBudget(); }, [tripId]);

  const fetchBudget = async () => {
    try {
      const { data } = await api.get(`/budgets/${tripId}`);
      if (data.budget) setBudget(data.budget);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveBudget = async () => {
    try {
      const { data } = await api.put(`/budgets/${tripId}`, budget);
      setBudget(data.budget);
      toast.success('Budget saved! 💰');
    } catch (err) { toast.error('Failed to save'); }
  };

  const totalEstimated = budget.transport + budget.hotels + budget.food + budget.activities + budget.miscellaneous;
  const isOverBudget = budget.totalBudget > 0 && totalEstimated > budget.totalBudget;

  const pieData = [
    { name: 'Transport', value: budget.transport },
    { name: 'Hotels', value: budget.hotels },
    { name: 'Food', value: budget.food },
    { name: 'Activities', value: budget.activities },
    { name: 'Other', value: budget.miscellaneous },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Transport', amount: budget.transport },
    { name: 'Hotels', amount: budget.hotels },
    { name: 'Food', amount: budget.food },
    { name: 'Activities', amount: budget.activities },
    { name: 'Other', amount: budget.miscellaneous },
  ];

  if (!tripId) return (
    <div className="glass-card p-12 text-center">
      <p className="text-5xl mb-4">💰</p>
      <h2 className="text-xl font-bold mb-2">Select a trip first</h2>
      <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
        Go to My Trips and select a trip to manage its budget
      </p>
    </div>
  );

  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
    ${isDark ? 'bg-dark-card border-dark-border text-dark-text focus:border-primary focus:ring-1 focus:ring-primary/30' : 'bg-gray-50 border-light-border focus:border-primary focus:ring-1 focus:ring-primary/30'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budget Dashboard 💰</h1>
          <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Track and manage your trip expenses
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveBudget}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/25">
          <HiSave /> Save
        </motion.button>
      </div>

      {isOverBudget && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30 mb-6">
          <HiExclamation className="text-danger text-xl flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm text-danger">Over Budget!</p>
            <p className="text-xs text-danger/80">
              You're {formatCurrency(totalEstimated - budget.totalBudget)} over your budget of {formatCurrency(budget.totalBudget)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card-static p-5">
          <p className={`text-xs font-medium mb-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Total Budget</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(budget.totalBudget)}</p>
        </div>
        <div className="glass-card-static p-5">
          <p className={`text-xs font-medium mb-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Estimated Cost</p>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-danger' : 'text-success'}`}>{formatCurrency(totalEstimated)}</p>
        </div>
        <div className="glass-card-static p-5">
          <p className={`text-xs font-medium mb-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Remaining</p>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-danger' : 'text-success'}`}>
            {formatCurrency(Math.max(0, budget.totalBudget - totalEstimated))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="glass-card-static p-5">
          <h3 className="font-bold mb-4">Cost Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: isDark ? '#9CA3AF' : '#6B7280' }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)}
                  contentStyle={{ backgroundColor: isDark ? '#1A1A2E' : '#fff', border: `1px solid ${isDark ? '#2A2A4A' : '#E5E7EB'}`, borderRadius: 12 }}
                  itemStyle={{ color: isDark ? '#F8F9FE' : '#1A1A2E' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-12 text-gray-500">Add expenses to see breakdown</p>}
        </div>

        {/* Bar Chart */}
        <div className="glass-card-static p-5">
          <h3 className="font-bold mb-4">Expense Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A4A' : '#E5E7EB'} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#6B7280' }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#6B7280' }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <Tooltip formatter={(v) => formatCurrency(v)}
                contentStyle={{ backgroundColor: isDark ? '#1A1A2E' : '#fff', border: `1px solid ${isDark ? '#2A2A4A' : '#E5E7EB'}`, borderRadius: 12 }}
                itemStyle={{ color: isDark ? '#F8F9FE' : '#1A1A2E' }} />
              <Bar dataKey="amount" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget inputs */}
      <div className="glass-card-static p-5">
        <h3 className="font-bold mb-4">Edit Budget</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Total Budget</label>
            <input type="number" value={budget.totalBudget}
              onChange={(e) => setBudget({ ...budget, totalBudget: Number(e.target.value) })} className={inputClass} />
          </div>
          {['transport', 'hotels', 'food', 'activities', 'miscellaneous'].map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium mb-1 capitalize">{field}</label>
              <input type="number" value={budget[field]}
                onChange={(e) => setBudget({ ...budget, [field]: Number(e.target.value) })} className={inputClass} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
