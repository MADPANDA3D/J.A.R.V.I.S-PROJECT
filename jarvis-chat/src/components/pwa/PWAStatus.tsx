import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Monitor } from 'lucide-react';

interface PWAStatusProps {
  showInstallButton?: boolean;
  className?: string;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({
  showInstallButton = true,
  className = '',
}) => {
  const { isInstalled, canInstall, isInstalling, install, isPWASupported } =
    usePWAInstall();

  // Detect display mode
  const standaloneQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null;
  const isStandalone = standaloneQuery ? standaloneQuery.matches : false;
  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const handleInstall = async () => {
    await install();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* PWA Status Badge */}
      {isInstalled || isStandalone ? (
        <Badge variant="default" className="bg-primary/10 text-primary">
          <Smartphone className="w-3 h-3 mr-1" />
          Installed
        </Badge>
      ) : isPWASupported ? (
        <Badge variant="outline">
          <Monitor className="w-3 h-3 mr-1" />
          Web App
        </Badge>
      ) : (
        <Badge variant="secondary">Browser</Badge>
      )}

      {/* Install Button */}
      {showInstallButton && canInstall && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleInstall}
          disabled={isInstalling}
          className="text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          {isInstalling
            ? 'Installing...'
            : isMobile
              ? 'Install App'
              : 'Install'}
        </Button>
      )}
    </div>
  );
};
