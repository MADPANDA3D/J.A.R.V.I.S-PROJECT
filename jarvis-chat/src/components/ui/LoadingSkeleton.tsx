import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-secondary/50';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 && 'w-3/4', // Last line shorter
              className
            )}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// Predefined skeleton layouts
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn('p-6 border border-border rounded-lg', className)}>
    <div className="space-y-4">
      <LoadingSkeleton variant="rectangular" height={20} width="60%" />
      <LoadingSkeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <LoadingSkeleton variant="rectangular" height={32} width={80} />
        <LoadingSkeleton variant="rectangular" height={32} width={64} />
      </div>
    </div>
  </div>
);

export const ListItemSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn('flex items-center space-x-4 p-4', className)}>
    <LoadingSkeleton variant="circular" width={40} height={40} />
    <div className="space-y-2 flex-1">
      <LoadingSkeleton variant="text" width="75%" />
      <LoadingSkeleton variant="text" width="50%" />
    </div>
  </div>
);

export const HeaderSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn('flex items-center justify-between p-4', className)}>
    <div className="flex items-center space-x-4">
      <LoadingSkeleton variant="circular" width={32} height={32} />
      <LoadingSkeleton variant="rectangular" width={120} height={24} />
    </div>
    <LoadingSkeleton variant="circular" width={32} height={32} />
  </div>
);
