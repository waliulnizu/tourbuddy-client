import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import type { Blog } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Breadcrumb from '../components/ui/Breadcrumb';
import SectionHeader from '../components/ui/SectionHeader';
import Container from '../components/ui/Container';

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<{ name: string; rating: number; text: string; date: string }[]>([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get<{ blog: Blog }>(`${import.meta.env.VITE_API_URL}/api/public/blog/${id}`);
        setBlog(res.data.blog);
        setLoading(false);
        try {
          const relRes = await axios.get<{ blogs: Blog[] }>(`${import.meta.env.VITE_API_URL}/api/public/blogs`);
          setRelatedBlogs(relRes.data.blogs.filter(b => b._id !== id).slice(0, 3));
        } catch { /* empty */ }
      } catch {
        setError('Blog not found.');
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;
    setReviews(prev => [{ name: reviewName, rating: reviewRating, text: reviewText, date: new Date().toISOString() }, ...prev]);
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
  };

  if (loading) return <LoadingSpinner message="Loading article..." />;

  if (error || !blog) {
    return (
      <Container className="py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <p className="text-red-600 font-semibold">{error || 'Blog not found'}</p>
          <Link to="/blogs" className="mt-4 inline-block text-blue-600 font-semibold hover:text-blue-800">← Back to Blogs</Link>
        </div>
      </Container>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Container size="4xl" className="py-8">
        <Breadcrumb items={[{ label: 'Blogs', to: '/blogs' }, { label: blog.title }]} />

        <article className="card-elevated overflow-hidden">
          <div className="h-72 md:h-96 overflow-hidden relative">
            <img src={blog.blog_image || defaultImage} alt={blog.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">{blog.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-10 pb-8 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {blog.traveler?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="font-semibold text-slate-700">{blog.traveler?.name || 'Anonymous'}</span>
              <span className="text-slate-300">|</span>
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
              {blog.details}
            </div>
          </div>
        </article>

        <div className="mt-12 card p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews & Ratings</h2>
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your name" required className="input-field" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Rating:</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} className={`w-7 h-7 transition-colors ${star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}`}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </button>
                ))}
              </div>
            </div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} placeholder="Write your review..." required className="input-field resize-none mb-4" />
            <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Submit Review</button>
          </form>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{review.name.charAt(0)}</div>
                      <span className="font-semibold text-slate-900 text-sm">{review.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">{review.text}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
          )}
        </div>

        {relatedBlogs.length > 0 && (
          <div className="mt-12">
            <SectionHeader title="Related Articles" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 -mt-4">
              {relatedBlogs.map(rb => (
                <Link key={rb._id} to={`/blog/${rb._id}`} className="group card card-hover overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={rb.blog_image || defaultImage} alt={rb.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{rb.title}</h3>
                    <p className="text-xs text-slate-400 mt-2">{new Date(rb.createdAt).toLocaleDateString()}</p>
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
