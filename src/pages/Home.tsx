import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import type { HomeData } from "../types";
import { API_BASE_URL } from "../api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SectionHeader from "../components/ui/SectionHeader";
import Container from "../components/ui/Container";

export default function Home() {
  const [data, setData] = useState<HomeData>({
    posts: [],
    blogs: [],
    sliders: [],
    bannertext: null,
    banners: [],
  });
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState<{ role?: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<HomeData>(
          `${API_BASE_URL}/api/public/home`,
        );
        setData(response.data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sliders =
    data.sliders && data.sliders.length > 0
      ? data.sliders
      : [
          {
            _id: "1",
            slider_title: "Discover the World",
            slider_slugan: "Find the best tours and guides",
            slider_image:
              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80",
          },
          {
            _id: "2",
            slider_title: "Adventure Awaits",
            slider_slugan: "Explore amazing destinations with expert guides",
            slider_image:
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80",
          },
          {
            _id: "3",
            slider_title: "Travel Together",
            slider_slugan: "Connect with fellow travelers worldwide",
            slider_image:
              "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2000&q=80",
          },
        ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  }, [sliders.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  }, [sliders.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (loading) return <LoadingSpinner message="Loading amazing tours..." />;

  if (error) {
    return (
      <Container size="4xl" className="py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center animate-fade-in-up">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  const postCount = data.posts?.length ?? 0;
  const blogCount = data.blogs?.length ?? 0;

  return (
    // FIX: removed the global `gap-24 md:gap-36` here — every section already
    // carries its own top/bottom padding, so the old gap was stacking on top
    // of that padding and creating the huge blank gaps seen between sections.
    // Spacing is now controlled per-section for a consistent, intentional rhythm.
    <div className="bg-white flex flex-col overflow-hidden">
      {/* 1. Hero Section - With slider */}
      <section className="relative h-[70vh] min-h-[550px] overflow-hidden">
        {sliders.map((slider, index) => (
          <div
            key={slider._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={
                slider.slider_image ||
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
              }
              alt=""
              className="w-full h-full object-cover scale-105"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gray-900/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/20" />

        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <Container size="4xl" className="text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/90 text-sm font-medium">
                Travel Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100 text-center w-full">
              {sliders[currentSlide]?.slider_title ||
                data.bannertext?.title || (
                  <>
                    Discover the
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                      World
                    </span>{" "}
                    with Us
                  </>
                )}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 text-center">
              {sliders[currentSlide]?.slider_slugan ||
                data.bannertext?.details ||
                "Find the best tours, connect with expert guides, and share your travel experiences with a vibrant community of adventurers."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300 w-full">
              <Link
                to="/posts"
                className="group inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                Explore Tours
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 transition-all duration-300 w-full sm:w-auto"
                >
                  Start Your Journey
                </Link>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 animate-fade-in-up delay-400">
              <div className="flex -space-x-3 justify-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center gap-1 mb-1 justify-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/70 text-sm">
                  <span className="text-white font-semibold">10,000+</span>{" "}
                  happy travelers
                </p>
              </div>
            </div>
          </Container>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {sliders.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* 2. Stats Section - Overlapping style handled with proper margins */}
      {/* FIX: added mb-16 md:mb-20 so there is a deliberate, single gap before
          the next section, instead of relying on the removed global gap. */}
      <section className="relative z-10 w-full -mt-28 md:-mt-36 mb-16 md:mb-20">
        <Container size="5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          {[
            {
              value: "500+",
              label: "Tours Completed",
              icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
              color: "from-blue-500 to-blue-600",
            },
            {
              value: "200+",
              label: "Expert Guides",
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              color: "from-teal-500 to-teal-600",
            },
            {
              value: "10K+",
              label: "Happy Travelers",
              icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              color: "from-purple-500 to-purple-600",
            },
            {
              value: "50+",
              label: "Destinations",
              icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
              color: "from-amber-500 to-orange-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-black/5 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center w-full"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-md mx-auto`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={stat.icon}
                  />
                </svg>
              </div>
              <p className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs md:text-sm font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        </Container>
      </section>

      {/* 3. Featured Tours Section */}
      <section className="relative w-full py-16 md:py-20">
        <Container className="flex flex-col items-center">
        <SectionHeader badge="Featured Tours" title="Popular Destinations" linkTo="/posts" linkLabel="View all tours" />

        <div
          className={
            postCount > 0
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl items-stretch mx-auto"
              : "flex justify-center items-center w-full"
          }
        >
          {postCount > 0 ? (
            data.posts.slice(0, 8).map((post, i) => (
              <div
                key={post._id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      post.image ||
                      "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold text-blue-600 shadow-md">
                    ${post.amount}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    {post.place_to || "Various"}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {post.details}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {post.traveler?.name?.charAt(0) || "U"}
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {post.traveler?.name || "Guide"}
                      </span>
                    </div>
                    <Link
                      to={`/post/${post._id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      Details <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // FIX: was `pt-32 pb-20`, which — stacked on top of the section's
            // own `py-16 md:py-20` and the (now removed) global gap — created
            // a huge blank block. A compact, icon-led empty state reads as an
            // intentional "nothing here yet" moment instead of a layout bug.
            <div className="flex flex-col justify-center items-center text-center py-10 w-full mx-auto max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-gray-700 text-base font-semibold">
                No tours yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                New destinations are added regularly — check back soon.
              </p>
            </div>
          )}
        </div>
        </Container>
      </section>

      {/* 4. Features Section (Why Choose Us) */}
      {/* FIX: py-28 md:py-40 → py-20 md:py-28. Kept generous, but no longer
          stacking with the removed global gap to create an oversized band. */}
       <section className="relative py-20 md:py-28 overflow-hidden w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

  <Container className="relative flex flex-col items-center">
    <div className="text-center mb-16 max-w-2xl mx-auto flex flex-col items-center justify-center">
      <span className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-3">
        <span className="w-8 h-0.5 bg-blue-400 rounded-full"></span>
        Why Choose Us
        <span className="w-8 h-0.5 bg-blue-400 rounded-full"></span>
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-3 text-center leading-tight">
        Everything You Need for Travel
      </h2>
      <p className="text-gray-400 mt-4 text-center text-lg leading-relaxed">
        We make travel planning simple, social, and unforgettable.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full max-w-6xl items-stretch mx-auto">
      {[
        {
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
          title: "Vibrant Community",
          desc: "Connect with fellow travelers, share stories, and build lifelong friendships around the world.",
          color: "from-blue-500 to-blue-600",
        },
        {
          icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
          title: "Curated Tours",
          desc: "Handpicked destinations and verified tour guides ensure the best travel experiences.",
          color: "from-teal-500 to-teal-600",
        },
        {
          icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
          title: "Safe & Reliable",
          desc: "Verified profiles, secure booking, and 24/7 support for worry-free adventures.",
          color: "from-purple-500 to-purple-600",
        },
      ].map((feature, i) => (
        <div
          key={feature.title}
          className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-10 hover:bg-white/10 transition-all duration-300 w-full flex flex-col justify-start"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={feature.icon}
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white mb-4 tracking-wide">
            {feature.title}
          </h3>

          <p className="text-gray-300/90 leading-relaxed text-sm md:text-base">
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  </Container>
</section>

      {/* 5. Testimonials Section */}
      {/* FIX: py-24 md:py-32 → py-20 md:py-28 for the same stacking reason. */}
      <section className="relative py-20 md:py-28 bg-gray-50 w-full">
        <Container className="flex flex-col items-center">
          <div className="text-center mb-16 max-w-2xl mx-auto flex flex-col items-center justify-center">
            <span className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">
              <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
              Testimonials
              <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 text-center">
              What Travelers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 w-full max-w-6xl items-stretch mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Adventure Traveler",
                text: "TourBuddy made finding the perfect tour so easy! The guides were incredible and the whole experience was seamless.",
                avatar: "S",
              },
              {
                name: "Michael Chen",
                role: "Solo Traveler",
                text: "I love how I can connect with other travelers. The community aspect sets TourBuddy apart from other platforms.",
                avatar: "M",
              },
              {
                name: "Emma Wilson",
                role: "Family Vacationer",
                text: "Safe, reliable, and fun! Our family trip was perfectly organized through TourBuddy. Highly recommended!",
                avatar: "E",
              },
            ].map((t, i) => (
              <div
                key={t.name}
                className="group bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 w-full flex flex-col justify-between"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div>
                  <div className="flex items-center gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className="w-5 h-5 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-6 italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-md transform group-hover:scale-105 transition-transform duration-300">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Latest Blogs Section */}
      <section className="relative w-full py-16 md:py-20">
        <Container className="flex flex-col items-center">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 w-full max-w-5xl">
          <div>
            <span className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
              <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
              From the Blog
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Latest Travel Stories
            </h2>
          </div>
          <Link
            to="/blogs"
            className="group inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            View all blogs
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* FIX: this was a `grid-cols-3` that, with only 1-2 blog posts, left
            large empty columns on the right (see screenshot). Switched to a
            flex-wrap row with per-card max-width so 1 or 2 posts center
            gracefully instead of being pinned to the left with dead space. */}
        {blogCount > 0 ? (
          <div className="flex flex-wrap justify-center gap-10 w-full max-w-5xl mx-auto">
            {data.blogs.slice(0, 3).map((blog) => (
              <Link
                key={blog._id}
                to={`/blog/${blog._id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-[46%] lg:w-[31%] max-w-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        blog.blog_image ||
                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span className="font-medium text-gray-600">
                        {blog.traveler?.name || "Anonymous"}
                      </span>
                      <span>&middot;</span>
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {blog.details}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center py-10 w-full mx-auto max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-gray-700 text-base font-semibold">
              No stories yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Travelers' stories will show up here as soon as they're shared.
            </p>
          </div>
        )}
        </Container>
      </section>

      {/* 7. Newsletter / FAQ Section */}
      {/* FIX: py-24 md:py-32 → py-20 md:py-28 for consistency with the rest. */}
      <section className="relative py-20 md:py-28 bg-gray-50 w-full">
        <Container className="flex flex-col items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start w-full max-w-6xl mx-auto">
            <div className="flex flex-col h-full justify-start w-full pr-0 lg:pr-6">
              <span className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">
                <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
                Newsletter
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Stay in the Loop
              </h2>
              <p className="text-gray-500 text-base md:text-lg mb-10 leading-relaxed">
                Get the latest tours, travel tips, and exclusive deals delivered
                straight to your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                />
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="flex flex-col w-full pl-0 lg:pl-6 mt-8 lg:mt-0">
              <span className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">
                <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Frequently Asked
              </h2>

              <div className="space-y-4 mt-8 w-full">
                {[
                  {
                    q: "How do I book a tour?",
                    a: 'Simply browse our tours, find one you like, and click "Details" to connect with the tour guide directly.',
                  },
                  {
                    q: "Can I become a tour guide?",
                    a: "Yes! Register as a traveler, complete your profile, and start creating tour listings for others to join.",
                  },
                  {
                    q: "Is TourBuddy free to use?",
                    a: "Absolutely. Creating an account, browsing tours, and connecting with guides is completely free.",
                  },
                ].map((faq) => (
                  <div
                    key={faq.q}
                    className="bg-white rounded-xl p-6 md:p-7 border border-gray-100 shadow-sm transition-all hover:shadow-md duration-200"
                  >
                    <h4 className="font-bold text-gray-900 mb-2 text-base md:text-lg">
                      {faq.q}
                    </h4>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 8. CTA Section */}
      {/* mb-24 md:mb-36 kept intentionally — this is the last section before
          the Footer component, so it needs its own trailing space now that
          the global gap on the wrapper has been removed. */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden w-full bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <Container size="4xl" className="relative flex flex-col items-center text-center pb-8 md:pb-0">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight text-center w-full">
            Ready to start your
            <br />
            next adventure?
          </h2>
          <p className="text-blue-100 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed text-center">
            Join thousands of travelers who are discovering the world with
            TourBuddy. Create your free account today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto whitespace-nowrap"
            >
              Get Started Free
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              to="/posts"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/30 transition-all duration-300 w-full sm:w-auto whitespace-nowrap"
            >
              Browse Tours
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}