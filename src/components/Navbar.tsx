import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import type { User, Notification, Conversation } from '../types';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u) as User);
    const handle = () => {
      const u = localStorage.getItem('user');
      setUser(u ? (JSON.parse(u) as User) : null);
    };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, [location.pathname]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const fetchUnread = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const [notifRes, msgRes] = await Promise.all([
            axios.get<{ count: number }>(
              `${import.meta.env.VITE_API_URL}/api/traveler/notifications/unread-count`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get<{ count: number }>(
              `${import.meta.env.VITE_API_URL}/api/traveler/unread-count`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          ]);
          setUnreadCount(notifRes.data.count);
          setUnreadMsgCount(msgRes.data.count);
        } catch { /* empty */ }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (notifRef.current && notifOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
          setNotifOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notifOpen]);

  useEffect(() => {
    if (msgRef.current && msgOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
          setMsgOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [msgOpen]);

  const fetchNotifications = async () => {
    if (!user || user.role === 'admin') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setNotifLoading(true);
      const [notiRes, countRes] = await Promise.all([
        axios.get<{ notifications: Notification[] }>(`${import.meta.env.VITE_API_URL}/api/traveler/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get<{ count: number }>(`${import.meta.env.VITE_API_URL}/api/traveler/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setNotifications(notiRes.data.notifications.filter(n => n.type !== 'message'));
      setUnreadCount(countRes.data.count);
    } catch { /* empty */ }
    setNotifLoading(false);
  };

  const toggleNotifications = async () => {
    if (!notifOpen) {
      await fetchNotifications();
    }
    setNotifOpen(!notifOpen);
  };

  const handleNotifClick = async (notif: Notification) => {
    const token = localStorage.getItem('token');
    if (token && !notif.read) {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/notifications/read/${notif._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    }
    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifOpen(false);
    navigate(notif.link);
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/notifications/read/all`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const fetchConversations = async () => {
    if (!user || user.role === 'admin') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setMsgLoading(true);
      const res = await axios.get<{ conversations: Conversation[] }>(
        `${import.meta.env.VITE_API_URL}/api/traveler/inbox`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(res.data.conversations);
      setUnreadMsgCount(0);
    } catch { /* empty */ }
    setMsgLoading(false);
  };

  const toggleMessages = async () => {
    if (!msgOpen) {
      await fetchConversations();
    }
    setMsgOpen(!msgOpen);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'join_request': return { bg: 'bg-blue-100', color: 'text-blue-600', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' };
      case 'message': return { bg: 'bg-purple-100', color: 'text-purple-600', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' };
      case 'approved': return { bg: 'bg-emerald-100', color: 'text-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' };
      case 'rejected': return { bg: 'bg-red-100', color: 'text-red-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' };
      default: return { bg: 'bg-gray-100', color: 'text-gray-600', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' };
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/posts', label: 'Tours' },
    { to: '/blogs', label: 'Blogs' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/80' : 'bg-white/90 backdrop-blur-md border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gradient hidden sm:block">TourBuddy</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 text-[15px] font-semibold rounded-lg transition-all duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                      active
                        ? 'text-blue-600 bg-blue-50/80'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full pl-4 pr-1.5 py-1">
                  {user.role !== 'admin' && (
                    <div className="relative" ref={msgRef}>
                      <button onClick={toggleMessages} className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {unreadMsgCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                            {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                          </span>
                        )}
                      </button>

                      {msgOpen && (
                        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Messages</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {msgLoading ? (
                              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
                            ) : conversations.length === 0 ? (
                              <div className="p-8 text-center text-sm text-gray-400">No messages yet</div>
                            ) : (
                              conversations.slice(0, 8).map((conv) => (
                                <Link
                                  key={conv._id}
                                  to={`/traveler/chat/${conv._id}/${conv.post?._id || ''}`}
                                  onClick={() => setMsgOpen(false)}
                                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {conv.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.user?.name || 'Unknown'}</p>
                                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                                        {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.text || 'No messages yet'}</p>
                                  </div>
                                  {conv.unreadCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                    </span>
                                  )}
                                </Link>
                              ))
                            )}
                          </div>
                          {conversations.length > 0 && (
                            <Link
                              to="/traveler/inbox"
                              onClick={() => setMsgOpen(false)}
                              className="block text-center py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors"
                            >
                              View all messages
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {user.role !== 'admin' && (
                    <div className="relative" ref={notifRef}>
                      <button onClick={toggleNotifications} className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={markAllRead} className="text-xs text-blue-600 font-semibold hover:text-blue-800">Mark all read</button>
                            )}
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifLoading ? (
                              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
                            ) : notifications.length === 0 ? (
                              <div className="p-8 text-center text-sm text-gray-400">No notifications yet</div>
                            ) : (
                              notifications.slice(0, 10).map((notif) => {
                                const iconStyle = getNotifIcon(notif.type);
                                return (
                                  <button
                                    key={notif._id}
                                    onClick={() => handleNotifClick(notif)}
                                    className={`w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                  >
                                    <div className={`w-9 h-9 rounded-xl ${iconStyle.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                      <svg className={`w-4.5 h-4.5 ${iconStyle.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconStyle.icon} />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                        {notif.text}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notif.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    {!notif.read && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <Link
                              to="/traveler/notifications"
                              onClick={() => setNotifOpen(false)}
                              className="block text-center py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors"
                            >
                              View all notifications
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="w-px h-4 bg-slate-200" />
                  <Link to={user.role === 'admin' ? '/admin' : '/traveler'} className="relative flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <div className="w-px h-4 bg-slate-200" />
                  <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors mr-1 outline-none">
                    Logout
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost px-4 py-2 text-sm">Log in</Link>
                  <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">Sign up</Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gradient">TourBuddy</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-base font-semibold outline-none ${
                      isActive(link.to) ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-6 pt-6">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <Link to={user.role === 'admin' ? '/admin' : '/traveler'} className="relative flex items-center gap-3 px-4 py-3 text-blue-600 font-bold bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    {user.role !== 'admin' && (
                      <Link to="/traveler/inbox" className="relative flex items-center gap-3 px-4 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Messages
                        {unreadMsgCount > 0 && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                            {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                          </span>
                        )}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/traveler/notifications" className="relative flex items-center gap-3 px-4 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" className="flex items-center justify-center w-full px-4 py-3 text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Log in</Link>
                    <Link to="/register" className="btn-primary flex items-center justify-center w-full px-4 py-3 font-bold">Sign up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
