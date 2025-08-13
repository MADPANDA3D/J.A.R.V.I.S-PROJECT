import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstallPrompt } from '../InstallPrompt';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { vi } from 'vitest';

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

    render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(screen.getByText('Install')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Install'));
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
    render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(screen.getAllByText('Install JARVIS Chat')[0]).toBeInTheDocument();
    });

    const dismissButton = screen.getByRole('button', { name: '' }); // X button has no text
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('Install JARVIS Chat')).not.toBeInTheDocument();
    });
  });

  it('should respect showDelay prop', async () => {
    render(<InstallPrompt showDelay={100} />);

    // Should not be visible immediately
    expect(screen.queryByText('Install JARVIS Chat')).not.toBeInTheDocument();

    // Should be visible after delay
    await waitFor(() => {
        expect(screen.getByText('Install JARVIS Chat')).toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it('should hide prompt after successful installation', async () => {
    mockInstall.mockResolvedValue(true);

    render(<InstallPrompt showDelay={0} />);

    await waitFor(() => {
      expect(screen.getByText('Install')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Install'));

    await waitFor(() => {
      expect(screen.queryByText('Install JARVIS Chat')).not.toBeInTheDocument();
    });
  });
});
