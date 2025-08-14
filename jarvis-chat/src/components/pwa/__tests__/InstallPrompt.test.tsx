import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { InstallPrompt } from '../InstallPrompt';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock the PWA hook
vi.mock('@/hooks/usePWAInstall');

const mockUsePWAInstall = usePWAInstall as ReturnType<typeof vi.fn>;

describe('InstallPrompt', () => {
  const mockInstall = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
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

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Ensure DOM is cleaned up between tests
  });

  it('should not render when canInstall is false', () => {
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

    render(<InstallPrompt />);
    expect(screen.queryByText('Install JARVIS Chat')).not.toBeInTheDocument();
  });

  it('should render install prompt when canInstall is true', async () => {
    render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(screen.getAllByText('Install JARVIS Chat')[0]).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Get the native app experience with faster access and offline support'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('should call install when install button is clicked', async () => {
    mockInstall.mockResolvedValue(true);

    const { container } = render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(container.querySelector('[role="button"]')).toBeInTheDocument();
    });

    const installButton = container.querySelector('[role="button"]') as HTMLElement;
    fireEvent.click(installButton);
    expect(mockInstall).toHaveBeenCalled();
  });

  it('should show installing state when isInstalling is true', async () => {
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

    render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(screen.getByText('Installing...')).toBeInTheDocument();
    });
  });

  it('should display error message when installError is present', async () => {
    const errorMessage = 'Installation failed';
    mockUsePWAInstall.mockReturnValue({
      canInstall: true,
      isInstalling: false,
      install: mockInstall,
      installError: errorMessage,
      clearError: mockClearError,
      isInstallable: true,
      isInstalled: false,
      installPrompt: null,
      isPWASupported: true,
    });

    render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('should dismiss prompt when X button is clicked', async () => {
    const { container } = render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(container.querySelector('h3')).toHaveTextContent('Install JARVIS Chat');
    });

    const buttons = container.querySelectorAll('[role="button"]');
    const dismissButton = Array.from(buttons).find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-x')
    ) as HTMLElement;
    
    expect(dismissButton).toBeInTheDocument();
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(container.querySelector('h3')).not.toBeInTheDocument();
    });
  });

  it('should respect showDelay prop', async () => {
    const { container } = render(<InstallPrompt showDelay={100} />);

    // Should not be visible immediately
    expect(container.querySelector('h3')).not.toBeInTheDocument();

    // Should be visible after delay
    await waitFor(() => {
        expect(container.querySelector('h3')).toHaveTextContent('Install JARVIS Chat');
      },
      { timeout: 200 }
    );
  });

  it('should hide prompt after successful installation', async () => {
    mockInstall.mockResolvedValue(true);

    const { container } = render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(container.querySelector('[role="button"]')).toBeInTheDocument();
    });

    const installButton = container.querySelector('[role="button"]') as HTMLElement;
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(container.querySelector('h3')).not.toBeInTheDocument();
    });
  });
});
