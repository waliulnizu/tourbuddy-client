import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { AboutData, Guide } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SectionHeader from '../components/ui/SectionHeader';
import Container from '../components/ui/Container';

interface AboutPageData {
  about: AboutData | null;
  guides: Guide[];
}

export default function About() {
  const [data, setData] = useState<AboutPageData>({ about: null, guides: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ about: AboutData; guides: Guide[] }>(`${import.meta.env.VITE_API_URL}/api/public/about`);
        setData(response.data);
        setLoading(false);
      } catch {
        setError('Failed to load about page.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading about page..." />;

  if (error) {
    return (
      <Container className="py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </Container>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-white">
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <img src={data.about?.about_image || defaultImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/30" />
        <div className="relative h-full flex flex-col justify-center">
          <Container>
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-5 w-fit text-white/90 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            About Us
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{data.about?.title || 'About TourBuddy'}</h1>
          <p className="text-xl text-slate-200 max-w-2xl leading-relaxed">Learn about our mission and meet our team of expert guides</p>
          </Container>
        </div>
      </section>

      <Container className="py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeader badge="Our Story" title="How TourBuddy Began" />
            <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line -mt-6">
              {data.about?.des || 'TourBuddy is your ultimate companion for finding and managing the best tours, guides, and travel experiences worldwide. We connect travelers with local guides to create unforgettable journeys.'}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
              <img src={data.about?.about_image || defaultImage} alt="TourBuddy" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </Container>

      <section className="bg-slate-50 py-20 md:py-28">
        <Container>
          <SectionHeader badge="Our Values" title="What Drives Us" align="center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-4">
            {[
              { title: 'Authenticity', desc: 'We believe in genuine travel experiences that connect you with local cultures and communities.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'from-blue-500 to-blue-600' },
              { title: 'Community', desc: 'We foster a vibrant community where travelers share stories, tips, and lifelong friendships.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'from-teal-500 to-teal-600' },
              { title: 'Excellence', desc: 'We carefully curate every tour and guide to ensure the highest quality travel experiences.', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'from-purple-500 to-purple-600' },
            ].map((v) => (
              <div key={v.title} className="card card-hover p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{v.title}</h3>
                <p className="text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-20 md:py-28">
        <SectionHeader badge="Our Team" title="Meet Our Guides" subtitle="Passionate experts who make every journey extraordinary" align="center" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 -mt-4">
          {data.guides && data.guides.length > 0 ? (
            data.guides.map((guide) => (
              <div key={guide._id} className="group card card-hover overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img src={guide.guide_image || defaultImage} alt={guide.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-slate-900">{guide.name}</h3>
                  <p className="text-blue-600 font-medium mt-1">{guide.designation || 'Tour Guide'}</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>{guide.phone}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-500 text-lg">No guides available at the moment.</p>
            </div>
          )}
        </div>
      </Container>

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
