import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'default' | 'light';
}

export default function Breadcrumb({ items, variant = 'default' }: BreadcrumbProps) {
  const linkClass = variant === 'light'
    ? 'text-white/80 font-medium hover:text-white transition-colors'
    : 'text-blue-600 font-medium hover:text-blue-800 transition-colors';
  const currentClass = variant === 'light' ? 'text-white/60 font-medium' : 'text-slate-500 font-medium';
  const separatorClass = variant === 'light' ? 'text-white/40' : 'text-slate-300';

  return (
    <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className={separatorClass}>/</span>}
          {item.to ? (
            <Link to={item.to} className={linkClass}>
              {item.label}
            </Link>
          ) : (
            <span className={currentClass}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
