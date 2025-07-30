/**
 * Color Contrast Validator
 * Validates color combinations against WCAG 2.1 AA standards
 */

export interface ColorValidationResult {
  isCompliant: boolean;
  ratio: number;
  requiredRatio: number;
  level: 'AA' | 'AAA';
  recommendation?: string;
}

export interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  destructive: string;
  destructiveForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
}

export class ColorContrastValidator {
  private static instance: ColorContrastValidator;

  public static getInstance(): ColorContrastValidator {
    if (!ColorContrastValidator.instance) {
      ColorContrastValidator.instance = new ColorContrastValidator();
    }
    return ColorContrastValidator.instance;
  }

  /**
   * Convert hex color to RGB values
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove # if present
    hex = hex.replace('#', '');

    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(char => char + char)
        .join('');
    }

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convert HSL to RGB values
   */
  private hslToRgb(
    h: number,
    s: number,
    l: number
  ): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * Parse CSS color value (hex, hsl, rgb)
   */
  private parseColor(
    color: string
  ): { r: number; g: number; b: number } | null {
    // Handle hex colors
    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    }

    // Handle HSL colors
    const hslMatch = color.match(/hsl\((\d+),?\s*(\d+)%?,?\s*(\d+)%?\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch.map(Number);
      return this.hslToRgb(h, s, l);
    }

    // Handle RGB colors
    const rgbMatch = color.match(/rgb\((\d+),?\s*(\d+),?\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      return { r, g, b };
    }

    // Handle CSS custom properties (approximate common values)
    const cssVarMap: Record<string, string> = {
      'hsl(var(--background))': '#000000',
      'hsl(var(--foreground))': '#ffffff',
      'hsl(var(--primary))': '#dc143c',
      'hsl(var(--primary-foreground))': '#ffffff',
      'hsl(var(--secondary))': '#1a1a1a',
      'hsl(var(--secondary-foreground))': '#ffffff',
      'hsl(var(--muted))': '#1a1a1a',
      'hsl(var(--muted-foreground))': '#999999',
      'hsl(var(--destructive))': '#ef4444',
      'hsl(var(--destructive-foreground))': '#ffffff',
      'hsl(var(--border))': '#333333',
      'hsl(var(--input))': '#333333',
      'hsl(var(--ring))': '#dc143c',
    };

    if (cssVarMap[color]) {
      return this.hexToRgb(cssVarMap[color]);
    }

    console.warn(`Unable to parse color: ${color}`);
    return null;
  }

  /**
   * Calculate relative luminance of a color
   */
  private getRelativeLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  public getContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Validate color combination against WCAG standards
   */
  public validateColorPair(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): ColorValidationResult {
    const ratio = this.getContrastRatio(foreground, background);

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
    let requiredRatio: number;
    if (level === 'AAA') {
      requiredRatio = isLargeText ? 4.5 : 7;
    } else {
      requiredRatio = isLargeText ? 3 : 4.5;
    }

    const isCompliant = ratio >= requiredRatio;

    let recommendation: string | undefined;
    if (!isCompliant) {
      if (ratio < 3) {
        recommendation =
          'Critical: Very poor contrast. Colors are too similar.';
      } else if (ratio < 4.5) {
        recommendation =
          'Poor contrast. Consider using darker or lighter colors.';
      } else {
        recommendation = 'Good contrast but does not meet AAA standards.';
      }
    }

    return {
      isCompliant,
      ratio: Math.round(ratio * 100) / 100,
      requiredRatio,
      level,
      recommendation,
    };
  }

  /**
   * Validate an entire color palette
   */
  public validateColorPalette(palette: Partial<ColorPalette>): Array<{
    pair: string;
    result: ColorValidationResult;
    severity: 'error' | 'warning' | 'success';
  }> {
    const validationResults: Array<{
      pair: string;
      result: ColorValidationResult;
      severity: 'error' | 'warning' | 'success';
    }> = [];

    const colorPairs = [
      {
        fg: palette.foreground,
        bg: palette.background,
        name: 'Text on Background',
      },
      {
        fg: palette.primaryForeground,
        bg: palette.primary,
        name: 'Primary Text on Primary',
      },
      {
        fg: palette.secondaryForeground,
        bg: palette.secondary,
        name: 'Secondary Text on Secondary',
      },
      {
        fg: palette.mutedForeground,
        bg: palette.muted,
        name: 'Muted Text on Muted',
      },
      {
        fg: palette.destructiveForeground,
        bg: palette.destructive,
        name: 'Error Text on Error',
      },
      {
        fg: palette.accentForeground,
        bg: palette.accent,
        name: 'Accent Text on Accent',
      },
      {
        fg: palette.foreground,
        bg: palette.secondary,
        name: 'Text on Secondary',
      },
      {
        fg: palette.mutedForeground,
        bg: palette.background,
        name: 'Muted Text on Background',
      },
    ];

    colorPairs.forEach(({ fg, bg, name }) => {
      if (fg && bg) {
        const result = this.validateColorPair(fg, bg);
        let severity: 'error' | 'warning' | 'success';

        if (result.ratio < 3) {
          severity = 'error';
        } else if (!result.isCompliant) {
          severity = 'warning';
        } else {
          severity = 'success';
        }

        validationResults.push({
          pair: name,
          result,
          severity,
        });
      }
    });

    return validationResults;
  }

  /**
   * Generate accessible color suggestions
   */
  public suggestAccessibleColors(
    baseColor: string,
    targetBackground: string,
    level: 'AA' | 'AAA' = 'AA'
  ): string[] {
    const suggestions: string[] = [];
    const targetRatio = level === 'AAA' ? 7 : 4.5;

    // Generate variations by adjusting lightness
    const baseRgb = this.parseColor(baseColor);
    if (!baseRgb) return suggestions;

    // Convert to HSL for easier manipulation
    const { r, g, b } = baseRgb;
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) => {
        case r / 255:
          h = (g / 255 - b / 255) / diff + (g < b ? 6 : 0);
          break;
        case g / 255:
          h = (b / 255 - r / 255) / diff + 2;
          break;
        case b / 255:
          h = (r / 255 - g / 255) / diff + 4;
          break;
      }
      h /= 6;
    }

