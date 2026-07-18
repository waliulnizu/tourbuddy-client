interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-14 h-14' };

  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-blue-100 rounded-full`} />
        <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`} />
      </div>
      {message && <p className="text-gray-400 text-sm font-medium">{message}</p>}
    </div>
  );
}
