import { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from './Icon';

function ApplyAsGuide() {
  const [editMode, setEditMode] = useState(false);

  // Existing form fields
  const [file, setFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [existingApp, setExistingApp] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  const token = () => localStorage.getItem('token');
  const formHeaders = () => ({ Authorization: `Bearer ${token()}` });

  const fetchApplication = async () => {
    try {
      const res = await axios.get<{ application: any }>(`${import.meta.env.VITE_API_URL}/api/traveler/my-application`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setExistingApp(res.data.application);
    } catch { /* empty */ }
    finally { setChecking(false); }
  };

  useEffect(() => { fetchApplication(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setMessage({ type: 'error', text: 'Please upload your CV/Resume' }); return; }
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      if (phone) formData.append('phone', phone);
      if (address) formData.append('address', address);
      if (experience) formData.append('experience', experience);
      if (bio) formData.append('bio', bio);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/traveler/apply-guide`, formData, { headers: formHeaders() });
      setMessage({ type: 'success', text: 'Application submitted successfully! We will review your application.' });
      fetchApplication();
      setFile(null);
      setPhone(''); setAddress(''); setExperience(''); setBio('');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message || 'Failed to submit application';
      setMessage({ type: 'error', text: msg });
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('experience', experience);
      formData.append('bio', bio);
      if (file) formData.append('cv', file);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/my-application`, formData, { headers: formHeaders() });
      setMessage({ type: 'success', text: 'Application updated successfully!' });
      setEditMode(false);
      setFile(null);
      fetchApplication();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message || 'Failed to update application';
      setMessage({ type: 'error', text: msg });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your application?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/my-application`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setExistingApp(null);
      setEditMode(false);
      setPhone(''); setAddress(''); setExperience(''); setBio(''); setFile(null);
      setMessage({ type: 'success', text: 'Application deleted successfully.' });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message || 'Failed to delete application';
      setMessage({ type: 'error', text: msg });
    }
  };

  const startEdit = () => {
    setPhone(existingApp.phone || '');
    setAddress(existingApp.address || '');
    setExperience(existingApp.experience || '');
    setBio(existingApp.bio || '');
    setFile(null);
    setMessage(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setMessage(null);
  };

  if (checking) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Show edit form
  if (existingApp && editMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Application</h1>
            <p className="text-gray-500 mt-1">Update your guide application</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Icon name="tours" className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Your Application</h2>
                <p className="text-blue-100 text-sm mt-1">Leave a field empty to keep the previous value</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-2 font-medium text-sm">
                  <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {message.text}
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder={existingApp.phone || 'Your phone number'} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder={existingApp.address || 'Your address'} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all appearance-none">
                  <option value="">{existingApp.experience || 'Select...'}</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                  placeholder={existingApp.bio || 'Tell us about yourself...'} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New CV/Resume (optional)</label>
                <label className="flex flex-col items-center justify-center gap-3 px-6 py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Upload new CV (leave empty to keep current)'}</p>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
                <button type="button" onClick={cancelEdit}
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show application status
  if (existingApp) {
    const statusConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
      pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Your application is under review. We will notify you once it is processed.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      approved: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Congratulations! Your application has been approved. You are now a guide.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      rejected: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Your application was not approved at this time. You may re-apply later.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
    };

    const config = statusConfig[existingApp.status] || statusConfig.pending;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apply as Guide</h1>
            <p className="text-gray-500 mt-1">Your application status</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${existingApp.status === 'approved' ? 'from-emerald-600 to-teal-600' : existingApp.status === 'rejected' ? 'from-red-600 to-rose-600' : 'from-amber-600 to-orange-600'} px-8 py-8`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white capitalize">{existingApp.status}</h2>
                <p className="text-white/80 text-sm mt-1">{config.label}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'Name', value: existingApp.name },
                { label: 'Email', value: existingApp.email },
                ...(existingApp.profile_image ? [{ label: 'Profile Image', isImage: true, value: existingApp.profile_image }] : []),
                { label: 'Phone', value: existingApp.phone || '-' },
                { label: 'Address', value: existingApp.address || '-' },
                { label: 'Experience', value: existingApp.experience || '-' },
                { label: 'Submitted', value: new Date(existingApp.createdAt).toLocaleDateString() },
                ...(existingApp.cv ? [{ label: 'CV', value: 'Download CV', isLink: true }] : []),
              ].map((item: any) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{item.label}</p>
                  {item.isImage ? (
                    <img src={`${import.meta.env.VITE_API_URL}/${item.value}`} alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 mt-2" />
                  ) : item.isLink ? (
                    <a href={`${import.meta.env.VITE_API_URL}/${existingApp.cv}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 underline mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download CV
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-1">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
            {existingApp.bio && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Bio</p>
                <p className="text-sm text-gray-700 leading-relaxed">{existingApp.bio}</p>
              </div>
            )}

            {/* Edit / Delete buttons */}
            {existingApp.status !== 'approved' && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <button onClick={startEdit}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit Application
                </button>
                <button onClick={handleDelete}
                  className="inline-flex items-center gap-2 bg-white border-2 border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete Application
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No application — show form
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply as Guide</h1>
        <p className="text-gray-500 mt-1">Interested in becoming a tour guide? Fill out the form below.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="tours" className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Guide Application</h2>
              <p className="text-blue-100 text-sm mt-1">Your name and email will be auto-filled from your account</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="flex items-center gap-2 font-medium text-sm">
                <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {message.text}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder="Your phone number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder="Your address / city" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <select value={experience} onChange={(e) => setExperience(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all appearance-none">
                  <option value="">Select experience level</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio / About Yourself</label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                  placeholder="Tell us about yourself, your skills, and why you want to be a guide..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload CV/Resume <span className="text-red-500">*</span></label>
              <label className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Click to upload your CV'}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 20MB)</p>
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Submit Application</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyAsGuide;
