import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  Bug, 
  Trash2, 
  Download, 
  Filter, 
  Eye, 
  EyeOff,
  Clock,
  Code,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { monitoringService } from '@/lib/monitoring';
// import { captureError } from '@/lib/errorTracking'; // Used in future implementation

interface RuntimeError {
  id: string;
  timestamp: Date;
  type: 'javascript' | 'react' | 'promise' | 'network' | 'component' | 'undefined_access';
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  filename?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  lastOccurrence: Date;
  metadata?: Record<string, unknown>;
}

interface RuntimeErrorMonitorProps {
  className?: string;
  maxErrors?: number;
}

export function RuntimeErrorMonitor({ 
  className = '', 
  maxErrors = 500 
}: RuntimeErrorMonitorProps) {
  const [errors, setErrors] = useState<RuntimeError[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<RuntimeError[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set(['javascript', 'react', 'promise', 'network', 'component', 'undefined_access']));
  const [severityFilter, setSeverityFilter] = useState<Set<string>>(new Set(['low', 'medium', 'high', 'critical']));
  const [showDetails, setShowDetails] = useState(false);

  // Error categorization
  const categorizeError = (error: ErrorEvent | Error): Omit<RuntimeError, 'id' | 'count' | 'lastOccurrence'> => {
    let severity: RuntimeError['severity'] = 'medium';
    let errorType: RuntimeError['type'] = 'javascript';
    let source = '';
    const metadata: Record<string, unknown> = {};

    // Determine error type and severity
    if (error.message) {
      const message = error.message.toLowerCase();
      
      // Categorize by error patterns
      if (message.includes('cannot read propert') || message.includes('undefined')) {
        errorType = 'undefined_access';
        severity = 'high';
      } else if (message.includes('network') || message.includes('fetch')) {
        errorType = 'network';
        severity = 'medium';
      } else if (message.includes('react') || message.includes('component')) {
        errorType = 'react';
        severity = 'high';
      } else if (message.includes('promise') || message.includes('async')) {
        errorType = 'promise';
        severity = 'medium';
      }

      // Determine severity by keywords
      if (message.includes('critical') || message.includes('fatal')) {
        severity = 'critical';
      } else if (message.includes('warning') || message.includes('deprecated')) {
        severity = 'low';
      }
    }

    // Extract source information
    if ('filename' in error && error.filename) {
      source = error.filename.split('/').pop() || error.filename;
      metadata.filename = error.filename;
      metadata.lineno = 'lineno' in error ? error.lineno : undefined;
      metadata.colno = 'colno' in error ? error.colno : undefined;
    }

    if (error.stack) {
      // Extract first meaningful line from stack trace
      const stackLines = error.stack.split('\n');
      const meaningfulLine = stackLines.find(line => 
        line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js')
      );
      if (meaningfulLine) {
        source = meaningfulLine.trim();
      }
    }

    return {
      timestamp: new Date(),
      type: errorType,
      message: error.message || 'Unknown error',
      stack: error.stack,
      source,
      lineno: 'lineno' in error ? error.lineno : undefined,
      colno: 'colno' in error ? error.colno : undefined,
      filename: 'filename' in error ? error.filename : undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity,
      metadata,
    };
  };

  // Add or update error
  const addError = useCallback((errorData: Omit<RuntimeError, 'id' | 'count' | 'lastOccurrence'>) {
    setErrors(prevErrors => {
      // Check if this error already exists (same message and source)
      const existingIndex = prevErrors.findIndex(e => 
        e.message === errorData.message && e.source === errorData.source
      );

      if (existingIndex !== -1) {
        // Update existing error
        const updatedErrors = [...prevErrors];
        updatedErrors[existingIndex] = {
          ...updatedErrors[existingIndex],
          count: updatedErrors[existingIndex].count + 1,
          lastOccurrence: new Date(),
        };
        return updatedErrors;
      } else {
        // Add new error
        const newError: RuntimeError = {
          ...errorData,
          id: crypto.randomUUID(),
          count: 1,
          lastOccurrence: new Date(),
        };

        const newErrors = [newError, ...prevErrors];
        
        // Keep only the most recent errors
        if (newErrors.length > maxErrors) {
          return newErrors.slice(0, maxErrors);
        }
        
        return newErrors;
      }
    });
  }, [maxErrors]);

  // Set up error monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    // JavaScript errors
    const handleError = (event: ErrorEvent) {
      const errorData = categorizeError(event);
      addError(errorData);
      
      // Also send to monitoring service
      monitoringService.captureException(new Error(event.message), {
        source: 'runtime_monitor',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) {
      const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
      const errorData = categorizeError(error);
      errorData.type = 'promise';
      addError(errorData);

      monitoringService.captureException(error, {
        source: 'runtime_monitor',
        type: 'unhandled_rejection',
        reason: event.reason,
      });
    };

    // Console error monitoring
    const originalConsoleError = console.error;
    const handleConsoleError = (...args: unknown[]) {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      const error = new Error(message);
      const errorData = categorizeError(error, 'javascript');
      errorData.severity = 'medium';
      addError(errorData);

      // Call original console.error
      originalConsoleError.apply(console, args);
    };

    // Component error boundary integration (for future use)
    // const handleReactError = (error: Error, errorInfo: { componentStack?: string }) {
    //   const errorData = categorizeError(error);
    //   errorData.type = 'component';
    //   errorData.componentStack = errorInfo.componentStack;
    //   errorData.severity = 'high';
    //   addError(errorData);
    // };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    console.error = handleConsoleError;

    // Store original functions for cleanup
    const cleanup = () {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };

    return cleanup;
  }, [isMonitoring, addError]);

  // Filter errors
  useEffect(() => {
    let filtered = errors;

    // Apply type filter
    filtered = filtered.filter(error => typeFilter.has(error.type));

    // Apply severity filter
    filtered = filtered.filter(error => severityFilter.has(error.severity));

    setFilteredErrors(filtered);
  }, [errors, typeFilter, severityFilter]);

  // Utility functions
  const getSeverityIcon = (severity: string) {
    switch (severity) {
    }
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Bug className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Bug className="h-4 w-4 text-blue-500" />;
      default:
        return <Bug className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'} className="text-xs">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800',
      react: 'bg-blue-100 text-blue-800',
      promise: 'bg-purple-100 text-purple-800',
      network: 'bg-green-100 text-green-800',
      component: 'bg-red-100 text-red-800',
      undefined_access: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}
      >
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(timestamp);
  };

  const exportErrors = () {
    const data = filteredErrors.map(error => ({
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      severity: error.severity,
      message: error.message,
      source: error.source,
      stack: error.stack,
      count: error.count,
      lastOccurrence: error.lastOccurrence.toISOString(),
      metadata: error.metadata,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runtime-errors-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearErrors = () {
    setErrors([]);
    setExpandedErrors(new Set());
  };

  const toggleErrorExpansion = (errorId: string) {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const toggleFilter = (filter: Set<string>, setFilter: (filter: Set<string>) => void, value: string) {
    const newFilter = new Set(filter);
    if (newFilter.has(value)) {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    setFilter(newFilter);
  };

  // Trigger a test error
  const triggerTestError = () {
    try {
      // This will cause an undefined access error
      (window as Record<string, unknown>).nonExistentFunction.call();
    } catch (error) {
      // This error will be caught by our monitoring
    }
  };

  const errorStats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === 'critical').length,
    high: errors.filter(e => e.severity === 'high').length,
    recent: errors.filter(e => Date.now() - e.timestamp.getTime() < 300000).length, // Last 5 minutes
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">Runtime Error Monitor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time JavaScript and React error tracking and debugging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isMonitoring ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className="h-8"
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportErrors}
              className="h-8"
            >
              <Download className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearErrors}
              className="h-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Error Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-blue-600">
              {errorStats.total}
            </div>
            <div className="text-xs text-muted-foreground">Total Errors</div>
          </div>
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-red-600">
              {errorStats.critical}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-orange-600">
              {errorStats.high}
            </div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center p-3 border border-border/50 rounded">
            <div className="text-lg font-semibold text-green-600">
              {errorStats.recent}
            </div>
            <div className="text-xs text-muted-foreground">Recent (5m)</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-8"
            >
              {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={triggerTestError}
              className="h-8"
            >
              <Bug className="h-3 w-3 mr-1" />
              Test Error
            </Button>
          </div>

          <div className="flex gap-2">
            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3 w-3 mr-2" />
                  Types ({typeFilter.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Error Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['javascript', 'react', 'promise', 'network', 'component', 'undefined_access'].map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilter.has(type)}
                    onCheckedChange={() => toggleFilter(typeFilter, setTypeFilter, type)}
                  >
                    {type.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Severity Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3 w-3 mr-2" />
                  Severity ({severityFilter.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Severity Levels</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['critical', 'high', 'medium', 'low'].map(severity => (
                  <DropdownMenuCheckboxItem
                    key={severity}
                    checked={severityFilter.has(severity)}
                    onCheckedChange={() => toggleFilter(severityFilter, setSeverityFilter, severity)}
                    className="capitalize"
                  >
                    {severity}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>
            Monitoring: {isMonitoring ? 'Active' : 'Paused'} • 
            Showing: {filteredErrors.length} of {errors.length} errors
          </span>
          <span>Max capacity: {maxErrors}</span>
        </div>
      </CardHeader>

      <CardContent>
        {filteredErrors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No runtime errors detected</p>
            <p className="text-xs mt-1">
              {errors.length === 0 ? 'System is running smoothly' : 'No errors match current filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                className="border border-border/50 rounded hover:bg-muted/30 transition-colors"
              >
                <div 
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => toggleErrorExpansion(error.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(error.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{error.message}</span>
                      {getSeverityBadge(error.severity)}
                      {getTypeBadge(error.type)}
                      {error.count > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {error.count}x
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(error.timestamp)}</span>
                        {error.count > 1 && (
                          <span>(last: {formatTimestamp(error.lastOccurrence)})</span>
                        )}
                      </div>
                      
                      {error.source && (
                        <div className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          <span className="truncate max-w-48" title={error.source}>
                            {error.source}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {expandedErrors.has(error.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedErrors.has(error.id) && showDetails && (
                  <div className="px-3 pb-3 border-t border-border/30">
                    <div className="mt-3 space-y-3 text-xs">
                      {/* Error Details */}
                      <div>
                        <span className="font-medium">Details:</span>
                        <div className="mt-1 p-2 bg-muted/50 rounded">
                          <div className="space-y-1">
                            <div><strong>Type:</strong> {error.type}</div>
                            <div><strong>Severity:</strong> {error.severity}</div>
                            <div><strong>URL:</strong> {error.url}</div>
                            {error.filename && <div><strong>File:</strong> {error.filename}</div>}
                            {error.lineno && <div><strong>Line:</strong> {error.lineno}:{error.colno}</div>}
                            <div><strong>User Agent:</strong> {error.userAgent}</div>
                          </div>
                        </div>
                      </div>

                      {/* Stack Trace */}
                      {error.stack && (
                        <div>
                          <span className="font-medium">Stack Trace:</span>
                          <pre className="mt-1 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {/* Component Stack (React errors) */}
                      {error.componentStack && (
                        <div>
                          <span className="font-medium">Component Stack:</span>
                          <pre className="mt-1 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                            {error.componentStack}
                          </pre>
                        </div>
                      )}

                      {/* Metadata */}
                      {error.metadata && Object.keys(error.metadata).length > 0 && (
                        <div>
                          <span className="font-medium">Metadata:</span>
                          <pre className="mt-1 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(error.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}