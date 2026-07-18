import { useState, useEffect } from 'react';
import axios from 'axios';
import type { ContactData, Message } from '../../types';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;

export default function ManageContact() {
  const [form, setForm] = useState<ContactData>({ address: '', city: '', email: '', telephone: '', phone: '', phone_2: '' });
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<{ contact?: ContactData }>(`${API}/contact`, { headers: headers() });
        if (res.data.contact) {
          const c = res.data.contact;
          setForm({ address: c.address || '', city: c.city || '', email: c.email || '', telephone: c.telephone || '', phone: c.phone || '', phone_2: c.phone_2 || '' });
        }
      } catch (err: unknown) { /* empty */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put<{ message: string }>(`${API}/contact`, form, { headers: headers() });
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Contact Info</h1>
        <p className="text-gray-500 mt-1">Update contact details displayed on the website</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
            <input name="address" value={form.address} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
            <input name="city" value={form.city} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telephone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone 2 (optional)</label>
            <input name="phone_2" value={form.phone_2} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
