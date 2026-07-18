import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Message, AboutData } from '../../types';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;

export default function ManageAbout() {
  const [form, setForm] = useState({ title: '', des: '' });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<{ about?: AboutData }>(`${API}/about`, { headers: headers() });
        if (res.data.about) {
          setForm({ title: res.data.about.title || '', des: res.data.about.des || '' });
        }
      } catch (err: unknown) { /* empty */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('des', form.des);
    if (file) fd.append('about_image', file);
    try {
      const res = await axios.put<{ message: string }>(`${API}/about`, fd, { headers: { ...headers() } });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: 'Failed to update.' });
    }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage About Page</h1>
        <p className="text-gray-500 mt-1">Update the About page content and image</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={form.des} onChange={(e) => setForm({ ...form, des: e.target.value })} rows={8} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image</label>
            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload image'}</span>
            </label>
          </div>
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Update About'}
          </button>
        </form>
      </div>
    </div>
  );
}
