import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { validateEnvironment, getHealthCheckStatus, type ValidationResult } from '@/lib/env-validation';

interface EnvironmentValidatorProps {
  showSensitiveData?: boolean;
  className?: string;
}

export function EnvironmentValidator({ 
  showSensitiveData = false, 
  className = '' 
}: EnvironmentValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Run validation on mount and when requested
  const runValidation = async () {
    setIsLoading(true);
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = validateEnvironment();
      setValidationResult(result);
    } catch (error) {
      console.error('Environment validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() {
    runValidation();
  }, []);

  const getSeverityIcon = (severity: 'error' | 'critical' | 'warning' | 'success') {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: 'error' | 'critical' | 'warning' | 'success') {
    const variants = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'secondary',
      success: 'default',
    } as const;

    return (
      <Badge variant={variants[severity]} className="text-xs">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const maskSensitiveValue = (value: string, field: string) {
    if (!showSensitiveData && !showSecrets) {
      // Mask API keys, secrets, and URLs
      if (field.toLowerCase().includes('key') || 
          field.toLowerCase().includes('secret') || 
          field.toLowerCase().includes('url')) {
        return value.slice(0, 8) + '•'.repeat(Math.max(0, value.length - 12)) + value.slice(-4);
      }
    }
    return value;
  };

  const copyToClipboard = async (text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getConfigurationStatus = () {
    if (!validationResult) return null;

    // const envInfo = getEnvironmentInfo(); // Used in future implementation
    const healthStatus = getHealthCheckStatus();

    return {
      application: {
        environment: validationResult.config.VITE_APP_ENV,
        version: validationResult.config.VITE_APP_VERSION || 'Not set',
        domain: validationResult.config.VITE_APP_DOMAIN || 'Not set',
        mode: import.meta.env.MODE,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
      },
      database: {
        supabaseUrl: validationResult.config.VITE_SUPABASE_URL,
        hasAnonKey: !!validationResult.config.VITE_SUPABASE_ANON_KEY,
        anonKeyLength: validationResult.config.VITE_SUPABASE_ANON_KEY?.length || 0,
        hasServiceRole: !!validationResult.config.SUPABASE_SERVICE_ROLE_KEY,
      },
      integrations: {
        n8nWebhookUrl: validationResult.config.VITE_N8N_WEBHOOK_URL,
        hasWebhookSecret: !!validationResult.config.N8N_WEBHOOK_SECRET,
        hasApiKey: !!validationResult.config.N8N_API_KEY,
        isSecureWebhook: validationResult.config.VITE_N8N_WEBHOOK_URL?.startsWith('https://') || false,
      },
      monitoring: {
        hasSentry: !!validationResult.config.VITE_SENTRY_DSN,
        hasDatadog: !!validationResult.config.DATADOG_API_KEY,
        logLevel: validationResult.config.LOG_LEVEL || 'Default',
        analyticsEnabled: validationResult.config.ENABLE_ANALYTICS || false,
      },
      features: {
        debugToolsEnabled: validationResult.config.ENABLE_DEBUG_TOOLS || false,
        experimentalEnabled: validationResult.config.ENABLE_EXPERIMENTAL_FEATURES || false,
        mockResponsesEnabled: validationResult.config.MOCK_N8N_RESPONSES || false,
        authBypassEnabled: validationResult.config.BYPASS_AUTH || false,
      },
      performance: {
        cachingEnabled: validationResult.config.ENABLE_CACHING || false,
        compressionEnabled: validationResult.config.COMPRESSION_ENABLED || false,
        cspEnabled: validationResult.config.CSP_ENABLED || false,
        webhookTimeout: validationResult.config.WEBHOOK_TIMEOUT || 'Default',
        retryAttempts: validationResult.config.WEBHOOK_RETRY_ATTEMPTS || 'Default',
      },
      health: healthStatus,
    };
  };

  const configStatus = getConfigurationStatus();

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <CardTitle>Validating Environment...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Running comprehensive environment validation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult || !configStatus) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-red-600">Validation Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Failed to validate environment configuration</p>
            <Button onClick={runValidation} variant="outline">
              Retry Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <CardTitle>Environment Configuration</CardTitle>
            </div>
            <div className="flex gap-2">
              {getSeverityBadge(validationResult.isValid ? 'success' : 'error')}
              <Badge variant="outline" className="text-xs">
                {validationResult.environment}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSensitiveData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
                className="h-8"
              >
                {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showSecrets ? 'Hide' : 'Show'} Secrets
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={runValidation}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-green-600">
              {validationResult.summary.validVariables}
            </div>
            <div className="text-xs text-muted-foreground">Valid</div>
          </div>
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-red-600">
              {validationResult.summary.missingRequired}
            </div>
            <div className="text-xs text-muted-foreground">Missing</div>
          </div>
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-yellow-600">
              {validationResult.summary.securityIssues}
            </div>
            <div className="text-xs text-muted-foreground">Security</div>
          </div>
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-blue-600">
              {validationResult.summary.recommendationsCount}
            </div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Application Configuration */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            🔧 Application Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Environment:</span>
              <div className="flex items-center gap-2">
                <Badge variant={configStatus.application.environment === 'production' ? 'default' : 'secondary'}>
                  {configStatus.application.environment || 'Unknown'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-mono text-xs">{configStatus.application.version}</span>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Domain:</span>
              <span className="font-mono text-xs">{configStatus.application.domain}</span>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Build Mode:</span>
              <Badge variant={configStatus.application.isProd ? 'default' : 'secondary'}>
                {configStatus.application.mode}
              </Badge>
            </div>
          </div>
        </div>

        {/* Database Configuration */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            🗄️ Database Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Supabase URL:</span>
              <div className="flex items-center gap-2">
                {configStatus.database.supabaseUrl ? (
                  <>
                    <span className="font-mono text-xs max-w-48 truncate">
                      {maskSensitiveValue(configStatus.database.supabaseUrl, 'url')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(configStatus.database.supabaseUrl!, 'supabase-url')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {copiedField === 'supabase-url' && (
                      <Badge variant="secondary" className="text-xs">Copied!</Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="destructive" className="text-xs">Not Set</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Anonymous Key:</span>
              <div className="flex items-center gap-2">
                {configStatus.database.hasAnonKey ? (
                  <>
                    <Badge variant="default" className="text-xs">
                      Configured ({configStatus.database.anonKeyLength} chars)
                    </Badge>
                    {configStatus.database.anonKeyLength < 100 && (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" title="Key seems unusually short" />
                    )}
                  </>
                ) : (
                  <Badge variant="destructive" className="text-xs">Missing</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Service Role Key:</span>
              <div className="flex items-center gap-2">
                {configStatus.database.hasServiceRole ? (
                  <>
                    <Badge variant="secondary" className="text-xs">Configured (Server Only)</Badge>
                    <AlertTriangle className="h-3 w-3 text-yellow-500" title="Ensure this is server-side only" />
                  </>
                ) : (
                  <Badge variant="outline" className="text-xs">Not Set</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Configuration */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            🔗 Integration Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">N8N Webhook URL:</span>
              <div className="flex items-center gap-2">
                {configStatus.integrations.n8nWebhookUrl ? (
                  <>
                    <span className="font-mono text-xs max-w-48 truncate">
                      {maskSensitiveValue(configStatus.integrations.n8nWebhookUrl, 'url')}
                    </span>
                    {configStatus.integrations.isSecureWebhook ? (
                      <CheckCircle className="h-3 w-3 text-green-500" title="HTTPS enabled" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" title="HTTP connection" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(configStatus.integrations.n8nWebhookUrl!, '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">Using Fallback</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Webhook Secret:</span>
              <Badge variant={configStatus.integrations.hasWebhookSecret ? 'default' : 'secondary'} className="text-xs">
                {configStatus.integrations.hasWebhookSecret ? 'Configured' : 'Not Secure'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">N8N API Key:</span>
              <Badge variant={configStatus.integrations.hasApiKey ? 'default' : 'outline'} className="text-xs">
                {configStatus.integrations.hasApiKey ? 'Configured' : 'Not Set'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            🚩 Feature Flags
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Debug Tools:</span>
              <Badge variant={configStatus.features.debugToolsEnabled ? 'destructive' : 'outline'} className="text-xs">
                {configStatus.features.debugToolsEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Experimental:</span>
              <Badge variant={configStatus.features.experimentalEnabled ? 'secondary' : 'outline'} className="text-xs">
                {configStatus.features.experimentalEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Mock Responses:</span>
              <Badge variant={configStatus.features.mockResponsesEnabled ? 'destructive' : 'outline'} className="text-xs">
                {configStatus.features.mockResponsesEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
              <span className="text-muted-foreground">Auth Bypass:</span>
              <Badge variant={configStatus.features.authBypassEnabled ? 'destructive' : 'outline'} className="text-xs">
                {configStatus.features.authBypassEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Errors and Warnings */}
        {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              ⚠️ Issues and Recommendations
            </h3>
            
            {/* Critical and Error Issues */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-medium text-red-600">Critical Issues</h4>
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-red-200 bg-red-50/50 rounded">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{error.variable}</span>
                        {getSeverityBadge(error.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">{error.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-yellow-600">Recommendations</h4>
                {validationResult.warnings.slice(0, 5).map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-yellow-200 bg-yellow-50/50 rounded">
                    {getSeverityIcon('warning')}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{warning.variable}</span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {warning.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{warning.message}</p>
                      <p className="text-xs text-blue-600">💡 {warning.recommendation}</p>
                    </div>
                  </div>
                ))}
                {validationResult.warnings.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{validationResult.warnings.length - 5} more warnings...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Validation Timestamp */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last validated: {validationResult.timestamp.toLocaleString()}</span>
            <span>Health: {configStatus.health.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}