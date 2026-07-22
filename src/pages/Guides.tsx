import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Guide } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import Container from '../components/ui/Container';

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await axios.get<{ guides: Guide[] }>(`${import.meta.env.VITE_API_URL}/api/public/guides`);
        setGuides(res.data.guides);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchGuides();
  }, []);

  if (loading) return <LoadingSpinner message="Loading guides..." />;

  const defaultImage = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-white">
      <section className="relative h-[45vh] min-h-[340px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
          alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/30" />
        <div className="relative h-full flex flex-col justify-center">
          <Container>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-5 w-fit text-white/90 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Our Guides
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Meet Our Guides</h1>
            <p className="text-xl text-slate-200 max-w-2xl leading-relaxed">Passionate experts who make every journey extraordinary</p>
          </Container>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-lg text-slate-600 leading-relaxed">Our team of certified guides are carefully selected for their expertise, passion, and commitment to delivering unforgettable travel experiences.</p>
          </div>
          {guides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {guides.map((guide) => (
                <div key={guide._id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-blue-100">
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                    <img
                      src={guide.guide_image ? `${import.meta.env.VITE_API_URL}/${guide.guide_image}` : defaultImage}
                      alt={guide.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    {!guide.guide_image && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <span className="text-3xl font-bold text-blue-600">
                            {guide.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold text-white">{guide.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {guide.designation || 'Tour Guide'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {guide.experience && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Experience</p>
                          <p className="font-medium text-slate-700">{guide.experience}</p>
                        </div>
                      </div>
                    )}
                    {guide.address && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Location</p>
                          <p className="font-medium text-slate-700">{guide.address}</p>
                        </div>
                      </div>
                    )}
                    {guide.bio && (
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed border-t border-slate-50 pt-3">{guide.bio}</p>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      <a href={`tel:${guide.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Contact
                      </a>
                      {guide.email && (
                        <a href={`mailto:${guide.email}`}
                          className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="text-slate-600 text-lg font-medium">No guides available at the moment.</p>
              <p className="text-slate-400 text-sm mt-1">Check back later for our team of expert guides.</p>
            </div>
          )}
        </Container>
      </section>

      <section className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Want to become a guide?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">Join our team of expert guides and share your passion for travel with the world.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:bg-slate-50 transform hover:-translate-y-0.5 transition-all">
            Contact Us
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </Container>
      </section>
    </div>
  );
}
