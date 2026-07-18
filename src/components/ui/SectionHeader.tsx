import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  linkTo?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  linkTo,
  linkLabel,
  align = 'left',
  dark = false,
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 ${isCenter ? 'text-center sm:text-center sm:justify-center' : ''}`}>
      <div className={isCenter ? 'mx-auto' : ''}>
        {badge && (
          <span className={`inline-flex items-center gap-2 font-semibold text-sm uppercase tracking-wider mb-3 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
            <span className={`w-8 h-0.5 rounded-full ${dark ? 'bg-blue-400' : 'bg-blue-600'}`} />
            {badge}
            {isCenter && <span className={`w-8 h-0.5 rounded-full ${dark ? 'bg-blue-400' : 'bg-blue-600'}`} />}
          </span>
        )}
        <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-3 text-lg leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'} ${isCenter ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
            {subtitle}
          </p>
        )}
      </div>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="group inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors shrink-0"
        >
          {linkLabel}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      )}
    </div>
  );
}
