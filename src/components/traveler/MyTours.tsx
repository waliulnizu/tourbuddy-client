import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Post, PostFormData } from '../../types';
import Icon from './Icon';

function MyTours() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PostFormData>({ title: '', amount: '', phone: '', gender: '', date_from: '', date_to: '', place_from: '', place_to: '', details: '', members: '', join_deadline: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // ImgBB আপলোডিং ট্র্যাকিংয়ের জন্য নতুন স্টেট
  const [isUploading, setIsUploading] = useState(false);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<{ posts: Post[] }>(`${import.meta.env.VITE_API_URL}/api/traveler/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data.posts);
    } catch (err: unknown) { 
      console.error('Failed to fetch posts'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ title: '', amount: '', phone: '', gender: '', date_from: '', date_to: '', place_from: '', place_to: '', details: '', members: '', join_deadline: '' });
    setFile(null);
    setEditing(null);
    setShowForm(false);
  };

  // ImgBB তে ইমেজ আপলোড করার হেল্পার ফাংশন
  const uploadToImgBB = async (imageFile: File): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      console.error("ImgBB API Key missing in .env files");
      return null;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      return response.data.data.url; // ইমেজের সরাসরি URL রিটার্ন করবে
    } catch (error) {
      console.error("ImgBB Upload Failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true); // আপলোড প্রসেস শুরু

    try {
      const token = localStorage.getItem('token');
      
      // ১. একটি প্লেইন অবজেক্ট তৈরি করা যা JSON আকারে ব্যাকএন্ডে যাবে
      const payload: Record<string, any> = {};
      Object.entries(form).forEach(([key, value]) => { 
        if (value !== undefined && value !== null && value !== '') {
          payload[key] = value; 
        }
      });

      // ২. নতুন ফাইল সিলেক্ট করা থাকলে সেটি ImgBB তে আপলোড হবে
      if (file) {
        const imageUrl = await uploadToImgBB(file);
        if (imageUrl) {
          payload['image'] = imageUrl; // নতুন আপলোড করা ইমেজ URL সেট হবে
        } else {
          alert("Image upload to ImgBB failed!");
          setIsUploading(false);
          return;
        }
      }

      // ৩. আপনার ব্যাকএন্ড সার্ভারে JSON ডাটা পাঠানো (কোনো FormData লাগবে না)
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      };

      if (editing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/posts/${editing}`, payload, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/traveler/posts`, payload, config);
      }
      
      resetForm();
      fetchPosts();
    } catch (err: unknown) {
      console.error('Failed to save post', err);
      alert('Failed to save post. Check console for details.');
    } finally {
      setIsUploading(false); // আপলোড প্রসেস শেষ (সফল বা ব্যর্থ যাই হোক)
    }
  };

  const handleEdit = (post: Post) => {
    setForm({
      title: post.title || '',
      amount: post.amount || '',
      phone: post.contact || '',
      gender: post.gender || '',
      date_from: post.date_from ? post.date_from.split('T')[0] : '',
      date_to: post.date_to ? post.date_to.split('T')[0] : '',
      place_from: post.place_from || '',
      place_to: post.place_to || '',
      details: post.details || '',
      members: post.members?.toString() || '',
      join_deadline: post.join_deadline?.toString() || '',
    });
    setEditing(post._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tour?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err: unknown) { console.error('Failed to delete post'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tours</h1>
          <p className="text-gray-500 mt-1">Create and manage your tour listings</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
          }`}>
          {showForm ? 'Cancel' : <><Icon name="plus" className="w-4 h-4" /> Create Tour</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Edit Tour' : 'Create New Tour'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Tour title" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount ($)</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Members</label>
                <input name="members" type="number" min="1" value={form.members} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="e.g. 5" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Join Deadline Before Start</label>
                <select name="join_deadline" value={form.join_deadline} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="">No Deadline</option>
                  <option value="24">24 hours before</option>
                  <option value="48">48 hours before</option>
                  <option value="72">72 hours before</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">From Date</label>
                <input name="date_from" type="date" value={form.date_from} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">To Date</label>
                <input name="date_to" type="date" value={form.date_to} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">From Place</label>
                <input name="place_from" value={form.place_from} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">To Place</label>
                <input name="place_to" value={form.place_to} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tour Image</label>
              <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload tour image'}</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Details</label>
              <textarea name="details" value={form.details} onChange={handleChange} rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"></textarea>
            </div>
            <button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:bg-blue-400">
              {isUploading ? 'Uploading Image...' : editing ? 'Update Tour' : 'Create Tour'}
            </button>
          </form>
        </div>
      )}

      {/* Table section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.length > 0 ? posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{post.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{post.place_to || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${post.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{post.members || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${post.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/post/${post._id}`} target="_blank" className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">View</Link>
                        <button onClick={() => handleEdit(post)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDelete(post._id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><Icon name="tours" className="w-8 h-8 text-gray-300" /></div>
                      <p className="text-gray-400 font-medium">No tours found. Create one!</p>
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

export default MyTours;