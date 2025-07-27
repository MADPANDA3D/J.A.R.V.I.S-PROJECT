import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { focusManager, screenReader, keyboardNav } from '@/lib/accessibility';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Setup global keyboard shortcuts for the application
  useEffect(() => {
    // Register global keyboard shortcuts
    keyboardNav.registerShortcut(
      'alt+m',
      () => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          focusManager.setFocus(
            mainContent as HTMLElement,
            'Navigated to main content'
          );
        }
      },
      'Skip to main content'
    );

    keyboardNav.registerShortcut(
      'alt+n',
      () => {
        setSidebarOpen(!sidebarOpen);
        screenReader.announce({
          message: sidebarOpen
            ? 'Navigation menu closed'
            : 'Navigation menu opened',
          priority: 'polite',
        });
      },
      'Toggle navigation menu'
    );

    keyboardNav.registerShortcut(
      'escape',
      () => {
        if (sidebarOpen) {
          setSidebarOpen(false);
          screenReader.announce({
            message: 'Navigation menu closed',
            priority: 'polite',
          });
        }
      },
      'Close navigation menu'
    );
  }, [sidebarOpen]);

  const handleMenuClick = () => {
    setSidebarOpen(true);
    screenReader.announce({
      message: 'Navigation menu opened',
      priority: 'polite',
    });
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    screenReader.announce({
      message: 'Navigation menu closed',
      priority: 'polite',
    });
  };

  return (
    <div
      className="min-h-screen bg-background"
      role="application"
      aria-label="JARVIS Chat Application"
    >
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link"
        onFocus={e => (e.target.style.top = '6px')}
        onBlur={e => (e.target.style.top = '-40px')}
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header onMenuClick={handleMenuClick} className="lg:pl-64" />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        aria-hidden={!sidebarOpen}
      />

      {/* Main content */}
      <main
        id="main-content"
        className="lg:pl-64"
        role="main"
        aria-label="Main application content"
        tabIndex={-1}
      >
        <div className="min-h-[calc(100vh-128px)]">{children}</div>
      </main>

      {/* Footer */}
      <Footer className="lg:pl-64" />

      {/* Live region for announcements */}
      <div
        id="live-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id="live-announcements-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};
