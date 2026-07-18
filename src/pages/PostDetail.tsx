import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Post, Connect } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Breadcrumb from '../components/ui/Breadcrumb';
import SectionHeader from '../components/ui/SectionHeader';
import Container from '../components/ui/Container';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [connects, setConnects] = useState<Connect[]>([]);
  const [myConnect, setMyConnect] = useState<Connect | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<{ name: string; rating: number; text: string; date: string }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const getUser = () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get<{ post: Post; connects?: Connect[]; myConnect?: Connect }>(
        `${import.meta.env.VITE_API_URL}/api/public/post/${id}`,
        getHeaders()
      );
      setPost(res.data.post);
      setConnects(res.data.connects || []);
      setMyConnect(res.data.myConnect || null);
      setLoading(false);
      if (res.data.post.place_to) {
        try {
          const relRes = await axios.get<{ posts: Post[] }>(
            `${import.meta.env.VITE_API_URL}/api/public/search?q=${res.data.post.place_to}`
          );
          setRelatedPosts(relRes.data.posts.filter(p => p._id !== id).slice(0, 3));
        } catch { /* empty */ }
      }
    } catch {
      setError('Tour not found.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleJoinRequest = async () => {
    const user = getUser();
    if (!user) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/traveler/connect/${id}`, {}, getHeaders());
      const res = await axios.get<{ post: Post; connects?: Connect[]; myConnect?: Connect }>(
        `${import.meta.env.VITE_API_URL}/api/public/post/${id}`,
        getHeaders()
      );
      setConnects(res.data.connects || []);
      setMyConnect(res.data.myConnect || null);
    } catch { /* empty */ }
    setActionLoading(false);
  };

  const handleCancelJoin = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/connect/${id}`, getHeaders());
      setMyConnect(null);
      const res = await axios.get<{ post: Post; connects?: Connect[]; myConnect?: Connect }>(
        `${import.meta.env.VITE_API_URL}/api/public/post/${id}`,
        getHeaders()
      );
      setConnects(res.data.connects || []);
    } catch { /* empty */ }
    setActionLoading(false);
  };

  const handleMessageHost = () => {
    const user = getUser();
    if (!user) { navigate('/login'); return; }
    if (post?.traveler?._id) {
      navigate(`/traveler/chat/${String(post.traveler._id)}/${id}`);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/posts/${id}`, getHeaders());
      navigate('/traveler/posts');
    } catch { /* empty */ }
  };

  const connectStatusLabel = () => {
    if (!myConnect) return null;
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      approved: { text: 'Joined', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      rejected: { text: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200' },
      active: { text: 'Joined', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    };
    return statusMap[myConnect.status] || null;
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;
    setReviews(prev => [{ name: reviewName, rating: reviewRating, text: reviewText, date: new Date().toISOString() }, ...prev]);
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
  };

  if (loading) return <LoadingSpinner message="Loading tour details..." />;

  if (error || !post) {
    return (
      <Container size="4xl" className="py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-semibold">{error || 'Tour not found'}</p>
          <Link to="/posts" className="mt-4 inline-block text-blue-600 font-semibold hover:text-blue-800">← Back to Tours</Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 w-full flex flex-col items-center">
      {/* 🛠️ mx-auto এবং px-4 যোগ করা হয়েছে যাতে কনটেন্ট পারফেক্টলি মাঝখানে থাকে */}
      <Container size="4xl" className="py-8">
        <Breadcrumb items={[{ label: 'Tours', to: '/posts' }, { label: post.title }]} />

        <div className="card-elevated overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img src={post.image || 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80'} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-bold text-blue-600 shadow-sm">
              ${post.amount}
            </div>
          </div>
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">{post.title}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-6 bg-gray-50 rounded-xl">
              {post.place_from && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">From</p>
                  <p className="text-gray-900 font-medium mt-1">{post.place_from}</p>
                </div>
              )}
              {post.place_to && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">To</p>
                  <p className="text-gray-900 font-medium mt-1">{post.place_to}</p>
                </div>
              )}
              {post.date_from && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Start Date</p>
                  <p className="text-gray-900 font-medium mt-1">{new Date(post.date_from).toLocaleDateString()}</p>
                </div>
              )}
              {post.date_to && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">End Date</p>
                  <p className="text-gray-900 font-medium mt-1">{new Date(post.date_to).toLocaleDateString()}</p>
                </div>
              )}
              {post.contact && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Contact</p>
                  <p className="text-gray-900 font-medium mt-1">{post.contact}</p>
                </div>
              )}
              {post.gender && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Gender</p>
                  <p className="text-gray-900 font-medium mt-1 capitalize">{post.gender}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Status</p>
                <span className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${post.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {post.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Posted by</p>
                <p className="text-gray-900 font-medium mt-1">{post.traveler?.name || 'Unknown'}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-8">
              {post.details}
            </div>

            {/* Connect & Message Buttons */}
            {(() => {
              const user = getUser();
              const userId = user?._id || user?.id;
              const isOwner = user && userId && String(post.traveler?._id) === String(userId);

              if (isOwner) {
                return (
                  <div className="flex flex-wrap items-center gap-3 mb-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-sm font-semibold text-blue-700 mr-2">This is your tour</span>
                    <Link
                      to={`/traveler/posts`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Tour
                    </Link>
                    <Link
                      to={`/traveler/posts`}
                      className="inline-flex items-center gap-2 bg-white border-2 border-blue-200 text-blue-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Manage Requests ({connects.length})
                    </Link>
                    <button
                      onClick={handleDeletePost}
                      className="inline-flex items-center gap-2 bg-white border-2 border-red-200 text-red-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Tour
                    </button>
                  </div>
                );
              }

              if (user?.role === 'admin') return null;

              if (!user) {
                return (
                  <div className="flex flex-wrap items-center gap-3 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <button
                      onClick={() => navigate('/login', { state: { from: `/post/${id}` } })}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Start Your Journey
                    </button>
                  </div>
                );
              }

              const statusInfo = connectStatusLabel();
              return (
                <div className="flex flex-wrap items-center gap-3 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                  {!myConnect ? (
                    <button
                      onClick={handleJoinRequest}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Request to Join
                    </button>
                  ) : myConnect.status === 'pending' ? (
                    <button
                      onClick={handleCancelJoin}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-amber-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Cancel Request
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border ${statusInfo?.color}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {statusInfo?.text}
                    </span>
                  )}

                  <button
                    onClick={handleMessageHost}
                    className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Message Host
                  </button>
                </div>
              );
            })()}

            {connects.length > 0 && (
              <div className="mt-16 pt-10 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Interested Travelers ({connects.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connects.map((connect) => (
                    <div key={connect._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {connect.traveler?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{connect.traveler?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">Interested in this tour</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews / Ratings */}
            <div className="mt-16 pt-10 border-t border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews & Ratings</h2>

              <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your name" required
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)}
                        className={`w-7 h-7 rounded-lg transition-colors ${star <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} placeholder="Write your review..." required
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">Submit Review</button>
              </form>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{review.name.charAt(0)}</div>
                          <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.text}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Tours */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <SectionHeader title="Related Tours" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
              {relatedPosts.map(rp => (
                <Link key={rp._id} to={`/post/${rp._id}`} className="group bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="h-40 overflow-hidden">
                    <img src={rp.image || 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80'} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{rp.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{rp.place_to || 'Various'}</p>
                    <p className="text-blue-600 font-bold text-sm mt-2">${rp.amount}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}