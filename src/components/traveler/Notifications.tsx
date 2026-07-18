import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import type { Notification } from '../../types';
import Icon from './Icon';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get<{ notifications: Notification[] }>(
        `${import.meta.env.VITE_API_URL}/api/traveler/notifications`,
        getHeaders()
      );
      setNotifications(res.data.notifications);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.read) {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/notifications/read/${notif._id}`, {}, getHeaders());
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
    }
    navigate(notif.link);
  };

  const markAllRead = async () => {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/notifications/read/all`, {}, getHeaders());
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/notifications/${id}`, getHeaders());
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'join_request': return { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Join Request' };
      case 'message': return { bg: 'bg-purple-100', color: 'text-purple-600', label: 'Message' };
      case 'approved': return { bg: 'bg-emerald-100', color: 'text-emerald-600', label: 'Approved' };
      case 'rejected': return { bg: 'bg-red-100', color: 'text-red-600', label: 'Rejected' };
      default: return { bg: 'bg-gray-100', color: 'text-gray-600', label: 'Notification' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 font-semibold hover:text-blue-800 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Icon name="message" className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500 text-sm">You'll see join requests, messages, and updates here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const iconStyle = getNotifIcon(notif.type);
            return (
              <div
                key={notif._id}
                onClick={() => handleNotifClick(notif)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all group ${
                  notif.read
                    ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    : 'bg-blue-50/40 border-blue-100 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                {!notif.read && <div className="absolute top-5 left-2 w-2 h-2 rounded-full bg-blue-500" />}

                <div className={`w-10 h-10 rounded-xl ${iconStyle.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={notif.type === 'join_request' ? 'tours' : notif.type === 'message' ? 'message' : 'dashboard'} className={`w-5 h-5 ${iconStyle.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {notif.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${iconStyle.bg} ${iconStyle.color}`}>
                      {iconStyle.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.type === 'join_request' && notif.connect && !notif.read && (
                    <Link
                      to={notif.link}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                    >
                      Review
                    </Link>
                  )}
                  <button
                    onClick={(e) => deleteNotif(notif._id, e)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
