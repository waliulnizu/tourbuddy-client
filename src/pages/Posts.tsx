import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Post } from '../types';
import PageHero from '../components/ui/PageHero';
import FilterBar from '../components/ui/FilterBar';
import EmptyState from '../components/ui/EmptyState';
import Container from '../components/ui/Container';

const ITEMS_PER_PAGE = 6;

function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-100 rounded-lg w-2/3"></div>
        </div>
        <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-100 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-100 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // মূল ডেটা লোড করার ফাংশন
  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ posts: Post[] }>(`${import.meta.env.VITE_API_URL}/api/public/posts`);
      setPosts(res.data.posts);
      setError(null);
    } catch {
      setError('Failed to load tours.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAllPosts();
      return;
    }
    try {
      setLoading(true);
      setCurrentPage(1);
      const res = await axios.get<{ posts: Post[] }>(`${import.meta.env.VITE_API_URL}/api/public/search?q=${searchQuery}`);
      setPosts(res.data.posts);
      setError(null);
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilterLocation('');
    setFilterGender('');
    setSortBy('newest');
    setCurrentPage(1);
    fetchAllPosts();
  };

  // ডাইনামিক লোকেশন এক্সট্রাকশন
  const locations = useMemo(() => {
    const locs = new Set<string>();
    posts.forEach(p => { if (p.place_to) locs.add(p.place_to); });
    return Array.from(locs).sort();
  }, [posts]);

  // ফিল্টারিং ও নিরাপদ সর্টিং লজিক
  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (filterLocation) result = result.filter(p => p.place_to === filterLocation);
    if (filterGender) result = result.filter(p => p.gender === filterGender);
    
    switch (sortBy) {
      case 'oldest': 
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()); 
        break;
      case 'price-low': 
        result.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0)); 
        break;
      case 'price-high': 
        result.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0)); 
        break;
      default: 
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return result;
  }, [posts, filterLocation, filterGender, sortBy]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <PageHero badge="Adventures" title="Explore Tours" subtitle="Find your next adventure with top-rated local guides">
        <form onSubmit={handleSearch} className="search-bar">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tours by title or destination..." />
          <button type="submit">Search</button>
        </form>
      </PageHero>

      {error && (
        <Container className="mt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-xl text-center max-w-xl mx-auto">{error}</div>
        </Container>
      )}

      <FilterBar count={filteredPosts.length} countLabel={`tour${filteredPosts.length !== 1 ? 's' : ''}`}>
        <select value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setCurrentPage(1); }} className="select-field">
          <option value="">All Locations</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} className="select-field">
          <option value="">All Genders</option>
          <option value="male">Male Only</option>
          <option value="female">Female Only</option>
          <option value="any">Any Gender</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="select-field">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
        {(filterLocation || filterGender || sortBy !== 'newest' || searchQuery) && (
          <button onClick={handleReset} className="text-sm text-red-500 hover:text-red-700 font-bold whitespace-nowrap bg-red-50 px-4 py-2.5 rounded-xl transition-colors">Clear All</button>
        )}
      </FilterBar>

      <Container className="py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6 px-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                {filteredPosts.length} tour{filteredPosts.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <Link key={post._id} to={`/post/${post._id}`} className="group bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
                  <div className="relative h-52 overflow-hidden">
                    <img src={post.image || 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-extrabold text-blue-600 shadow-md">
                      ${post.amount}
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white font-semibold">
                      <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {post.place_from && post.place_to ? `${post.place_from} → ${post.place_to}` : 'Various'}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors leading-snug">{post.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{post.details}</p>
                    {post.date_from && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg w-fit mb-4">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(post.date_from).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-auto">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {post.traveler?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-bold text-gray-600 truncate max-w-[100px]">{post.traveler?.name || 'Guide'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {page}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12">
            <EmptyState
              title="No tours found."
              description="Try a different search or adjust your filters."
              action={
                (filterLocation || filterGender || sortBy !== 'newest' || searchQuery) ? (
                  <button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm rounded-xl font-bold transition-all">Clear All Filters</button>
                ) : undefined
              }
            />
          </div>
        )}
      </Container>
    </div>
  );
}