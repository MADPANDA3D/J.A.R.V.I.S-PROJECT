import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Eye,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { accessibilityPrefs } from '@/lib/accessibility';
import type { AccessibilityPreferences } from '@/lib/accessibility';
import { colorContrastValidator } from '@/lib/color-contrast-validator';

interface VisualAccessibilityControlsProps {
  className?: string;
}

export const VisualAccessibilityControls: React.FC<
  VisualAccessibilityControlsProps
> = ({ className = '' }) => {
  const [preferences, setPreferences] =
    React.useState<AccessibilityPreferences>(
      accessibilityPrefs.getPreferences()
    );
  const [contrastReport, setContrastReport] = React.useState<any>(null);

  React.useEffect(() => {
    // Update contrast report when preferences change
    const report = colorContrastValidator.getThemeContrastReport();
    setContrastReport(report);
  }, [preferences]);

  const handlePreferenceChange = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    accessibilityPrefs.setPreference(key, value);
    setPreferences(accessibilityPrefs.getPreferences());
  };

  const resetToDefaults = () => {
    accessibilityPrefs.resetToDefaults();
    setPreferences(accessibilityPrefs.getPreferences());
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Color Scheme Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Color & Contrast</h3>
        </div>

        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Color Theme
            </label>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Choose color theme"
            >
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Monitor, label: 'Auto' },
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={
                    preferences.colorScheme === value ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    handlePreferenceChange('colorScheme', value as any)
                  }
                  className="flex items-center gap-2"
                  role="radio"
                  aria-checked={preferences.colorScheme === value}
                  aria-label={`${label} theme`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="high-contrast"
                className="text-sm font-medium cursor-pointer"
              >
                High Contrast Mode
              </label>
              <p className="text-xs text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Button
              id="high-contrast"
              variant={preferences.highContrast ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                handlePreferenceChange(
                  'highContrast',
                  !preferences.highContrast
                )
              }
              aria-pressed={preferences.highContrast}
              aria-label={`Turn ${preferences.highContrast ? 'off' : 'on'} high contrast mode`}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              {preferences.highContrast ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Contrast Report */}
          {contrastReport && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Contrast Score</span>
                <span
                  className={`text-sm font-bold ${
                    contrastReport.overallScore >= 90
                      ? 'text-green-600'
                      : contrastReport.overallScore >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                  aria-label={`Contrast compliance score: ${contrastReport.overallScore} out of 100`}
                >
                  {contrastReport.overallScore}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {contrastReport.compliantPairs} of {contrastReport.totalPairs}{' '}
                color pairs meet WCAG AA standards
              </div>
              {contrastReport.issues.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer hover:text-foreground">
                    View Issues ({contrastReport.issues.length})
                  </summary>
                  <ul className="mt-1 space-y-1 text-xs">
                    {contrastReport.issues
                      .slice(0, 3)
                      .map((issue: any, index: number) => (
                        <li key={index} className="text-muted-foreground">
                          {issue.element}: {issue.issue}
                        </li>
                      ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Font Size Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <ZoomIn className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Text Size</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Choose font size"
            >
              {[
                { value: 'small', label: 'Small', size: '14px' },
                { value: 'medium', label: 'Medium', size: '16px' },
                { value: 'large', label: 'Large', size: '18px' },
                { value: 'extra-large', label: 'Extra Large', size: '20px' },
              ].map(({ value, label, size }) => (
                <Button
                  key={value}
                  variant={
                    preferences.fontSize === value ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    handlePreferenceChange('fontSize', value as any)
                  }
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  role="radio"
                  aria-checked={preferences.fontSize === value}
                  aria-label={`${label} font size (${size})`}
                >
                  <span style={{ fontSize: size === '14px' ? '12px' : '14px' }}>
                    Aa
                  </span>
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Current size: {preferences.fontSize.replace('-', ' ')}
          </div>
        </div>
      </Card>

      {/* Motion Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Motion & Animation</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="reduced-motion"
                className="text-sm font-medium cursor-pointer"
              >
                Reduce Motion
              </label>
              <p className="text-xs text-muted-foreground">
                Minimizes animations and transitions
              </p>
            </div>
            <Button
              id="reduced-motion"
              variant={preferences.reducedMotion ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                handlePreferenceChange(
                  'reducedMotion',
                  !preferences.reducedMotion
                )
              }
              aria-pressed={preferences.reducedMotion}
              aria-label={`Turn ${preferences.reducedMotion ? 'off' : 'on'} reduced motion`}
            >
              {preferences.reducedMotion ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Screen Reader Optimization */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Screen Reader</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="screen-reader-optimized"
                className="text-sm font-medium cursor-pointer"
              >
                Screen Reader Optimization
              </label>
              <p className="text-xs text-muted-foreground">
                Optimizes layout and timing for screen readers
              </p>
            </div>
            <Button
              id="screen-reader-optimized"
              variant={
                preferences.screenReaderOptimized ? 'default' : 'outline'
              }
              size="sm"
              onClick={() =>
                handlePreferenceChange(
                  'screenReaderOptimized',
                  !preferences.screenReaderOptimized
                )
              }
              aria-pressed={preferences.screenReaderOptimized}
              aria-label={`Turn ${preferences.screenReaderOptimized ? 'off' : 'on'} screen reader optimization`}
            >
              {preferences.screenReaderOptimized ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
          aria-label="Reset all accessibility preferences to default values"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
