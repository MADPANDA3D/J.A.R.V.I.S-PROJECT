import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PWAStatus } from '@/components/pwa/PWAStatus';
import { Link } from 'react-router-dom';
import { screenReader } from '@/lib/accessibility';

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, className }) {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () {
    try {
      screenReader.announce({
        message: 'Signing out...',
        priority: 'polite',
      });
      await signOut();
      screenReader.announce({
        message: 'Successfully signed out',
        priority: 'polite',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      screenReader.announce({
        message: 'Sign out failed. Please try again.',
        priority: 'assertive',
      });
    }
  };

  return (
    <header
      className={`bg-background border-b border-border ${className || ''}`}
      role="banner"
      aria-label="Application header"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side: Menu button (mobile) + Logo */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded="false"
              aria-controls="main-navigation"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              role="img"
              aria-label="JARVIS logo"
            >
              <span className="text-primary-foreground font-bold text-sm">
                J
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">JARVIS</h1>
              <p className="text-xs text-muted-foreground leading-none">
                AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Right side: PWA Status + User menu */}
        <nav
          className="flex items-center gap-3"
          role="navigation"
          aria-label="User navigation"
        >
          <PWAStatus showInstallButton={false} />

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 px-2"
                  disabled={loading}
                  aria-label={`User menu for ${user?.email?.split('@')[0] || 'User'}`}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div
                    className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center"
                    role="img"
                    aria-label="User avatar"
                  >
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                aria-label="User menu options"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Signed in as</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2"
                    aria-label="Go to Settings"
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  aria-label={
                    loading ? 'Signing out...' : 'Sign out of your account'
                  }
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  {loading ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
};
