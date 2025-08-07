import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
  showDelay?: number; // Delay in ms before showing prompt
  className?: string;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  showDelay = 30000, // 30 seconds default
  className = '',
}) => {
  const { canInstall, isInstalling, install, installError, clearError } =
    usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show prompt after delay and user engagement
  useEffect(() => {
    if (!canInstall || isDismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [canInstall, showDelay, isDismissed]);

  // Clear error when component unmounts
  useEffect(() => {
    return () {
      if (installError) {
        clearError();
      }
    };
  }, [installError, clearError]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  // Don't render if not installable or dismissed
  if (!canInstall || !isVisible || isDismissed) {
    return null;
  }

  return (
    <Card
      className={`fixed bottom-4 left-4 right-4 z-50 p-4 bg-card border-primary/20 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Install JARVIS Chat</h3>
            <p className="text-xs text-muted-foreground">
              Get the native app experience with faster access and offline
              support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={isInstalling}
            className="text-xs"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-xs p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {installError && (
        <div className="mt-2 text-xs text-destructive">
          Error: {installError}
        </div>
      )}
    </Card>
  );
};
