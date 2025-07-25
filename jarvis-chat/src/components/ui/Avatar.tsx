import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    // Fallback to initials
    const initials = alt
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={cn(
          'rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold',
          sizeClasses[size],
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-secondary animate-pulse',
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'rounded-full object-cover transition-opacity duration-200',
          sizeClasses[size],
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  );
}