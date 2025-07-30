/**
 * Accessibility Utilities
 * Provides comprehensive accessibility features and WCAG 2.1 AA compliance utilities
 */

// Screen reader announcement utility
export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timeout?: number;
}

class ScreenReaderManager {
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  constructor() {
    this.createLiveRegions();
  }

  /**
   * Create ARIA live regions for screen reader announcements
   */
  private createLiveRegions(): void {
    // Polite announcements (non-interrupting)
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    // Assertive announcements (interrupting)
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.style.cssText = this.politeRegion.style.cssText;

    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  /**
   * Announce message to screen readers
   */
  announce(announcement: ScreenReaderAnnouncement): void {
    const region =
      announcement.priority === 'assertive'
        ? this.assertiveRegion
        : this.politeRegion;

    if (!region) return;

    // Clear previous message
    region.textContent = '';

    // Add new message after a brief delay to ensure screen readers detect the change
    setTimeout(() => {
      region.textContent = announcement.message;

      // Clear message after timeout if specified
      if (announcement.timeout) {
        setTimeout(() => {
          region.textContent = '';
        }, announcement.timeout);
      }
    }, 50);
  }
}

// Global screen reader manager instance
export const screenReader = new ScreenReaderManager();

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusHistory: HTMLElement[] = [];
  private trapStack: HTMLElement[] = [];

  /**
   * Set focus on element with optional announcement
   */
  setFocus(element: HTMLElement, announce?: string): void {
    if (!element) return;

    // Store previous focus for restoration
    const previousElement = document.activeElement as HTMLElement;
    if (previousElement && previousElement !== document.body) {
      this.focusHistory.push(previousElement);
    }

    element.focus();

    if (announce) {
      screenReader.announce({
        message: announce,
        priority: 'polite',
      });
    }
  }

  /**
   * Restore focus to previous element
   */
  restoreFocus(): void {
    const previousElement = this.focusHistory.pop();
    if (previousElement) {
      previousElement.focus();
    }
  }

  /**
   * Trap focus within a container (for modals, dropdowns)
   */
  trapFocus(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    this.trapStack.push(container);

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Store cleanup function
    (container as HTMLElement & { _focusTrapCleanup?: () => void })._focusTrapCleanup = () {
      container.removeEventListener('keydown', handleKeyDown);
    };

    // Focus first element
    firstElement.focus();
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap(): void {
    const container = this.trapStack.pop();
    const containerWithCleanup = container as HTMLElement & { _focusTrapCleanup?: () => void };
    if (container && containerWithCleanup._focusTrapCleanup) {
      containerWithCleanup._focusTrapCleanup();
      delete containerWithCleanup._focusTrapCleanup;
    }
    this.restoreFocus();
  }

  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const elements = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    return elements.filter(element => {
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hidden &&
        window.getComputedStyle(element).visibility !== 'hidden'
      );
    });
  }
}

export const focusManager = new FocusManager();

/**
 * Color contrast utilities for WCAG AA compliance
 */
export class ColorContrastValidator {
  /**
   * Calculate relative luminance of a color
   */
  private getRelativeLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color combination meets WCAG AA standards
   */
  isWCAGCompliant(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): {
    isCompliant: boolean;
    ratio: number;
    requiredRatio: number;
  } {
    const ratio = this.getContrastRatio(foreground, background);
    const requiredRatio = level === 'AAA' ? 7 : 4.5;

    return {
      isCompliant: ratio >= requiredRatio,
      ratio: ratio,
      requiredRatio: requiredRatio,
    };
  }

  /**
   * Suggest better color combinations
   */
  suggestBetterColor(foreground: string, background: string): string[] {
    const suggestions: string[] = [];
    const backgroundLuminance = this.getRelativeLuminance(background);

    // If background is light, suggest darker foregrounds
    if (backgroundLuminance > 0.5) {
      suggestions.push('#000000', '#333333', '#4a4a4a', '#666666');
    } else {
      // If background is dark, suggest lighter foregrounds
      suggestions.push('#ffffff', '#f5f5f5', '#e5e5e5', '#cccccc');
    }

    return suggestions.filter(
      color => this.isWCAGCompliant(color, background).isCompliant
    );
  }
}

