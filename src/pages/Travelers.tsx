import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Traveler } from '../types';
import PageHero from '../components/ui/PageHero';
import FilterBar from '../components/ui/FilterBar';
import EmptyState from '../components/ui/EmptyState';
import Container from '../components/ui/Container';

const ITEMS_PER_PAGE = 8;

function TravelerSkeleton() {
  return (
    <div className="card animate-pulse p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-4" />
      <div className="h-5 bg-slate-200 rounded w-2/3 mx-auto mb-2" />
      <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto mb-4" />
      <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto" />
    </div>
  );
}

export default function Travelers() {
  const [members, setMembers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-az' | 'name-za' | 'newest'>('name-az');
  const [filterGender, setFilterGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get<{ all_members: Traveler[] }>(`${import.meta.env.VITE_API_URL}/api/public/travelers`);
        setMembers(res.data.all_members);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    let result = [...members];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.address?.toLowerCase().includes(q));
    }
    if (filterGender) result = result.filter(m => m.gender === filterGender);
    switch (sortBy) {
      case 'name-za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'newest': result.sort((a, b) => (b._id || '').localeCompare(a._id || '')); break;
      default: result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [members, searchQuery, sortBy, filterGender]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <PageHero badge="Community" title="Our Travelers" subtitle="Meet the vibrant community of adventurers">
        <form onSubmit={(e) => e.preventDefault()} className="search-bar">
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search travelers by name, email, or location..." />
          <button type="submit">Search</button>
        </form>
      </PageHero>

      <FilterBar count={filteredMembers.length} countLabel={`traveler${filteredMembers.length !== 1 ? 's' : ''}`}>
        <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} className="select-field">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="select-field">
          <option value="name-az">Name: A to Z</option>
          <option value="name-za">Name: Z to A</option>
          <option value="newest">Newest First</option>
        </select>
      </FilterBar>

      <Container className="py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <TravelerSkeleton key={i} />)}
          </div>
        ) : paginatedMembers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedMembers.map((member) => (
                <div key={member._id} className="group card card-hover p-8 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden bg-slate-100 mb-4 ring-4 ring-slate-50 group-hover:ring-blue-100 transition-all">
                    <img src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.name}&background=2563eb&color=fff`} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{member.email}</p>
                  {member.address && <p className="text-xs text-slate-400 mt-1">{member.address}</p>}
                  <Link to={`/traveler/${member._id}`} className="mt-5 inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-800 text-sm transition-colors">
                    View Profile
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
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
          <EmptyState title="No travelers found." description="Try adjusting your search or filters." />
        )}
      </Container>
    </div>
  );
}
