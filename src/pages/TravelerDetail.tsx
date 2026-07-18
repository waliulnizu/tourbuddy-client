import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import type { Traveler, TravelerDetailResponse } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Breadcrumb from '../components/ui/Breadcrumb';
import Container from '../components/ui/Container';

export default function TravelerDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TravelerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraveler = async () => {
      try {
        const res = await axios.get<TravelerDetailResponse>(`${import.meta.env.VITE_API_URL}/api/public/travelers/${id}`);
        setData(res.data);
        setLoading(false);
      } catch {
        setError('Traveler not found.');
        setLoading(false);
      }
    };
    fetchTraveler();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  if (error || !data?.traveler) {
    return (
      <Container className="py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <p className="text-red-600 font-semibold">{error || 'Traveler not found'}</p>
          <Link to="/travelers" className="mt-4 inline-block text-blue-600 font-semibold hover:text-blue-800">← All Travelers</Link>
        </div>
      </Container>
    );
  }

  const { traveler, star_total } = data;
  const ratingPercent = data.percentage || 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />
        </div>
        <Container size="4xl">
          <Breadcrumb items={[{ label: 'Travelers', to: '/travelers' }, { label: traveler.name }]} variant="light" />
        </Container>
      </section>

      <Container size="4xl" className="-mt-10 pb-8">
        <div className="card-elevated p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 ring-4 ring-slate-50 shadow-lg">
              <img src={traveler.profilePicture || `https://ui-avatars.com/api/?name=${traveler.name}&background=2563eb&color=fff&size=128`} alt={traveler.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{traveler.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 justify-center md:justify-start">
                <span className="flex items-center gap-1.5 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {traveler.email}
                </span>
                {traveler.phone && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {traveler.phone}
                  </span>
                )}
              </div>
              {traveler.address && <p className="text-slate-500 mt-2 text-sm">{traveler.address}</p>}
              {traveler.gender && <p className="text-slate-500 mt-1 text-sm capitalize">Gender: {traveler.gender}</p>}

              {star_total && star_total > 0 ? (
                <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-5 h-5 ${star <= Math.round(ratingPercent / 20) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">({star_total} {star_total === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
