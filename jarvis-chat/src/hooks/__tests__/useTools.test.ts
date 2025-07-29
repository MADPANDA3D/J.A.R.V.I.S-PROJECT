import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTools } from '../useTools';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_TOOLS } from '../../types/tools';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('useTools', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default tools when user is not logged in', async () => {
      mockUseAuth.mockReturnValue({ user: null, signOut: vi.fn(), loading: false });

      const { result } = renderHook(() => useTools());

      expect(result.current.loading).toBe(false);
      expect(result.current.availableTools).toEqual(AVAILABLE_TOOLS);
      expect(result.current.selectedTools).toHaveLength(1); // file_analysis is default_enabled
      expect(result.current.isToolSelected('file_analysis')).toBe(true);
    });

    it('should load saved preferences from localStorage when user is logged in', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });

      const savedSelections = JSON.stringify([
        {
          tool_id: 'web_search',
          tool_name: 'Web Search',
          enabled: true,
          priority: 1,
        },
      ]);
      const savedPreferences = JSON.stringify({
        auto_suggest: false,
        persist_selections: true,
        analytics_enabled: false,
      });

      localStorageMock.getItem
        .mockReturnValueOnce(savedSelections) // tools_selections_test-user-id
        .mockReturnValueOnce(savedPreferences); // tools_preferences_test-user-id

      const { result } = renderHook(() => useTools());

      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isToolSelected('web_search')).toBe(true);
      expect(result.current.preferences.auto_suggest).toBe(false);
      expect(result.current.preferences.analytics_enabled).toBe(false);
    });
  });

  describe('tool selection', () => {
    it('should toggle tool selection correctly', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Initially, web_search should not be selected
      expect(result.current.isToolSelected('web_search')).toBe(false);

      // Toggle web_search on
      act(() => {
        result.current.toggleTool('web_search');
      });

      expect(result.current.isToolSelected('web_search')).toBe(true);
      expect(result.current.getSelectedToolIds()).toContain('web_search');

      // Toggle web_search off
      act(() => {
        result.current.toggleTool('web_search');
      });

      expect(result.current.isToolSelected('web_search')).toBe(false);
      expect(result.current.getSelectedToolIds()).not.toContain('web_search');
    });

    it('should save selections to localStorage when changed', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.toggleTool('web_search');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tools_selections_test-user-id',
        expect.stringContaining('web_search')
      );
    });
  });

  describe('getSelectedToolIds', () => {
    it('should return only enabled tool IDs', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Initially should have file_analysis (default enabled)
      expect(result.current.getSelectedToolIds()).toEqual(['file_analysis']);

      // Add web_search
      act(() => {
        result.current.toggleTool('web_search');
      });

      expect(result.current.getSelectedToolIds()).toEqual([
        'file_analysis',
        'web_search',
      ]);

      // Disable file_analysis
      act(() => {
        result.current.toggleTool('file_analysis');
      });

      expect(result.current.getSelectedToolIds()).toEqual(['web_search']);
    });
  });

  describe('preferences management', () => {
    it('should update preferences correctly', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.updatePreferences({
          auto_suggest: false,
          analytics_enabled: false,
        });
      });

      expect(result.current.preferences.auto_suggest).toBe(false);
      expect(result.current.preferences.analytics_enabled).toBe(false);
      expect(result.current.preferences.persist_selections).toBe(true); // Should keep existing value
    });
  });

  describe('resetToDefaults', () => {
    it('should reset to default selections and preferences', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Make some changes
      act(() => {
        result.current.toggleTool('web_search');
        result.current.updatePreferences({ auto_suggest: false });
      });

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.isToolSelected('file_analysis')).toBe(true);
      expect(result.current.isToolSelected('web_search')).toBe(false);
      expect(result.current.preferences.auto_suggest).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });
      localStorageMock.getItem.mockImplementation(() {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to load tool preferences');
      expect(result.current.selectedTools).toHaveLength(1); // Should fall back to defaults
    });
  });

  describe('analytics', () => {
    it('should generate session ID when recording usage', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });
      console.log = vi.fn(); // Mock console.log

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.toggleTool('web_search');
      });

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'chat_session_id',
        expect.stringMatching(/^session_\d+_/)
      );
    });

    it('should not record usage when analytics is disabled', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, signOut: vi.fn(), loading: false });
      console.log = vi.fn();

      const { result } = renderHook(() => useTools());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Disable analytics
      act(() => {
        result.current.updatePreferences({ analytics_enabled: false });
      });

      act(() => {
        result.current.toggleTool('web_search');
      });

      // Should not set session ID when analytics disabled
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
});
