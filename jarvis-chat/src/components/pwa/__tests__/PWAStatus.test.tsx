import { render, screen, fireEvent } from '@testing-library/react';
import { PWAStatus } from '../PWAStatus';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { vi } from 'vitest';

// Mock the PWA hook
vi.mock('@/hooks/usePWAInstall');

const mockUsePWAInstall = usePWAInstall as ReturnType<typeof vi.fn>;

// Mock window.matchMedia
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

describe('PWAStatus', () => {
  const mockInstall = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: false,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: false,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    vi.clearAllMocks();
  });

  it('should show "Installed" badge when app is installed', () => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: false,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: false,
      isInstalled: true,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<PWAStatus />);
    expect(screen.getByText('Installed')).toBeInTheDocument();
  });

  it('should show "Installed" badge when in standalone mode', () => {
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

    render(<PWAStatus />);
    expect(screen.getByText('Installed')).toBeInTheDocument();
  });

  it('should show "Web App" badge when PWA is supported but not installed', () => {
    render(<PWAStatus />);
    expect(screen.getByText('Web App')).toBeInTheDocument();
  });

  it('should show "Browser" badge when PWA is not supported', () => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: false,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: false,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: false,
    });

    render(<PWAStatus />);
    expect(screen.getByText('Browser')).toBeInTheDocument();
  });

  it('should show install button when canInstall is true and showInstallButton is true', () => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: true,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: true,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<PWAStatus showInstallButton={true} />);
    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('should not show install button when showInstallButton is false', () => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: true,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: true,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<PWAStatus showInstallButton={false} />);
    expect(screen.queryByText('Install')).not.toBeInTheDocument();
  });

  it('should call install when install button is clicked', () => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: true,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: true,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<PWAStatus showInstallButton={true} />);

    const installButton = screen.getByText('Install');
    fireEvent.click(installButton);

    expect(mockInstall).toHaveBeenCalled();
  });

  it('should show "Installing..." when isInstalling is true', () => {
    mockUsePWAInstall.mockReturnValue({
      canInstall: true,
      isInstalling: true,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: true,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<PWAStatus showInstallButton={true} />);
    expect(screen.getByText('Installing...')).toBeInTheDocument();
  });

  it('should show "Install App" on mobile devices', () => {
    // Mock mobile user agent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    mockUsePWAInstall.mockReturnValue({
      canInstall: true,
      isInstalling: false,
      install: mockInstall,
      installError: null,
      clearError: mockClearError,
      isInstallable: true,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<PWAStatus showInstallButton={true} />);
    expect(screen.getByText('Install App')).toBeInTheDocument();
  });
});
