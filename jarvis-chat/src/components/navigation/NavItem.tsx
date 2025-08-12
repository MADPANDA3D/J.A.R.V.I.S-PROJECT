import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { screenReader } from '@/lib/accessibility';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  onClick?: () => void;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  to,
  icon: Icon,
  label,
  badge,
  onClick,
  className,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    // Announce navigation to screen readers
    screenReader.announce({
      message: `Navigating to ${label}`,
      priority: 'polite',
    });

    onClick?.();
  };

  const badgeText =
    badge && badge > 0 ? `${badge > 99 ? '99+' : badge} notifications` : '';
  const ariaLabel = `${label}${badgeText ? `. ${badgeText}` : ''}${isActive ? '. Current page' : ''}`;

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        'hover:bg-secondary/80 hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        'active:scale-95',
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
      role="menuitem"
    >
      <Icon
        className={cn(
          'w-5 h-5 transition-colors',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
        aria-hidden="true"
      />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full min-w-[20px] h-5',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
          aria-hidden="true"
          role="status"
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};
