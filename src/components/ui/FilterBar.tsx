import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  count?: number;
  countLabel?: string;
}

export default function FilterBar({ children, count, countLabel = 'results' }: FilterBarProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-black/5 p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold uppercase tracking-wider shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </div>
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
          {children}
        </div>
        {count !== undefined && (
          <span className="text-sm text-gray-400 font-medium ml-auto shrink-0">
            {count} {countLabel}
          </span>
        )}
      </div>
    </div>
  );
}
