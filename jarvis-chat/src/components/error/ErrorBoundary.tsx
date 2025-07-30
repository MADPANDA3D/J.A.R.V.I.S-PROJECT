import React, { Component, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { errorTracker } from '@/lib/errorTracking';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void; reportBug?: () => void }>;
  name?: string;
  tags?: Record<string, string>;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private componentName: string;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.componentName = props.name || 'ErrorBoundary';
    this.state = {
      hasError: false,
      error: null,
    };
    
    // Set component-specific tags if provided
    if (props.tags) {
      errorTracker.setTags({
        ...props.tags,
        errorBoundaryComponent: this.componentName
      });
    }
    
    // Add breadcrumb for boundary initialization
    errorTracker.addBreadcrumb('info', 'info', `Error boundary initialized: ${this.componentName}`, {
      component: this.componentName,
      tags: props.tags
    });
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Add breadcrumb before capturing error
    errorTracker.addBreadcrumb('error', 'error', `Error boundary caught error: ${error.message}`, {
      component: this.componentName,
      componentStack: errorInfo.componentStack,
      errorName: error.name
    });
    
    // Set component-specific tags
    const componentTags = {
      component: this.componentName,
      errorBoundary: 'true',
      ...this.props.tags
    };
    errorTracker.setTags(componentTags);
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      console.error('Component:', this.componentName);
      console.error('Tags:', componentTags);
    }

    // Capture error with our enhanced error tracking system
    errorTracker.captureReactError(error, errorInfo);
  }

  resetError = () => {
    // Add breadcrumb for error reset
    errorTracker.addBreadcrumb('info', 'user_action', 'Error boundary reset', {
      component: this.componentName,
      previousError: this.state.error?.message
    });
    
    this.setState({
      hasError: false,
      error: null,
    });
  };

  reportBug = () => {
    // This will be used by the ErrorFallback component to open bug report modal
    errorTracker.addBreadcrumb('info', 'user_action', 'Bug report initiated from error boundary', {
      component: this.componentName,
      error: this.state.error?.message
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          reportBug={this.reportBug}
        />
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components (React 18+)
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void; reportBug?: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
