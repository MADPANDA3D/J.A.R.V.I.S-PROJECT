import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
  showVersion?: boolean;
}

export function Footer({ className, showVersion = true }: FooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-border bg-background px-6 py-4',
        className
      )}
      role="contentinfo"
      aria-label="Application information"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          &copy; 2024 JARVIS. All rights reserved.
        </div>
        
        {showVersion && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">JARVIS v1.0</span>
            {' - '}
            <span>AI Assistant Interface</span>
          </div>
        )}
      </div>
    </footer>
  );
}