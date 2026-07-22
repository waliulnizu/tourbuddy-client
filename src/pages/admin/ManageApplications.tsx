import { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;

export default function ManageApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchData = async () => {
    try {
      const res = await axios.get<{ applications: any[] }>(`${API}/applications`, { headers: headers() });
      setApplications(res.data.applications);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const approve = async (id: string) => {
    try {
      await axios.put(`${API}/applications/${id}/status`, { status: 'approved' }, { headers: headers() });
      alert('Application approved! The guide has been added.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve application');
    }
    fetchData();
  };

  const reject = async (id: string) => {
    try {
      await axios.put(`${API}/applications/${id}/status`, { status: 'rejected' }, { headers: headers() });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject application');
    }
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this application?')) return;
    await axios.delete(`${API}/applications/${id}`, { headers: headers() });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Applications</h1>
        <p className="text-gray-500 mt-1">Review and manage guide job applications</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name / Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">CV</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.length > 0 ? applications.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.experience || '-'}</td>
                    <td className="px-6 py-4">
                      {a.cv ? (
                        <a href={`${import.meta.env.VITE_API_URL}/${a.cv}`} target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline">View CV</a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        a.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        a.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          a.status === 'approved' ? 'bg-emerald-500' :
                          a.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => approve(a._id)}
                              className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Approve</button>
                            <button onClick={() => reject(a._id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Reject</button>
                          </>
                        )}
                        {a.status !== 'pending' && (
                          <button onClick={() => approve(a._id)}
                            className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">Toggle</button>
                        )}
                        <button onClick={() => handleDelete(a._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-gray-400 font-medium">No applications yet</p>
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
