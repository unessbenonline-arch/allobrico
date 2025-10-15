import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false,
}) => {
  return (
    <div
      className={`
        ${width} ${height} 
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        animate-pulse
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}
  >
    <div className="flex items-start gap-4">
      <Skeleton width="w-12" height="h-12" rounded />
      <div className="flex-1 space-y-3">
        <Skeleton width="w-3/4" height="h-5" />
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-1/2" height="h-4" />
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton width="w-20" height="h-8" />
      <Skeleton width="w-24" height="h-8" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Header Skeleton */}
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton width="w-96" height="h-8" />
        <Skeleton width="w-64" height="h-5" />
      </div>
      <Skeleton width="w-32" height="h-10" />
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton width="w-8" height="h-8" rounded />
            <Skeleton width="w-4" height="h-4" />
          </div>
          <Skeleton width="w-16" height="h-8" />
          <Skeleton width="w-20" height="h-4" className="mt-2" />
          <Skeleton width="w-24" height="h-3" className="mt-1" />
        </div>
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <Skeleton width="w-32" height="h-6" className="mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton width="w-8" height="h-8" rounded />
                  <div className="flex-1 space-y-1">
                    <Skeleton width="w-24" height="h-4" />
                    <Skeleton width="w-16" height="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement...',
  showSpinner = true,
}) => (
  <div className="flex flex-col items-center justify-center py-12">
    {showSpinner && <LoadingSpinner size="lg" className="mb-4" />}
    <p className="text-gray-600 font-medium">{message}</p>
  </div>
);

// Note: Add shimmer animation to your CSS file
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }

export default LoadingSpinner;
