/**
 * Enhanced Error Tracking Tests
 * Tests for enhanced error tracking with breadcrumbs, sessions, and external monitoring
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  captureError,
  captureAPIFailure,
  captureAuthError,
  trackUserAction,
  addBreadcrumb,
  setErrorTags,
  getBreadcrumbs,
  getSessionId,
  getCurrentTags,
  errorTracker
} from '../errorTracking';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window and navigator
Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost:3000/test' },
  writable: true,
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

// Mock import for external monitoring
vi.mock('../externalMonitoring', () => ({
  captureExternalError: vi.fn(),
  captureExternalBreadcrumb: vi.fn(),
}));

vi.mock('../sessionTracking', () => ({
  incrementSessionErrors: vi.fn(),
}));

describe('Enhanced Error Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    errorTracker.clearErrors();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Enhanced Error Reports', () => {
    it('should create enhanced error reports with session info', () => {
      const error = new Error('Test error');
      const errorId = captureError(error, { component: 'TestComponent' });
      
      const errors = errorTracker.getErrors();
      const capturedError = errors.find(e => e.id === errorId);
      
      expect(capturedError).toBeDefined();
      expect(capturedError?.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(capturedError?.breadcrumbs).toBeDefined();
      expect(capturedError?.tags).toBeDefined();
      expect(capturedError?.fingerprint).toBeDefined();
      expect(capturedError?.environment).toBeDefined();
      expect(capturedError?.component).toBe('TestComponent');
    });

    it('should generate fingerprints for error grouping', () => {
      const error1 = new Error('Same error message');
      const error2 = new Error('Same error message');
      
      const id1 = captureError(error1, { component: 'Component1' });
      const id2 = captureError(error2, { component: 'Component1' });
      
      const errors = errorTracker.getErrors();
      const err1 = errors.find(e => e.id === id1);
      const err2 = errors.find(e => e.id === id2);
      
      // Should have similar fingerprints for same error
      expect(err1?.fingerprint[0]).toBe(err2?.fingerprint[0]);
    });

    it('should include release and environment information', () => {
      const error = new Error('Test error');
      const errorId = captureError(error);
      
      const errors = errorTracker.getErrors();
      const capturedError = errors.find(e => e.id === errorId);
      
      expect(capturedError?.release).toBeDefined();
      expect(capturedError?.environment).toBeDefined();
    });
  });

  describe('Breadcrumb System', () => {
    it('should add breadcrumbs with proper categorization', () => {
      addBreadcrumb('info', 'navigation', 'User navigated to page', { url: '/test' });
      addBreadcrumb('error', 'error', 'API call failed', { endpoint: '/api/test' });
      
      const breadcrumbs = getBreadcrumbs();
      
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].category).toBe('navigation');
      expect(breadcrumbs[0].level).toBe('info');
      expect(breadcrumbs[1].category).toBe('error');
      expect(breadcrumbs[1].level).toBe('error');
    });

    it('should limit breadcrumb storage', () => {
      // Add many breadcrumbs
      for (let i = 0; i < 100; i++) {
        addBreadcrumb('info', 'info', `Breadcrumb ${i}`);
      }
      
      const breadcrumbs = getBreadcrumbs();
      
      // Should limit to maximum (50 in implementation)
      expect(breadcrumbs.length).toBeLessThanOrEqual(50);
    });

    it('should include breadcrumbs in error reports', () => {
      addBreadcrumb('info', 'user_action', 'User clicked button');
      addBreadcrumb('warning', 'http', 'Slow API response');
      
      const error = new Error('Test error');
      const errorId = captureError(error);
      
      const errors = errorTracker.getErrors();
      const capturedError = errors.find(e => e.id === errorId);
      
      expect(capturedError?.breadcrumbs).toHaveLength(3); // 2 manual + 1 auto from error
    });
  });

  describe('API Failure Tracking', () => {
    it('should track API failures with detailed context', () => {
      const apiContext = {
        endpoint: '/api/users',
        method: 'GET',
        statusCode: 500,
        responseTime: 2500,
        retryAttempt: 1,
        requestId: 'req-123'
      };
      
      const errorId = captureAPIFailure(apiContext);
      
      const errors = errorTracker.getErrors();
      const error = errors.find(e => e.id === errorId);
      
      expect(error).toBeDefined();
      expect(error?.apiEndpoint).toBe('/api/users');
      expect(error?.retryCount).toBe(1);
      expect(error?.context).toEqual(expect.objectContaining({
        method: 'GET',
        statusCode: 500,
        responseTime: 2500
      }));
    });

    it('should add breadcrumbs for API failures', () => {
      const apiContext = {
        endpoint: '/api/test',
        method: 'POST',
        statusCode: 404,
        responseTime: 1000,
        retryAttempt: 0
      };
      
      captureAPIFailure(apiContext);
      
      const breadcrumbs = getBreadcrumbs();
      const apiBreadcrumb = breadcrumbs.find(b => 
        b.category === 'http' && b.message.includes('API Failure')
      );
      
      expect(apiBreadcrumb).toBeDefined();
      expect(apiBreadcrumb?.data).toEqual(expect.objectContaining({
        statusCode: 404,
        responseTime: 1000
      }));
    });
  });

  describe('Authentication Error Tracking', () => {
    it('should track auth errors with context', () => {
      const authContext = {
        authEvent: 'sign_in' as const,
        supabaseError: 'Invalid credentials',
        userId: 'user-123',
        sessionId: 'session-456'
      };
      
      const errorId = captureAuthError(authContext);
      
      const errors = errorTracker.getErrors();
      const error = errors.find(e => e.id === errorId);
      
      expect(error).toBeDefined();
      expect(error?.context).toEqual(expect.objectContaining({
        type: 'auth_error',
        authEvent: 'sign_in',
        supabaseError: 'Invalid credentials'
      }));
    });

    it('should add breadcrumbs for auth events', () => {
      const authContext = {
        authEvent: 'sign_up' as const,
        supabaseError: 'Email already exists',
        userId: undefined,
        sessionId: undefined
      };
      
      captureAuthError(authContext);
      
      const breadcrumbs = getBreadcrumbs();
      const authBreadcrumb = breadcrumbs.find(b => 
        b.category === 'user_action' && b.message.includes('Auth Error')
      );
      
      expect(authBreadcrumb).toBeDefined();
    });
  });

  describe('User Action Tracking', () => {
    it('should track user actions as breadcrumbs', () => {
      const actionContext = {
        actionType: 'chat_message' as const,
        elementId: 'message-input',
        elementText: 'Send message'
      };
      
      trackUserAction(actionContext);
      
      const breadcrumbs = getBreadcrumbs();
      const actionBreadcrumb = breadcrumbs.find(b => 
        b.category === 'user_action' && b.message.includes('User Action')
      );
      
      expect(actionBreadcrumb).toBeDefined();
      expect(actionBreadcrumb?.data).toEqual(expect.objectContaining({
        elementId: 'message-input',
        elementText: 'Send message'
      }));
    });

    it('should handle different action types', () => {
      const actions = [
        { actionType: 'form_submit' as const, formData: { field: 'value' } },
        { actionType: 'navigation' as const, navigationFrom: '/page1', navigationTo: '/page2' },
        { actionType: 'button_click' as const, elementId: 'submit-btn' }
      ];
      
      actions.forEach(action => trackUserAction(action));
      
      const breadcrumbs = getBreadcrumbs();
      const actionBreadcrumbs = breadcrumbs.filter(b => 
        b.category === 'user_action' && b.message.includes('User Action')
      );
      
      expect(actionBreadcrumbs).toHaveLength(3);
    });
  });

  describe('Tags Management', () => {
    it('should set and retrieve tags', () => {
      const tags = { component: 'TestComponent', version: '1.0.0' };
      setErrorTags(tags);
      
      const currentTags = getCurrentTags();
      expect(currentTags).toEqual(tags);
    });

    it('should merge tags when setting multiple times', () => {
      setErrorTags({ component: 'TestComponent' });
      setErrorTags({ version: '1.0.0' });
      
      const currentTags = getCurrentTags();
      expect(currentTags).toEqual({
        component: 'TestComponent',
        version: '1.0.0'
      });
    });

    it('should include tags in error reports', () => {
      setErrorTags({ feature: 'authentication', module: 'login' });
      
      const error = new Error('Login failed');
      const errorId = captureError(error);
      
      const errors = errorTracker.getErrors();
      const capturedError = errors.find(e => e.id === errorId);
      
      expect(capturedError?.tags).toEqual(expect.objectContaining({
        feature: 'authentication',
        module: 'login'
      }));
    });
  });

  describe('Session Integration', () => {
    it('should include session ID in error reports', () => {
      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      
      const error = new Error('Test error');
      const errorId = captureError(error);
      
      const errors = errorTracker.getErrors();
      const capturedError = errors.find(e => e.id === errorId);
      
      expect(capturedError?.sessionId).toBe(sessionId);
    });

    it('should set user context', () => {
      const userId = 'user-123';
      const metadata = { email: 'test@example.com', role: 'admin' };
      
      errorTracker.setUser(userId, metadata);
      
      const error = new Error('Test error');
      const errorId = captureError(error);
      
      const errors = errorTracker.getErrors();
      const capturedError = errors.find(e => e.id === errorId);
      
      expect(capturedError?.userId).toBe(userId);
    });
  });

  describe('Performance', () => {
    it('should handle high volume of errors efficiently', () => {
      const startTime = Date.now();
      
      // Generate many errors
      for (let i = 0; i < 100; i++) {
        captureError(new Error(`Error ${i}`));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000);
    });

    it('should limit stored errors to prevent memory leaks', () => {
      // Generate many errors
      for (let i = 0; i < 200; i++) {
        captureError(new Error(`Error ${i}`));
      }
      
      const errors = errorTracker.getErrors();
      
      // Should limit to maximum (100 in implementation)
      expect(errors.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Persistence', () => {
    it('should persist errors to localStorage', () => {
      const error = new Error('Test error');
      captureError(error);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jarvis_errors',
        expect.any(String)
      );
    });

    it('should persist breadcrumbs to localStorage', () => {
      addBreadcrumb('info', 'info', 'Test breadcrumb');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jarvis_breadcrumbs',
        expect.any(String)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() {
        throw new Error('Storage quota exceeded');
      });
      
      // Should not throw error
      expect(() {
        captureError(new Error('Test error'));
      }).not.toThrow();
    });
  });

  describe('External Monitoring Integration', () => {
    it('should send errors to external monitoring asynchronously', async () => {
      const error = new Error('Test error');
      captureError(error);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // External monitoring should be called (mocked)
      const { captureExternalError } = await import('../externalMonitoring');
      expect(captureExternalError).toHaveBeenCalled();
    });

    it('should send breadcrumbs to external monitoring', async () => {
      addBreadcrumb('info', 'navigation', 'Test breadcrumb');
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const { captureExternalBreadcrumb } = await import('../externalMonitoring');
      expect(captureExternalBreadcrumb).toHaveBeenCalled();
    });
  });
});