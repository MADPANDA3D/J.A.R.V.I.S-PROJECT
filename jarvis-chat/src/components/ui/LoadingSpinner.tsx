import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading...',
}) {
  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-label={label}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-border border-t-primary',
          sizeClasses[size],
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Inline spinner for use within text or buttons
export const InlineSpinner: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      'inline-block w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent',
      className
    )}
    role="status"
    aria-hidden="true"
  />
);

// Full page loading spinner
export const PageSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);
