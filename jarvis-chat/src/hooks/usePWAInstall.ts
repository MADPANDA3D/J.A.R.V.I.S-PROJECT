import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  installError: string | null;
}

export const usePWAInstall = () => {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isInstalling: false,
    installPrompt: null,
    installError: null,
  });

  // Check if app is already installed
  const checkInstallStatus = useCallback(() => {
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setState(prev => ({ ...prev, isInstalled }));
  }, []);

  // Handle the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      const installEvent = e as BeforeInstallPromptEvent;
      console.log('📱 PWA install prompt available');

      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent,
        installError: null,
      }));
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA was installed');
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
        isInstalling: false,
      }));
    };

    // Listen for install events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check initial install status
    checkInstallStatus();

    return () {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkInstallStatus]);

  // Trigger the install prompt
  const install = useCallback(async () => {
    if (!state.installPrompt) {
      setState(prev => ({
        ...prev,
        installError: 'Install prompt not available',
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isInstalling: true, installError: null }));

      // Show the install prompt
      await state.installPrompt.prompt();

      // Wait for the user's choice
      const choiceResult = await state.installPrompt.userChoice;

      console.log('👤 User choice:', choiceResult.outcome);

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        // The 'appinstalled' event will handle state updates
        return true;
      } else {
        console.log('❌ User dismissed the install prompt');
        setState(prev => ({
          ...prev,
          isInstalling: false,
          isInstallable: false, // Hide install button for this session
          installPrompt: null,
        }));
        return false;
      }
    } catch {
      console.error('❌ Install failed:', error);
      setState(prev => ({
        ...prev,
        isInstalling: false,
        installError: error instanceof Error ? error.message : 'Install failed',
      }));
      return false;
    }
  }, [state.installPrompt]);

  // Reset install error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, installError: null }));
  }, []);

  // Check if PWA features are supported
  const isPWASupported =
    'serviceWorker' in navigator && 'PushManager' in window;

  return {
    ...state,
    install,
    clearError,
    isPWASupported,
    canInstall:
      state.isInstallable && !state.isInstalled && !state.isInstalling,
  };
};
