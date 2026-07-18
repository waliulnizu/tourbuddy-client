import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { User, Post, Blog } from '../../types';
import Icon from './Icon';

function DashboardHome({ traveler }: { traveler: User | null }) {
  const [postData, setPostData] = useState<{ active: number; pending: number }>({ active: 0, pending: 0 });
  const [blogCount, setBlogCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [postsRes, blogsRes] = await Promise.all([
          axios.get<{ posts: Post[] }>(`${import.meta.env.VITE_API_URL}/api/traveler/posts`, { headers }),
          axios.get<{ blogs: Blog[] }>(`${import.meta.env.VITE_API_URL}/api/traveler/blogs`, { headers }),
        ]);
        const posts = postsRes.data.posts;
        setPostData({ active: posts.filter(p => p.status === 'active').length, pending: posts.filter(p => p.status !== 'active').length });
        setBlogCount(blogsRes.data.blogs.length);
      } catch { /* empty */ }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Active Tours', value: postData.active },
    { name: 'Pending Tours', value: postData.pending },
    { name: 'Blogs', value: blogCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {traveler?.name || 'Traveler'}!</h1>
        <p className="text-gray-500 mt-1">Manage your tours, blogs, and profile settings</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/traveler/posts" className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"><Icon name="tours" className="w-6 h-6 text-white" /></div>
            <h3 className="text-white/80 text-sm font-medium mb-1">My Tours</h3>
            <p className="text-3xl font-bold text-white">{postData.active + postData.pending}</p>
            <p className="mt-4 text-blue-100 text-sm group-hover:text-white transition-colors">View & manage tours →</p>
          </div>
        </Link>
        <Link to="/traveler/blogs" className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"><Icon name="blog" className="w-6 h-6 text-white" /></div>
            <h3 className="text-white/80 text-sm font-medium mb-1">My Blogs</h3>
            <p className="text-3xl font-bold text-white">{blogCount}</p>
            <p className="mt-4 text-teal-100 text-sm group-hover:text-white transition-colors">View & manage blogs →</p>
          </div>
        </Link>
        <Link to="/traveler/profile" className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"><Icon name="profile" className="w-6 h-6 text-white" /></div>
            <h3 className="text-white/80 text-sm font-medium mb-1">Profile Status</h3>
            <p className="text-3xl font-bold text-white capitalize">{traveler?.status || 'Active'}</p>
            <p className="mt-4 text-purple-100 text-sm group-hover:text-white transition-colors">Edit profile →</p>
          </div>
        </Link>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardHome;
