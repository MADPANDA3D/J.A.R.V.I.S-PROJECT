import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    // In a real app, this would send error data to a logging service
    console.error('User reported error:', error);
    alert('Error reported. Thank you for helping us improve JARVIS!');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <p className="text-muted-foreground">
            We encountered an unexpected error. This has been logged and we'll
            look into it.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">
                Error Details:
              </p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                onClick={resetError}
                className="flex-1 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleReload}
                className="flex items-center gap-2"
              >
                Reload Page
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReportError}
                className="flex items-center gap-2"
              >
                <Bug className="w-4 h-4" />
                Report Issue
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/chat">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>

          {/* Help text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              If this error persists, try refreshing the page or clearing your
              browser cache.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
