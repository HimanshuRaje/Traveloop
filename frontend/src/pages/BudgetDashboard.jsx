import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiCurrencyDollar, HiExclamation, HiSave, HiChartPie } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

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
    <EmptyState 
      icon="💰"
      title="Select a trip first"
      description="Go to My Trips and select a trip to manage its budget"
    />
  );

  const inputClass = `w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300
    ${isDark ? 'bg-gray-900/50 border-gray-700/50 text-white focus:border-primary focus:ring-2 focus:ring-primary/20' : 'bg-gray-50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="Budget Dashboard" 
        subtitle="Track and manage your trip expenses"
        icon={HiChartPie}
        actionButton={
          <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={saveBudget}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/30 transition-all">
            <HiSave className="text-lg" /> Save Changes
          </motion.button>
        }
      />

      {isOverBudget && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-danger/10 border border-danger/30 mb-8 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0">
            <HiExclamation className="text-danger text-2xl" />
          </div>
          <div>
            <p className="font-extrabold text-base text-danger mb-0.5">Over Budget Warning</p>
            <p className="text-sm font-medium text-danger/80">
              You're {formatCurrency(totalEstimated - budget.totalBudget)} over your budget of {formatCurrency(budget.totalBudget)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl
          ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:border-primary/30' : 'bg-white border-gray-100 shadow-sm hover:border-primary/20'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <HiCurrencyDollar className="text-2xl text-primary" />
          </div>
          <p className="text-3xl font-extrabold mb-1 text-primary">{formatCurrency(budget.totalBudget)}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Budget</p>
        </div>
        
        <div className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl
          ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:border-warning/30' : 'bg-white border-gray-100 shadow-sm hover:border-warning/20'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <HiChartPie className={`text-2xl ${isOverBudget ? 'text-danger' : 'text-warning'}`} />
          </div>
          <p className={`text-3xl font-extrabold mb-1 ${isOverBudget ? 'text-danger' : 'text-warning'}`}>{formatCurrency(totalEstimated)}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Estimated Cost</p>
        </div>
        
        <div className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl
          ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:border-success/30' : 'bg-white border-gray-100 shadow-sm hover:border-success/20'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <HiSave className={`text-2xl ${isOverBudget ? 'text-danger' : 'text-success'}`} />
          </div>
          <p className={`text-3xl font-extrabold mb-1 ${isOverBudget ? 'text-danger' : 'text-success'}`}>
            {formatCurrency(Math.max(0, budget.totalBudget - totalEstimated))}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className={`rounded-3xl p-6 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-6">Cost Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  paddingAngle={5} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: isDark ? '#9CA3AF' : '#6B7280', strokeWidth: 1.5 }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)}
                  contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', border: `1px solid ${isDark ? '#374151' : '#F3F4F6'}`, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: isDark ? '#F3F4F6' : '#111827', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <HiChartPie className="text-3xl text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">Add expenses to see breakdown</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className={`rounded-3xl p-6 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-6">Expense Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#F3F4F6'} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280', fontWeight: 'bold' }} stroke={isDark ? '#4B5563' : '#D1D5DB'} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280', fontWeight: 'bold' }} stroke={isDark ? '#4B5563' : '#D1D5DB'} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip formatter={(v) => formatCurrency(v)}
                contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', border: `1px solid ${isDark ? '#374151' : '#F3F4F6'}`, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: isDark ? '#F3F4F6' : '#111827', fontWeight: 'bold' }}
                cursor={{ fill: isDark ? '#374151' : '#F3F4F6', opacity: 0.4 }} />
              <Bar dataKey="amount" fill="#6C63FF" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget inputs */}
      <div className={`rounded-3xl p-6 md:p-8 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className="font-extrabold text-xl mb-6 flex items-center gap-2">
          <HiSave className="text-primary" /> Edit Budget Limits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Budget Allocation</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
              <input type="number" value={budget.totalBudget}
                onChange={(e) => setBudget({ ...budget, totalBudget: Number(e.target.value) })} 
                className={`${inputClass} pl-8`} />
            </div>
          </div>
          {['transport', 'hotels', 'food', 'activities', 'miscellaneous'].map((field) => (
            <div key={field}>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{field}</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                <input type="number" value={budget[field]}
                  onChange={(e) => setBudget({ ...budget, [field]: Number(e.target.value) })} 
                  className={`${inputClass} pl-8`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
