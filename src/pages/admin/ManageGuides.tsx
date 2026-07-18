import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Guide } from '../../types';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;

interface GuideForm {
  name: string;
  designation: string;
  phone: string;
  status: string;
}

export default function ManageGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [form, setForm] = useState<GuideForm>({ name: '', designation: '', phone: '', status: 'active' });
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchData = async () => {
    try {
      const res = await axios.get<{ guides: Guide[] }>(`${API}/guides`, { headers: headers() });
      setGuides(res.data.guides);
    } catch (err: unknown) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !file) {
      alert('Please select an image for the guide.');
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('designation', form.designation);
    fd.append('phone', form.phone);
    fd.append('status', form.status);
    if (file) fd.append('guide_image', file);
    try {
      if (editing) {
        await axios.put(`${API}/guides/${editing}`, fd, { headers: { ...headers() } });
      } else {
        await axios.post(`${API}/guides`, fd, { headers: { ...headers() } });
      }
      setShowForm(false); setEditing(null); setForm({ name: '', designation: '', phone: '', status: 'active' }); setFile(null); fetchData();
    } catch (err: any) { 
      console.error(err);
      alert(`Backend Error: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
    }
    finally { setSaving(false); }
  };

  const handleEdit = (g: Guide) => { setForm({ name: g.name, designation: g.designation || '', phone: g.phone, status: g.status || 'active' }); setEditing(g._id); setShowForm(true); };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this guide?')) return;
    await axios.delete(`${API}/guides/${id}`, { headers: headers() }); fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Guides</h1>
          <p className="text-gray-500 mt-1">Add and manage tour guides</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', designation: '', phone: '', status: 'active' }); setFile(null); }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
          }`}>
          {showForm ? 'Cancel' : '+ Add Guide'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Edit Guide' : 'New Guide'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation</label>
              <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image</label>
              <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload'}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Guide' : 'Create Guide'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {guides.length > 0 ? guides.map((g) => (
                  <tr key={g._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <img src={g.guide_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'} alt="" className="w-10 h-10 object-cover rounded-full border border-gray-100" />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{g.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{g.designation || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{g.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${g.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${g.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(g)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDelete(g._id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-gray-400 font-medium">No guides found</p>
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
