import type { ReactNode } from 'react';

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  size?: 'default' | 'large';
}

export default function PageHero({ badge, title, subtitle, children, size = 'default' }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 ${size === 'large' ? 'py-28 md:py-36' : 'py-20 md:py-24'}`}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {badge && (
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-5 text-white/90 text-sm font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {badge}
          </span>
        )}
        <h1 className={`font-extrabold text-white tracking-tight mb-4 ${size === 'large' ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-blue-100/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
