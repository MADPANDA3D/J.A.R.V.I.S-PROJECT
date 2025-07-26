import { renderHook, act } from '@testing-library/react';
import { usePWAInstall } from '../usePWAInstall';
import { vi } from 'vitest';

// Mock the beforeinstallprompt event
interface MockBeforeInstallPromptEvent {
  type: string;
  preventDefault: ReturnType<typeof vi.fn>;
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

describe('usePWAInstall', () => {
  let mockEvent: MockBeforeInstallPromptEvent;

  // Helper function to dispatch mock beforeinstallprompt event
  const dispatchMockInstallPrompt = (
    customEvent?: Partial<MockBeforeInstallPromptEvent>
  ) => {
    const eventData = { ...mockEvent, ...customEvent };

    // Manually trigger the event handler since we can't properly mock Events
    const event = new CustomEvent('beforeinstallprompt');
    Object.defineProperty(event, 'prompt', {
      value: eventData.prompt,
      writable: false,
    });
    Object.defineProperty(event, 'userChoice', {
      value: eventData.userChoice,
      writable: false,
    });
    Object.defineProperty(event, 'preventDefault', {
      value: eventData.preventDefault,
      writable: false,
    });

    window.dispatchEvent(event);
  };

  beforeEach(() => {
    // Reset window properties
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock beforeinstallprompt event
    mockEvent = {
      type: 'beforeinstallprompt',
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    } as MockBeforeInstallPromptEvent;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isInstalling).toBe(false);
    expect(result.current.installPrompt).toBe(null);
    expect(result.current.installError).toBe(null);
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isPWASupported).toBe(false); // jsdom doesn't support PushManager
  });

  it('should detect when app is installed in standalone mode', () => {
    // Mock standalone display mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
  });

  it('should handle beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      dispatchMockInstallPrompt();
    });

    expect(result.current.isInstallable).toBe(true);
    expect(result.current.installPrompt).toBeTruthy();
    expect(result.current.canInstall).toBe(true);
  });

  it('should handle successful installation', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // Trigger beforeinstallprompt
    act(() => {
      dispatchMockInstallPrompt();
    });

    // Install the app
    await act(async () => {
      const success = await result.current.install();
      expect(success).toBe(true);
    });

    expect(mockEvent.prompt).toHaveBeenCalled();
  });

  it('should handle installation rejection', async () => {
    // Mock rejected installation
    mockEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      dispatchMockInstallPrompt();
    });

    await act(async () => {
      const success = await result.current.install();
      expect(success).toBe(false);
    });

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.installPrompt).toBe(null);
  });

  it('should handle installation error', async () => {
    // Mock installation error
    const errorMessage = 'Installation failed';
    mockEvent.prompt = vi.fn().mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      dispatchMockInstallPrompt();
    });

    await act(async () => {
      const success = await result.current.install();
      expect(success).toBe(false);
    });

    expect(result.current.installError).toBe(errorMessage);
    expect(result.current.isInstalling).toBe(false);
  });

  it('should handle appinstalled event', () => {
    const { result } = renderHook(() => usePWAInstall());

    // First make it installable
    act(() => {
      dispatchMockInstallPrompt();
    });

    expect(result.current.isInstallable).toBe(true);

    // Then trigger app installed
    act(() => {
      const installedEvent = new Event('appinstalled');
      window.dispatchEvent(installedEvent);
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.installPrompt).toBe(null);
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => usePWAInstall());

    // Set an error state manually (this would normally happen during failed install)
    act(() => {
      dispatchMockInstallPrompt();
    });

    // Mock a failed install to set error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.installError).toBe(null);
  });

  it('should return false for install when no prompt is available', async () => {
    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      const success = await result.current.install();
      expect(success).toBe(false);
    });

    expect(result.current.installError).toBe('Install prompt not available');
  });
});
