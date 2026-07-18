import { useState, useEffect } from 'react';
import axios from 'axios';
import type { ContactData, ContactFormData } from '../types';
import PageHero from '../components/ui/PageHero';
import Container from '../components/ui/Container';

export default function Contact() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get<{ contact: ContactData }>(`${import.meta.env.VITE_API_URL}/api/public/contact`);
        setContact(res.data.contact);
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchContact();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await axios.post<{ success: boolean; message: string }>(`${import.meta.env.VITE_API_URL}/api/public/rating`, form);
      setSuccess('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setSuccess('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  const contactItems = contact ? [
    { label: 'Email', value: contact.email, color: 'bg-blue-50 text-blue-600', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Phone', value: `${contact.phone}${contact.phone_2 ? ` / ${contact.phone_2}` : ''}`, color: 'bg-teal-50 text-teal-600', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { label: 'Address', value: `${contact.address}, ${contact.city}`, color: 'bg-purple-50 text-purple-600', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Telephone', value: contact.telephone, color: 'bg-orange-50 text-orange-600', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  ].filter(item => item.value) : [];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <PageHero badge="Get in Touch" title="Contact Us" subtitle="We'd love to hear from you. Reach out anytime." />

      <Container className="-mt-10 relative z-10 pb-16">
        {success && (
          <div className={`mb-6 p-4 rounded-xl border ${success.includes('success') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-2 h-2 rounded-full ${success.includes('success') ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {success}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-elevated p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
              </div>
            ) : contactItems.length > 0 ? (
              <div className="space-y-6">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                      <p className="text-slate-600 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Contact information coming soon.</p>
            )}
          </div>

          <div className="card-elevated p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Your Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Your Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="input-field resize-none" placeholder="Your message..." />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
