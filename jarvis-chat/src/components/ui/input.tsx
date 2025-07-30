import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) {
    // Enhanced accessibility props
    const accessibilityProps = {
      'aria-invalid': props['aria-invalid'] || false,
      'aria-required': props.required || false,
      'aria-disabled': props.disabled || false,
      tabIndex: props.disabled ? -1 : 0,
      ...props,
    };

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...accessibilityProps}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