    // Generate suggestions with different lightness values
    const lightnessValues = [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9];

    for (const lightness of lightnessValues) => {
      const rgb = this.hslToRgb(h * 360, s * 100, lightness * 100);
      const hexColor = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;

      const ratio = this.getContrastRatio(hexColor, targetBackground);
      if (ratio >= targetRatio) {
        suggestions.push(hexColor);
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Get current theme contrast report
   */
  public getThemeContrastReport(): {
    overallScore: number;
    issues: Array<{
      element: string;
      issue: string;
      severity: 'error' | 'warning';
      suggestion: string;
    }>;
    compliantPairs: number;
    totalPairs: number;
  } {
    // Get computed styles from CSS variables
    // const rootStyles = getComputedStyle(document.documentElement);

    const palette: Partial<ColorPalette> = {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: 'hsl(var(--primary))',
      primaryForeground: 'hsl(var(--primary-foreground))',
      secondary: 'hsl(var(--secondary))',
      secondaryForeground: 'hsl(var(--secondary-foreground))',
      destructive: 'hsl(var(--destructive))',
      destructiveForeground: 'hsl(var(--destructive-foreground))',
      muted: 'hsl(var(--muted))',
      mutedForeground: 'hsl(var(--muted-foreground))',
      accent: 'hsl(var(--accent))',
      accentForeground: 'hsl(var(--accent-foreground))',
    };

    const results = this.validateColorPalette(palette);
    const compliantPairs = results.filter(r => r.result.isCompliant).length;
    const totalPairs = results.length;
    const overallScore = Math.round((compliantPairs / totalPairs) * 100);

    const issues = results
      .filter(r => !r.result.isCompliant)
      .map(r => ({
        element: r.pair,
        issue: `Contrast ratio ${r.result.ratio}:1 is below required ${r.result.requiredRatio}:1`,
        severity: r.severity as 'error' | 'warning',
        suggestion: r.result.recommendation || 'Increase color contrast',
      }));

    return {
      overallScore,
      issues,
      compliantPairs,
      totalPairs,
    };
  }
}

// Export singleton instance
export const colorContrastValidator = ColorContrastValidator.getInstance();
