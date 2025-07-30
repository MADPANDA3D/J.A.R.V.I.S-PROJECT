import React, { useEffect, useRef } from 'react';
import {
  MessageCircle,
  CheckSquare,
  Settings,
  Activity,
  X,
} from 'lucide-react';
import { NavItem } from '@/components/navigation/NavItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { focusManager, screenReader } from '@/lib/accessibility';

interface NavigationItem {
  label: string;
  path: string;
  icon: typeof MessageCircle;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Chat',
    path: '/chat',
    icon: MessageCircle,
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    badge: 0, // Will be dynamic in future
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
  {
    label: 'Health',
    path: '/health',
    icon: Activity,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  className,
}) {
  const sidebarRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle focus management when sidebar opens/closes
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // Trap focus within sidebar when open on mobile
      focusManager.trapFocus(sidebarRef.current);

      // Announce to screen readers
      screenReader.announce({
        message: 'Navigation menu opened',
        priority: 'polite',
      });

      // Focus first focusable element
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
    } else if (!isOpen) {
      // Release focus trap when closed
      focusManager.releaseFocusTrap();

      screenReader.announce({
        message: 'Navigation menu closed',
        priority: 'polite',
      });
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        id="main-navigation"
        role="navigation"
        aria-label="Main navigation menu"
        aria-hidden={!isOpen}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 bg-primary rounded flex items-center justify-center"
              role="img"
              aria-label="JARVIS logo"
            >
              <span className="text-primary-foreground font-bold text-xs">
                J
              </span>
            </div>
            <span className="font-semibold text-foreground">Menu</span>
          </div>
          <Button
            ref={firstFocusableRef}
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Navigation */}
        <nav
          className="p-4 space-y-2 overflow-y-auto overscroll-contain"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
          onWheel={(e) => e.stopPropagation()}
          aria-label="Main navigation"
          role="navigation"
        >
          <div className="mb-6">
            <h2
              className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              id="main-nav-heading"
            >
              Navigation
            </h2>
            <ul
              className="space-y-1"
              role="list"
              aria-labelledby="main-nav-heading"
            >
              {navigationItems.map(item => (
                <li key={item.path} role="listitem">
                  <NavItem
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    onClick={onClose} // Close mobile menu on navigation
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Future sections can be added here */}
          <div className="pt-4 border-t border-border">
            <h3
              className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              id="quick-actions-heading"
            >
              Quick Actions
            </h3>
            <ul
              className="space-y-1"
              role="list"
              aria-labelledby="quick-actions-heading"
            >
              <li>
                <button
                  disabled
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg cursor-not-allowed opacity-50"
                  aria-label="New Chat (Coming soon)"
                  aria-disabled="true"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  New Chat
                </button>
              </li>
              <li>
                <button
                  disabled
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg cursor-not-allowed opacity-50"
                  aria-label="Add Task (Coming soon)"
                  aria-disabled="true"
                >
                  <CheckSquare className="w-4 h-4" aria-hidden="true" />
                  Add Task
                </button>
              </li>
            </ul>
          </div>
        </nav>

      </aside>
    </>
  );
};
