/**
 * Accessibility Testing Automation
 * Provides automated accessibility testing with axe-core integration
 */

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: Array<{ id: string; description: string }>;
  incomplete: Array<{ id: string; description: string }>;
  inapplicable: Array<{ id: string; description: string }>;
  timestamp: Date;
  url: string;
  score: number;
}

export interface AccessibilityTestConfig {
  includeTags?: string[];
  excludeTags?: string[];
  rules?: Record<string, { enabled: boolean }>;
  resultTypes?: Array<'violations' | 'incomplete' | 'passes' | 'inapplicable'>;
}

export class AccessibilityTester {
  private static instance: AccessibilityTester;
  private axeLoaded: boolean = false;
  private testHistory: AccessibilityResult[] = [];

  public static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  /**
   * Load axe-core library dynamically
   */
  private async loadAxeCore(): Promise<void>  {
    if (this.axeLoaded) return;

    try {
      // Load axe-core from CDN
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          this.axeLoaded = true;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load axe-core'));
        document.head.appendChild(script);
      });

      console.log('Axe-core loaded successfully');
    } catch (error) {
      console.error('Failed to load axe-core:', error);
      throw error;
    }
  }

  /**
   * Run accessibility audit on current page
   */
  public async auditPage(
    config: AccessibilityTestConfig = {}
  ): Promise<AccessibilityResult> {
    await this.loadAxeCore();

    if (!(window as typeof window & { axe?: { run: (options?: unknown) => Promise<unknown> } }).axe) {
      throw new Error('Axe-core not available');
    }

    const axeConfig = {
      tags: config.includeTags || ['wcag2a', 'wcag2aa', 'wcag21aa'],
      exclude: config.excludeTags || [],
      rules: config.rules || {},
      resultTypes: config.resultTypes || ['violations', 'incomplete', 'passes'],
    };

    try {
      const results = await (window as typeof window & { axe: { run: (element: Element, options?: unknown) => Promise<unknown> } }).axe.run(document, axeConfig);

      const processedResult: AccessibilityResult = {
        violations: results.violations.map(this.processViolation),
        passes: results.passes.map((pass: { id: string; description: string }) => ({
          id: pass.id,
          description: pass.description,
        })),
        incomplete: results.incomplete.map((incomplete: { id: string; description: string }) => ({
          id: incomplete.id,
          description: incomplete.description,
        })),
        inapplicable: results.inapplicable.map((inapplicable: { id: string; description: string }) => ({
          id: inapplicable.id,
          description: inapplicable.description,
        })),
        timestamp: new Date(),
        url: window.location.href,
        score: this.calculateAccessibilityScore(
          results.violations,
          results.passes
        ),
      };

      // Store in test history
      this.testHistory.push(processedResult);

      // Keep only last 10 results
      if (this.testHistory.length > 10) {
        this.testHistory = this.testHistory.slice(-10);
      }

      return processedResult;
    } catch (error) {
      console.error('Accessibility audit failed:', error);
      throw error;
    }
  }

  /**
   * Process violation data
   */
  private processViolation(violation: {
    id: string;
    impact?: string;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    nodes: Array<{
      html: string;
      target: string[];
      failureSummary?: string;
    }>;
  }): AccessibilityViolation {
    return {
      id: violation.id,
      impact: violation.impact || 'moderate',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      tags: violation.tags,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary || '',
      })),
    };
  }

  /**
   * Calculate accessibility score (0-100)
   */
  private calculateAccessibilityScore(
    violations: Array<{ impact?: string }>,
    passes: unknown[]
  ): number {
    const totalChecks = violations.length + passes.length;
    if (totalChecks === 0) return 100;

    // Weight violations by impact
    const violationScore = violations.reduce((score, violation) => {
      switch (violation.impact) {
        case 'critical':
          return score + 10;
        case 'serious':
          return score + 7;
        case 'moderate':
          return score + 4;
        case 'minor':
          return score + 1;
        default:
          return score + 4;
      }
    }, 0);

    const maxPossibleScore = totalChecks * 10; // Assuming all critical
    const actualScore = maxPossibleScore - violationScore;

    return Math.max(0, Math.round((actualScore / maxPossibleScore) * 100));
  }

  /**
   * Run specific accessibility tests
   */
  public async runSpecificTests(
    testSuite: string
  ): Promise<AccessibilityResult> {
    const configs: Record<string, AccessibilityTestConfig> = {
      'wcag-aa': {
        includeTags: ['wcag2a', 'wcag2aa'],
        resultTypes: ['violations', 'passes'],
      },
      'wcag-aaa': {
        includeTags: ['wcag2aaa'],
        resultTypes: ['violations', 'passes'],
      },
      keyboard: {
        includeTags: ['keyboard'],
        resultTypes: ['violations', 'passes'],
      },
      'color-contrast': {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true },
        },
        resultTypes: ['violations', 'passes'],
      },
      forms: {
        includeTags: ['forms'],
        resultTypes: ['violations', 'passes'],
      },
      aria: {
        includeTags: ['aria'],
        resultTypes: ['violations', 'passes'],
      },
    };

    const config = configs[testSuite];
    if (!config) {
      throw new Error(`Unknown test suite: ${testSuite}`);
    }

    return this.auditPage(config);
  }

  /**
   * Generate accessibility report
   */
  public generateReport(result: AccessibilityResult): string {
    const { violations, passes, score, timestamp } = result;

    let report = `# Accessibility Audit Report\n\n`;
    report += `**Generated:** ${timestamp.toLocaleString()}\n`;
    report += `**URL:** ${result.url}\n`;
    report += `**Score:** ${score}/100\n\n`;

    // Summary
    report += `## Summary\n\n`;
    report += `- **Violations:** ${violations.length}\n`;
    report += `- **Passes:** ${passes.length}\n`;
    report += `- **Overall Score:** ${score}%\n\n`;

    if (violations.length > 0) {
      // Group violations by impact
      const violationsByImpact = violations.reduce((groups, violation) => {
          const impact = violation.impact;
          if (!groups[impact]) groups[impact] = [];
          groups[impact].push(violation);
          return groups;
        },
        {} as Record<string, AccessibilityViolation[]>
      );

      report += `## Violations by Impact\n\n`;

      ['critical', 'serious', 'moderate', 'minor'].forEach(impact => {
        const impactViolations = violationsByImpact[impact];
        if (impactViolations && impactViolations.length > 0) {
          const emoji =
            {
              critical: '🔴',
              serious: '🟠',
              moderate: '🟡',
              minor: '🔵',
            }[impact] || '⚪';

          report += `### ${emoji} ${impact.toUpperCase()} (${impactViolations.length})\n\n`;

          impactViolations.forEach((violation, index) => {
            report += `#### ${index + 1}. ${violation.description}\n\n`;
            report += `**Rule:** ${violation.id}\n`;
            report += `**Help:** ${violation.help}\n`;
            report += `**More Info:** [WCAG Guidelines](${violation.helpUrl})\n`;
            report += `**Affected Elements:** ${violation.nodes.length}\n\n`;

            // Show first few affected elements
            violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
              report += `**Element ${nodeIndex + 1}:**\n`;
              report += `- Target: \`${node.target.join(' > ')}\`\n`;
              report += `- HTML: \`${node.html.substring(0, 100)}${node.html.length > 100 ? '...' : ''}\`\n`;
              if (node.failureSummary) {
                report += `- Issue: ${node.failureSummary}\n`;
              }
              report += '\n';
            });

            if (violation.nodes.length > 3) {
              report += `_... and ${violation.nodes.length - 3} more elements_\n\n`;
            }
          });
        }
      });
    } else {
      report += `## 🎉 No Violations Found!\n\n`;
      report += `Great job! Your page meets WCAG accessibility standards.\n\n`;
    }

    // Recommendations
    report += `## Recommendations\n\n`;

    if (score >= 90) {
      report += `✅ **Excellent accessibility!** Your score of ${score}% indicates strong compliance with accessibility standards.\n\n`;
    } else if (score >= 70) {
      report += `⚠️ **Good accessibility** with room for improvement. Focus on fixing the ${violations.filter(v => ['critical', 'serious'].includes(v.impact)).length} high-impact violations.\n\n`;
    } else {
      report += `❌ **Accessibility needs attention.** Priority should be given to fixing critical and serious violations first.\n\n`;
    }

    report += `### Next Steps:\n`;
    report += `1. Address critical and serious violations first\n`;
    report += `2. Test with actual screen readers (NVDA, JAWS, VoiceOver)\n`;
    report += `3. Verify keyboard navigation works throughout the application\n`;
    report += `4. Test with users who have disabilities\n`;
    report += `5. Run regular automated accessibility audits\n\n`;

    return report;
  }

  /**
   * Get test history
   */
  public getTestHistory(): AccessibilityResult[] {
    return [...this.testHistory];
  }

  /**
   * Clear test history
   */
  public clearTestHistory(): void {
    this.testHistory = [];
  }

  /**
   * Schedule periodic accessibility tests
   */
  public schedulePeriodicTests(intervalMinutes: number = 60): () => void {
    let isRunning = true;

    const runPeriodicTest = async () => {
      if (!isRunning) return;

      try {
        const result = await this.auditPage();
        console.log(
          `Periodic accessibility test completed. Score: ${result.score}%`
        );

        if (result.violations.length > 0) {
          console.warn(
            `Found ${result.violations.length} accessibility violations`
          );
        }
      } catch (error) {
        console.error('Periodic accessibility test failed:', error);
      }

      if (isRunning) {
        setTimeout(runPeriodicTest, intervalMinutes * 60 * 1000);
      }
    };

    // Start first test after 1 minute
    setTimeout(runPeriodicTest, 60000);

    // Return cleanup function
    return () => {
      isRunning = false;
    };
  }

  /**
   * Test specific component accessibility
   */
  public async testComponent(selector: string): Promise<AccessibilityResult> {
    await this.loadAxeCore();

    if (!(window as typeof window & { axe?: { run: (options?: unknown) => Promise<unknown> } }).axe) {
      throw new Error('Axe-core not available');
    }

    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    try {
      const results = await (window as typeof window & { axe: { run: (element: Element, options?: unknown) => Promise<unknown> } }).axe.run(element);
      return {
        violations: results.violations.map(this.processViolation),
        passes: results.passes.map((pass: { id: string; description: string }) => ({
          id: pass.id,
          description: pass.description,
        })),
        incomplete: results.incomplete.map((incomplete: { id: string; description: string }) => ({
          id: incomplete.id,
          description: incomplete.description,
        })),
        inapplicable: results.inapplicable.map((inapplicable: { id: string; description: string }) => ({
          id: inapplicable.id,
          description: inapplicable.description,
        })),
        timestamp: new Date(),
        url: `${window.location.href} (${selector})`,
        score: this.calculateAccessibilityScore(
          results.violations,
          results.passes
        ),
      };
    } catch (error) {
      console.error('Component accessibility audit failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const accessibilityTester = AccessibilityTester.getInstance();

// Auto-start periodic testing in development
if (process.env.NODE_ENV === 'development') {
  // Schedule accessibility tests every 30 minutes in development
  let cleanup: (() => void) | null = null;

  // Start after page is fully loaded
  if (document.readyState === 'complete') {
    cleanup = accessibilityTester.schedulePeriodicTests(30);
  } else {
    window.addEventListener("load", () => {
      cleanup = accessibilityTester.schedulePeriodicTests(30);
    });
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    if (cleanup) cleanup();
  });
}
