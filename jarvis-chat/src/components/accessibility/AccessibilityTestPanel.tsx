import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Keyboard,
  Palette,
} from 'lucide-react';
import { accessibilityTester } from '@/lib/accessibility-testing';
import type { AccessibilityResult } from '@/lib/accessibility-testing';

interface AccessibilityTestPanelProps {
  className?: string;
}

export const AccessibilityTestPanel: React.FC<AccessibilityTestPanelProps> = ({
  className = '',
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<AccessibilityResult | null>(
    null
  );
  const [testHistory, setTestHistory] = useState<AccessibilityResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('wcag-aa');

  const testSuites = [
    {
      id: 'wcag-aa',
      name: 'WCAG 2.1 AA',
      description: 'Standard accessibility compliance',
    },
    {
      id: 'wcag-aaa',
      name: 'WCAG 2.1 AAA',
      description: 'Enhanced accessibility compliance',
    },
    {
      id: 'keyboard',
      name: 'Keyboard Navigation',
      description: 'Keyboard accessibility tests',
    },
    {
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Color contrast validation',
    },
    {
      id: 'forms',
      name: 'Form Accessibility',
      description: 'Form and input accessibility',
    },
    {
      id: 'aria',
      name: 'ARIA Implementation',
      description: 'ARIA labels and roles',
    },
  ];

  const runAccessibilityTest = async (testType: string = selectedTest) => {
    setIsRunning(true);

    try {
      let result: AccessibilityResult;

      if (testType === 'full') {
        result = await accessibilityTester.auditPage();
      } else {
        result = await accessibilityTester.runSpecificTests(testType);
      }

      setLastResult(result);
      setTestHistory(accessibilityTester.getTestHistory());

      // Announce result to screen readers
      const message = `Accessibility test completed. Score: ${result.score}%. ${result.violations.length} violations found.`;

      // Create announcement element
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    } catch (error) {
      console.error('Accessibility test failed:', error);

      // Announce error
      const errorAnnouncement = document.createElement('div');
      errorAnnouncement.setAttribute('aria-live', 'assertive');
      errorAnnouncement.setAttribute('aria-atomic', 'true');
      errorAnnouncement.className = 'sr-only';
      errorAnnouncement.textContent =
        'Accessibility test failed. Please try again.';
      document.body.appendChild(errorAnnouncement);

      setTimeout(() => {
        document.body.removeChild(errorAnnouncement);
      }, 1000);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!lastResult) return;

    const report = accessibilityTester.generateReport(lastResult);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70)
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Test Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Accessibility Testing</h3>
        </div>

        <div className="space-y-4">
          {/* Test Suite Selection */}
          <div>
            <label
              htmlFor="test-suite"
              className="block text-sm font-medium mb-2"
            >
              Select Test Suite
            </label>
            <select
              id="test-suite"
              value={selectedTest}
              onChange={e => setSelectedTest(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isRunning}
            >
              {testSuites.map(suite => (
                <option key={suite.id} value={suite.id}>
                  {suite.name} - {suite.description}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => runAccessibilityTest()}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? 'Running Test...' : 'Run Test'}
            </Button>

            <Button
              variant="outline"
              onClick={() => runAccessibilityTest('full')}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Full Audit
            </Button>

            {lastResult && (
              <Button
                variant="outline"
                onClick={downloadReport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Test Results */}
      {lastResult && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            {getScoreIcon(lastResult.score)}
            <h3 className="text-lg font-semibold">Latest Results</h3>
            <span className="text-sm text-muted-foreground">
              {lastResult.timestamp.toLocaleString()}
            </span>
          </div>

          <div className="space-y-4">
            {/* Score Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(lastResult.score)}`}
                >
                  {lastResult.score}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Overall Score
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {lastResult.violations.length}
                </div>
                <div className="text-xs text-muted-foreground">Violations</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lastResult.passes.length}
                </div>
                <div className="text-xs text-muted-foreground">Passes</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {lastResult.incomplete.length}
                </div>
                <div className="text-xs text-muted-foreground">Incomplete</div>
              </div>
            </div>

            {/* Violations Summary */}
            {lastResult.violations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Top Violations
                </h4>
                <div className="space-y-2">
                  {lastResult.violations.slice(0, 5).map((violation) => (
                    <div
                      key={violation.id}
                      className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`
                              px-2 py-1 text-xs font-medium rounded uppercase
                              ${
                                violation.impact === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : violation.impact === 'serious'
                                    ? 'bg-orange-100 text-orange-800'
                                    : violation.impact === 'moderate'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                              }
                            `}
                            >
                              {violation.impact}
                            </span>
                            <span className="text-sm font-medium">
                              {violation.description}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {violation.help}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Affects {violation.nodes.length} element
                            {violation.nodes.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {lastResult.violations.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      ... and {lastResult.violations.length - 5} more violations
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Action Recommendations */}
            <div className="p-3 bg-secondary/50 rounded-lg">
              <h4 className="font-medium mb-2">Quick Recommendations</h4>
              <ul className="text-sm space-y-1">
                {lastResult.score < 70 && (
                  <li className="flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-600" />
                    Focus on fixing critical and serious violations first
                  </li>
                )}
                {lastResult.violations.some(v =>
                  v.tags.includes('color-contrast')
                ) && (
                  <li className="flex items-center gap-2">
                    <Palette className="w-3 h-3 text-yellow-600" />
                    Review color contrast ratios
                  </li>
                )}
                {lastResult.violations.some(v =>
                  v.tags.includes('keyboard')
                ) && (
                  <li className="flex items-center gap-2">
                    <Keyboard className="w-3 h-3 text-blue-600" />
                    Test keyboard navigation functionality
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-green-600" />
                  Test with actual screen readers for validation
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Test History</h3>
          <div className="space-y-2">
            {testHistory
              .slice(-5)
              .reverse()
              .map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded"
                >
                  <div className="flex items-center gap-3">
                    {getScoreIcon(result.score)}
                    <div>
                      <div className="text-sm font-medium">
                        Score: {result.score}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {result.violations.length} violations
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};
