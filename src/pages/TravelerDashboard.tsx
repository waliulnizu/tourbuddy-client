import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../types';
import Icon from '../components/traveler/Icon';
import DashboardHome from '../components/traveler/DashboardHome';
import MyTours from '../components/traveler/MyTours';
import MyBlogs from '../components/traveler/MyBlogs';
import ProfileSettings from '../components/traveler/ProfileSettings';
import Inbox from '../components/traveler/Inbox';
import Chat from '../components/traveler/Chat';
import Notifications from '../components/traveler/Notifications';
import ApplyAsGuide from '../components/traveler/ApplyAsGuide';

export default function TravelerDashboard() {
  const [traveler, setTraveler] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handle = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) { navigate('/login'); return; }
      setTraveler(JSON.parse(userStr) as User);
    };
    handle();
    window.addEventListener('storage', handle);
    window.addEventListener('user_updated', handle);
    return () => {
      window.removeEventListener('storage', handle);
      window.removeEventListener('user_updated', handle);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/traveler', icon: 'dashboard' },
    { name: 'My Tours', path: '/traveler/posts', icon: 'tours' },
    { name: 'My Blogs', path: '/traveler/blogs', icon: 'blog' },
    { name: 'Inbox', path: '/traveler/inbox', icon: 'message' },
    { name: 'Notifications', path: '/traveler/notifications', icon: 'dashboard' },
    { name: 'Apply as Guide', path: '/traveler/apply-guide', icon: 'tours' },
    { name: 'Profile Settings', path: '/traveler/profile', icon: 'profile' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(n => n.path === location.pathname);
    return item?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden" onClick={() => setMobileOpen(false)}></div>}

      <aside className={`fixed md:sticky top-0 left-0 z-30 h-screen w-72 bg-slate-900 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
              <Icon name="dashboard" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">TourBuddy</h2>
              <p className="text-xs text-slate-400 font-medium">Traveler Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <Icon name={item.icon} className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <Icon name="logout" className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Icon name="menu" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Traveler / {getPageTitle()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <Icon name="logout" className="w-4 h-4" />
                Logout
              </button>
              <Link to="/traveler/profile" className="relative flex-shrink-0 cursor-pointer">
                {traveler?.profilePicture ? (
                  <img src={`${import.meta.env.VITE_API_URL}/${traveler.profilePicture}`} alt=""
                    className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-white hover:ring-teal-300 transition-all"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.querySelector('.fallback')?.classList.remove('hidden'); }} />
                ) : null}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white hover:ring-teal-300 transition-all ${traveler?.profilePicture ? 'hidden fallback' : ''}`}>
                  {traveler?.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome traveler={traveler} />} />
            <Route path="/posts" element={<MyTours />} />
            <Route path="/blogs" element={<MyBlogs />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/chat/:otherUserId/:postId" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/apply-guide" element={<ApplyAsGuide />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
