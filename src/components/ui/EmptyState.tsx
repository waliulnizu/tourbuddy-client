import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card-elevated p-12 md:p-16 text-center max-w-lg mx-auto">
      {icon ?? (
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}
      <p className="text-slate-900 text-xl font-bold tracking-tight">{title}</p>
      {description && <p className="text-slate-500 text-sm mt-2 leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
