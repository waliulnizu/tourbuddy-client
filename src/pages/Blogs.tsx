import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Blog } from '../types';
import PageHero from '../components/ui/PageHero';
import FilterBar from '../components/ui/FilterBar';
import EmptyState from '../components/ui/EmptyState';
import Container from '../components/ui/Container';

const ITEMS_PER_PAGE = 9;

function BlogSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-full" />
      </div>
    </div>
  );
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get<{ blogs: Blog[] }>(`${import.meta.env.VITE_API_URL}/api/public/blogs`);
        setBlogs(res.data.blogs);
        setLoading(false);
      } catch {
        setError('Failed to load blogs.');
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    let result = [...blogs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.details.toLowerCase().includes(q) || b.traveler?.name?.toLowerCase().includes(q));
    }
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [blogs, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const defaultImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <PageHero badge="Stories & Tips" title="Travel Blogs" subtitle="Stories, tips, and experiences from travelers around the world">
        <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="search-bar">
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search blogs by title or content..." />
          <button type="submit">Search</button>
        </form>
      </PageHero>

      {error && (
        <Container className="mt-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 font-medium max-w-2xl mx-auto">{error}</div>
        </Container>
      )}

      <FilterBar count={filteredBlogs.length} countLabel={`blog${filteredBlogs.length !== 1 ? 's' : ''}`}>
        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }} className="select-field">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </FilterBar>

      <Container className="py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)}
          </div>
        ) : paginatedBlogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBlogs.map((blog) => (
                <Link key={blog._id} to={`/blog/${blog._id}`} className="group card card-hover overflow-hidden flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img src={blog.blog_image || defaultImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <span className="font-medium text-slate-500">{blog.traveler?.name || 'Anonymous'}</span>
                      <span>&bull;</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h2>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed flex-1">{blog.details}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'btn-secondary'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="No blog posts found." description="Try a different search or check back soon for new stories." />
        )}
      </Container>
    </div>
  );
}