export const colorValidator = new ColorContrastValidator();

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigationManager {
  private shortcuts: Map<string, () => void> = new Map();

  /**
   * Register keyboard shortcut
   */
  registerShortcut(
    keys: string,
    callback: () => void,
    description?: string
  ): void {
    this.shortcuts.set(keys.toLowerCase(), callback);

    // Add to global shortcuts registry for help
    if (description) {
      this.addToShortcutsHelp(keys, description);
    }
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    const key = this.getKeyString(event);
    const callback = this.shortcuts.get(key);

    if (callback) {
      event.preventDefault();
      callback();
      return true;
    }

    return false;
  }

  /**
   * Convert keyboard event to string representation
   */
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');

    parts.push(event.key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Add shortcut to help system
   */
  private addToShortcutsHelp(keys: string, description: string): void {
    const helpContainer = document.getElementById('keyboard-shortcuts-help');
    if (helpContainer) {
      const shortcutElement = document.createElement('div');
      shortcutElement.innerHTML = `<kbd>${keys}</kbd>: ${description}`;
      helpContainer.appendChild(shortcutElement);
    }
  }

  /**
   * Create keyboard shortcuts help modal
   */
  createShortcutsHelp(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'keyboard-shortcuts-help';
    modal.className = 'keyboard-shortcuts-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'shortcuts-title');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="shortcuts-content">
        <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
        <div class="shortcuts-list"></div>
        <button class="close-shortcuts" aria-label="Close keyboard shortcuts help">×</button>
      </div>
    `;

    return modal;
  }
}

export const keyboardNav = new KeyboardNavigationManager();

/**
 * ARIA utilities
 */
export class AriaManager {
  /**
   * Set ARIA properties safely
   */
  setAria(
    element: HTMLElement,
    properties: Record<string, string | boolean | number>
  ): void {
    Object.entries(properties).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      element.setAttribute(ariaKey, String(value));
    });
  }

  /**
   * Create ARIA describedby relationship
   */
  createDescription(element: HTMLElement, description: string): string {
    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;

    const descElement = document.createElement('div');
    descElement.id = descId;
    descElement.className = 'sr-only';
    descElement.textContent = description;

    element.parentNode?.insertBefore(descElement, element.nextSibling);
    element.setAttribute('aria-describedby', descId);

    return descId;
  }

  /**
   * Create ARIA live region
   */
  createLiveRegion(type: 'polite' | 'assertive' = 'polite'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', type);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';

    return region;
  }

  /**
   * Update element's ARIA label based on context
   */
  updateLabel(element: HTMLElement, label: string, context?: string): void {
    const fullLabel = context ? `${label} (${context})` : label;
    element.setAttribute('aria-label', fullLabel);
  }
}

export const ariaManager = new AriaManager();

/**
 * Accessibility preferences management
 */
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'auto';
}

export class AccessibilityPreferencesManager {
  private preferences: AccessibilityPreferences = {
    reducedMotion: this.getPrefersReducedMotion(),
    highContrast: this.getPrefersHighContrast(),
    screenReaderOptimized: false,
    fontSize: 'medium',
    colorScheme: 'auto',
  };

  constructor() {
    this.loadPreferences();
    this.applyPreferences();
    this.setupMediaQueryListeners();
  }

  /**
   * Detect user's reduced motion preference
   */
  private getPrefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Detect user's high contrast preference
   */
  private getPrefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    const stored = localStorage.getItem('accessibility-preferences');
    if (stored) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      } catch (error) {
        console.warn('Failed to load accessibility preferences:', error);
      }
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    localStorage.setItem(
      'accessibility-preferences',
      JSON.stringify(this.preferences)
    );
  }

  /**
   * Apply preferences to the DOM
   */
  private applyPreferences(): void {
    const root = document.documentElement;

    // Apply reduced motion
    root.style.setProperty(
      '--motion-duration',
      this.preferences.reducedMotion ? '0.01ms' : '200ms'
    );

    // Apply high contrast
    if (this.preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.classList.remove(
      'font-small',
      'font-medium',
      'font-large',
      'font-extra-large'
    );
    root.classList.add(`font-${this.preferences.fontSize}`);

    // Apply color scheme
    root.setAttribute('data-color-scheme', this.preferences.colorScheme);

    // Apply screen reader optimizations
    if (this.preferences.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  }

  /**
   * Setup media query listeners for system preferences
   */
  private setupMediaQueryListeners(): void {
    // Listen for reduced motion changes
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    reducedMotionQuery.addEventListener('change', e => {
      this.preferences.reducedMotion = e.matches;
      this.applyPreferences();
    });

    // Listen for high contrast changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addEventListener('change', e => {
      this.preferences.highContrast = e.matches;
      this.applyPreferences();
    });

    // Listen for color scheme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', () => {
      if (this.preferences.colorScheme === 'auto') {
        this.applyPreferences();
      }
    });
  }

  /**
   * Update preference
   */
  setPreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ): void {
    this.preferences[key] = value;
    this.savePreferences();
    this.applyPreferences();

    screenReader.announce({
      message: `Accessibility preference updated: ${key} set to ${value}`,
      priority: 'polite',
    });
  }

  /**
   * Get current preferences
   */
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.preferences = {
      reducedMotion: this.getPrefersReducedMotion(),
      highContrast: this.getPrefersHighContrast(),
      screenReaderOptimized: false,
      fontSize: 'medium',
      colorScheme: 'auto',
    };
    this.savePreferences();
    this.applyPreferences();
  }
}

export const accessibilityPrefs = new AccessibilityPreferencesManager();

/**
 * Accessibility testing utilities
 */
export class AccessibilityTester {
  /**
   * Run basic accessibility audit
   */
  async audit(): Promise<{
    issues: Array<{
      type: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
      element?: HTMLElement;
    }>;
    score: number;
  }> {
    const issues: Array<{
      type: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
      element?: HTMLElement;
    }> = [];

    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          type: 'missing-alt-text',
          severity: 'error',
          message: 'Image missing alt text',
          element: img,
        });
      }
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const hasLabel =
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        document.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
        issues.push({
          type: 'missing-form-label',
          severity: 'error',
          message: 'Form input missing label',
          element: input as HTMLElement,
        });
      }
    });

    // Check heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      if (level > lastLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          severity: 'warning',
          message: `Heading level ${level} skips level ${lastLevel + 1}`,
          element: heading as HTMLElement,
        });
      }
      lastLevel = level;
    });

    // Check color contrast (simplified check)
    const textElements = document.querySelectorAll(
      'p, span, div, a, button, label'
    );
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = colorValidator.getContrastRatio(
          color,
          backgroundColor
        );
        if (contrast < 4.5) {
          issues.push({
            type: 'color-contrast',
            severity: 'error',
            message: `Poor color contrast: ${contrast.toFixed(2)} (minimum: 4.5)`,
            element: element as HTMLElement,
          });
        }
      }
    });

    const score = Math.max(0, 100 - issues.length * 10);

    return { issues, score };
  }

  /**
   * Generate accessibility report
   */
  async generateReport(): Promise<string> {
    const audit = await this.audit();

    let report = `# Accessibility Audit Report\n\n`;
    report += `**Score:** ${audit.score}/100\n\n`;
    report += `**Issues Found:** ${audit.issues.length}\n\n`;

    if (audit.issues.length > 0) {
      report += `## Issues by Severity\n\n`;

      const errorCount = audit.issues.filter(
        i => i.severity === 'error'
      ).length;
      const warningCount = audit.issues.filter(
        i => i.severity === 'warning'
      ).length;
      const infoCount = audit.issues.filter(i => i.severity === 'info').length;

      report += `- **Errors:** ${errorCount}\n`;
      report += `- **Warnings:** ${warningCount}\n`;
      report += `- **Info:** ${infoCount}\n\n`;

      report += `## Detailed Issues\n\n`;

      audit.issues.forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.type} (${issue.severity})\n`;
        report += `${issue.message}\n\n`;
      });
    } else {
      report += `🎉 No accessibility issues found!\n\n`;
    }

    return report;
  }
}

export const accessibilityTester = new AccessibilityTester();

/**
 * Initialize accessibility features
 */
export function initializeAccessibility(): void {
  // Setup global keyboard navigation
  document.addEventListener('keydown', event => {
    keyboardNav.handleKeyDown(event);
  });

  // Setup skip links
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Register common keyboard shortcuts
  keyboardNav.registerShortcut(
    'alt+h',
    () {
      const heading = document.querySelector('h1, h2');
      if (heading) {
        focusManager.setFocus(
          heading as HTMLElement,
          'Navigated to main heading'
        );
      }
    },
    'Navigate to main heading'
  );

  keyboardNav.registerShortcut(
    'alt+m',
    () {
      const main =
        document.getElementById('main-content') ||
        document.querySelector('main');
      if (main) {
        focusManager.setFocus(main as HTMLElement, 'Navigated to main content');
      }
    },
    'Navigate to main content'
  );

  keyboardNav.registerShortcut(
    'alt+/',
    () {
      // Toggle shortcuts help
      const help = document.getElementById('keyboard-shortcuts-help');
      if (help) {
        const isVisible = help.getAttribute('aria-hidden') === 'false';
        help.setAttribute('aria-hidden', String(!isVisible));
        help.style.display = isVisible ? 'none' : 'block';
      }
    },
    'Show/hide keyboard shortcuts help'
  );

  console.log('Accessibility features initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAccessibility);
} else {
  initializeAccessibility();
}
