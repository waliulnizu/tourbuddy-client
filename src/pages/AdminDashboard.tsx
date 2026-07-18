import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Post, Traveler, AdminStats, User, PostFilter } from '../types';

import ManageBanners from './admin/ManageBanners';
import ManageSliders from './admin/ManageSliders';
import ManageGuides from './admin/ManageGuides';
import ManageAbout from './admin/ManageAbout';
import ManageContact from './admin/ManageContact';
import ManageAllBlogs from './admin/ManageAllBlogs';
import ManageApplications from './admin/ManageApplications';

const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
  const icons: Record<string, string> = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    tours: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    slider: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    guide: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    blog: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
    file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    alert: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    chevron: 'M9 5l7 7-7 7',
    x: 'M6 18L18 6M6 6l12 12',
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[name] || icons.info} /></svg>;
};

function DashboardHome() {
  const [stats, setStats] = useState<AdminStats>({ totalPost: 0, totalPendingPost: 0, totalPendingGuide: 0, totalTraveler: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') return;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<AdminStats>(`${import.meta.env.VITE_API_URL}/api/admin`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (err: unknown) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Active Tours', value: stats.totalPost, color: 'from-blue-500 to-indigo-600', icon: 'tours', change: '+12%' },
    { label: 'Pending Tours', value: stats.totalPendingPost, color: 'from-amber-500 to-orange-600', icon: 'alert', change: 'Needs review' },
    { label: 'Pending Guides', value: stats.totalPendingGuide, color: 'from-rose-500 to-pink-600', icon: 'guide', change: 'Needs review' },
    { label: 'Total Travelers', value: stats.totalTraveler, color: 'from-emerald-500 to-teal-600', icon: 'users', change: '+8%' },
  ];

  const barData = [
    { name: 'Active', value: stats.totalPost },
    { name: 'Pending', value: stats.totalPendingPost },
    { name: 'Guides', value: stats.totalPendingGuide },
    { name: 'Travelers', value: stats.totalTraveler },
  ];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];
  const pieData = [
    { name: 'Active Tours', value: stats.totalPost },
    { name: 'Pending Tours', value: stats.totalPendingPost },
    { name: 'Pending Guides', value: stats.totalPendingGuide },
    { name: 'Travelers', value: stats.totalTraveler },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card) => (
              <div key={card.label} className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon name={card.icon} className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-2">{card.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tour Overview</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className="text-gray-600">{entry.name}</span>
                    <span className="font-semibold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ManagePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<PostFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const endpoint = filter === 'all' ? 'posts/all' : filter === 'pending' ? 'posts/pending' : 'posts/active';
        const res = await axios.get<{ posts: Post[] }>(`${import.meta.env.VITE_API_URL}/api/admin/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
        setPosts(res.data.posts);
      } catch (err: unknown) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPosts();
  }, [filter]);

  const handleAccept = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/posts/accept/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(posts.map(p => p._id === id ? { ...p, status: 'active' } : p));
    } catch (err: unknown) { console.error(err); }
  };

  const filters: { key: PostFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All Tours' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tours</h1>
          <p className="text-gray-500 mt-1">Approve, review and manage all tour posts</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === f.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tour</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Traveler</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.length > 0 ? posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.place_to ? `${post.place_to}` : 'No destination'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {post.traveler?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-gray-600">{post.traveler?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${post.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${post.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status !== 'active' && (
                          <button onClick={() => handleAccept(post._id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm">Approve</button>
                        )}
                        <Link to={`/post/${post._id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">View</Link>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><Icon name="search" className="w-8 h-8 text-gray-300" /></div>
                      <p className="text-gray-400 font-medium">No tours found</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ManageTravelers() {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<{ travelers: Traveler[] }>(`${import.meta.env.VITE_API_URL}/api/admin/travelers`, { headers: { Authorization: `Bearer ${token}` } });
        setTravelers(res.data.travelers);
      } catch (err: unknown) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTravelers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this traveler?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTravelers(travelers.filter(t => t._id !== id));
    } catch (err: unknown) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Travelers</h1>
        <p className="text-gray-500 mt-1">View and manage all registered travelers</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Traveler</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {travelers.length > 0 ? travelers.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {t.name?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(t._id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><Icon name="users" className="w-8 h-8 text-gray-300" /></div>
                      <p className="text-gray-400 font-medium">No travelers found</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Tours', path: '/admin/posts', icon: 'tours' },
    { name: 'Travelers', path: '/admin/travelers', icon: 'users' },
    { name: 'Banners', path: '/admin/banners', icon: 'image' },
    { name: 'Sliders', path: '/admin/sliders', icon: 'slider' },
    { name: 'Guides', path: '/admin/guides', icon: 'guide' },
    { name: 'About', path: '/admin/about', icon: 'info' },
    { name: 'Contact', path: '/admin/contact', icon: 'mail' },
    { name: 'Blogs', path: '/admin/blogs', icon: 'blog' },
    { name: 'Applications', path: '/admin/applications', icon: 'file' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(n => n.path === location.pathname);
    return item?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden" onClick={() => setMobileOpen(false)}></div>}

      <aside className={`fixed md:sticky top-0 left-0 z-30 h-screen w-72 bg-slate-900 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <Icon name="dashboard" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">TourBuddy</h2>
              <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <Icon name={item.icon} className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <Icon name="logout" className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Icon name="menu" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Admin / {getPageTitle()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <Icon name="logout" className="w-4 h-4" />
                Logout
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-md">A</div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/posts" element={<ManagePosts />} />
            <Route path="/travelers" element={<ManageTravelers />} />
            <Route path="/banners" element={<ManageBanners />} />
            <Route path="/sliders" element={<ManageSliders />} />
            <Route path="/guides" element={<ManageGuides />} />
            <Route path="/about" element={<ManageAbout />} />
            <Route path="/contact" element={<ManageContact />} />
            <Route path="/blogs" element={<ManageAllBlogs />} />
            <Route path="/applications" element={<ManageApplications />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
