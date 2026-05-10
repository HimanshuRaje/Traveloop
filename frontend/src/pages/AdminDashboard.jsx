import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiUsers, HiMap, HiLightningBolt, HiGlobe, HiTrash } from 'react-icons/hi';

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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const tripsPerMonth = (stats?.tripsPerMonth || []).map(t => ({
    month: monthNames[t._id - 1] || t._id,
    trips: t.count,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard 🛡️</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: HiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: 'from-primary to-primary-light' },
          { icon: HiMap, label: 'Total Trips', value: stats?.totalTrips || 0, color: 'from-accent to-accent-light' },
          { icon: HiLightningBolt, label: 'Activities', value: stats?.totalActivities || 0, color: 'from-warning to-yellow-300' },
          { icon: HiGlobe, label: 'Top Cities', value: stats?.topCities?.length || 0, color: 'from-secondary to-secondary-light' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="glass-card-static p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trips per month */}
        <div className="glass-card-static p-5">
          <h3 className="font-bold mb-4">Trips Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tripsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A4A' : '#E5E7EB'} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#6B7280' }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#6B7280' }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1A1A2E' : '#fff', border: `1px solid ${isDark ? '#2A2A4A' : '#E5E7EB'}`, borderRadius: 12 }}
                itemStyle={{ color: isDark ? '#F8F9FE' : '#1A1A2E' }} />
              <Bar dataKey="trips" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular styles */}
        <div className="glass-card-static p-5">
          <h3 className="font-bold mb-4">Travel Styles</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={(stats?.popularStyles || []).map(s => ({ name: s._id, value: s.count }))}
                cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: isDark ? '#9CA3AF' : '#6B7280' }}>
                {(stats?.popularStyles || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1A1A2E' : '#fff', border: `1px solid ${isDark ? '#2A2A4A' : '#E5E7EB'}`, borderRadius: 12 }}
                itemStyle={{ color: isDark ? '#F8F9FE' : '#1A1A2E' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cities */}
      <div className="glass-card-static p-5 mb-6">
        <h3 className="font-bold mb-4">Most Popular Cities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(stats?.topCities || []).map((city, i) => (
            <div key={i} className={`p-3 rounded-xl text-center ${isDark ? 'bg-dark-card' : 'bg-gray-50'}`}>
              <p className="font-bold text-lg text-primary">{city.count}</p>
              <p className="text-sm font-medium">{city._id}</p>
              <p className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>trips</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div className="glass-card-static p-5">
        <h3 className="font-bold mb-4">Recent Users</h3>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className={`border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                <th className="text-left py-3 px-2 font-semibold">Name</th>
                <th className="text-left py-3 px-2 font-semibold">Email</th>
                <th className="text-left py-3 px-2 font-semibold">Joined</th>
                <th className="text-right py-3 px-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={`border-b transition-colors
                  ${isDark ? 'border-dark-border hover:bg-dark-card/50' : 'border-light-border hover:bg-gray-50'}`}>
                  <td className="py-3 px-2 font-medium">{u.name}</td>
                  <td className={`py-3 px-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{u.email}</td>
                  <td className={`py-3 px-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-danger">
                      <HiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
