import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiUsers, HiMap, HiLightningBolt, HiGlobe, HiTrash, HiShieldCheck, HiChartBar } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';

const COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFB347', '#2ED573', '#FF4757', '#1E90FF', '#FF69B4'];

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
      setUsers(data.recentUsers || []);
      setRecentTrips(data.recentTrips || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      <p className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading analytics...</p>
    </div>
  );

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const tripsPerMonth = (stats?.tripsPerMonth || []).map(t => ({
    month: monthNames[t._id - 1] || t._id,
    trips: t.count,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Platform analytics and user management"
        icon={HiShieldCheck}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { icon: HiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: HiMap, label: 'Total Trips', value: stats?.totalTrips || 0, color: 'text-accent', bg: 'bg-accent/10' },
          { icon: HiLightningBolt, label: 'Activities', value: stats?.totalActivities || 0, color: 'text-warning', bg: 'bg-warning/10' },
          { icon: HiGlobe, label: 'Top Cities', value: stats?.topCities?.length || 0, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} 
            className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
              ${isDark ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'}`}>
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
            <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trips per month */}
        <div className={`rounded-3xl p-6 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
            <HiChartBar className="text-primary text-xl" /> Trips Over Time
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tripsPerMonth} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#F3F4F6'} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280', fontWeight: 'bold' }} stroke={isDark ? '#4B5563' : '#D1D5DB'} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280', fontWeight: 'bold' }} stroke={isDark ? '#4B5563' : '#D1D5DB'} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', border: `1px solid ${isDark ? '#374151' : '#F3F4F6'}`, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: isDark ? '#F3F4F6' : '#111827', fontWeight: 'bold' }}
                cursor={{ fill: isDark ? '#374151' : '#F3F4F6', opacity: 0.4 }} />
              <Bar dataKey="trips" fill="#6C63FF" radius={[6, 6, 0, 0]}>
                {tripsPerMonth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular styles */}
        <div className={`rounded-3xl p-6 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
            <HiGlobe className="text-primary text-xl" /> Travel Styles
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={(stats?.popularStyles || []).map(s => ({ name: s._id, value: s.count }))}
                cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: isDark ? '#9CA3AF' : '#6B7280', strokeWidth: 1.5 }}>
                {(stats?.popularStyles || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', border: `1px solid ${isDark ? '#374151' : '#F3F4F6'}`, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: isDark ? '#F3F4F6' : '#111827', fontWeight: 'bold' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cities */}
      <div className={`rounded-3xl p-6 mb-8 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
          <HiMap className="text-primary text-xl" /> Most Popular Cities
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {(stats?.topCities || []).map((city, i) => (
            <div key={i} className={`p-4 rounded-2xl text-center border transition-all hover:shadow-md
              ${isDark ? 'bg-gray-900/50 border-gray-800 hover:border-primary/50' : 'bg-gray-50 border-gray-100 hover:border-primary/30'}`}>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                #{i + 1}
              </div>
              <p className="font-extrabold text-base mb-1 truncate px-2" title={city._id}>{city._id}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="text-primary text-xs">{city.count}</span> trips
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div className={`rounded-3xl p-6 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2">
          <HiUsers className="text-primary text-xl" /> Recent Users
        </h3>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-4 px-3 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>User</th>
                <th className={`text-left py-4 px-3 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</th>
                <th className={`text-left py-4 px-3 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Joined Date</th>
                <th className={`text-right py-4 px-3 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={`border-b last:border-b-0 transition-colors group
                  ${isDark ? 'border-gray-800 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td className={`py-4 px-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</td>
                  <td className={`py-4 px-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className={`px-2.5 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      {formatDate(u.createdAt)}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button onClick={() => deleteUser(u._id)} 
                      className="p-2 rounded-xl text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                      <HiTrash className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recent users found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
