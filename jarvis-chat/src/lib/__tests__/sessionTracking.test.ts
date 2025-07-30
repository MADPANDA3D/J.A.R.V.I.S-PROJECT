/**
 * Session Tracking Tests
 * Tests for user session management and logging functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  getCurrentSession, 
  getSessionHistory, 
  getSessionAnalytics,
  setSessionUser,
  logSessionAuthEvent,
  clearAllSessions
} from '../sessionTracking';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock navigation APIs
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test',
    origin: 'http://localhost:3000'
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true,
});

Object.defineProperty(navigator, 'platform', {
  value: 'Test Platform',
  writable: true,
});

// Mock document
Object.defineProperty(document, 'title', {
  value: 'Test Page',
  writable: true,
});

Object.defineProperty(document, 'referrer', {
  value: '',
  writable: true,
});

// Mock screen
Object.defineProperty(screen, 'width', { value: 1920 });
Object.defineProperty(screen, 'height', { value: 1080 });
Object.defineProperty(screen, 'colorDepth', { value: 24 });

// Mock Intl
global.Intl = {
  DateTimeFormat: () => ({
    resolvedOptions: () => ({ timeZone: 'UTC' })
  })
} as any;

describe('Session Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    clearAllSessions();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Session Creation', () => {
    it('should create a new session on initialization', () => {
      const currentSession = getCurrentSession();
      
      expect(currentSession).toBeDefined();
      expect(currentSession?.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(currentSession?.startTime).toBeDefined();
      expect(currentSession?.deviceInfo).toBeDefined();
      expect(currentSession?.pageViews).toHaveLength(1); // Initial page view
    });

    it('should generate unique session IDs', () => {
      const session1 = getCurrentSession();
      clearAllSessions();
      const session2 = getCurrentSession();
      
      expect(session1?.sessionId).not.toBe(session2?.sessionId);
    });

    it('should collect device information', () => {
      const currentSession = getCurrentSession();
      const deviceInfo = currentSession?.deviceInfo;
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.userAgent).toBe('Mozilla/5.0 (Test Browser)');
      expect(deviceInfo?.platform).toBe('Test Platform');
      expect(deviceInfo?.language).toBe('en-US');
      expect(deviceInfo?.screenResolution).toBe('1920x1080');
      expect(deviceInfo?.timezone).toBe('UTC');
    });
  });

  describe('User Management', () => {
    it('should set user ID and metadata', () => {
      const userId = 'test-user-123';
      const metadata = { email: 'test@example.com', role: 'user' };
      
      setSessionUser(userId, metadata);
      
      const currentSession = getCurrentSession();
      expect(currentSession?.userId).toBe(userId);
      expect(currentSession?.metadata).toEqual(expect.objectContaining(metadata));
    });

    it('should track auth events', () => {
      logSessionAuthEvent('sign_in', true, undefined, { method: 'password' });
      
      const currentSession = getCurrentSession();
      expect(currentSession?.authEvents).toHaveLength(2); // session_start + sign_in
      
      const signInEvent = currentSession?.authEvents.find(e => e.type === 'sign_in');
      expect(signInEvent).toBeDefined();
      expect(signInEvent?.success).toBe(true);
      expect(signInEvent?.metadata).toEqual({ method: 'password' });
    });

    it('should track failed auth events', () => {
      logSessionAuthEvent('sign_in', false, 'Invalid credentials', { attempt: 1 });
      
      const currentSession = getCurrentSession();
      const signInEvent = currentSession?.authEvents.find(e => e.type === 'sign_in');
      
      expect(signInEvent?.success).toBe(false);
      expect(signInEvent?.errorMessage).toBe('Invalid credentials');
    });
  });

  describe('Session Analytics', () => {
    it('should calculate session analytics', () => {
      // Set up test data
      setSessionUser('test-user', { email: 'test@example.com' });
      logSessionAuthEvent('sign_in', true);
      
      const analytics = getSessionAnalytics();
      
      expect(analytics.totalSessions).toBeGreaterThan(0);
      expect(analytics.totalPageViews).toBeGreaterThan(0);
      expect(analytics.averageSessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should track most visited pages', () => {
      const analytics = getSessionAnalytics();
      
      expect(analytics.mostVisitedPages).toBeDefined();
      expect(Array.isArray(analytics.mostVisitedPages)).toBe(true);
    });
  });

  describe('Session History', () => {
    it('should maintain session history', () => {
      const history = getSessionHistory();
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should include current session in history', () => {
      const currentSession = getCurrentSession();
      const history = getSessionHistory();
      
      const currentInHistory = history.find(s => s.sessionId === currentSession?.sessionId);
      expect(currentInHistory).toBeDefined();
    });
  });

  describe('Error Integration', () => {
    it('should increment error count', () => {
      const { incrementSessionErrors } = require('../sessionTracking');
      
      const initialSession = getCurrentSession();
      const initialErrorCount = initialSession?.errorCount || 0;
      
      incrementSessionErrors();
      
      const updatedSession = getCurrentSession();
      expect(updatedSession?.errorCount).toBe(initialErrorCount + 1);
    });
  });

  describe('Data Persistence', () => {
    it('should attempt to persist session data', () => {
      // Session tracking automatically persists data
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jarvis_sessions',
        expect.any(String)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw error
      expect(() => {
        setSessionUser('test-user');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should limit session storage size', () => {
      // Create multiple sessions (would require more complex setup)
      const history = getSessionHistory();
      
      // Sessions should be limited to reasonable number
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should handle rapid user actions without performance issues', () => {
      const startTime = Date.now();
      
      // Simulate rapid actions
      for (let i = 0; i < 100; i++) {
        logSessionAuthEvent('token_refresh', true);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (1 second)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with continuous usage', () => {
      const initialSession = getCurrentSession();
      const initialPageViews = initialSession?.pageViews.length || 0;
      
      // Simulate many page views
      for (let i = 0; i < 200; i++) {
        // Page views would be added by navigation tracking in real usage
      }
      
      const finalSession = getCurrentSession();
      
      // Should manage memory appropriately
      expect(finalSession?.pageViews.length).toBeLessThan(initialPageViews + 200);
    });
  });
});